# Mix: score (out/score.wav) + ambience beds per place + event foley + voices → out/mix.wav
# Reads events.json (export with: node core/render/events.mjs <project>) for voice and event times.
# Usage: <LIB>/.venv/bin/python mix.py
import sys, os, json, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *

E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']; N = int(DUR * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(31)
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
def place(buf, x, t, pan=0.0, g=1.0):
    s = int(t * SR); x = stereo(x, pan) if x.ndim == 1 else x
    if s >= len(buf) or s < 0: return
    n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n] * g
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
def full(fn): return fn(DUR)[:N]
def gate(*spans, fi=.5, fo=.5):
    g = np.zeros(N)
    for a, b in spans: g = np.maximum(g, np.clip(np.minimum((tt - a) / fi + 1, (b - tt) / fo + 1), 0, 1))
    return g
REWT = [238.5 + 9.0 * (i + .5) / 3 for i in range(3)]

# —— Ambience beds ——
NZ = full(noise); BR = full(brown)
def chirps(n, f0, f1, seed, d0=.06, d1=.16):
    r = np.random.default_rng(seed); o = np.zeros(N)
    for k in range(n):
        t0 = r.uniform(0, DUR); f = r.uniform(f0, f1); d = r.uniform(d0, d1); m = int(d * SR); x = np.arange(m) / SR
        ch = np.sin(2 * np.pi * np.cumsum(f * (1 + .35 * np.sin(2 * np.pi * r.uniform(15, 30) * x))) / SR) * np.sin(np.pi * x / d) ** 2
        s = int(t0 * SR); o[s:s + m] += ch[:max(0, min(m, N - s))] * r.uniform(.2, .6)
    return o
birds = chirps(380, 2600, 4300, 1)
# rain: a hiss, a patter of drops, gutters
drops = np.zeros(N)
for k in range(int(DUR * 40)):
    s = int(rng.uniform(0, DUR) * SR); x = t_(.02); d = bp(np.random.default_rng(k).standard_normal(len(x)), 1500, 7000) * np.exp(-x / .003)
    drops[s:s + len(x)] += d[:max(0, min(len(x), N - s))] * rng.uniform(.1, .5)
rainBed = bp(NZ, 400, 9000) * .5 + lp(np.roll(BR, 999), 300) * .5 + drops * .6
rainIn = lp(rainBed, 1200) * .7 + lp(np.roll(drops, 4444), 2500) * .4      # heard through glass
roomTone = lp(np.roll(BR, 4321), 160) * .7
officeHum = lp(np.roll(BR, 2222), 140) * .6 + np.sin(2 * np.pi * 60 * tt) * .015 + bp(np.roll(NZ, 5151), 400, 1400) * .04
def ticks(period, f0, f1, seed, sharp=.004, accent=1.0, offset=0.0):
    o = np.zeros(N); k = 0; t = offset
    while t < DUR - .1:
        s = int(t * SR); x = t_(.04); c = bp(np.random.default_rng(seed + k).standard_normal(len(x)), f0, f1) * np.exp(-x / sharp)
        o[s:s + len(x)] += c * (accent if k % 2 == 0 else .7); k += 1; t += period
    return o
bigTick = ticks(1.0, 1800, 6000, 11, .005, 1.0)                # the brass clock, close
shopTicks = sum(ticks(p, 1500 + 300 * i, 6000, 100 * i, .003, 1.0, o) * g for i, (p, o, g) in enumerate([(1.0, .0, 1), (.5, .13, .5), (1.0, .37, .7), (.75, .21, .5), (1.2, .55, .6), (.6, .41, .4)]))
traffic = lp(BR, 220) * .8 + bp(np.roll(NZ, 1234), 200, 1200) * .25 * (.5 + .5 * np.sin(2 * np.pi * .05 * tt) ** 2)
siren = np.zeros(N)
def addSiren(a, b, g=1.0):
    s, e = int(a * SR), int(b * SR); x = np.arange(e - s) / SR; f = np.where((x % 1.2) < .6, 960, 770)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)
    siren[s:e] += lp(y, 2500) * g * np.minimum(1, np.minimum(x / 1.5, (b - a - x) / 1.0))
