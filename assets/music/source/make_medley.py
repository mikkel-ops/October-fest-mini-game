#!/usr/bin/env python3
"""make_medley.py — builds assets/music/overworld.mp3, the Oktoberfest walking tune.

YOU DO NOT NEED THIS TO RUN THE GAME. The game just plays the finished mp3.
This script only exists so the tune can be rebuilt or changed later, and so
nobody has to wonder where the music came from.

WHAT IT DOES: reads the public-domain (CC0) folk-song scores in this folder
(the .mid files, from Wikimedia Commons — see ../CREDITS.md) and plays them on
a little Game Boy "oompah band":

    melody   -> a thin pulse wave   (the trumpet)
    harmony  -> a softer pulse wave (the clarinets, played short: "pah")
    bass     -> a triangle wave     (the tuba: "oom")
    beat     -> a quiet noise tick  (someone tapping a Masskrug)

The songs are joined into one medley in the order of SONGS below.

HOW TO RUN (needs Python 3, ffmpeg, and two packages):
    pip install mido numpy
    python3 assets/music/source/make_medley.py
"""
import os
import subprocess
import wave

import mido
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_MP3 = os.path.join(HERE, '..', 'overworld.mp3')
RATE = 44100            # samples per second

# The medley, in playing order. It opens with "Ein Prosit" — the toast every
# Wiesn tent strikes up every fifteen minutes — so the game starts on THE tune.
SONGS = [
    'ein_prosit_der_gemutlichkeit.mid',
    'bier_her.mid',
    'muss_i_denn_zum_stadtele_hinaus.mid',
    'im_krug_zum_grunen_kranze.mid',
    'auf_de_schwabsche_eisebahne.mid',
    'horch_was_kommt_von_draussen_rein.mid',
]
GAP_SECONDS = 0.45      # breath between two songs (and before the loop restarts)
BASS_BELOW = 55         # MIDI notes lower than this (G3) go to the tuba
LEAD_CHANNEL = 0        # the MIDI channel that carries the tune in these scores
BASS_FLOOR = 40         # tuba notes lower than this (E2, 82 Hz) are moved up an octave: a TV's
                        # speakers can't play anything deeper, so the "oom" would simply vanish
MAX_HARMONICS = 40      # how many overtones we add up per note (keeps it clean, no fizz)


def read_notes(path):
    """Return (notes, beat_times). notes = [(start_s, end_s, midi_note, channel)]."""
    mid = mido.MidiFile(path)
    tempo = 500000  # MIDI default (120 bpm) until the file says otherwise
    seconds = 0.0
    ticks = 0
    open_notes = {}
    notes = []
    beat_times = []
    next_beat_tick = 0
    for msg in mido.merge_tracks(mid.tracks):
        # walk forward in time, dropping a beat marker every quarter note
        while next_beat_tick < ticks + msg.time:
            beat_times.append(seconds + mido.tick2second(next_beat_tick - ticks, mid.ticks_per_beat, tempo))
            next_beat_tick += mid.ticks_per_beat
        seconds += mido.tick2second(msg.time, mid.ticks_per_beat, tempo)
        ticks += msg.time
        if msg.type == 'set_tempo':
            tempo = msg.tempo
        elif msg.type == 'note_on' and msg.velocity > 0:
            open_notes[(msg.channel, msg.note)] = seconds
        elif msg.type in ('note_off', 'note_on'):  # note_on with velocity 0 = off
            start = open_notes.pop((msg.channel, msg.note), None)
            if start is not None and seconds > start:
                notes.append((start, seconds, msg.note, msg.channel))
    end = max(n[1] for n in notes)
    return notes, [b for b in beat_times if b < end]


def pick_roles(notes):
    """Decide which notes are melody / harmony / bass.

    In all of these scores the tune is on MIDI channel 0 (the arranger's habit).
    Do NOT guess it from "whichever voice is highest": two of the songs have a
    decorative flute/violin line above the tune, and that guess picks the
    decoration — the song then plays with its melody buried. Anything low is
    the tuba; everything else is harmony. Some scores double a voice on two
    channels; identical notes are played once.
    """
    lead_channel = LEAD_CHANNEL
    seen = set()
    out = []
    for start, end, note, ch in sorted(notes, key=lambda n: (n[0], n[3] != lead_channel)):
        key = (round(start, 3), note)
        if key in seen:
            continue  # the same note doubled on another channel
        seen.add(key)
        if note < BASS_BELOW:
            role = 'bass'
        elif ch == lead_channel:
            role = 'lead'
        else:
            role = 'harmony'
        out.append((start, end, note, role))
    return out


