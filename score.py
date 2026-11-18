# Original score for "What If Your Alarm Clock Could Rewind the Day?" 72 bpm, 3/4 (bar = 2.5 s).
# D minor for the loop and the crossing, D major when it is earned (the sunrise, the perfect answer, the promise, Tuesday).
# The clock motif: four notes on glockenspiel, A-D-E-F (the warning) and A-D-E-F# (the promise). Pip has her own tune (flute).
# Devices: a pizzicato clock that ticks under every countdown, a "rewind" (swell, a falling glissando, a bright chord),
# heartbeats on timpani, tremolo that climbs into the headlights, and hard stops into silence at the crossing.
# Instruments: glockenspiel, harp, glass harp, strings (arco, pizzicato, contrabass), flute, clarinet, oboe, French horn,
# vibraphone (bowed), timpani, suspended cymbal.
# Usage: <LIB>/.venv/bin/python score.py   → out/score.wav
import sys, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR

S.seed(72)
BPM = 72; B = 60 / BPM; BAR = 3 * B
DUR = 555.0
bt = lambda bar, beat=0: (bar - 1) * BAR + beat * B
EV = []
def ev(t, inst, pitch, dur, vel, pan=0, gain=1.0, **kw):
    if 0 <= t < DUR: EV.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))
m = S.midi
CH = {'D': ['D2', 'A2', 'D3', 'F#3', 'A3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'], 'Bm': ['B1', 'F#2', 'B2', 'D3', 'F#3'],
      'G': ['G1', 'D2', 'G2', 'B2', 'D3'], 'Em': ['E2', 'B2', 'E3', 'G3', 'B3'], 'F#': ['F#1', 'C#2', 'F#2', 'A#2', 'C#3'], 'Em7': ['E2', 'B2', 'D3', 'G3', 'B3'],
      'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['A#1', 'F2', 'A#2', 'D3', 'F3'], 'Gm': ['G1', 'D2', 'G2', 'A#2', 'D3'], 'C': ['C2', 'G2', 'C3', 'E3', 'G3'],
      'A7': ['A1', 'E2', 'G2', 'C#3', 'E3'], 'F': ['F1', 'C2', 'F2', 'A2', 'C3']}
P_MAIN = ['D', 'Bm', 'G', 'A']
P_WARM = ['G', 'D', 'Em', 'A']
P_MIN = ['Bm', 'G', 'Em', 'F#']
P_DARK = ['Dm', 'Bb', 'Gm', 'A']
P_DRIVE = ['Dm', 'Dm', 'Bb', 'A']

THEME = [(0, 'F#5', 2), (2, 'A5', 1), (3, 'D6', 2), (5, 'C#6', 1), (6, 'B5', 1), (7, 'A5', 1), (8, 'F#5', 1), (9, 'A5', 3),
         (12, 'G5', 2), (14, 'B5', 1), (15, 'E6', 2), (17, 'D6', 1), (18, 'C#6', 1), (19, 'B5', 1), (20, 'A5', 1), (21, 'D6', 3)]
THEME_M = [(b, {'F#5': 'F5', 'C#6': 'C#6', 'B5': 'A#5', 'E6': 'E6', 'G5': 'G5'}.get(p, p), d) for b, p, d in THEME]   # the theme in D minor
HALF = THEME[:8]
MOTIF = ['F#5', 'A5', 'D6', 'C#6']
MOTIF_M = ['F5', 'A5', 'D6', 'C#6']

def melody(t0, inst, notes, vel=.45, pan=.1, tr=0, gain=1.0, rate=1.0, leg=.92):
    for b, p, d in notes:
        if p: ev(t0 + b * B / rate, inst, m(p) + tr, d * B / rate * leg, vel, pan, gain, attack=.05)
def motif(t0, vel=.5, tr=0, big=False, minor=False, inst='glass'):
    for i, p in enumerate(MOTIF_M if minor else MOTIF):
        t = t0 + i * B * .75; pp = m(p) + tr
        ev(t, inst, pp, 2.4, vel, .15); ev(t, 'harp', pp - 12, 1.6, vel * .6, -.2)
    if big:
        for p in CH['Dm' if minor else 'D']: ev(t0 + 3 * B, 'violins' if m(p) >= 55 else 'cellos', m(p) + 12 + tr, BAR * 2, vel * .5, 0, attack=.4)
        ev(t0 + 3 * B, 'horn', m('A3') + tr, BAR * 2, vel * .4, -.1, attack=.3)