addSiren(299.6, 312.0, .5); addSiren(350.6, 352.2, .35)
RAIN_OUT = [(0.0, 24.6), (112.0, 119.0), (290.0, 297.25), (299.0, 312.0), (346.0, 350.45)]
g_rain = gate(*RAIN_OUT, fi=.3, fo=.05)
g_rainIn = gate((119.0, 148.0), fi=.3, fo=.4)
g_flat = gate((35, 49.6), (52.2, 74), (166, 216), (280, 290), (312, 334), (401, 416), (468, 490), (497.2, 520), fi=.3, fo=.3)
g_morningBirds = gate((35, 49.6), (52.2, 74), (166, 216), (324, 334), (401, 416), (497.2, 520), fi=.6, fo=.4)
g_office = gate((86, 112), (216, 280), (334, 346), (416, 434), fi=.3, fo=.3)
g_shop = gate((119, 148), (356, 401), fi=.3, fo=.4)
g_macro = gate((24.6, 35), (49.6, 52.2), (148, 166), (352, 356), (490, 497.2), *[(r - .5, r + .5) for r in REWT], fi=.05, fo=.1)
g_nightTick = gate((312, 324), (468, 490), fi=.4, fo=.4)
g_street = gate((74, 86), (434, 468), (520, 555), fi=.6, fo=.8)
g_birdsOut = gate((434, 451), (454.6, 468), (520, 555), fi=1.0, fo=1.0)
amb = (stereo(rainBed * g_rain, -.2) + stereo(np.roll(rainBed, 77777) * g_rain, .2) + stereo(rainIn * g_rainIn * .5, -.3)
       + stereo(roomTone * (g_flat + g_shop) * .8, 0) + stereo(officeHum * g_office, 0) + stereo(traffic * g_office * .25, .3)
       + stereo(birds * (g_morningBirds * .3 + g_birdsOut * .7), -.3) + stereo(np.roll(birds, 9001) * g_birdsOut * .5, .35)
       + stereo(shopTicks * g_shop * .5, .2) + stereo(np.roll(shopTicks, 3333) * g_shop * .4, -.25)
       + stereo(bigTick * g_macro * .9, .05) + stereo(bigTick * g_nightTick * .35, -.1)
       + stereo(traffic * g_street, -.2) + stereo(np.roll(traffic, 8001) * g_street, .2)
       + stereo(siren * .6, -.4))
amb *= (1 - gate((297.25, 299.0), (350.45, 352.0), fi=.01, fo=.3))[:, None]      # the impact: everything stops
amb *= (1 - .7 * gate((451.0, 454.6), fi=.02, fo=.6))[:, None]                  # the grab: the world holds its breath
amb *= (1 - .5 * gate((482.4, 490.0), fi=.02, fo=.2))[:, None]                  # lamp off

# —— Foley ——
fx = np.zeros((N, 2))
def tone(f, d, tau, v=1.0, h=((1, 1),)):
    x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * x) for m, a in h) * np.exp(-x / tau) * np.minimum(1, x / .004)) * v