def tone(freq, seconds, kind):
    """One note as a clean chip wave, built from sine overtones (no harsh aliasing)."""
    t = np.arange(int(seconds * RATE)) / RATE
    wave_ = np.zeros_like(t)
    count = int(min(MAX_HARMONICS, (RATE * 0.45) // freq))
    for k in range(1, count + 1):
        if kind == 'triangle':
            if k % 2 == 0:
                continue
            amp = (8 / np.pi ** 2) * ((-1) ** ((k - 1) // 2)) / (k * k)
        else:  # a pulse wave; `kind` is its duty cycle (0.25 = thin, 0.5 = square)
            amp = (2 / (k * np.pi)) * np.sin(k * np.pi * kind)
        wave_ += amp * np.sin(2 * np.pi * freq * k * t)
    return wave_


def envelope(n_samples, attack, release, decay_to, decay_seconds):
    """Volume shape of a note: quick start, settle a bit, short fade at the end."""
    env = np.ones(n_samples)
    t = np.arange(n_samples) / RATE
    env *= decay_to + (1 - decay_to) * np.exp(-t / decay_seconds)
    a = min(int(attack * RATE), n_samples)
    env[:a] *= np.linspace(0, 1, a)
    r = min(int(release * RATE), n_samples)
    env[n_samples - r:] *= np.linspace(1, 0, r)
    return env


# how each role is played: wave, loudness, how much of the written length it
# holds (harmony is clipped short — that is the "pah"), and its volume shape
VOICES = {
    'lead':    dict(kind=0.25,       gain=0.30, hold=0.95, decay_to=0.75, decay_seconds=0.25),
    'harmony': dict(kind=0.5,        gain=0.11, hold=0.70, decay_to=0.55, decay_seconds=0.12),
    'bass':    dict(kind='triangle', gain=0.42, hold=0.85, decay_to=0.60, decay_seconds=0.20),
}


def render_song(path):
    notes, beats = read_notes(path)
    length = max(n[1] for n in notes) + 0.3
    audio = np.zeros(int(length * RATE))
    for start, end, note, role in pick_roles(notes):
        while note < BASS_FLOOR:
            note += 12
        v = VOICES[role]
        seconds = max(0.05, (end - start) * v['hold'])
        freq = 440.0 * 2 ** ((note - 69) / 12)
        w = tone(freq, seconds, v['kind'])
        w *= envelope(len(w), 0.004, 0.03, v['decay_to'], v['decay_seconds']) * v['gain']
        i = int(start * RATE)
        audio[i:i + len(w)] += w[:len(audio) - i]
    # the Masskrug tick: a tiny burst of bright noise on every beat
    rng = np.random.default_rng(1810)  # fixed seed = same file every build (1810: the first Oktoberfest)
    for b in beats:
        n = int(0.03 * RATE)
        burst = rng.standard_normal(n)
        burst = np.diff(burst, prepend=0.0)          # crude high-pass: keeps only the "tss"
        burst *= np.exp(-np.arange(n) / (0.007 * RATE)) * 0.035
        i = int(b * RATE)
        audio[i:i + n] += burst[:len(audio) - i]
    return audio


def main():
    gap = np.zeros(int(GAP_SECONDS * RATE))
    parts = []
    for name in SONGS:
        song = render_song(os.path.join(HERE, name))
        print('%-40s %5.1f s' % (name, len(song) / RATE))
        parts += [song, gap]
    audio = np.concatenate(parts)
    audio = np.tanh(audio * 1.4)                     # gentle limiter: loud chords round off instead of clipping
    # Level: average loudness about -15.5 dB, the same as the battle clips, so the
    # music never jumps in volume when a fight starts or ends.
    audio *= 0.67 / np.max(np.abs(audio))

    wav_path = os.path.join(HERE, '_medley.wav')
    with wave.open(wav_path, 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes((audio * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav_path,
                    '-codec:a', 'libmp3lame', '-q:a', '4', '-map_metadata', '-1', OUT_MP3], check=True)
    os.remove(wav_path)
    print('wrote %s  (%.1f s)' % (os.path.normpath(OUT_MP3), len(audio) / RATE))


if __name__ == '__main__':
    main()