def pad(t0, bars, prog, vel=.18, upper='violas', low='cellos', att=.6, tr=0):
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        if low: ev(s, low, m(c[0]) + 12 + tr, BAR * 1.04, vel, -.2, attack=att)
        if upper: ev(s, upper, m(c[3]) + 12 + tr, BAR * 1.04, vel * .8, .25, attack=att); ev(s, upper, m(c[4]) + 12 + tr, BAR * 1.04, vel * .7, .35, attack=att)
def harp(t0, bars, prog, vel=.26, tr=0, per=6):
    for i in range(bars):
        c = [m(x) + 12 + tr for x in CH[prog[i % len(prog)]][1:]]; seq = [c[0], c[1], c[2], c[3], c[2], c[1]]
        for k in range(per): ev(t0 + i * BAR + k * BAR / per, 'harp', seq[k % 6], 1.4, vel * (1 if k == 0 else .78), .3)
def bowed(t0, bars, prog, vel=.12):
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        for p in c[3:5]: ev(s, 'vibraphone_bowed', m(p) + 24, BAR * 1.1, vel, .1)
def clock(t0, t1, prog, vel=.2, cresc=0.0, per=6, inst='violins_pizz', bass=True, tr=0):
    """The countdown: pizzicato eighths (per bar), root in the contrabass on 1. Grows by cresc over the span."""
    n = int((t1 - t0) / (BAR / per))
    for k in range(n):
        t = t0 + k * BAR / per; i = int((t - t0) // BAR); c = CH[prog[i % len(prog)]]; u = k / max(1, n - 1)
        v = vel * (1 + cresc * u) * (1.15 if k % per == 0 else .85 if k % 2 else 1)
        ev(t, inst, m([c[2], c[3], c[4], c[3]][k % 4]) + 12 + tr, .22, v, .25)
        if bass and k % per == 0: ev(t, 'contrabass_pizz', m(c[0]) + 12 + tr, .5, v * 1.2, -.2)
def drone(t0, dur, note, vel=.14, inst='cellos', pan=-.15, att=1.5):
    ev(t0, inst, note, dur, vel, pan, attack=att)
def trem(t0, dur, notes, vel=.12, cresc=1.0, inst='violins', rate=.125):
    """String tremolo: fast repeated short notes, swelling by cresc."""
    n = int(dur / rate)
    for k in range(n):
        u = k / max(1, n - 1)
        for j, p in enumerate(notes): ev(t0 + k * rate, inst, p, rate * 1.6, vel * (1 + (cresc - 1) * u) * (.9 + .2 * ((k + j) % 2)), .2 - .1 * j)
def hit(t, vel=.6, chord='Dm', cym=True):
    """A stinger: timpani, low strings and horns together, cymbal."""
    c = CH[chord]
    ev(t, 'timpani', c[0] if m(c[0]) >= m('F2') else S.name(m(c[0]) + 12), 2.0, vel, 0)
    for p in c[:3]: ev(t, 'cellos', m(p) + 12, 1.6, vel * .7, -.2, attack=.01)
    ev(t, 'contrabass', m(c[0]) + 12, 2.2, vel * .6, -.1, attack=.01)
    for p in c[3:5]: ev(t, 'horn', m(p) + 12, 1.8, vel * .55, .1, attack=.02)
    for p in c[2:5]: ev(t, 'violins', m(p) + 24, 1.2, vel * .5, .25, attack=.01)
    if cym: ev(t - .02, 'sus_cymbal', None, None, vel * .5, 0)
def heart(t0, n, gap=.9, vel=.22, note='D2'):
    for i in range(n): ev(t0 + i * gap, 'timpani', note, .6, vel, 0); ev(t0 + i * gap + .22, 'timpani', note, .5, vel * .6, 0)
T = dict(knob1=162.8, knob2=318.6, knob3=353.2, cheer=264.8, hug3=414.0, hug=459.0, hover=476.0, setDown=479.4, lampOff=482.4, slap4=491.8)
REW = [238.5 + 9.0 * (i + .5) / 3 for i in range(3)]

# —— The clock motif: four notes, A-D-E-F in minor (the warning), A-D-E-F# in major (the promise) ——
CLK = ['A5', 'D6', 'E6', 'F6']; CLK_M = ['A5', 'D6', 'E6', 'F#6']
def tick(t0, minor=True, vel=.4, inst='glockenspiel', tr=0, big=False):
    for i, p in enumerate(CLK if minor else CLK_M):
        t = t0 + i * B * .5; ev(t, inst, m(p) + tr, 1.6, vel, .2); ev(t, 'harp', m(p) - 12 + tr, 1.4, vel * .55, -.2)
    if big:
        c = CH['Dm' if minor else 'D']
        for p in c: ev(t0 + 2 * B, 'violins' if m(p) >= 55 else 'cellos', m(p) + 12 + tr, BAR * 2, vel * .5, 0, attack=.4)
        ev(t0 + 2 * B, 'horn', m('A3') + tr, BAR * 2, vel * .4, -.1, attack=.3)
def rewindFx(t, vel=.5, minor=True, short=False):
    """The knob turns: a swell up, then everything runs backwards (a falling glissando) into a bright chord."""
    d = .5 if short else 1.0
    trem(t - .3, .3 + d * .4, [m('A4'), m('D5')], vel=.08 * vel / .5, cresc=3.0)
    seq = [m(x) for x in (['F6', 'E6', 'D6', 'C#6', 'A5', 'F5', 'E5', 'D5', 'A4', 'F4', 'D4', 'A3'] if minor else ['F#6', 'E6', 'D6', 'C#6', 'A5', 'F#5', 'E5', 'D5', 'A4', 'F#4', 'D4', 'A3'])]
    for k, p in enumerate(seq): ev(t + k * d / len(seq), 'glockenspiel' if k % 2 else 'harp', p, .6, vel * (.9 - .03 * k), .3 - .05 * k)
    ev(t - .4, 'sus_cymbal', None, None, vel * .55, 0)
    for p in (['D4', 'F4', 'A4', 'D5'] if minor else ['D4', 'F#4', 'A4', 'D5']): ev(t + d, 'vibraphone_bowed', m(p) + 12, 2.2, vel * .3, .1)
    if not short: ev(t + d, 'timpani', 'D2', 1.4, vel * .6, 0)
# Pip's tune: bright, a little skip (flute or glockenspiel)
PIP = [(0, 'D5', 1), (1, 'F#5', 1), (2, 'A5', 2), (4, 'B5', 1), (5, 'A5', 1), (6, 'F#5', 2), (8, 'E5', 1), (9, 'F#5', 1), (10, 'D5', 2)]
PIP2 = [(0, 'G5', 1), (1, 'A5', 1), (2, 'B5', 2), (4, 'D6', 1), (5, 'C#6', 1), (6, 'A5', 2), (8, 'B5', 1), (9, 'C#6', 1), (10, 'D6', 2)]

# ===== Cold open (0–24.6): rain, a low drone, a heart; the tremolo climbs into the bell =====
drone(1.0, 23.4, 'D2', vel=.12); drone(1.0, 23.4, 'A2', vel=.07, inst='violas', att=3.0)
ev(4.2, 'timpani', 'D2', 1.6, .34, 0); ev(4.2, 'sus_cymbal', None, None, .22, 0)          # "Pip!"
for p in ['D4', 'F4', 'A4']: ev(5.2, 'violas', p, 6.0, .1, .1, attack=1.2)
heart(8.0, 10, gap=1.05, vel=.16)
melody(9.0, 'cellos', [(0, 'A3', 3), (3, 'F3', 3), (6, 'E3', 3), (9, 'D3', 6)], vel=.24, pan=-.1)
ev(15.0, 'glass', 'F5', 2.0, .18, .2); ev(16.4, 'glass', 'E5', 2.4, .16, .2)
trem(18.2, 6.3, [m('A4'), m('A#4')], vel=.08, cresc=3.6)
trem(19.6, 4.9, [m('D3'), m('D#3')], vel=.09, cresc=3.0, inst='cellos')
for k in range(10): ev(20.0 + k * .44, 'violins', m('D5') + k, .44, .1 + .03 * k, .2, attack=.02)
# ===== Title (24.6–35): the bell is the hit; the clock starts ticking; the motif on horn and glockenspiel =====
hit(24.6, vel=.72, chord='Dm')
clock(25.2, 34.6, ['Dm', 'Bb', 'Gm', 'A'], vel=.14, per=6)
tick(26.0, vel=.42, big=True)
melody(28.6, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'E4', 2), (5, 'F4', 4)], vel=.44, pan=-.05)
ev(33.2, 'timpani', 'A2', 1.0, .34, 0); ev(34.0, 'timpani', 'D2', 1.4, .42, 0)
# ===== Ch I (35–112): Monday =====
# the first morning: sleepy harp; the radio; the snooze run; "Seven forty?"
harp(35.6, 5, ['D', 'G', 'D', 'A'], vel=.13, per=3); bowed(35.6, 5, ['D', 'G', 'D', 'A'], vel=.08)
ev(45.2, 'glockenspiel', 'A6', .8, .14, .3)
for k in range(16): ev(49.6 + k * .14, 'glockenspiel' if k % 2 else 'harp', m('D5') + [0, 2, 4, 5, 7, 9, 11, 12][k % 8] + (12 if k > 7 else 0), .3, .16 + .01 * k, .3)
trem(49.6, 2.4, [m('A4'), m('D5')], vel=.07, cresc=3.0)
hit(52.2, vel=.42, chord='Dm', cym=False)
# the rush: fast pizzicato clock under the kitchen and the street
clock(53.0, 58.0, ['Dm', 'Dm'], vel=.15, per=12)
pad(58.0, 6, ['D', 'Bm', 'G', 'A', 'D', 'A'], vel=.09, upper='violas')
melody(59.0, 'flute', PIP, vel=.24, pan=.2)                                            # Pip's tune: "Will you watch me ride?"
clock(64.6, 73.8, ['D', 'D', 'G', 'A'], vel=.12, per=12, inst='violins_pizz')
ev(66.0, 'cellos', 'B2', 2.0, .14, -.2)                                                 # "Can't, Pip."
clock(74.0, 81.0, ['Dm', 'Bb', 'Gm', 'A'], vel=.17, per=12, cresc=.6)
for i in range(3): ev(74.0 + i * BAR, 'timpani', 'D2', .5, .24, 0)
ev(81.0, 'timpani', 'A1', 1.6, .3, 0); ev(81.0, 'cellos', 'A2', 3.0, .16, -.2, attack=.02)   # missed it
drone(82.0, 4.0, 'D2', vel=.1)
# the first interview: almost nothing. A low drone, a clock ticking somewhere, the blank
drone(86.4, 16.2, 'D2', vel=.09); drone(92.4, 10.2, 'G#2', vel=.05, inst='violas', pan=.2)
clock(88.0, 102.4, ['Dm'], vel=.06, per=3, inst='cellos_pizz', bass=False)
ev(98.3, 'glass', 'D#6', 3.0, .16, .2)                                                  # "I… um."
ev(102.8, 'cellos', 'D2', 3.0, .2, -.2, attack=.02); ev(102.8, 'timpani', 'D2', 1.2, .26, 0)
melody(104.4, 'oboe', [(0, 'F5', 2), (2, 'E5', 1), (3, 'D5', 3)], vel=.18, pan=.2)     # "They would not be in touch."
# ===== the clock shop (112–148): rain outside; inside, a music box of a hundred clocks =====
drone(112.0, 7.0, 'D2', vel=.1); trem(112.0, 7.0, [m('F4')], vel=.05, cresc=1.5, inst='violas')
for k in range(48): ev(119.6 + k * .5, 'glockenspiel' if k % 3 else 'harp', m(['D6', 'A5', 'F5', 'A5', 'E6', 'A5', 'F5', 'A5'][k % 8]), .8, .1 + (.03 if k % 6 == 0 else 0), .3 - .02 * (k % 8))
pad(119.6, 11, ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'C', 'A', 'Dm', 'Gm', 'A'], vel=.08, upper='violas')
tick(126.6, vel=.36, inst='glass')                                                     # "Turn this knob"
ev(131.0, 'vibraphone_bowed', 'A6', 3.0, .12, .1); ev(133.8, 'vibraphone_bowed', 'D7', 3.0, .12, .1)   # "Seven turns."
ev(139.6, 'glass', 'F6', 2.4, .2, .2); ev(140.4, 'glass', 'A5', 2.4, .18, -.1)        # "Whatever you think a day is worth."
# ===== the first turn (148–166) =====
clock(148.6, 162.6, ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb'], vel=.1, per=6, cresc=1.2)
bowed(148.6, 5, ['Dm', 'Bb', 'Gm', 'A', 'Dm'], vel=.08)
trem(158.8, 4.0, [m('A4'), m('A#4')], vel=.07, cresc=2.6)
rewindFx(T['knob1'], vel=.6)
# ===== Ch II (166–216): the same Monday =====
tick(166.8, minor=False, vel=.42, big=True)                                             # it worked
harp(168.0, 9, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D'], vel=.15, per=3)
pad(168.0, 9, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D'], vel=.1, upper='violas')
melody(176.6, 'clarinet', [(0, 'A4', 2), (2, 'D5', 1), (3, 'E5', 2), (5, 'F#5', 4)], vel=.2, pan=.2)
ev(184.0, 'glockenspiel', 'D7', 1.4, .14, .3)
# the curtains: sunrise
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(193.2, 'violins' if m(p) >= 55 else 'cellos', p, 8.0, .2, 0, attack=1.4)
ev(193.2, 'horn', 'F#3', 7.0, .2, -.1, attack=1.2); ev(193.6, 'glockenspiel', 'F#6', 1.6, .2, .3); ev(194.0, 'glockenspiel', 'A6', 1.6, .2, .3)
melody(196.0, 'flute', [(0, 'F#5', 3), (3, 'E5', 1), (4, 'D5', 2), (6, 'A5', 6)], vel=.22, pan=.2)
# Pip again; Remi mouths along
melody(205.0, 'glockenspiel', PIP, vel=.22, pan=.25); melody(205.0, 'flute', PIP, vel=.16, pan=.2)
clock(204.4, 215.8, ['D', 'Bm', 'G', 'A'], vel=.1, per=6, inst='violins_pizz')
# ===== the montage (216–250): practising Monday. The clock drives, three rewinds, rising =====
clock(216.4, 237.6, ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'C', 'A', 'Dm'], vel=.12, per=6, cresc=1.2)
for i in range(8): ev(216.4 + i * BAR, 'timpani', ['D2', 'A#1', 'C2', 'A1'][i % 4], .6, .18 + .02 * i, 0)
ev(219.6, 'cellos', 'C#3', 1.0, .2, -.2)                                                 # "A bridge. No."
pad(224.0, 5, ['Dm', 'Bb', 'C', 'A', 'Dm'], vel=.1, upper='violas')
melody(233.2, 'horn', [(0, 'A3', 1), (1, 'D4', 1), (2, 'E4', 1), (3, 'F4', 3)], vel=.36)   # "She really did know."
clock(237.6, 249.6, ['Dm', 'Bb', 'C', 'A', 'Bb', 'A'], vel=.16, per=12, cresc=1.0)
for r in REW: rewindFx(r - .35, vel=.45, short=True)
trem(246.4, 3.6, [m('A4'), m('D5')], vel=.09, cresc=3.0)
# ===== the perfect answer (250–272) =====
hit(250.2, vel=.36, chord='D', cym=False)
harp(251.0, 8, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A'], vel=.16, per=6)
pad(251.0, 8, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A'], vel=.13, upper='violins')
melody(255.6, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'E4', 2), (5, 'F#4', 4)], vel=.36, pan=-.1)
hit(T['cheer'], vel=.5, chord='D', cym=True)
melody(265.2, 'violins', [(0, 'A4', 1), (1, 'D5', 1), (2, 'E5', 1), (3, 'F#5', 3), (6, 'A5', 6)], vel=.3, pan=.2)
# dusk (272–280): it still sounds like a party, but the clock creeps in underneath
pad(272.2, 3, ['G', 'D', 'A'], vel=.13, upper='violins')
clock(273.4, 279.6, ['G', 'D', 'A'], vel=.07, per=6, cresc=2.0, inst='cellos_pizz', bass=False)
ev(277.0, 'vibraphone_bowed', 'D#6', 3.0, .12, .1)
# Pip at home (280–290): her tune on a music box, alone
melody(280.4, 'glockenspiel', PIP, vel=.24, pan=.2, rate=.85)
ev(286.4, 'cellos', 'D2', 3.4, .14, -.2, attack=.6); ev(286.4, 'violas', 'D#3', 3.4, .09, .2, attack=.6)
# ===== 6:14 (290–299): rain, the beacons, a heart that runs, the headlights =====
drone(290.4, 6.8, 'D2', vel=.13); drone(290.4, 6.8, 'D#2', vel=.08, inst='contrabass')
for i in range(12): g = 1.0 - .055 * i; ev(290.6 + sum(1.0 - .055 * j for j in range(i)) * .62, 'timpani', 'D2', .5, .2 + .025 * i, 0)
trem(292.4, 4.8, [m('A4'), m('A#4')], vel=.08, cresc=4.0)
trem(293.6, 3.6, [m('D3'), m('D#3')], vel=.09, cresc=3.4, inst='cellos')
for k in range(12): ev(294.0 + k * .26, 'violins', m('D5') + k, .26, .12 + .03 * k, .2, attack=.02)
# 297.2: impact. Silence (hard stop) until 299
# after (299–312): a lament on the cello, minor, very low
drone(299.4, 12.4, 'D2', vel=.1); drone(299.4, 12.4, 'A2', vel=.06, inst='violas')
melody(300.4, 'cellos', [(0, 'A3', 3), (3, 'F3', 2), (5, 'E3', 1), (6, 'D3', 3), (9, 'C#3', 3), (12, 'D3', 6)], vel=.3, pan=-.1)
ev(301.2, 'glass', 'F5', 2.4, .14, .2)
# ===== Ch III (312–401): fourteen past six =====
bowed(312.4, 3, ['Dm', 'Gm', 'A'], vel=.1); melody(313.0, 'oboe', [(0, 'D5', 3), (3, 'C#5', 3)], vel=.16, pan=.2)
rewindFx(T['knob2'], vel=.5)
# try again: fast, anxious pizzicato
clock(324.2, 333.8, ['Dm', 'Gm', 'A', 'Dm'], vel=.15, per=12)
ev(324.6, 'cellos', 'D3', 1.0, .22, -.2); ev(329.0, 'cellos', 'A2', 1.0, .2, -.2)
# 6:13 again: the clock and the heart, faster
clock(334.4, 346.0, ['Dm', 'Bb', 'Gm', 'A'], vel=.13, per=6, cresc=1.6, inst='cellos_pizz')
heart(336.0, 11, gap=.86, vel=.18)
trem(339.4, 6.6, [m('A4'), m('A#4')], vel=.07, cresc=3.2)
hit(346.0, vel=.46, chord='Dm', cym=False)
trem(346.2, 4.2, [m('D5'), m('D#5')], vel=.09, cresc=3.6); trem(346.2, 4.2, [m('D3'), m('D#3')], vel=.09, cresc=3.0, inst='cellos')
for k in range(10): ev(347.4 + k * .3, 'violins', m('D5') + k, .3, .13 + .03 * k, .2, attack=.02)
# 350.4 impact; silence to 352.2; the last-but-one turn
rewindFx(T['knob3'], vel=.55)
# the watchmaker at dawn (356–401)
drone(356.4, 7.4, 'D2', vel=.11); trem(356.4, 6.0, [m('A3'), m('A#3')], vel=.07, cresc=1.8, inst='violas')
pad(364.0, 5, ['Gm', 'Dm', 'Bb', 'A', 'Dm'], vel=.1, upper='violas')
ev(370.6, 'glass', 'D5', 2.4, .16, .2)
harp(370.6, 4, ['Bb', 'F', 'Gm', 'A'], vel=.12, per=3)                                 # "A day isn't a recording."
for k in range(30): ev(379.0 + k * .45, 'glockenspiel' if k % 2 else 'harp', m(['D6', 'A5', 'F5', 'A5', 'E6', 'A5'][k % 6]), .7, .1, .3 - .03 * (k % 6))   # the clocks replay the day
bowed(379.4, 4, ['Dm', 'Bb', 'Gm', 'A', 'Dm'], vel=.08)
ev(389.4, 'cellos', 'G2', 4.0, .16, -.2, attack=.6)                                     # "Choosing is hard."
ev(393.2, 'violas', 'A3', 3.4, .12, .2, attack=.6)
for p in ['D3', 'A3', 'D4', 'F#4']: ev(397.0, 'violins' if m(p) >= 55 else 'cellos', p, 4.0, .18, 0, attack=.8)   # "Live it."
tick(397.8, minor=False, vel=.3, inst='glass')
# ===== Ch IV (401–468): the last Monday =====
harp(401.4, 6, ['D', 'Bm', 'G', 'A', 'D', 'A'], vel=.14, per=3)
melody(403.0, 'flute', PIP, vel=.24, pan=.2)
pad(409.2, 3, ['G', 'D', 'A'], vel=.13, upper='violins')
melody(409.2, 'horn', [(0, 'D4', 2), (2, 'E4', 1), (3, 'F#4', 3)], vel=.3)              # "I'll be there. I promise."
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(T['hug3'], 'violins' if m(p) >= 55 else 'cellos', p, 3.0, .2, 0, attack=.4)
# the office: she turns it down
drone(416.4, 15.0, 'D2', vel=.1); clock(417.0, 426.6, ['Dm'], vel=.06, per=3, inst='cellos_pizz', bass=False)
ev(422.0, 'violas', 'F3', 4.4, .12, .2, attack=.8)                                      # "I made a promise."
hit(426.6, vel=.3, chord='Bb', cym=False)                                                # "no second chance"
for p in ['D3', 'F#3', 'A3', 'D4']: ev(431.7, 'violins' if m(p) >= 55 else 'cellos', p, 3.6, .16, 0, attack=.5)   # "I know."
melody(432.0, 'horn', [(0, 'A3', 2), (2, 'D4', 4)], vel=.28)
# the park (434–468): golden; her tune; then the clock again, 6:12, 6:13, 6:14
harp(434.4, 5, ['D', 'G', 'D', 'A', 'D'], vel=.16, per=3); pad(434.4, 5, ['D', 'G', 'D', 'A', 'D'], vel=.12, upper='violins')
melody(436.4, 'flute', PIP, vel=.26, pan=.2); melody(441.4, 'flute', PIP2, vel=.24, pan=.2)
clock(446.0, 451.0, ['Dm', 'Bb', 'A'], vel=.13, per=12, cresc=1.4)
heart(446.2, 6, gap=.8, vel=.2)
trem(447.0, 4.0, [m('A4'), m('A#4')], vel=.08, cresc=3.6)
hit(451.0, vel=.6, chord='Dm', cym=True)                                                 # "Pip, wait!" — then only the van
# 451.0–454.6 silence; then relief
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(454.8, 'violins' if m(p) >= 55 else 'cellos', p, 4.0, .16, 0, attack=1.0)
melody(T['hug'], 'violins', [(0, 'A4', 2), (2, 'D5', 1), (3, 'E5', 2), (5, 'F#5', 4), (9, 'A5', 6)], vel=.3, pan=.2)
melody(T['hug'], 'cellos', [(0, 'D3', 6), (6, 'A2', 3), (9, 'D3', 6)], vel=.24, pan=-.15)
harp(T['hug'], 4, ['D', 'G', 'A', 'D'], vel=.16, per=6); ev(T['hug'], 'horn', 'F#3', 6.0, .24, -.1, attack=.6)
melody(463.4, 'glockenspiel', PIP, vel=.2, pan=.3)
# ===== the last night (468–490): one turn left; she doesn't take it =====
harp(468.4, 3, ['D', 'Bm', 'G'], vel=.11, per=3)
tick(472.0, minor=False, vel=.24, inst='glass')
trem(T['hover'] - 1.0, 3.2, [m('A4'), m('A#4')], vel=.05, cresc=2.0)
for p in ['D3', 'A3', 'D4', 'F#4']: ev(T['setDown'], 'violins' if m(p) >= 55 else 'cellos', p, 3.0, .16, 0, attack=.4)
ev(T['setDown'] + .2, 'glockenspiel', 'F#6', 1.4, .16, .3)
ev(T['lampOff'] + .4, 'vibraphone_bowed', 'A6', 5.0, .08, .1)
# ===== Ch V (490–555): Tuesday =====
tick(T['slap4'], minor=False, vel=.44, big=True)
harp(493.0, 10, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D', 'A'], vel=.15, per=3)
pad(493.0, 10, ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D', 'A'], vel=.11, upper='violas')
melody(498.6, 'clarinet', [(0, 'F#4', 2), (2, 'A4', 1), (3, 'D5', 3)], vel=.2, pan=.2)
ev(510.8, 'glockenspiel', 'A6', 1.2, .2, .3)
hit(513.0, vel=.42, chord='D', cym=True)                                                 # the cheer
melody(513.4, 'violins', [(0, 'A4', 1), (1, 'D5', 1), (2, 'E5', 1), (3, 'F#5', 3), (6, 'A5', 6)], vel=.28, pan=.2)
# the end: Pip's tune and the clock motif together, in major
harp(520.4, 8, ['D', 'Bm', 'G', 'A', 'D', 'G', 'A', 'D'], vel=.17, per=6); pad(520.4, 8, ['D', 'Bm', 'G', 'A', 'D', 'G', 'A', 'D'], vel=.15, upper='violins')
melody(521.4, 'flute', PIP, vel=.28, pan=.2); melody(526.4, 'flute', PIP2, vel=.26, pan=.2)
melody(526.4, 'cellos', [(0, 'G2', 3), (3, 'A2', 3), (6, 'B2', 3), (9, 'D3', 3)], vel=.24, pan=-.15)
melody(531.4, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'E4', 2), (5, 'F#4', 4)], vel=.34)
tick(536.0, minor=False, vel=.36)
for p in ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']: ev(540.0, 'violins' if m(p) >= 55 else 'cellos', p, 14.0, .26, 0, attack=1.0)
ev(540.0, 'horn', 'F#3', 12.0, .24, -.1, attack=.8); ev(540.0, 'horn', 'A3', 12.0, .22, .1, attack=.8)
ev(540.0, 'timpani', 'D2', 2.0, .32, 0); ev(540.0, 'sus_cymbal', None, None, .3, 0)
harp(540.0, 3, ['D', 'G', 'D'], vel=.18, per=3)
tick(547.0, minor=False, vel=.26, tr=12)

# —— Render ——
mus = S.render(EV, dur=DUR, master=False)
N = int(DUR * SR); mus = mus[:N]
def hard_stop(at, until, size=.9):
    cut = int(at * SR)
    tail = np.zeros((int(2.2 * SR), 2), np.float32); tail[:int(.3 * SR)] = mus[cut - int(.3 * SR):cut]
    tail = S.room(tail, size=size, mix=.9)
    mus[cut:int(until * SR)] = 0
    L = min(len(tail) - int(.3 * SR), N - cut)
    mus[cut:cut + L] += tail[int(.3 * SR):int(.3 * SR) + L] * np.linspace(1, 0, L)[:, None]
mus[:int(.8 * SR)] = 0
hard_stop(24.55, 24.6, .2)           # into the bell
hard_stop(102.6, 102.8, .5)          # "We'll be in touch."
hard_stop(297.2, 299.4, .3)          # the impact: nothing
hard_stop(350.4, 352.2, .3)
hard_stop(451.0, 454.8, .6)          # "Pip, wait!" — only the van
hard_stop(T['lampOff'], T['lampOff'] + .4, 1.2)
mus = S.room(mus, size=.55, mix=.2)
fade = int(1.4 * SR); mus[-fade:] *= np.linspace(1, 0, fade)[:, None]
mus /= max(1e-6, np.abs(mus).max()) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'score.wav'), mus.astype(np.float32), SR)
used = sorted({e['inst'] for e in EV})
open(os.path.join(HERE, 'out', 'score_instruments.txt'), 'w').write('\n'.join(used))
print('score', DUR, 's', len(EV), 'notes', used)