def ping(v=1.0, f=1568): return tone(f, .5, .14, v, ((1, 1), (2, .25)))
def place_m(buf, x, t): s = int(t * SR); n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n]
def stepW(v=1.0): d = .12; x = t_(d); return norm(bp(noise(d), 300, 2500) * np.exp(-x / .015) + np.sin(2 * np.pi * 160 * x) * np.exp(-x / .02) * .6) * v
def stepP(v=1.0): d = .09; x = t_(d); return norm(bp(noise(d), 600, 4500) * np.exp(-x / .014) + np.sin(2 * np.pi * 220 * x) * np.exp(-x / .012) * .35) * v
def stepWet(v=1.0): d = .16; x = t_(d); return norm(bp(noise(d), 700, 6000) * np.exp(-x / .03) * (1 + .5 * np.sin(2 * np.pi * 40 * x)) + np.sin(2 * np.pi * 200 * x) * np.exp(-x / .01) * .3) * v
def bell(d, v=1.0, far=False):
    """The alarm: a hammer between two bells, ~16 strikes a second."""
    o = np.zeros(int(d * SR) + int(.6 * SR)); k = 0; t = 0.0
    while t < d:
        f = 2350 if k % 2 else 2790; x = t_(.35)
        c = (np.sin(2 * np.pi * f * x) + .5 * np.sin(2 * np.pi * f * 2.76 * x) + .3 * np.sin(2 * np.pi * f * 5.4 * x)) * np.exp(-x / .09) + bp(noise(.35), 3000, 9000) * np.exp(-x / .004) * .6
        place_m(o, c, t); t += 1 / 16; k += 1
    o = norm(o) * v
    return lp(o, 3500) * .8 if far else o
def slap(v=1.0): o = np.zeros(int(.6 * SR)); place_m(o, thump(1, 150)[:int(.3 * SR)], 0); place_m(o, tone(2350, .3, .05, .3, ((1, 1), (2.76, .4))), .0); place_m(o, bp(noise(.08), 800, 4000) * np.exp(-t_(.08) / .01), 0); return norm(o) * v
def ratchet(d, v=1.0, rate=22):
    o = np.zeros(int(d * SR) + 2000); t = 0.0
    while t < d: place_m(o, click(1.6 + rng.uniform(-.2, .2), 1)[:1500] if True else 0, t); t += 1 / rate
    return norm(o) * v
def rewind(v=1.0, short=False):
    d = .55 if short else 1.1; o = np.zeros(int((d + 1.6) * SR))
    place_m(o, ratchet(d * .9, .5, 18), 0)
    x = t_(d); f = 5200 * np.exp(-x / (d * .45)) + 300                       # a tape running backwards: a falling chirp
    place_m(o, np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 * np.minimum(1, x / .05), .05)
    x2 = t_(d + .3); sw = bp(noise(d + .3), 1500, 9000) * (x2 / (d + .3)) ** 2 * .9; place_m(o, sw[::-1][::-1], 0)   # a rush up
    x3 = t_(1.4); place_m(o, bp(noise(1.4), 3000, 12000) * np.exp(-x3 / .3) * .5, d)
    return norm(o) * v
def spin(d, v=1.0): return ratchet(d, v, 30)
def screech(v=1.0, d=1.4):
    x = t_(d); f = 1700 + 300 * np.sin(2 * np.pi * 7 * x) + 200 * x
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(noise(d), 1200, 5000) * .7
    return norm(y * np.minimum(1, x / .05) * np.minimum(1, (d - x) / .05 + .2)) * v
def impact(v=1.0): x = t_(.5); return norm(lp(noise(.5), 300) * np.exp(-x / .08) + np.sin(2 * np.pi * 55 * x) * np.exp(-x / .15)) * v
def passby(v=1.0, d=3.6):
    x = t_(d); c = d / 2; g = 1 / (1 + ((x - c) / .55) ** 2); f = 95 * (1 + .12 * np.tanh(-(x - c) / .4))
    eng = np.sin(2 * np.pi * np.cumsum(f) / SR) + .5 * np.sign(np.sin(2 * np.pi * np.cumsum(f * 2) / SR)) * .3
    y = (lp(eng, 900) * .6 + bp(noise(d), 300, 6000) * .9) * g
    return np.stack([y * np.clip(.5 - (x - c) / 2.4, 0, 1) * 1.4, y * np.clip(.5 + (x - c) / 2.4, 0, 1) * 1.4], 1) / (np.abs(y).max() + 1e-9) * v
def shopBell(v=1.0): o = np.zeros(int(1.6 * SR)); place_m(o, tone(2637, 1.2, .35, .6, ((1, 1), (2.4, .3))), 0); place_m(o, tone(3136, 1.1, .3, .5, ((1, 1), (2.4, .3))), .12); place_m(o, tone(2637, .8, .25, .3), .3); return norm(o) * v
def tramBell(v=1.0): o = np.zeros(int(1.0 * SR)); [place_m(o, tone(1480, .5, .18, 1, ((1, 1), (2.7, .4))), k * .32) for k in range(2)]; return norm(o) * v
def tramGo(v=1.0, d=10.0):
    x = t_(d); f = 60 + 90 * np.minimum(1, x / 6); hum = np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(2 * np.pi * np.cumsum(f * 3) / SR)
    o = (lp(hum, 600) * .6 + bp(noise(d), 200, 2000) * .4) * np.minimum(1, x / .8) * np.clip(1 - (x - 4) / 6, 0, 1); return norm(o) * v
def cloth(v=1.0, d=.6): x = t_(d); return norm(bp(noise(d), 800, 5000) * np.sin(np.pi * x / d) ** 2) * v
def lightOff(v=1.0): o = np.zeros(int(.6 * SR)); place_m(o, click(1.4, 1), 0); return norm(o) * v
def setDown(v=1.0): o = np.zeros(int(.6 * SR)); place_m(o, thump(.8, 180)[:int(.25 * SR)], 0); place_m(o, tone(2350, .4, .08, .15, ((1, 1), (2.76, .3))), .0); return norm(o) * v
def buzz(v=1.0, n=3): o = np.zeros(int((n * .9) * SR)); x = t_(.45); b = np.sign(np.sin(2 * np.pi * 150 * x)) * .5 * np.sin(np.pi * x / .45) ** .5; [place_m(o, lp(b, 600), k * .9) for k in range(n)]; return norm(o) * v
def ringback(v=1.0, n=2): o = np.zeros(int(n * 3.0 * SR)); x = t_(1.0); y = (np.sin(2 * np.pi * 400 * x) + np.sin(2 * np.pi * 450 * x)) * np.minimum(1, np.minimum(x / .02, (1 - x) / .02)); [place_m(o, bp(y, 300, 3400), k * 3.0) for k in range(n)]; return norm(o) * v
def chairFx(v=1.0): o = np.zeros(int(.8 * SR)); place_m(o, creak(.6)[:int(.6 * SR)], 0); place_m(o, thump(.5, 120)[:int(.2 * SR)], .1); return norm(o) * v

STEP = {'wood': stepW, 'pave': stepP, 'wet': stepWet}
for e in EV:
    t0, k = e['t'], e['type']
    if k == 'chime': place(fx, ping(.12, 1318), t0)
    elif k == 'tick': place(fx, ping(.1, 2093), t0, .45)
    elif k == 'step': place(fx, STEP.get(e.get('surf'), stepP)(.3 * rng.uniform(.8, 1.1)), t0 + rng.uniform(-.01, .01), rng.uniform(-.2, .2))
    elif k == 'ring': place(fx, bell(e['d'], .9 if not e.get('far') else .55, bool(e.get('far'))), t0, .1)
    elif k == 'slap': place(fx, slap(.6), t0, .1)
    elif k == 'spin': place(fx, spin(e['d'], .35), t0, .1)
    elif k == 'rewind': place(fx, rewind(.6 if not e.get('short') else .45, bool(e.get('short'))), t0, 0)
    elif k == 'screech': place(fx, screech(.7), t0, -.3)
    elif k == 'screechFar': place(fx, lp(screech(.3, 1.0), 2500), t0, -.5)
    elif k == 'impact': place(fx, impact(.5), t0, 0)
    elif k == 'passby': place(fx, passby(.9), t0, 0)
    elif k in ('grabFx', 'cloth', 'curtain'): place(fx, cloth(.4 if k != 'curtain' else .5, .8 if k == 'curtain' else .5), t0, 0)
    elif k == 'shopBell': place(fx, shopBell(.4), t0, -.3)
    elif k == 'door': place(fx, creak(.5), t0, -.4)
    elif k == 'tramBell': place(fx, tramBell(.45), t0, .3)
    elif k == 'tramGo': place(fx, tramGo(.3), t0, .3)
    elif k == 'lightOff': place(fx, lightOff(.3), t0, .3)
    elif k == 'setDown': place(fx, setDown(.4), t0, 0)
    elif k == 'buzz': place(fx, buzz(.35), t0, .2)
    elif k == 'dial': place(fx, ringback(.25), t0, .1)
    elif k == 'chair': place(fx, chairFx(.35), t0, .2)

# —— Voices ——
VT = {e['id']: e['t'] for e in EV if e['type'] == 'voice'}
DLG = {e['id'] for e in EV if e['type'] == 'voice' and e.get('dlg')}
Dd = json.load(open(os.path.join(HERE, 'voices', 'dur.json')))
vo = np.zeros((N, 2)); vmask = np.zeros(N)
for k, t0 in VT.items():
    y, sr = sf.read(os.path.join(HERE, 'voices', k + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = resample_poly(y, SR, sr)
    y = compress(norm(y, .9), thr=.25, ratio=3.2)
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    if k in DLG: y = lp(y, 7000) * 1.05
    if k.startswith('d'): y = np.tanh(bp(y, 280, 4200) * 2.2) * .62                 # the clock radio
    if k == 'i08': y = bp(y, 300, 3400)                                              # the voicemail: a phone line
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    pan = -.12 if k.startswith('r') else .18 if k.startswith('k') else .15 if k[0] in 'wi' else .3 if k.startswith('d') else 0
    place(vo, y, t0, pan); s = int(t0 * SR); vmask[s:s + len(y)] = 1

# —— Music ——
m, sr = sf.read(os.path.join(HERE, 'out', 'score.wav'), always_2d=True)
mus = np.zeros((N, 2)); n = min(len(m), N); mus[:n] = m[:n]
duck = uniform_filter1d(vmask, int(.35 * SR)); mus *= (1 - .2 * np.clip(duck * 1.6, 0, 1))[:, None]

def lvl(x, db): sel = np.abs(x).sum(1) > 1e-4; r = np.sqrt(np.mean(x[sel] ** 2)) if sel.any() else 1; return x * (10 ** (db / 20)) / (r + 1e-9)
voS = lvl(vo, -17); musS = lvl(mus, -21); ambS = lvl(amb, -31); fxS = lvl(fx, -26)
bedG = np.ones(N)
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):   # each line dips the bed just enough for 10 dB; overlapping dips take the deeper one
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); need = rms_db(voS[a:b]) - 10 - rms_db((musS + ambS + fxS)[a:b]) - 1.5; g = min(1.0, 10 ** (need / 20))
    env = np.interp(tt, [t0 - .35, t0 - .05, t0 + Dd[k] + .1, t0 + Dd[k] + .6], [1.0, g, g, 1.0]); bedG = np.minimum(bedG, env)
musS *= bedG[:, None]; ambS *= (.2 + .8 * bedG)[:, None]; fxS *= (.45 + .55 * bedG)[:, None]
mix = voS + musS + ambS + fxS
pk = np.abs(mix).max(); mix = np.tanh(mix / max(pk, 1e-6) * 1.2) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print('wrote out/mix.wav', DUR, 's | vo', round(rms_db(voS), 1), 'mus', round(rms_db(musS), 1), 'amb', round(rms_db(ambS), 1), 'fx', round(rms_db(fxS), 1))
low = []
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); gap = rms_db(voS[a:b]) - rms_db((musS + ambS + fxS)[a:b])
    if gap < 7: low.append(f'{k}@{t0:.1f}:{gap:.1f}dB')
print('voice over bed below 7 dB:', low or 'none')
