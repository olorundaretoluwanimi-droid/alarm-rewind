// The world of "What If Your Alarm Clock Could Rewind the Day?": one scene, many dioramas.
// Larkfield (the street, the zebra crossing with its amber beacons, the tram stop, the clock shop, the park) for the outdoor shots;
// cut-away interiors far east of town: Remi and Pip's flat, the office of Halden Architects, the clock shop inside,
// and a table-top macro set where the brass clock is a metre tall (its knob, its bells, its counter window).
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow } from './px.js';
import { box, mat } from './kit.js';
import { sky, stars, rain, flick } from './fx.js';
import { cmats, Windows, building, shopFront, lampPost, car, tram, bed, sign, solid, pixText } from './city_art.js';
import { cardboard, pendant, table, chair, fridge } from './props.js';
import { makeChar } from './chars.js';
import { T, REW, clockMin } from './story.js';
import { track, seg, ss, lerp, clamp, mulberry } from '/core/lib.js';

const C = c => new THREE.Color(c);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const stdM = o => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
const TT = (w, h, f) => { const P = new PX(w, h); P.fill(f); return P.done(); };

// —— Light keys: each set owns one ——
const KEYS = {
  dark: { top: '#05070c', mid: '#0a0e16', hor: '#121822', sun: '#506080', sunI: .05, sunDir: [-10, 30, 20], hemiS: '#2a3446', hemiG: '#06070a', hemiI: .22, fog: '#0a0e16', fogD: .03, exp: 1.35, moon: 0 },
  night: { top: '#03050c', mid: '#0b1428', hor: '#1e2c46', sun: '#8ea8e0', sunI: .45, sunDir: [-20, 34, 16], hemiS: '#3a4c7a', hemiG: '#0a0c14', hemiI: 1.2, fog: '#121c30', fogD: .018, exp: 1.45, moon: .2 },
  rainDusk: { top: '#141a2a', mid: '#2a3248', hor: '#4a4e62', sun: '#8a94b8', sunI: .35, sunDir: [-30, 20, 20], hemiS: '#4a5470', hemiG: '#14141c', hemiI: 1.3, fog: '#262c3c', fogD: .02, exp: 1.4, moon: 0 },
  morning: { top: '#46689a', mid: '#90b0d4', hor: '#f0e2c8', sun: '#fff0d8', sunI: 2.1, sunDir: [30, 30, 34], hemiS: '#b0c4e0', hemiG: '#4a4030', hemiI: 1.2, fog: '#c4c8c8', fogD: .0045, exp: 1.05, moon: 0 },
  grey: { top: '#4a5462', mid: '#7a8492', hor: '#a8acb2', sun: '#d8dce4', sunI: .9, sunDir: [20, 34, 30], hemiS: '#9aa2ae', hemiG: '#3a3a3c', hemiI: 1.4, fog: '#8a9098', fogD: .008, exp: 1.1, moon: 0 },
  gold: { top: '#3a4a7a', mid: '#c08a80', hor: '#ffc080', sun: '#ffc080', sunI: 2.8, sunDir: [-40, 16, 26], hemiS: '#e0b0a0', hemiG: '#4a3a30', hemiI: 1.8, fog: '#c09080', fogD: .005, exp: 1.25, moon: 0 },
  sunny: { top: '#3a70b0', mid: '#80b4e0', hor: '#e8eef0', sun: '#fff4e0', sunI: 2.6, sunDir: [24, 36, 30], hemiS: '#b8d0ec', hemiG: '#4a4436', hemiI: 1.3, fog: '#c8d4dc', fogD: .004, exp: 1.02, moon: 0 },
  flatDawn: { top: '#1a2236', mid: '#3a4a66', hor: '#6a7a96', sun: '#a8b8e0', sunI: .4, sunDir: [-20, 30, 26], hemiS: '#6a7a9a', hemiG: '#1e1e26', hemiI: 1.25, fog: '#1e2638', fogD: .02, exp: 1.35, moon: 0 },
  flatDay: { top: '#3a5070', mid: '#8aa0b8', hor: '#e0dccc', sun: '#ffe8cc', sunI: 1.0, sunDir: [-20, 30, 26], hemiS: '#b0b8c8', hemiG: '#3a3430', hemiI: 1.2, fog: '#8a8a88', fogD: .015, exp: 1.12, moon: 0 },
  flatNight: { top: '#05070c', mid: '#0c1220', hor: '#1a2234', sun: '#7a8ab0', sunI: .15, sunDir: [-20, 30, 26], hemiS: '#3a4868', hemiG: '#14141c', hemiI: .8, fog: '#121826', fogD: .02, exp: 1.35, moon: 0 },
  office: { top: '#5a6a80', mid: '#a0acbc', hor: '#dce0e4', sun: '#f0f0f4', sunI: .9, sunDir: [10, 30, 30], hemiS: '#c0c8d4', hemiG: '#3a3a3e', hemiI: 1.4, fog: '#a0a8b0', fogD: .01, exp: 1.1, moon: 0 },
  officeDusk: { top: '#1a1a34', mid: '#4a3a5a', hor: '#c06a50', sun: '#ff9a60', sunI: .6, sunDir: [-30, 14, 30], hemiS: '#6a5a78', hemiG: '#1a1418', hemiI: 1.0, fog: '#3a2a3a', fogD: .012, exp: 1.3, moon: 0 },
  shop: { top: '#1a120c', mid: '#3a2a1e', hor: '#6a4a30', sun: '#ffd0a0', sunI: .25, sunDir: [20, 30, 26], hemiS: '#a08060', hemiG: '#2a1a10', hemiI: .9, fog: '#2a1e16', fogD: .02, exp: 1.3, moon: 0 },
  shopDawn: { top: '#16203a', mid: '#3a4a6a', hor: '#8a8ca0', sun: '#a8b8e0', sunI: .4, sunDir: [-20, 30, 26], hemiS: '#6a7898', hemiG: '#1a1814', hemiI: 1.0, fog: '#1e2434', fogD: .02, exp: 1.35, moon: 0 },
  macro: { top: '#0a0c12', mid: '#141820', hor: '#20242e', sun: '#c8d4ff', sunI: .3, sunDir: [24, 20, 30], hemiS: '#3a4258', hemiG: '#0c0c10', hemiI: .7, fog: '#0c0e14', fogD: .01, exp: 1.3, moon: 0 },
};
function mixKey(a, b, k) {
  const A = KEYS[a], B = KEYS[b], o = {};
  for (const n in A) { if (typeof A[n] === 'number') o[n] = lerp(A[n], B[n], k); else if (Array.isArray(A[n])) o[n] = A[n].map((v, i) => lerp(v, B[n][i], k)); else o[n] = C(A[n]).lerp(C(B[n]), k); }
  return o;
}

// —— Pixel materials ——
const wallpaper = (cols, seed, stripe = 12) => { const R = ramp(cols, .45); return mat(TT(48, 48, (x, y) => R(.5 + ((x + (y >> 3) * 4) % stripe < 2 ? .16 : 0) + (fbm(x * .15, y * .15, seed) - .5) * .2, x, y))); };
const panels = (cols, seed) => { const R = ramp(cols, .45); return mat(TT(48, 48, (x, y) => R(.5 + (x % 16 === 0 ? -.3 : x % 16 === 1 ? .15 : 0) + (y % 24 === 0 ? -.25 : 0) + (fbm(x * .3, y * .05, seed) - .5) * .3, x, y))); };
const MAT = {};
function mats2() {
  if (MAT.ok) return MAT;
  MAT.flatWall = wallpaper(['#6a5a4a', '#80705e', '#968674', '#ac9c8a'], 13);
  MAT.kitWall = wallpaper(['#4a6a6a', '#5a7e7c', '#6c9290', '#80a6a2'], 15, 6);
  MAT.officeWall = wallpaper(['#8a8e92', '#9ea2a6', '#b2b6ba', '#c6cacc'], 21, 48);
  MAT.shopWall = panels(['#2a160c', '#3c2214', '#52301c', '#683e24'], 19);
  MAT.macroWall = wallpaper(['#2a2a3a', '#36364a', '#44445a', '#52526a'], 23);
  MAT.brass = solid(['#5a3a10', '#8a6020', '#b88a34', '#e0b858', '#fff0a0'], 29);
  MAT.brassD = solid(['#3a2208', '#5a3a12', '#7a5420', '#9a6e30'], 31);
  MAT.curtain = solid(['#3a1a2a', '#542638', '#6e3448', '#884a5c'], 37);
  MAT.duvet = solid(['#2a3a5a', '#3a4e74', '#4e6490', '#6a80aa'], 39);
  MAT.grass = solid(['#1e3a1a', '#2a4e22', '#3a662c', '#4e7e38'], 41);
  MAT.leaf = solid(['#14301a', '#1e4a24', '#2e6a30', '#46883e'], 43);
  MAT.counter = solid(['#2a1408', '#42200e', '#5a2e16', '#743e20'], 45);
  MAT.white = solid(['#9aa4a8', '#c4ccce', '#e2e8e8', '#f6f8f6'], 61);
  MAT.metal = cmats().metal; MAT.wood = cmats().wood;
  MAT.ok = true; return MAT;
}

// —— The brass clock: face, hands, two bells and a hammer, the knob on the side, the counter window ——
function faceTex() {
  const P = new PX(96, 96), cr = ramp(['#c8bc9a', '#e2d8bc', '#f2ecd8', '#fbf8ee'], .45);
  P.fill((x, y) => { const dx = (x + .5 - 48) / 48, dy = (y + .5 - 48) / 48, d = Math.hypot(dx, dy); if (d > 1) return null; if (d > .93) return [150, 110, 40]; return cr(.75 - d * .3 + (h2(x, y, 3) - .5) * .1 - (dy > .4 ? .08 : 0), x, y); });
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r0 = i % 5 ? .84 : .76; for (let r = r0; r < .9; r += .02) P.set(48 + Math.sin(a) * r * 48, 48 - Math.cos(a) * r * 48, i % 5 ? [120, 100, 80] : [40, 30, 24]); }
  for (const [n, a] of [['12', 0], ['3', 90], ['6', 180], ['9', 270]]) { const r = .6, x = 48 + Math.sin(a * Math.PI / 180) * r * 48, y = 48 - Math.cos(a * Math.PI / 180) * r * 48; const w = n.length * 8 - 2; pixText(P, n, Math.round(x - w / 2), Math.round(y - 5), [36, 26, 20], 2); }
  P.rect(40, 66, 16, 12, [60, 40, 20]); P.rect(41, 67, 14, 10, [24, 18, 14]);   // the counter window's frame
  pixText(P, 'R', 30, 69, [150, 40, 30], 1);
  return texOf(P.done());
}
const DIGITS = [];
function digitTex(n) { if (DIGITS[n]) return DIGITS[n]; const P = new PX(12, 10); P.fill(() => [24, 18, 14]); pixText(P, String(n), 4, 2, n <= 1 ? [255, 120, 80] : [255, 220, 150], 1); return (DIGITS[n] = texOf(P.done())); }
function brassClock() {
  const g = new THREE.Group(), M = mats2();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .26, 40).rotateX(Math.PI / 2), M.brass); body.position.y = .62; body.castShadow = true; g.add(body);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .05, 40).rotateX(Math.PI / 2), M.brassD); back.position.set(0, .62, -.15); g.add(back);
  const ft = faceTex(), face = new THREE.Mesh(new THREE.CircleGeometry(.45, 48), stdM({ map: ft, emissive: C('#ffffff'), emissiveMap: ft, emissiveIntensity: .0, roughness: .6 }));
  face.position.set(0, .62, .132); g.add(face);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(.465, .035, 8, 40), M.brass); bezel.position.set(0, .62, .13); g.add(bezel);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.45, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .06, depthWrite: false, blending: THREE.AdditiveBlending })); glass.position.set(0, .62, .15); g.add(glass);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.13, .1), new THREE.MeshBasicMaterial({ map: digitTex(7) })); win.position.set(0, .62 - .284, .136); g.add(win);
  const hands = new THREE.Group(); hands.position.set(0, .62, .14); g.add(hands);
  const hM = stdM({ color: '#1a1410', roughness: .5 });
  const hr = new THREE.Mesh(new THREE.BoxGeometry(.04, .24, .012).translate(0, .1, 0), hM), mn = new THREE.Mesh(new THREE.BoxGeometry(.028, .36, .012).translate(0, .16, .006), hM);
  const al = new THREE.Mesh(new THREE.BoxGeometry(.018, .3, .01).translate(0, .13, .012), stdM({ color: '#c02a1a', roughness: .5 }));
  hands.add(hr, mn, al); const cap = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .03, 12).rotateX(Math.PI / 2), M.brass); cap.position.z = .02; hands.add(cap);
  const bells = [];
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.brass); b.position.set(s * .27, 1.06, -.02); b.rotation.z = -s * .45; b.castShadow = true; g.add(b); bells.push(b); const st = box(.03, .14, .03, M.brassD); st.position.set(s * .2, .95, -.02); st.rotation.z = -s * .5; g.add(st); }
  const hamG = new THREE.Group(); hamG.position.set(0, 1.0, -.02); g.add(hamG);
  const ham = box(.025, .16, .025, M.brassD); hamG.add(ham); const ball = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), M.brass); ball.position.y = .17; hamG.add(ball);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.16, .02, 6, 20, Math.PI), M.brass); handle.position.set(0, 1.12, -.02); g.add(handle);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .05, .2, 8), M.brassD); l.position.set(s * .3, .1, 0); l.rotation.z = s * .35; g.add(l); const f = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), M.brass); f.position.set(s * .34, .02, 0); g.add(f); }
  const knob = new THREE.Group(); knob.position.set(.52, .62, 0); g.add(knob);
  const kn = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .08, 12).rotateZ(Math.PI / 2), M.brass); knob.add(kn);
  for (let i = 0; i < 6; i++) { const r = box(.09, .02, .02, M.brassD); r.geometry.translate(0, -.01, 0); r.position.set(0, Math.cos(i * Math.PI / 3) * .09, Math.sin(i * Math.PI / 3) * .09); r.rotation.x = i * Math.PI / 3; knob.add(r); }
  const kstem = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .06, 8).rotateZ(Math.PI / 2), M.brassD); kstem.position.x = -.05; knob.add(kstem);
  const kR = sign('R', .09, .09, { bg: '#7a1a10', fg: '#ffe0a0', k: .8, edge: '#7a1a10', lit: .4 }); kR.position.set(.045, 0, 0); kR.rotation.y = Math.PI / 2; knob.add(kR);
  g.userData = {
    face, win, knob, hamG,
    set(min, count, ring, t) {
      const m = ((min % 720) + 720) % 720;
      hr.rotation.z = -m / 720 * Math.PI * 2; mn.rotation.z = -(m % 60) / 60 * Math.PI * 2; al.rotation.z = 0;
      win.material.map = digitTex(Math.max(0, Math.min(7, count))); hamG.rotation.z = ring ? Math.sin(t * 90) * .35 : 0;
      g.position.x += 0;
    },
  };
  return g;
}
// —— A small bike lying on its side (the cold open) ——
function bike3D() {
  const g = new THREE.Group(), red = solid(['#3a0808', '#7a1414', '#b82424', '#e44a3a'], 47), tyre = stdM({ color: '#141418', roughness: .9 });
  const wheels = [];
  for (const x of [-.42, .42]) { const w = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(.26, .035, 8, 24), tyre); w.add(t); for (let i = 0; i < 4; i++) { const sp = box(.01, .5, .01, cmats().rail, { cast: false }); sp.geometry.translate(0, -.25, 0); sp.rotation.z = i * Math.PI / 4; w.add(sp); } w.position.set(x, 0, 0); g.add(w); wheels.push(w); }
  for (const [x0, y0, x1, y1] of [[-.42, 0, 0, 0], [0, 0, -.15, .32], [-.42, 0, -.15, .32], [0, 0, .3, .3], [-.15, .32, .3, .3], [.3, .3, .42, 0], [.3, .3, .36, .5]]) {
    const L = Math.hypot(x1 - x0, y1 - y0), b = new THREE.Mesh(new THREE.BoxGeometry(L, .035, .035), red); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); b.castShadow = true; g.add(b);
  }
  const bar = box(.04, .04, .4, cmats().dark); bar.position.set(.36, .5, 0); g.add(bar);
  const seat = box(.18, .05, .08, cmats().dark); seat.position.set(-.15, .33, 0); g.add(seat);
  g.userData.wheels = wheels; return g;
}
function plant(scale = 1, seed = 1) {
  const g = new THREE.Group(), pot = new THREE.Mesh(new THREE.CylinderGeometry(.13 * scale, .1 * scale, .22 * scale, 8).translate(0, .11 * scale, 0), solid(['#5a2a1a', '#7a3a24', '#9a4e30'], 41));
  pot.castShadow = true; g.add(pot);
  const R = mulberry(seed), lm = mats2().leaf;
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.12 * scale, 6, 4), lm); l.position.set((R() - .5) * .22 * scale, (.28 + R() * .3) * scale, (R() - .5) * .22 * scale); l.scale.y = 1.3; l.castShadow = true; g.add(l); }
  return g;
}
function tree(h = 4, seed = 1) {
  const g = new THREE.Group(), R = mulberry(seed);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, h * .5, 6).translate(0, h * .25, 0), solid(['#2a1a10', '#3e2818', '#543822'], 49)); tr.castShadow = true; g.add(tr);
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(h * (.2 + R() * .08), 0), mats2().leaf); l.position.set((R() - .5) * h * .4, h * (.55 + R() * .35), (R() - .5) * h * .4); l.castShadow = true; g.add(l); }
  return g;
}
// a little wall clock (office, shop wall): face + two hands; set(min)
function wallClock(r = .22, frame = '#2a2a2e') {
  const g = new THREE.Group(), ft = faceTex();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, .05, 28).rotateX(Math.PI / 2), stdM({ color: frame })); g.add(rim);
  const f = new THREE.Mesh(new THREE.CircleGeometry(r, 32), stdM({ map: ft, roughness: .7 })); f.position.z = .03; g.add(f);
  const hM = stdM({ color: '#141010' });
  const hr = new THREE.Mesh(new THREE.BoxGeometry(r * .09, r * .5, .01).translate(0, r * .22, 0), hM), mn = new THREE.Mesh(new THREE.BoxGeometry(r * .06, r * .78, .01).translate(0, r * .36, .004), hM);
  hr.position.z = .04; mn.position.z = .045; g.add(hr, mn);
  g.userData.set = min => { const m = ((min % 720) + 720) % 720; hr.rotation.z = -m / 720 * Math.PI * 2; mn.rotation.z = -(m % 60) / 60 * Math.PI * 2; };
  return g;
}
function skylineTex(lit) {
  const P = new PX(160, 60), R = mulberry(7), sk = lit ? ramp(['#1a1a34', '#4a3a5a', '#a05a50', '#e08a5a'], .45) : ramp(['#8aa0b8', '#a8bccc', '#c8d4dc', '#e0e6ea'], .45);
  P.fill((x, y) => sk(lit ? 1 - y / 60 * .9 : .3 + y / 60 * .7, x, y));
  let x = 0; while (x < 160) { const w = 8 + Math.floor(R() * 14), h = 14 + Math.floor(R() * 34), c = lit ? [26 + R() * 14, 24 + R() * 10, 40 + R() * 14] : [96 + R() * 30, 104 + R() * 30, 118 + R() * 30];
    for (let yy = 60 - h; yy < 60; yy++) for (let xx = x; xx < x + w; xx++) P.set(xx, yy, ((xx - x) % 3 === 1 && (yy - 60 + h) % 4 === 2 && yy > 60 - h + 1) ? (lit ? (R() < .6 ? [255, 200, 120] : c) : [70, 84, 100]) : c);
    x += w + 1 + Math.floor(R() * 3); }
  return texOf(P.done());
}

export function buildWorld() {
  const M = cmats(), M2 = mats2(), scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#101a2e', .006);
  const SK = sky(); scene.add(SK.mesh);
  const ST = stars(500, 11); scene.add(ST);
  const sun = new THREE.DirectionalLight('#ffffff', 1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 200; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  const sunT = new THREE.Object3D(); scene.add(sunT); sun.target = sunT; scene.add(sun);
  const hemi = new THREE.HemisphereLight('#ffffff', '#222222', 1); scene.add(hemi);
  const W = new Windows(5000); scene.add(W.mesh);
  const R = mulberry(81);

  // ================= Larkfield =================
  const CR = { x: 4 }, SHX = -4, TS = { x: -16 }, HB = { x: 15, w: 10, floors: 4 };
  const gnd = box(420, .2, 300, M.asphalt, { cast: false }); gnd.position.set(0, -.2, 0); scene.add(gnd);
  const road = box(240, .04, 6, M.asphalt, { cast: false }); road.position.set(0, -.02, 0); scene.add(road);
  for (const s of [-1, 1]) { const pv = box(240, .14, 2.4, M.paving, { cast: false }); pv.position.set(0, 0, s * 4.2); scene.add(pv); const kb = box(240, .16, .2, M.kerb, { cast: false }); kb.position.set(0, 0, s * 3.05); scene.add(kb); }
  for (let x = -110; x < 110; x += 4) { if (Math.abs(x - CR.x) < 4) continue; const d = box(2, .03, .12, M.paint, { cast: false }); d.position.set(x, .01, 0); scene.add(d); }
  // the zebra crossing and its amber beacons
  for (let i = 0; i < 6; i++) { const s = box(2.6, .03, .5, M.paint, { cast: false }); s.position.set(CR.x, .015, -2.5 + i * 1.0); scene.add(s); }
  for (const s of [-1, 1]) { const zz = box(.12, .03, 6, M.yellow, { cast: false }); zz.position.set(CR.x + s * 3.4, .016, 0); scene.add(zz); }
  const beacons = [];
  for (const [x, z] of [[CR.x - 1.7, -3.4], [CR.x + 1.7, 3.4]]) {
    for (let k = 0; k < 6; k++) { const b = box(.1, .42, .1, k % 2 ? M.dark : M.paint); b.position.set(x, .14 + k * .42, z); scene.add(b); }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 8), new THREE.MeshBasicMaterial({ color: C('#ff9a20') })); globe.position.set(x, 2.8, z); scene.add(globe);
    const gl = glow('#ffa030', 1.4, 1.2); gl.position.copy(globe.position); scene.add(gl);
    const L = new THREE.PointLight('#ffa030', 0, 7, 2); L.position.copy(globe.position); scene.add(L);
    beacons.push({ globe, gl, L });
  }
  // north shop row (Remi's building has a laundry; the clock shop; the office tower further west)
  const row = [
    { x: -64, w: 14, mat: 'brickY', floors: 5 }, { x: -48, w: 16, mat: 'concreteB', floors: 7 }, { x: -32, w: 14, mat: 'concreteW', floors: 4 },
    { x: -18, w: 12, mat: 'brick', floors: 4 }, { x: SHX, w: 14, mat: 'stone', floors: 3 }, { x: HB.x, w: HB.w, mat: 'brickD', floors: HB.floors },
    { x: 28, w: 14, mat: 'concrete', floors: 5 }, { x: 44, w: 16, mat: 'brick', floors: 4 }, { x: 60, w: 14, mat: 'concreteB', floors: 5 }, { x: 76, w: 16, mat: 'brickY', floors: 4 },
  ];
  for (const b of row) scene.add(building(W, { x: b.x, z: -11.4, w: b.w, d: 12, floors: b.floors, mat: b.mat, shop: true, rnd: R, lampP: .3, wpm: .45, roofBoxes: 2 }));
  for (const [x, w, sg, inside] of [[-64, 10, 'PHARMACY', '#c8f0d8'], [-48, 12, 'HALDEN ARCHITECTS', '#e0e8ff'], [-32, 10, 'BAKERY', '#ffc070'], [-18, 8, 'FLORIST', '#ffc8a0'], [HB.x, 6, 'LAUNDRY', '#d8e8ff'], [28, 10, 'GROCER', '#ffe0a0'], [44, 12, 'HARDWARE', '#ffd8a0'], [60, 10, 'BOOKS', '#ffd0e0']]) {
    const s = shopFront(w, 3.6, { sign: sg, inside, signO: { bg: '#16181e', fg: '#e8d8a8', k: sg.length > 10 ? .4 : .55 } }); s.position.set(x, 0, -5.38); scene.add(s);
  }
  // the clock shop: warm window full of clocks
  const shopF = shopFront(8, 3.6, { sign: 'CLOCKS  &  REPAIRS', inside: '#ffc070', opacity: .2, signO: { bg: '#20140e', fg: '#f0dca8', k: .5, font: '"Cormorant Garamond"' } }); shopF.position.set(SHX, 0, -5.38); scene.add(shopF); shopF.userData.glass.depthWrite = false;
  const swin = box(7.6, .3, 1.0, M2.counter); swin.position.set(SHX, 0, -6.0); scene.add(swin);
  const sback = box(7.6, 3.2, .1, M2.shopWall); sback.position.set(SHX, 0, -6.8); scene.add(sback);
  const winClocks = [];
  for (let i = 0; i < 7; i++) { const c = wallClock(.14 + (i % 3) * .05, ['#5a3a10', '#2a2a2e', '#7a2a1a'][i % 3]); c.position.set(SHX - 3 + i * 1.0, 1.0 + (i % 2) * .9, -6.7); scene.add(c); winClocks.push(c); }
  const shopGlow = new THREE.PointLight('#ffb060', 0, 7, 2); shopGlow.position.set(SHX, 2.0, -5.6); scene.add(shopGlow);
  // tram stop (south pavement)
  const shel = new THREE.Group(); scene.add(shel); shel.position.set(TS.x, .14, 4.9);
  { const rf = box(3.4, .1, 1.2, M.metal); rf.position.y = 2.5; shel.add(rf); for (const x of [-1.6, 1.6]) { const p = box(.08, 2.5, .08, M.metal); p.position.set(x, 0, .5); shel.add(p); } const bk = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), new THREE.MeshStandardMaterial({ color: '#9ab0c0', transparent: true, opacity: .3, roughness: .1 })); bk.position.set(0, 1.2, -.5); shel.add(bk); const bn = box(2.2, .08, .4, M.wood); bn.position.set(0, .45, -.3); shel.add(bn); const sg = sign('TRAM  9', 1.2, .3, { bg: '#16304a', fg: '#f0e6c8', k: .6, lit: .6 }); sg.position.set(0, 2.75, .62); shel.add(sg); }
  const tramA = tram({ len: 14 }); tramA.position.set(TS.x, .02, 1.4); scene.add(tramA);
  // the south side: blocks, and the park beside the crossing
  for (const [x0, x1] of [[-90, -60], [-58, -30], [-28, -6], [44, 70], [72, 100]]) { const b = box(x1 - x0, 3.4, 10, M[['brick', 'concrete', 'brickY', 'concreteW'][Math.abs(x0) % 4]], { cast: false }); b.position.set((x0 + x1) / 2, 0, 12); scene.add(b); }
  const PK = { x0: CR.x + 3, x1: 42, z0: 5.5, z1: 22 };
  const grass = box(PK.x1 - PK.x0, .1, PK.z1 - PK.z0, M2.grass, { cast: false }); grass.position.set((PK.x0 + PK.x1) / 2, 0, (PK.z0 + PK.z1) / 2); scene.add(grass);
  const path = box(PK.x1 - PK.x0, .12, 1.6, M.paving, { cast: false }); path.position.set((PK.x0 + PK.x1) / 2, 0, 9.0); scene.add(path);
  for (const [x, z, h, s] of [[CR.x + 15, 19.5, 5, 3], [CR.x + 20, 16, 6, 5], [CR.x + 28, 12, 4.5, 7], [CR.x + 6, 17, 5.5, 9], [CR.x + 34, 18, 6, 11], [CR.x + 16, 6.4, 3.8, 13]]) { const tr = tree(h, s); tr.position.set(x, 0, z); scene.add(tr); }
  const BEN = V3(CR.x + 7, 0, 7.6);
  { const s = box(1.8, .08, .45, M.wood); s.position.set(BEN.x, .44, BEN.z); scene.add(s); const bk = box(1.8, .4, .06, M.wood); bk.position.set(BEN.x, .5, BEN.z + .24); scene.add(bk); for (const x of [-.8, .8]) { const l = box(.06, .44, .4, M.metal); l.position.set(BEN.x + x, 0, BEN.z); scene.add(l); } }
  const fence = box(PK.x1 - PK.x0, .5, .06, M.metal); fence.position.set((PK.x0 + PK.x1) / 2, 0, PK.z0 + .1); scene.add(fence);
  const lamps = [];
  for (const x of [-42, -28, -14, 0, 14, 28, 56, 70]) { const L = lampPost(4.8); L.position.set(x, 0, 4.95); L.rotation.y = Math.PI / 2; scene.add(L); lamps.push(L); }
  const lampGlows = lamps.map(L => { const g = glow('#ffd9a0', 1.6, .9); g.position.copy(L.localToWorld(L.userData.head.clone())); g.material.depthTest = false; g.renderOrder = 6; scene.add(g); return g; });
  const parked = [];
  for (const [x, col] of [[-36, ['#1a2a3a', '#2a4058', '#3c5878', '#527296']], [-24, ['#3a1a1a', '#5a2828', '#7a3a38', '#9a5048']], [30, ['#2a2a2a', '#404040', '#5a5a5a', '#787878']], [50, ['#3a3420', '#585030', '#786c44', '#988a5a']]]) { const c = car(col, { seed: x & 7 }); c.position.set(x, 0, -2.15); scene.add(c); parked.push(c); }
  const mats = ['concrete', 'brick', 'brickD', 'brickY', 'concreteW', 'concreteB', 'stone'];
  for (let gx = -140; gx <= 140; gx += 24) for (const gz of [-30, -50, -74, -98, 30, 46]) {
    if (gz > 0 && gx > -2 && gx < 46) continue;
    const n = 1 + Math.floor(R() * 2.5);
    for (let k = 0; k < n; k++) { const w = 16 / n - .6, x = gx - 8 + (k + .5) * 16 / n, d = 12 + R() * 3, fl = 3 + Math.floor(R() * (Math.abs(gz) > 60 ? 5 : 3));
      scene.add(building(W, { x, z: gz, w, d, floors: fl, mat: mats[Math.floor(R() * mats.length)], rnd: R, lampP: .3, wpm: .34, cast: Math.abs(gz) < 40 })); }
  }
  // the van (front faces +x) with its headlights; the bike in the road
  const van = car(['#9a9a96', '#c0c0bc', '#dcdcd8', '#f0f0ec'], { len: 5.2, seed: 3 }); scene.add(van);
  const vanHL = []; for (const s of [-1, 1]) { const g = glow('#fff4d8', .5, 1.3); g.material.depthTest = false; g.renderOrder = 8; scene.add(g); vanHL.push([g, s]); }
  const vanSpot = new THREE.SpotLight('#fff0d0', 0, 40, .5, .5, 1.2); scene.add(vanSpot); scene.add(vanSpot.target);
  const bikeR = bike3D(); scene.add(bikeR);
  const blueL = new THREE.PointLight('#4a7aff', 0, 14, 2); scene.add(blueL);
  const rainT = rain(2200, [CR.x - 24, 0, -7, CR.x + 16, 9, 9], { seed: 5, opacity: .17 }); scene.add(rainT);
  const rainS = rain(1400, [SHX - 10, 0, -6.6, SHX + 14, 7, 6], { seed: 7, opacity: .18 }); scene.add(rainS);

  // ================= Interiors =================
  const FL = V3(230, 0, 0), OF = V3(280, 0, 0), SH = V3(330, 0, 0), CM = V3(400, 0, 0);
  // —— the flat: bedroom left, kitchen right, front cut away ——
  const FW_ = 5.0, FD = 3.4, FH_ = 2.7;
  const flat = new THREE.Group(); flat.position.copy(FL); scene.add(flat);
  const F = {};
  { const fl = box(FW_ + .32, .1, FD + .16, M.wood, { cast: false }); fl.position.set(0, -.1, -.08); flat.add(fl);
    const bk = box(FW_ * .55, FH_, .16, M2.flatWall); bk.position.set(-FW_ / 2 + FW_ * .275 + .08, 0, -FD / 2 - .08); flat.add(bk);
    const bk2 = box(FW_ * .45 + .16, FH_, .16, M2.kitWall); bk2.position.set(FW_ / 2 - FW_ * .225 + .08, 0, -FD / 2 - .08); flat.add(bk2);
    const lw0 = box(.16, FH_, 1.7, M2.flatWall); lw0.position.set(-FW_ / 2 - .08, 0, -FD / 2 + .85); flat.add(lw0);
    const lw1 = box(.16, FH_ - 2.1, 1.7, M2.flatWall); lw1.position.set(-FW_ / 2 - .08, 2.1, .85); flat.add(lw1);
    const rw = box(.16, FH_, FD, M2.kitWall); rw.position.set(FW_ / 2 + .08, 0, 0); flat.add(rw);
    const door = box(.06, 2.1, 1.0, solid(['#3a2a1c', '#4e3a28', '#644a34'], 59)); door.geometry.translate(0, 0, .5); door.position.set(-FW_ / 2 - .06, 0, .15); flat.add(door); F.door = door;
    const B = bed(); B.position.set(-1.35, 0, -FD / 2 + .62); flat.add(B);
    const duvet = box(1.25, .1, 1.04, M2.duvet); duvet.position.set(-1.0, .55, -FD / 2 + .62); flat.add(duvet); F.duvet = duvet;
    const ns = box(.45, .52, .4, M.wood); ns.position.set(.0, 0, -FD / 2 + .3); flat.add(ns);
    const lampB = box(.14, .28, .14, solid(['#a89470', '#c8b48a', '#e2d0a4'], 41)); lampB.position.set(-.12, .52, -FD / 2 + .28); flat.add(lampB); F.lampAt = V3(-.12, .9, -FD / 2 + .32);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, .18, 10, 1, true), stdM({ color: '#e8c890', emissive: C('#ffb060'), emissiveIntensity: .0, side: THREE.DoubleSide })); shade.position.set(-.12, .86, -FD / 2 + .28); flat.add(shade); F.shade = shade;
    const ck = brassClock(); ck.scale.setScalar(.16); ck.position.set(.1, .52, -FD / 2 + .32); ck.rotation.y = -.25; flat.add(ck); F.clock = ck;
    const radio = box(.22, .12, .1, solid(['#2a3a2a', '#3a5038', '#4e684a'], 43)); radio.position.set(.0, .52, -FD / 2 + .2); flat.add(radio);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ color: C('#1a2438') })); win.position.set(-1.0, 1.55, -FD / 2 + .005); flat.add(win); F.win = win;
    const wfr = box(1.2, .06, .1, M.paint, { cast: false }); wfr.position.set(-1.0, .98, -FD / 2 + .05); flat.add(wfr);
    F.curt = [];
    for (const s of [-1, 1]) { const c = box(.36, 1.4, .06, M2.curtain); c.position.set(-1.0 + s * .38, .9, -FD / 2 + .12); flat.add(c); F.curt.push([c, s]); }
    const rail = box(1.6, .04, .04, M.metal, { cast: false }); rail.position.set(-1.0, 2.3, -FD / 2 + .12); flat.add(rail);
    const rug = box(1.6, .02, 1.1, M.rug, { cast: false }); rug.position.set(-.8, 0, .5); flat.add(rug);
    const tb = table(1.1, .8, .74); tb.position.set(1.45, 0, .2); flat.add(tb);
    for (const [x, r] of [[.75, 0], [2.15, Math.PI]]) { const ch = chair(M.wood); ch.position.set(x, 0, .2); ch.rotation.y = r; flat.add(ch); }
    const fr = fridge(); fr.position.set(2.15, 0, -FD / 2 + .4); flat.add(fr);
    const ctr = box(1.3, .9, .6, M2.white); ctr.position.set(1.15, 0, -FD / 2 + .3); flat.add(ctr);
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .2, 10).translate(0, .1, 0), stdM({ color: '#c04a2a' })); kettle.position.set(1.0, .9, -FD / 2 + .3); flat.add(kettle);
    const cereal = box(.14, .24, .06, solid(['#c08a1a', '#e0b030', '#f4d060'], 45)); cereal.position.set(1.3, .74, .15); flat.add(cereal);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.08, .05, .06, 10).translate(0, .03, 0), stdM({ color: '#e8e0d0' })); bowl.position.set(1.1, .74, .3); flat.add(bowl);
    const helmetHook = box(.04, .04, .1, M.metal); helmetHook.position.set(-FW_ / 2 + .02, 1.5, -.25); flat.add(helmetHook);
    const bikeIn = bike3D(); bikeIn.position.set(-FW_ / 2 + .28, .3, -.5); bikeIn.rotation.y = Math.PI / 2; bikeIn.scale.setScalar(.85); flat.add(bikeIn); F.bike = bikeIn;
    const pl = plant(1.0, 3); pl.position.set(2.2, 0, 1.2); flat.add(pl);
    for (const [x, y, w, h, s] of [[-2.0, 1.7, .4, .5, 1], [.5, 1.8, .5, .35, 2]]) { const R2 = ramp(['#3a2a1a', '#6a5a3a', '#9a8a5a', '#c8b88a'], .45); const pc = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stdM({ map: texOf(TT(Math.round(w * 40), Math.round(h * 40), (x2, y2) => { const b = Math.min(x2, y2, w * 40 - 1 - x2, h * 40 - 1 - y2); return b < 2 ? [60, 40, 30] : R2(.4 + fbm(x2 * .1, y2 * .1, s) * .6, x2, y2); })) })); pc.position.set(x, y, -FD / 2 + .01); flat.add(pc); }
    const card = new THREE.Mesh(new THREE.PlaneGeometry(.16, .12), stdM({ color: '#f4e6c8', emissive: C('#ffd0a0'), emissiveIntensity: .2 })); card.rotation.x = -Math.PI / 2; card.position.set(1.25, .745, .38); flat.add(card); F.card = card;
  }
  const lampL = new THREE.PointLight('#ffb870', 0, 7, 2); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -.003; lampL.position.copy(FL).add(F.lampAt).add(V3(0, .1, .35)); scene.add(lampL);
  const lampG = glow('#ffc070', .6, 1); lampG.position.copy(FL).add(F.lampAt).add(V3(0, -.05, 0)); scene.add(lampG);
  const kitL = new THREE.PointLight('#fff0d8', 0, 7, 2); kitL.position.copy(FL).add(V3(1.4, 2.3, .2)); scene.add(kitL);
  const kitPend = pendant('#ffe0b0', .5); kitPend.position.copy(FL).add(V3(1.45, FH_, .2)); scene.add(kitPend);
  const winL = new THREE.PointLight('#a8b8e0', 0, 8, 1.6); winL.castShadow = true; winL.shadow.mapSize.set(1024, 1024); winL.shadow.bias = -.003; scene.add(winL);
  const shaftM = new THREE.MeshBasicMaterial({ color: '#ffe8b8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const shaftP = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.2), shaftM); shaftP.position.copy(FL).add(V3(-.8, 1.0, -.6)); shaftP.rotation.set(-.9, .2, 0); scene.add(shaftP);
  // —— the office: a glass wall with the city, the table, two chairs, a wall clock ——
  const office = new THREE.Group(); office.position.copy(OF); scene.add(office);
  const O = {};
  { const fl = box(6, .1, 4.4, M.wood, { cast: false }); fl.position.set(0, -.1, 0); office.add(fl);
    const lw = box(.16, 2.9, 4.4, M2.officeWall); lw.position.set(-3.0, 0, 0); office.add(lw);
    const rw = box(.16, 2.9, 4.4, M2.officeWall); rw.position.set(3.0, 0, 0); office.add(rw);
    O.dayTex = skylineTex(false); O.duskTex = skylineTex(true);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 2.6), new THREE.MeshBasicMaterial({ map: O.dayTex, fog: false })); view.position.set(0, 1.45, -2.4); office.add(view); O.view = view;
    for (let i = 0; i < 5; i++) { const m = box(.08, 2.9, .1, M.metal); m.position.set(-2.9 + i * 1.45, 0, -2.2); office.add(m); }
    const sill = box(6, .5, .2, M2.officeWall); sill.position.set(0, 0, -2.2); office.add(sill);
    const tp = box(6, .2, .2, M.metal); tp.position.set(0, 2.8, -2.2); office.add(tp);
    const tb = table(1.6, .9, .76, M2.white); tb.position.set(0, 0, 0); office.add(tb);
    for (const [x, r] of [[-1.05, 0], [1.05, Math.PI]]) { const ch = chair(); ch.position.set(x, 0, .02); ch.rotation.y = r; office.add(ch); }
    const model = new THREE.Group(); model.position.set(.15, .76, -.1); office.add(model);
    for (const [x, z, h] of [[0, 0, .3], [.14, .05, .2], [-.12, .08, .14]]) { const b = box(.1, h, .1, M2.white); b.position.set(x, 0, z); model.add(b); }
    const papers = box(.3, .01, .22, stdM({ color: '#f0ece0' }), { cast: false }); papers.position.set(-.45, .76, .1); office.add(papers);
    const wc = wallClock(.24); wc.position.set(-2.91, 2.05, -.9); wc.rotation.y = Math.PI / 2; office.add(wc); O.clock = wc;
    const pl = plant(1.4, 7); pl.position.set(2.5, 0, -1.6); office.add(pl);
    const shelf = box(.4, 1.8, 1.2, M.wood); shelf.position.set(2.75, 0, .9); office.add(shelf);
    const lsign = sign('HALDEN', 1.2, .3, { bg: '#e8e8ea', fg: '#2a2a30', k: .6, edge: '#e8e8ea' }); lsign.position.set(-2.91, 2.4, 1.0); lsign.rotation.y = Math.PI / 2; office.add(lsign);
    O.doorAt = V3(2.7, 0, 1.4);
  }
  const offL = new THREE.PointLight('#f0f0ff', 0, 9, 1.6); offL.castShadow = true; offL.shadow.mapSize.set(1024, 1024); offL.shadow.bias = -.003; offL.position.copy(OF).add(V3(.4, 2.6, 1.0)); scene.add(offL);
  const offWin = new THREE.PointLight('#c8d8ff', 0, 8, 1.4); offWin.position.copy(OF).add(V3(0, 1.6, -1.6)); scene.add(offWin);
  // —— the clock shop: panelled walls covered in clocks, a counter, warm pendants ——
  const shop = new THREE.Group(); shop.position.copy(SH); scene.add(shop);
  const S = { clocks: [], pend: [] };
  { const fl = box(5.2, .1, 3.6, M.wood, { cast: false }); fl.position.set(0, -.1, 0); shop.add(fl);
    const bk = box(5.2, 2.9, .16, M2.shopWall); bk.position.set(0, 0, -1.8); shop.add(bk);
    const rw = box(.16, 2.9, 3.6, M2.shopWall); rw.position.set(2.6, 0, 0); shop.add(rw);
    const lw0 = box(.16, 2.9, 1.2, M2.shopWall); lw0.position.set(-2.6, 0, -1.2); shop.add(lw0);
    const lw1 = box(.16, .6, 2.4, M2.shopWall); lw1.position.set(-2.6, 2.3, .6); shop.add(lw1);
    const lw2 = box(.16, .7, 2.4, M2.shopWall); lw2.position.set(-2.6, 0, .6); shop.add(lw2);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ color: C('#2a3450'), fog: false })); pane.position.set(-2.55, 1.5, .6); pane.rotation.y = Math.PI / 2; shop.add(pane); S.pane = pane;
    const ctr = box(2.4, .95, .6, M2.counter); ctr.position.set(.7, 0, -.45); shop.add(ctr);
    const top = box(2.5, .05, .7, M.wood); top.position.set(.7, .95, -.45); shop.add(top);
    const R3 = mulberry(19);
    for (let i = 0; i < 16; i++) { const r = .1 + R3() * .14, c = wallClock(r, ['#5a3a10', '#2a2a2e', '#7a2a1a', '#3a4a2a'][i % 4]); c.position.set(-2.1 + (i % 8) * .58 + (R3() - .5) * .1, 1.35 + Math.floor(i / 8) * .62 + (R3() - .5) * .12, -1.7); shop.add(c); S.clocks.push([c, R3() * 720, .5 + R3() * 2]); }
    for (let i = 0; i < 3; i++) { const cs = box(.36, 1.7, .26, M.wood); cs.position.set(1.5 + i * .4, 0, -1.6); shop.add(cs); const pd = new THREE.Group(); pd.position.set(1.5 + i * .4, 1.2, -1.45); shop.add(pd); const rod = box(.015, .5, .015, M2.brass, { cast: false }); rod.geometry.translate(0, -.25, 0); pd.add(rod); const bob = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .02, 12).rotateX(Math.PI / 2), M2.brass); bob.position.y = -.52; pd.add(bob); S.pend.push(pd); const f = wallClock(.12, '#5a3a10'); f.position.set(1.5 + i * .4, 1.45, -1.46); shop.add(f); }
    const ck = brassClock(); ck.scale.setScalar(.17); ck.position.set(.35, .97, -.4); shop.add(ck); S.clock = ck;
    const lamp = box(.14, .3, .14, M2.brass); lamp.position.set(1.4, .97, -.55); shop.add(lamp);
    const loupe = new THREE.Mesh(new THREE.CylinderGeometry(.05, .04, .06, 10), cmats().dark); loupe.position.set(1.1, .98, -.3); shop.add(loupe);
    for (const x of [-1.2, .6]) { const p = pendant('#ffcf8a', .7); p.position.set(x, 2.9, -.2); shop.add(p); }
  }
  const shopL1 = new THREE.PointLight('#ffb870', 0, 7, 1.8); shopL1.castShadow = true; shopL1.shadow.mapSize.set(1024, 1024); shopL1.shadow.bias = -.003; shopL1.position.copy(SH).add(V3(.6, 2.1, -.1)); scene.add(shopL1);
  const shopL2 = new THREE.PointLight('#ffc890', 0, 6, 1.8); shopL2.position.copy(SH).add(V3(-1.2, 2.1, .3)); scene.add(shopL2);
  const shopW = new THREE.PointLight('#8aa0d8', 0, 6, 1.6); shopW.position.copy(SH).add(V3(-2.0, 1.6, .6)); scene.add(shopW);
  // —— the macro set: the clock a metre tall on a night table ——
  const macro = new THREE.Group(); macro.position.copy(CM); scene.add(macro);
  const X = {};
  { const top = box(4.4, .1, 2.6, M.wood, { cast: false }); top.position.set(0, -.1, 0); macro.add(top);
    const wall = box(6, 4, .16, M2.macroWall); wall.position.set(0, -1, -1.3); macro.add(wall);
    const ck = brassClock(); ck.position.set(0, 0, 0); ck.rotation.y = -.18; macro.add(ck); X.clock = ck;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(.16, .14, .5, 16).translate(0, .25, 0), new THREE.MeshStandardMaterial({ color: '#c8dce8', transparent: true, opacity: .35, roughness: .05 })); glass.position.set(-1.1, 0, .2); macro.add(glass);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(.145, .13, .3, 16).translate(0, .15, 0), new THREE.MeshStandardMaterial({ color: '#8ab0c8', transparent: true, opacity: .4 })); water.position.set(-1.1, 0, .2); macro.add(water);
    for (let i = 0; i < 3; i++) { const b = box(.9, .1, .6, solid([['#3a1a14', '#5a2a1e', '#7a3a28'], ['#14283a', '#1e3c56', '#2a5272'], ['#2a3a1a', '#3c5228', '#526a36']][i], 51 + i)); b.position.set(1.2, i * .1, -.2); b.rotation.y = .1 * (i - 1); macro.add(b); }
    const ph = box(.36, .03, .7, cmats().dark); ph.position.set(-.8, 0, .7); ph.rotation.y = .3; macro.add(ph);
    const phS = new THREE.Mesh(new THREE.PlaneGeometry(.3, .62), new THREE.MeshBasicMaterial({ color: '#0a0c10' })); phS.rotation.x = -Math.PI / 2; phS.rotation.z = .3; phS.position.set(-.8, .035, .7); macro.add(phS); X.phone = phS;
  }
  const mLamp = new THREE.PointLight('#ffb870', 0, 8, 1.6); mLamp.castShadow = true; mLamp.shadow.mapSize.set(1024, 1024); mLamp.shadow.bias = -.003; mLamp.position.copy(CM).add(V3(-2.0, 2.2, 1.0)); scene.add(mLamp);
  const mWin = new THREE.PointLight('#a8c0ff', 0, 9, 1.4); mWin.position.copy(CM).add(V3(2.4, 2.4, 1.6)); scene.add(mWin);
  const mRim = new THREE.PointLight('#ffe0b0', 0, 5, 2); mRim.position.copy(CM).add(V3(.8, 1.6, -.8)); scene.add(mRim);
  const kGlow = glow('#ffd8a0', .5, 1.2); kGlow.position.copy(CM).add(V3(.55, .62, .05)); scene.add(kGlow);

  // ================= Cast =================
  const remi = makeChar('hero', 'remi'), remiN = makeChar('hero', 'remiN', { tag: 'remiN' });
  const pip = makeChar('kid', 'pip'), pipH = makeChar('kid', 'pipH', { tag: 'pipH' });
  [pip, pipH].forEach(c => c.mesh.scale.setScalar(1));
  const watch = makeChar('watch', 'watch'), boss = makeChar('folk', 'boss', { tag: 'boss' }), dir = makeChar('folk', 't4', { tag: 'director' });
  const folk = ['t1', 't2', 't5', 't7', 't8', 't6'].map(l => makeChar('folk', l));
  const all = [remi, remiN, pip, pipH, watch, boss, dir, ...folk];
  all.forEach(c => { scene.add(c.root); c.root.visible = false; });
  const fill = new THREE.PointLight('#c8d4f0', 0, 8, 2); scene.add(fill);
  const camKey = new THREE.PointLight('#ffe2c4', 0, 0, 2); scene.add(camKey);
  const blinkOr = (t, f, b, s = 0) => (((t + s) % 3.7) < .12 ? b : f);
  const KID = .74;
  const place = (c, x, y, z) => { c.root.visible = true; c.root.position.set(x, y, z); c.root.scale.setScalar(c === pip || c === pipH ? KID : 1); };
  const walk4 = (t, fps = 7, pre = 'w') => pre + (Math.floor(t * fps) % 4);
  const ride = (t, fps = 4) => Math.floor(t * fps) % 2 ? 'ride1' : 'ride0';
  const Fl = (x, y, z) => [FL.x + x, y, FL.z + z], Of = (x, y, z) => [OF.x + x, y, OF.z + z], Sh = (x, y, z) => [SH.x + x, y, SH.z + z], Cm = (x, y, z) => [CM.x + x, y, CM.z + z], Tn = (x, y, z) => [CR.x + x, y, z];

  // —— Cameras per shot (local time) ——
  const WAKE_P = track([[0, Fl(1.7, 2.7, 3.7)], [14, Fl(1.3, 2.4, 3.1)]]), WAKE_L = track([[0, Fl(-1.1, .6, -1.0)], [14, Fl(-1.0, .65, -1.0)]]);
  const KIT_P = track([[0, Fl(.3, 1.9, 4.3)], [16, Fl(.2, 1.7, 3.7)]]), KIT_L = track([[0, Fl(.1, .9, .2)], [16, Fl(.1, .9, .2)]]);
  const OFF_P = track([[0, Of(.3, 1.8, 4.6)], [26, Of(.2, 1.6, 3.9)]]), OFF_L = track([[0, Of(0, .95, 0)], [26, Of(0, .95, 0)]]);
  const CAM = {
    cold: { p: track([[0, Tn(6.4, 2.9, 7.4)], [8, Tn(5.2, 2.4, 6.2)], [18, Tn(4.0, 1.9, 5.0)], [18.4, Tn(-1.6, .85, 2.4)], [24.6, Tn(-1.2, .7, 1.9)]]), l: track([[0, Tn(-1, .6, 0)], [18, Tn(0, .7, .6)], [18.4, Tn(.4, .3, .5)], [24.6, Tn(.4, .3, .5)]]), fov: 32 },
    title: { p: track([[0, Cm(.1, 1.05, 3.8)], [10.4, Cm(0, .95, 2.7)]]), l: track([[0, Cm(0, .72, 0)], [10.4, Cm(0, .7, 0)]]), fov: 30 },
    wake1: { p: WAKE_P, l: WAKE_L, fov: 32 },
    snooze: { p: track([[0, Cm(.3, .85, 1.8)], [2.6, Cm(.2, .8, 1.6)]]), l: track([[0, Cm(0, .64, 0)], [2.6, Cm(0, .64, 0)]]), fov: 30 },
    up1: { p: track([[0, Fl(1.3, 2.4, 3.1)], [5.8, Fl(1.1, 2.2, 2.9)]]), l: track([[0, Fl(-1.0, .7, -.8)], [5.8, Fl(-1.4, .8, -.4)]]), fov: 32 },
    kitchen: { p: KIT_P, l: KIT_L, fov: 32 }, kitchen2: { p: KIT_P, l: KIT_L, fov: 32 }, tryA: { p: KIT_P, l: KIT_L, fov: 32 },
    kitchen3: { p: track([[0, Fl(.3, 1.9, 4.3)], [12, Fl(.2, 1.5, 3.2)], [15, Fl(.15, 1.4, 2.9)]]), l: track([[0, Fl(.1, .9, .2)], [15, Fl(.2, .8, .3)]]), fov: 32 },
    tram: { p: track([[0, Tn(-38, 3.0, 8.6)], [12, Tn(-26, 2.6, 8.4)]]), l: track([[0, Tn(-28, 1.2, 1.4)], [12, Tn(-14, 1.4, 1.4)]]), fov: 34 },
    office1: { p: OFF_P, l: OFF_L, fov: 32 }, office4: { p: OFF_P, l: OFF_L, fov: 32 },
    office2: { p: track([[0, Of(.6, 1.6, 3.6)], [22, Of(.4, 1.4, 2.9)]]), l: track([[0, Of(.1, .95, 0)], [22, Of(.1, .95, 0)]]), fov: 32 },
    montage: { p: track([[0, Of(-.8, 1.7, 4.0)], [8, Of(-.6, 1.6, 3.6)], [8.01, Of(1.9, 1.3, 2.2)], [21, Of(1.7, 1.25, 2.0)], [21.01, Of(.2, 1.8, 4.2)], [34, Of(.1, 1.6, 3.6)]]), l: track([[0, Of(.2, .95, 0)], [8, Of(.2, .95, 0)], [8.01, Of(.6, 1.0, 0)], [21, Of(.6, 1.0, 0)], [21.01, Of(0, .95, 0)], [34, Of(0, .95, 0)]]), fov: 32 },
    dusk: { p: track([[0, Of(-1.6, 1.6, 3.4)], [8, Of(-1.3, 1.5, 3.0)]]), l: track([[0, Of(.0, 1.2, -.6)], [8, Of(.0, 1.2, -.6)]]), fov: 34 },
    office3: { p: track([[0, Of(-.6, 1.6, 3.0)], [12, Of(-.2, 1.5, 2.4)]]), l: track([[0, Of(1.2, 1.3, -1.2)], [12, Of(1.3, 1.35, -1.3)]]), fov: 32 },
    pipCard: { p: track([[0, Fl(.8, 1.6, 3.3)], [10, Fl(.4, 1.5, 3.4)]]), l: track([[0, Fl(.7, .7, .2)], [10, Fl(-.6, .8, .3)]]), fov: 32 },
    shopExt: { p: track([[0, [SHX + 7.5, 1.9, 3.0]], [7, [SHX + 4.5, 1.7, 1.4]]]), l: track([[0, [SHX + 1.5, 1.3, -4.6]], [7, [SHX, 1.4, -5.4]]]), fov: 32 },
    shop: { p: track([[0, Sh(-.2, 1.9, 4.2)], [29, Sh(-.1, 1.6, 3.2)]]), l: track([[0, Sh(0, 1.1, -.4)], [29, Sh(0, 1.1, -.4)]]), fov: 32 },
    shop2: { p: track([[0, Sh(-.2, 1.8, 3.6)], [22, Sh(-.1, 1.6, 3.2)], [22.01, Sh(-1.8, 1.6, .2)], [35, Sh(1.0, 1.7, .0)], [35.01, Sh(-.3, 1.5, 2.6)], [45, Sh(-.2, 1.45, 2.3)]]), l: track([[0, Sh(0, 1.1, -.4)], [22, Sh(0, 1.1, -.4)], [22.01, Sh(-1.4, 1.6, -1.7)], [35, Sh(.8, 1.6, -1.7)], [35.01, Sh(0, 1.15, -.3)], [45, Sh(0, 1.15, -.3)]]), fov: 32 },
    night1: { p: track([[0, Cm(.8, 1.3, 3.6)], [10, Cm(.45, 1.0, 2.4)], [11, Cm(1.6, .85, 1.5)], [18, Cm(1.35, .8, 1.25)]]), l: track([[0, Cm(.1, .65, 0)], [10, Cm(.1, .65, 0)], [11, Cm(.45, .62, 0)], [18, Cm(.48, .62, 0)]]), fov: 30 },
    wake2: { p: track([[0, Fl(1.7, 2.7, 3.7)], [8, Fl(1.4, 2.4, 3.2)], [26, Fl(.0, 1.3, 1.5)]]), l: track([[0, Fl(-1.1, .6, -1.0)], [8, Fl(-1.0, .7, -.9)], [26, Fl(-.9, .95, -.5)]]), fov: 32 },
    light: { p: track([[0, Fl(.8, 1.5, 2.8)], [12, Fl(.6, 1.4, 2.4)]]), l: track([[0, Fl(-1.0, 1.3, -1.6)], [12, Fl(-1.0, 1.35, -1.6)]]), fov: 34 },
    crossing1: { p: track([[0, Tn(8.5, 1.5, -.6)], [6.8, Tn(7.8, 1.4, -.8)]]), l: track([[0, Tn(-4, 1.0, -1.6)], [6.8, Tn(-4, .9, -1.8)]]), fov: 34 },
    crossing2: { p: track([[0, Tn(7.6, 1.3, -.4)], [6, Tn(7.0, 1.2, -.6)]]), l: track([[0, Tn(-4, .9, -1.6)], [6, Tn(-4, .9, -1.6)]]), fov: 34 },
    after1: { p: track([[0, Tn(3.6, 1.6, 4.6)], [13, Tn(2.8, 1.25, 3.6)]]), l: track([[0, Tn(.4, .5, .8)], [13, Tn(.8, .55, .9)]]), fov: 32 },
    night2: { p: track([[0, Fl(.5, 1.5, 2.7)], [12, Fl(.0, 1.2, 1.9)]]), l: track([[0, Fl(-.7, .8, -.6)], [12, Fl(-.8, .8, -.7)]]), fov: 32 },
    night3: { p: track([[0, Fl(.5, 1.5, 2.7)], [22, Fl(-.1, 1.15, 1.8)]]), l: track([[0, Fl(-.7, .8, -.6)], [22, Fl(-.8, .75, -.7)]]), fov: 32 },
    turn2: { p: track([[0, Cm(1.5, .85, 1.4)], [4, Cm(1.3, .8, 1.2)]]), l: track([[0, Cm(.46, .62, 0)], [4, Cm(.48, .62, 0)]]), fov: 30 },
    park: { p: track([[0, Tn(12.5, 2.3, 13.5)], [12, Tn(11.5, 2.1, 12.5)], [17, Tn(5.4, 1.6, 7.6)], [24, Tn(4.4, 1.45, 7.0)], [29, Tn(3.4, 1.4, 6.2)], [34, Tn(9, 4.6, 11)]]), l: track([[0, Tn(8.5, .8, 8.2)], [12, Tn(7.5, .8, 7.6)], [17, Tn(.6, .9, 3.2)], [24, Tn(.4, .9, 3.0)], [29, Tn(.4, .9, 3.2)], [34, Tn(0, 1.0, -1)]]), fov: 34 },
    tuesM: { p: track([[0, Cm(.2, 1.0, 2.8)], [7.2, Cm(.05, .9, 2.1)]]), l: track([[0, Cm(0, .7, 0)], [7.2, Cm(0, .68, 0)]]), fov: 30 },
    tuesday: { p: track([[0, Fl(.9, 1.8, 3.2)], [22.8, Fl(.2, 1.4, 2.3)]]), l: track([[0, Fl(-.8, .9, -.6)], [22.8, Fl(-.6, 1.0, -.5)]]), fov: 32 },
    endWide: { p: track([[0, Tn(-4, 1.8, 9.4)], [14, Tn(0, 2.2, 9.8)], [35, Tn(18, 26, 46)]]), l: track([[0, Tn(-8, 1.0, 3.4)], [14, Tn(-2, 1.0, 3.4)], [35, Tn(0, 2, -6)]]), fov: track([[0, [32]], [35, [38]]]) },
  };
  const KEY_OF = { cold: 'night', title: 'macro', wake1: 'flatDawn', snooze: 'macro', up1: 'flatDay', kitchen: 'flatDay', tram: 'grey', office1: 'office', shopExt: 'rainDusk', shop: 'shop',
    night1: 'macro', wake2: 'flatDawn', light: 'flatDawn', kitchen2: 'flatDay', montage: 'office', office2: 'office', dusk: 'officeDusk', pipCard: 'flatNight', crossing1: 'rainDusk', after1: 'night',
    night2: 'flatNight', tryA: 'flatDay', office3: 'officeDusk', crossing2: 'rainDusk', turn2: 'macro', shop2: 'shopDawn', kitchen3: 'flatDay', office4: 'office', park: 'gold', night3: 'flatNight', tuesM: 'macro', tuesday: 'flatDay', endWide: 'sunny' };
  function applyKey(K, renderer) {
    SK.u.top.value.copy(K.top); SK.u.mid.value.copy(K.mid); SK.u.hor.value.copy(K.hor);
    const sd = new THREE.Vector3(...K.sunDir).normalize();
    SK.u.moonDir.value.copy(sd); SK.u.moonCol.value.copy(K.sun); SK.u.moonI.value = K.moon;
    sun.color.copy(K.sun); sun.intensity = K.sunI; sun.position.copy(sunT.position).addScaledVector(sd, 90);
    hemi.color.copy(K.hemiS); hemi.groundColor.copy(K.hemiG); hemi.intensity = K.hemiI;
    scene.fog.color.copy(K.fog); scene.fog.density = K.fogD; renderer.toneMappingExposure = K.exp;
  }
  const FLAT = ['wake1', 'up1', 'kitchen', 'wake2', 'light', 'kitchen2', 'pipCard', 'night2', 'tryA', 'kitchen3', 'night3', 'tuesday'];
  const MACRO = ['title', 'snooze', 'night1', 'turn2', 'tuesM'];
  const OFFICE = ['office1', 'montage', 'office2', 'dusk', 'office3', 'office4'];
  const TOWN = ['cold', 'tram', 'shopExt', 'crossing1', 'after1', 'crossing2', 'park', 'endWide'];
  const RAINY = ['cold', 'shopExt', 'crossing1', 'after1', 'crossing2'];
  const rings = [[T.ring0, T.slap0], [T.ring1, T.slap1], [T.ring1b, T.ring1b + .9], [T.ring2, T.ring2 + 1.6], [T.ring4, T.slap4]];
  const ringing = t => rings.some(([a, b]) => t >= a && t < b);
  const rewindsAt = t => t < T.knob1 + .8 ? 7 : t < REW[0] ? 6 : t < REW[1] ? 5 : t < REW[2] ? 4 : t < T.knob2 + .3 ? 3 : t < T.knob3 + .3 ? 2 : 1;
  const knobSpin = t => { let a = 0; for (const k of [T.knob1, T.knob2, T.knob3, ...REW.map(r => r - .35)]) a += ss(seg(t, k, k + 1.0)) * Math.PI * 4; return a; };
  const rewMin = t => { for (const r of REW) if (Math.abs(t - r) < .5) return 7 * 60 + 600 * (1 - ss(seg(t, r - .45, r + .1))); return null; };

  function update(t, shot, cam, post, renderer) {
    let id = shot.id, lt = t - shot.a;
    // the montage cuts to the clock at each rewind
    let insert = id === 'montage' && REW.some(r => Math.abs(t - r) < .5);
    if (insert) id = 'turn2';
    all.forEach(c => { c.root.visible = false; c.mesh.scale.x = 1; });
    fill.intensity = 0; lampL.intensity = 0; lampG.visible = false; kitL.intensity = 0; winL.intensity = 0; shaftM.opacity = 0; F.shade.material.emissiveIntensity = 0;
    offL.intensity = offWin.intensity = 0; shopL1.intensity = shopL2.intensity = shopW.intensity = 0; mLamp.intensity = mWin.intensity = mRim.intensity = 0; kGlow.visible = false;
    shopGlow.intensity = 0; vanSpot.intensity = 0; vanHL.forEach(([g]) => g.visible = false); blueL.intensity = 0; beacons.forEach(b => { b.L.intensity = 0; });
    rainT.visible = rainS.visible = false; van.visible = false; bikeR.visible = false; F.card.visible = false; F.bike.visible = true; F.door.rotation.y = 0;
    road.material = M.asphalt; camKey.intensity = 0;

    let K = mixKey(KEY_OF[id], KEY_OF[id], 0);
    const CK = CAM[id];
    let look = null;
    const lc = insert ? .3 : lt;
    if (CK) { cam.position.set(...CK.p(lc)); look = V3(...CK.l(lc)); cam.fov = typeof CK.fov === 'number' ? CK.fov : CK.fov(lc)[0]; }
    if (look) cam.lookAt(look);
    sunT.position.copy(look || V3(0, 0, 0)); sunT.position.y = 0;
    if (id === 'snooze') K = mixKey('macro', 'flatDay', ss(seg(t, 49.6, 51.8)) * .5);
    if (id === 'night1' && t > T.knob1 + .6) K = mixKey('macro', 'flatDawn', ss(seg(t, T.knob1 + .6, 166)));
    if (id === 'tuesM' || id === 'tuesday') K = mixKey(KEY_OF[id], 'sunny', id === 'tuesM' ? .25 : .35);
    if (id === 'park' && t > 462) K = mixKey('gold', 'night', ss(seg(t, 462, 468)) * .3);
    applyKey(K, renderer);
    const night = ['night', 'rainDusk', 'flatNight', 'gold'].includes(KEY_OF[id]);
    ST.visible = KEY_OF[id] === 'night'; ST.material.uniforms.t.value = t;
    W.update(t, { night: night ? 1 : 0, day: night ? null : [K.mid.r * .5, K.mid.g * .5, K.mid.b * .55] });
    lampGlows.forEach(g => { g.visible = night; });
    lamps.forEach(Lp => { Lp.userData.bulb.material.color.setRGB(night ? 3 : .6, night ? 2.5 : .55, night ? 1.6 : .5); });

    let tiltC = null, focusOn = null, tiltW = null;
    const idle = (tt, s = 0) => blinkOr(tt, Math.floor((tt + s) * 1.1) % 2 ? 'idle1' : 'idle0', 'blink', s);
    const talkF = (tt, a, b) => blinkOr(tt, Math.floor(tt * 5) % 2 ? a : b, 'blink');
    const speaking = p => VOA.some(v => v.id.startsWith(p) && t > v.t && t < v.t + v.d - .1);
    const mouth = (p, on, off) => speaking(p) ? (Math.floor(t * 6.5) % 3 ? on : off) : off;

    // ——— the clock (macro and the small ones) ———
    const cmin = rewMin(t) ?? clockMin(t), cnt = rewindsAt(t), ring = ringing(t);
    X.clock.userData.set(cmin, cnt, ring, t); F.clock.userData.set(cmin, cnt, ring, t);
    X.clock.userData.knob.rotation.x = knobSpin(t); F.clock.userData.knob.rotation.x = knobSpin(t);
    if (MACRO.includes(id)) {
      const nightM = id === 'night1' && t < T.knob1 + .6 || id === 'turn2';
      mLamp.intensity = nightM ? 5.0 : 1.2; mLamp.color.set(nightM ? '#ffb070' : '#ffe0c0');
      mWin.intensity = nightM ? .6 : id === 'tuesM' ? 4.0 : 2.4; mWin.color.set(id === 'tuesM' ? '#fff0d0' : '#a8c0ff');
      mRim.intensity = 1.6; fill.position.copy(CM).add(V3(0, 1.4, 2.6)); fill.intensity = nightM ? .6 : 1.4; fill.color.set(nightM ? '#ffd0a0' : '#d8e4ff');
      const turning = [T.knob1, T.knob2, T.knob3, ...REW.map(r => r - .35)].some(k => t > k - .3 && t < k + 1.3);
      kGlow.visible = turning || id === 'night1'; kGlow.material.opacity = turning ? 1 : .35;
      X.clock.userData.face.material.emissiveIntensity = nightM ? .05 : .0;
      X.phone.material.color.set(id === 'tuesM' && t > 493 ? '#3a5a8a' : '#0a0c10');
      focusOn = id === 'night1' && lt > 10.5 || id === 'turn2' ? V3(CM.x + .5, .62, CM.z) : V3(CM.x, .65, CM.z + .1);
      tiltW = .3;
    }
    // ——— the town ———
    if (TOWN.includes(id)) {
      const rainy = RAINY.includes(id);
      rainT.visible = rainy; rainS.visible = id === 'shopExt'; if (rainy) { rainT.userData.update(t, [-3, 0]); rainS.userData.update(t, [-3, 0]); road.material = M.asphaltWet; }
      const amber = id === 'cold' || id === 'after1' || id === 'crossing1' || id === 'crossing2' || id === 'park' || id === 'shopExt';
      beacons.forEach((b, i) => { const on = Math.floor(t * 1.4 + i * .5) % 2 === 0; b.globe.material.color.set(on ? '#ffb030' : '#4a2a10').multiplyScalar(on ? 2.2 : 1); b.gl.visible = on && (amber || night); b.L.intensity = on && amber ? 1.2 : 0; });
      tramA.position.x = id === 'tram' ? TS.x + Math.max(0, t - T.tramGo) ** 2 * .32 : id === 'endWide' ? -200 : TS.x - 400;
      tramA.userData.winM.emissiveIntensity = night ? 1 : .2;
      folk.forEach(f => { f.root.visible = false; });
      if (['tram', 'endWide'].includes(id)) folk.slice(0, 4).forEach((f, i) => { const x = CR.x - 30 + ((t * (i % 2 ? .9 : 1.2) + i * 11) % 40) * (i % 2 ? 1 : -1) + (i % 2 ? -10 : 30); place(f, x, .14, i % 2 ? -4.4 : -3.8); f.frame(walk4(t + i, 6)); f.face(cam, i % 2 === 0); });
      if (id === 'shopExt') { shopGlow.intensity = 9; shopF.userData.glass.emissiveIntensity = .14; } else shopF.userData.glass.emissiveIntensity = night ? .06 : .02;
      winClocks.forEach((c, i) => c.userData.set(t * (8 + i * 3)));
    }
    if (id === 'cold' || id === 'after1') {
      van.visible = true; van.position.set(CR.x - 5.4, 0, -1.3); van.rotation.y = .2;
      bikeR.visible = true; bikeR.position.set(CR.x + .2, .32, .5); bikeR.rotation.set(Math.PI / 2, 0, .4); bikeR.userData.wheels[1].rotation.z = -t * (id === 'cold' ? 2.4 : .6);
      const fl = id === 'cold' ? ss(seg(t, T.flare, 24.6)) : 0;
      vanHL.forEach(([g, s]) => { g.visible = true; const p = van.localToWorld(V3(2.75, .55, s * .6)); g.position.copy(p); g.material.opacity = .8 + fl * .2; g.scale.setScalar(1 + fl * 2.5); });
      vanSpot.position.copy(van.localToWorld(V3(2.7, .7, 0))); vanSpot.target.position.copy(van.localToWorld(V3(12, 0, 0))); vanSpot.intensity = 60 + fl * 160;
      blueL.position.set(CR.x - 9, 2.4, 4); blueL.intensity = id === 'after1' ? (Math.floor(t * 3) % 2 ? 6 : 0) : 0;
      fill.position.set(CR.x + 2.6, 1.8, 3.2); fill.intensity = 2.4; fill.color.set('#ffb880');
      let f, x = CR.x + 1.1, z = 1.1, flip = true;
      if (id === 'cold') {
        if (t < T.runIn[1] - 1.0) { const k = ss(seg(t, T.runIn[0], T.runIn[1] - 1.0)); x = lerp(CR.x + 6, CR.x + 1.3, k); z = lerp(4.6, 1.2, k); f = walk4(t, 10); }
        else if (t < 7.0) { x = CR.x + 1.3; z = 1.2; f = 'yell'; }
        else f = t < 16 ? blinkOr(t, 'sitWide', 'sitBlink') : 'sitCry';
        if (t < T.runIn[0]) { x = CR.x + 9; z = 6; }
      } else f = speaking('r') ? mouth('r', 'sitTalkB', 'sitCry') : t < 304 ? 'sitCry' : blinkOr(t, 'sitWorry', 'sitBlink');
      place(remiN, x, typeof f === 'string' && f.startsWith('sit') ? 0 : .0, z); remiN.frame(f); remiN.face(cam, flip);
      focusOn = id === 'cold' && lt > 18.2 ? bikeR.position.clone() : remiN.root.position.clone().add(V3(0, .9, 0));
    }
    if (id === 'tram') {
      const k = ss(seg(t, T.runTram[0], T.runTram[1])); place(remi, lerp(TS.x - 18, TS.x - 3, k), .14, 3.8);
      remi.frame(t < T.runTram[1] ? walk4(t, 10) : t < 84 ? 'yell' : blinkOr(t, 'worryF', 'flatBlink')); remi.face(cam, false);
      focusOn = remi.root.position.clone().add(V3(0, 1, 0));
    }
    if (id === 'shopExt') {
      const k = ss(seg(t, 112.2, 118.0)); place(remiN, lerp(SHX + 8, SHX + 1.4, k), .14, -3.9);
      remiN.frame(k < 1 ? walk4(t, 6) : blinkOr(t, 'stare', 'blink')); remiN.face(cam, true);
      fill.position.set(SHX + 1, 2.2, -2.6); fill.intensity = 1.6; fill.color.set('#ffb070');
      focusOn = remiN.root.position.clone().add(V3(0, 1.2, 0));
    }
    if (id === 'crossing1' || id === 'crossing2') {
      const [r0, r1] = id === 'crossing1' ? T.ride1 : T.ride2, fl = id === 'crossing1' ? T.flash1 : T.flash2;
      const k = ss(seg(t, id === 'crossing1' ? 293.6 : r0, r1));
      place(pipH, CR.x - .2, .0, lerp(id === 'crossing1' ? -3.7 : -3.2, -1.0, k));
      pipH.frame(k > 0 && k < 1 ? ride(t, 4) : k >= 1 ? 'rideW' : 'rideS'); pipH.face(cam, true);
      van.visible = true; van.rotation.y = 0; const vk = seg(t, r0, fl); van.position.set(lerp(CR.x - (id === 'crossing1' ? 60 : 44), CR.x - 3.0, vk), 0, -1.3);
      vanHL.forEach(([g, s]) => { g.visible = true; g.position.copy(van.localToWorld(V3(2.75, .55, s * .6))); g.scale.setScalar(1 + ss(seg(t, fl - .7, fl)) * 2.6); g.material.opacity = 1; });
      vanSpot.position.copy(van.localToWorld(V3(2.7, .7, 0))); vanSpot.target.position.copy(van.localToWorld(V3(12, 0, 0))); vanSpot.intensity = 60 + 220 * ss(seg(t, fl - .9, fl));
      fill.position.set(CR.x + 2.4, 1.8, -1.6); fill.intensity = 2.4; fill.color.set('#ffb880');
      focusOn = pipH.root.position.clone().add(V3(0, .7, 0));
    }
    if (id === 'park') {
      place(remi, BEN.x - .3, .26, BEN.z - .1);
      let rf = blinkOr(t, 'sitSmile', 'sitBlink'), rx = BEN.x - .3, rz = BEN.z - .1, ry = .26, flipR = true;
      let px = CR.x + 12 + 4 * Math.sin((t - 436) * .5), pz = 9.0, pf = ride(t, 4), flipP = Math.cos((t - 436) * .5) < 0;
      if (t < T.rideP[0]) { px = CR.x + 12; pf = 'rideS'; }
      if (t > T.walkX[0]) {
        const k = ss(seg(t, T.walkX[0], T.walkX[1])); rx = lerp(BEN.x - .3, CR.x + .7, k); rz = lerp(BEN.z - .1, 3.9, k); ry = k > .05 ? .14 : .26; rf = k < 1 ? walk4(t, 6) : 'idle0';
        px = lerp(CR.x + 12 + 4 * Math.sin((T.walkX[0] - 436) * .5), CR.x + 1.05, k); pz = lerp(9.0, 3.3, k); pf = k < 1 ? ride(t, 3) : 'rideS'; flipP = true;
        if (k >= 1) { pz = lerp(3.3, 2.9, ss(seg(t, 450.4, 451.2))); pf = 'rideS'; }
      }
      if (t > T.grab) { flipR = false; rf = t < 455 ? 'grab' : speaking('r') ? 'smileT' : t < T.hug ? 'worryF' : t < 463 ? 'hug' : walk4(t, 5); pf = t < 455.2 ? 'rideW' : t < T.hug ? mouth('k', 'rideT', 'rideW') : t < 463 ? 'rideS' : ride(t, 3); pz = 2.9; }
      if (t > T.hug && t < 463) { pf = 'hug'; px = CR.x + 1.0; pz = 3.3; }
      if (t > T.walkOn[0]) { const k = ss(seg(t, T.walkOn[0], T.walkOn[1])); rz = lerp(3.9, -2.4, k); pz = lerp(3.2, -2.8, k); px = CR.x + 1.3; rx = CR.x + .5; rf = walk4(t, 5); pf = ride(t, 3); flipR = true; }
      place(remi, rx, ry, rz); remi.frame(rf); remi.face(cam, flipR);
      const P_ = pipH; place(P_, px, .0, pz); P_.frame(pf); P_.face(cam, t > T.grab && t < T.walkOn[0] ? true : flipP);
      van.visible = t > T.van[0] - .2 && t < T.van[1] + .2; van.rotation.y = 0; van.position.set(lerp(CR.x - 34, CR.x + 34, seg(t, T.van[0], T.van[1])), 0, 1.4);
      vanHL.forEach(([g, s]) => { g.visible = van.visible; g.position.copy(van.localToWorld(V3(2.75, .55, s * .6))); g.scale.setScalar(1.4); });
      fill.position.set(CR.x + 3, 2.2, 7); fill.intensity = 2.2; fill.color.set('#ffc8a0');
      focusOn = V3((rx + px) / 2, .9, (rz + pz) / 2);
    }
    if (id === 'endWide') {
      const k = seg(t, 520, 548);
      place(remi, lerp(CR.x - 18, CR.x + 6, k), .14, 4.2); remi.frame(walk4(t, 5)); remi.face(cam, false);
      place(pipH, lerp(CR.x - 16.6, CR.x + 7.4, k), .14, 3.7); pipH.frame(ride(t, 3)); pipH.face(cam, false);
      if (lt < 14) { const rx = remi.root.position.x; cam.position.set(rx + 2.2, 1.6, .6); look = V3(rx - .4, 1.0, 4.4); cam.fov = 34; cam.lookAt(look); }
      else { const k2 = ss(seg(lt, 14, 35)), rx = remi.root.position.x; cam.position.set(lerp(lerp(CR.x - 18, CR.x + 6, seg(534, 520, 548)) + 2.2, CR.x + 16, k2), lerp(1.6, 24, k2), lerp(.6, 44, k2)); look = V3(lerp(rx - .4, CR.x, k2), lerp(1.0, 2, k2), lerp(4.4, -6, k2)); cam.fov = lerp(34, 38, k2); cam.lookAt(look); }
      remi.face(cam, false); pipH.face(cam, false);
      focusOn = remi.root.position.clone().add(V3(0, 1, 0)); if (lt > 14) tiltC = .45;
    }
    // ——— the flat ———
    if (FLAT.includes(id)) {
      const dawn = ['wake1', 'wake2', 'light'].includes(id), nightF = ['pipCard', 'night2', 'night3'].includes(id);
      F.win.material.color.set(nightF ? '#141c2c' : dawn ? (id === 'light' && t > T.curtain ? '#ffe8c0' : '#4a5a7a') : '#c8d8ec');
      if (id === 'light' && t > T.curtain) F.win.material.color.multiplyScalar(1 + 1.2 * ss(seg(t, T.curtain, T.curtain + 1.2)));
      const lampOn = nightF && !(id === 'night3' && t > T.lampOff);
      lampL.intensity = lampOn ? 2.6 : dawn ? 0 : .3; lampG.visible = lampOn; F.shade.material.emissiveIntensity = lampOn ? .9 : 0;
      kitL.intensity = ['kitchen', 'kitchen2', 'kitchen3', 'tryA', 'pipCard'].includes(id) ? (nightF ? 1.6 : .9) : 0;
      winL.position.copy(FL).add(V3(-1.0, 1.7, -1.0)); winL.intensity = nightF ? .2 : dawn ? (id === 'light' && t > T.curtain ? 3.2 : .9) : 2.0; winL.color.set(nightF ? '#5a70a8' : id === 'light' && t > T.curtain ? '#ffe0b0' : dawn ? '#8a9ad0' : '#e8f0ff');
      fill.position.copy(FL).add(V3(.4, 1.6, 2.2)); fill.intensity = nightF ? 1.8 : dawn ? 1.3 : 1.1; fill.color.set(nightF ? '#7a94d0' : '#fff0e0');
      if (id === 'night3' && t > T.lampOff) { winL.intensity = .7; fill.intensity = .5; }
      const curtOpen = id === 'light' ? ss(seg(t, T.curtain, T.curtain + 1.0)) : dawn ? 0 : 1;
      F.curt.forEach(([c, s]) => { c.position.x = -1.0 + s * (.2 + .36 * curtOpen); });
      if (id === 'light') shaftM.opacity = .12 * ss(seg(t, T.curtain + .3, T.curtain + 1.6));
      const bedX = -1.3, bedZ = -1.1;
      if (id === 'wake1' || id === 'wake2') {
        const ringT = id === 'wake1' ? [T.ring1, T.slap1] : [T.ring2, T.ring2 + 1.6];
        let f = t > ringT[1] - .5 && t < ringT[1] + .3 ? 'lieReach' : t > ringT[0] ? 'lieOpen' : 'lie';
        if (id === 'wake1' && t > T.slap1 + .6) f = 'lie';
        place(remiN, FL.x + bedX - .1, .55, FL.z + bedZ + .02);
        if (id === 'wake2' && t > T.sitUp2) { place(remiN, FL.x - .55, .3, FL.z - .62); f = speaking('r') ? mouth('r', 'sitTalkB', 'sitWide') : t < 176 ? blinkOr(t, 'sitWide', 'sitBlink') : blinkOr(t, 'sitSmile', 'sitBlink'); }
        remiN.frame(f); remiN.face(cam, false);
        focusOn = remiN.root.position.clone().add(V3(0, .3, 0));
      }
      if (id === 'up1') {
        let x = FL.x - .55, z = FL.z - .62, f = speaking('r') ? mouth('r', 'sitTalkB', 'sitWide') : blinkOr(t, 'sitWide', 'sitBlink'), y = .3;
        if (t > T.out1[0]) { const k = ss(seg(t, T.out1[0], T.out1[1])); x = lerp(FL.x - .4, FL.x - 2.7, k); z = lerp(FL.z - .3, FL.z + .7, k); f = walk4(t, 10); y = 0; }
        place(remiN, x, y, z); remiN.frame(f); remiN.face(cam, t > T.out1[0]);
        if (t > T.out1[0] + .8) F.door.rotation.y = -1.2 * ss(seg(t, T.out1[0] + .8, T.out1[0] + 1.4));
        focusOn = remiN.root.position.clone().add(V3(0, .9, 0));
      }
      if (['kitchen', 'kitchen2', 'tryA', 'kitchen3'].includes(id)) {
        F.bike.visible = true;
        const kc = id === 'kitchen3';
        place(pip, FL.x + .68, .14, FL.z + .32);
        let pf = speaking('k') ? mouth('k', 'sitT', 'sitS') : blinkOr(t, id === 'tryA' ? 'sitSad' : 'sitS', 'sit');
        if ((id === 'kitchen' && t > 66) || (id === 'kitchen2' && t > 211)) pf = blinkOr(t, 'sitSad', 'sit');
        let rx = FL.x - .55, rz = FL.z + .55, rf = speaking('r') ? mouth('r', 'talk', 'idle0') : idle(t), flipR = false;
        if (id === 'kitchen2' && t > 205 && t < 210.2) rf = Math.floor(t * 6) % 3 ? 'smileT' : 'smile';   // she mouths Pip's line with her
        if (id === 'tryA') rf = speaking('r') ? mouth('r', 'yell', 'worry') : blinkOr(t, 'worryF', 'flatBlink');
        if (kc) { rx = FL.x - .15; rz = FL.z + .6; rf = speaking('r') ? mouth('r', 'smileT', 'smile') : blinkOr(t, 'smile', 'smileBlink'); if (t > 413.4) pf = t < T.hug3 ? 'wide' : 'hug'; if (t > T.hug3) { rf = 'hug'; place(pip, FL.x + .3, .0, FL.z + .55); } }
        const exitA = id === 'kitchen' ? T.dash : id === 'kitchen2' ? [213.0, 216.0] : null;
        if (exitA && t > exitA[0]) { const k = ss(seg(t, exitA[0], exitA[1])); rx = lerp(rx, FL.x - 2.7, k); rz = lerp(rz, FL.z + .7, k); rf = walk4(t, id === 'kitchen' ? 10 : 6); flipR = true; if (t > exitA[0] + 1.2) F.door.rotation.y = -1.2 * ss(seg(t, exitA[0] + 1.2, exitA[0] + 1.8)); }
        place(remi, rx, 0, rz); remi.frame(rf); remi.face(cam, flipR);
        pip.frame(pf); pip.face(cam, !(kc && t > T.hug3) ? true : true);
        if (kc && t > T.hug3) { pip.face(cam, true); remi.face(cam, false); }
        focusOn = V3((remi.root.position.x + pip.root.position.x) / 2, .9, (remi.root.position.z + pip.root.position.z) / 2);
      }
      if (id === 'light') {
        place(remiN, FL.x - 1.75, 0, FL.z - 1.15); remiN.frame(t < T.curtain ? idle(t) : t < T.curtain + 1.4 ? 'curtain' : blinkOr(t, 'smile', 'smileBlink')); remiN.face(cam, false);
        focusOn = remiN.root.position.clone().add(V3(0, 1.2, 0));
      }
      if (id === 'pipCard') {
        F.bike.visible = t < T.pipOut;
        if (t < 283.6) { place(pip, FL.x + .68, .14, FL.z + .32); pip.frame(blinkOr(t, 'sitS', 'sit')); pip.face(cam, true); F.card.visible = true; }
        else if (t < T.pipOut) { place(pipH, FL.x + .2, 0, FL.z + .5); pipH.frame('card'); pipH.face(cam, true); }
        else { const k = ss(seg(t, T.pipOut, 289.6)); place(pipH, lerp(FL.x - .2, FL.x - 2.7, k), 0, lerp(FL.z + .2, FL.z + .7, k)); pipH.frame(walk4(t, 7)); pipH.face(cam, true); F.door.rotation.y = -1.2; }
        focusOn = (pip.root.visible ? pip : pipH).root.position.clone().add(V3(0, .6, 0));
      }
      if (id === 'night2' || id === 'night3') {
        place(remiN, FL.x - .55, .3, FL.z - .62);
        let f;
        if (id === 'night2') f = t < T.knob2 - .3 ? 'sitClockC' : t < T.knob2 + 1.4 ? 'sitClock' : 'sitClockC';
        else f = t < T.hover ? blinkOr(t, 'sitClock', 'sitClockB') : t < T.setDown ? (Math.floor(t * 1.5) % 2 ? 'sitClock' : 'sitClockB') : blinkOr(t, 'sitSmile', 'sitBlink');
        remiN.frame(f); remiN.face(cam, false); F.clock.visible = !f.startsWith('sitClock');
        focusOn = remiN.root.position.clone().add(V3(0, .7, 0));
      } else F.clock.visible = true;
      if (id === 'tuesday') {
        let f = speaking('r') ? mouth('r', 'sitTalk', 'sitSmile') : blinkOr(t, 'sitSmile', 'sitBlink'), x = FL.x - .55, y = .3, z = FL.z - .62;
        if (t > T.phone4) { x = FL.x - .3; y = 0; z = FL.z - .2; f = t < 511 ? blinkOr(t, 'phoneE', 'phoneEB') : t < 513 ? 'smile' : t < 516 ? 'cheer' : blinkOr(t, 'smile', 'smileBlink'); }
        place(remiN, x, y, z); remiN.frame(f); remiN.face(cam, false);
        focusOn = remiN.root.position.clone().add(V3(0, .9, 0));
      }
    }
    // ——— the office ———
    if (OFFICE.includes(id)) {
      const dk = id === 'dusk' || id === 'office3';
      O.view.material.map = dk ? O.duskTex : O.dayTex;
      offL.intensity = dk ? 2.6 : 2.0; offWin.intensity = dk ? .8 : 2.6; offWin.color.set(dk ? '#ff9a70' : '#d8e4ff');
      fill.position.copy(OF).add(V3(.2, 2.0, 2.6)); fill.intensity = 1.0; fill.color.set(dk ? '#ffc8a0' : '#f0f4ff');
      O.clock.userData.set(id === 'dusk' ? 18 * 60 + 2 + 7 * seg(t, 273.4, 279.4) : id === 'office3' ? 18 * 60 + 13 + (t > 343 ? 1 : 0) : 9 * 60 + 40 + lt / 10);
      place(boss, OF.x - 1.0, .1, OF.z + .05);
      let bf = speaking('i') ? mouth('i', 'sitTalk', 'sitFlat') : blinkOr(t, 'sitFlat', 'sitBlink');
      let rx = OF.x + 1.0, ry = .1, rz = OF.z + .05, rf = speaking('r') ? mouth('r', 'sitTalkB', 'sitNod') : blinkOr(t, 'sitNod', 'sitBlink'), flipR = true, showR = true;
      if (id === 'office1') {
        if (t < T.enter1[1]) { const k = ss(seg(t, T.enter1[0], T.enter1[1])); rx = lerp(OF.x + 2.7, OF.x + 1.2, k); rz = lerp(OF.z + 1.3, OF.z + .4, k); ry = 0; rf = walk4(t, 8); }
        if (t > 97.0 && t < 101) rf = speaking('r') ? mouth('r', 'sitTalkB', 'sitWide') : 'sitWide';
        if (t > T.leave1[0]) { const k = ss(seg(t, T.leave1[0], T.leave1[1])); rx = lerp(OF.x + 1.2, OF.x + 3.2, k); rz = lerp(OF.z + .4, OF.z + 1.4, k); ry = 0; rf = k < .02 ? 'worryF' : walk4(t, 6); flipR = false; }
      }
      if (id === 'montage' || id === 'office2' || id === 'office4') {
        if (id === 'montage' && t > 224 && !speaking('r')) rf = blinkOr(t, Math.floor(t * 1.3) % 3 ? 'sitSmileT' : 'sitSmile', 'sitBlink');
        if (id === 'office2') { rf = speaking('r') ? mouth('r', 'sitSmileT', 'sitSmile') : blinkOr(t, 'sitSmile', 'sitBlink'); bf = speaking('i') ? mouth('i', 'sitTalk', 'sitSmile') : blinkOr(t, 'sitSmile', 'sitBlink'); if (t > T.cheer - .2) { ry = 0; rx = OF.x + 1.5; rz = OF.z - .35; rf = t < 268.5 ? (speaking('r') ? 'cheer' : 'cheer') : blinkOr(t, 'smile', 'smileBlink'); } }
        if (id === 'office4' && t > T.leave4[0]) { const k = ss(seg(t, T.leave4[0], T.leave4[1])); rx = lerp(OF.x + 1.2, OF.x + 3.2, k); rz = lerp(OF.z + .4, OF.z + 1.4, k); ry = 0; rf = walk4(t, 6); flipR = false; }
        if (id === 'office4' && t > T.leave4[0] - 1) bf = 'sitFlat';
      }
      if (id === 'dusk') {
        rf = blinkOr(t, 'sitSmileT', 'sitSmile'); bf = blinkOr(t, 'sitSmile', 'sitBlink');
        place(dir, OF.x + .1, 0, OF.z - .75); dir.frame(blinkOr(t, Math.floor(t * 1.2) % 2 ? 'point' : 'idle0', 'blink')); dir.face(cam, false);
      }
      if (id === 'office3') { showR = true; rx = OF.x + 1.55; ry = 0; rz = OF.z - 1.25; rf = speaking('r') ? mouth('r', 'phoneET', 'phoneE') : blinkOr(t, 'phoneE', 'phoneEB'); flipR = false; boss.root.visible = false; }
      if (showR) { place(remi, rx, ry, rz); remi.frame(rf); remi.face(cam, flipR); }
      if (id !== 'office3') { boss.frame(bf); boss.face(cam, false); }
      focusOn = id === 'office3' ? remi.root.position.clone().add(V3(0, 1.2, 0)) : V3(OF.x, .95, OF.z);
      if (id === 'montage' && lt > 8 && lt < 21) focusOn = remi.root.position.clone().add(V3(0, .9, 0));
    }
    // ——— the clock shop ———
    if (id === 'shop' || id === 'shop2') {
      const dawnS = id === 'shop2';
      shopL1.intensity = dawnS ? 1.2 : 3.0; shopL2.intensity = dawnS ? .4 : 2.0; shopW.intensity = dawnS ? 2.4 : 1.0;
      S.pane.material.color.set(dawnS ? '#6a7aa8' : '#1e2840');
      fill.position.copy(SH).add(V3(-.6, 1.6, 2.4)); fill.intensity = dawnS ? 1.8 : 1.3; fill.color.set(dawnS ? '#a8b8e0' : '#ffd8b0');
      S.clocks.forEach(([c, m0, sp]) => c.userData.set(m0 + t * sp));
      S.pend.forEach((p, i) => { p.rotation.z = Math.sin(t * 3.1 + i * 1.3) * .22; });
      S.clock.visible = !(id === 'shop' && t > 126.6);
      place(watch, SH.x + .9, 0, SH.z - .95);
      let wf = speaking('w') ? mouth('w', 'talk', 'idle0') : blinkOr(t, 'smile', 'smileBlink');
      if (id === 'shop' && t > 126.6 && t < 136.4) wf = speaking('w') ? mouth('w', 'giveT', 'give') : 'give';
      if (id === 'shop2') { wf = speaking('w') ? mouth('w', t > 369 && t < 377 ? 'talkO' : 'talk', 'flat') : t > 395 ? blinkOr(t, 'smile', 'smileBlink') : blinkOr(t, 'flat', 'blink'); }
      watch.frame(wf); watch.face(cam, true);
      let rx = SH.x - .9, rz = SH.z + .35, rf = speaking('r') ? mouth('r', 'talk', 'idle0') : idle(t);
      const enter = id === 'shop' ? [T.door, T.door + 1.8] : [T.shopKnock, T.shopKnock + 1.0];
      if (t < enter[1]) { const k = ss(seg(t, enter[0], enter[1])); rx = lerp(SH.x - 2.4, rx, k); rz = lerp(SH.z + .7, rz, k); rf = walk4(t, id === 'shop2' ? 10 : 6); }
      if (id === 'shop' && t > 136.4) rf = speaking('r') ? mouth('r', 'holdClockT', 'holdClock') : 'holdClock';
      if (id === 'shop2' && t > enter[1]) rf = speaking('r') ? mouth('r', t < 363 ? 'yell' : 'talk', 'worryF') : t > 395 ? blinkOr(t, 'smile', 'smileBlink') : blinkOr(t, 'worryF', 'flatBlink');
      place(remiN, rx, 0, rz); remiN.frame(rf); remiN.face(cam, false);
      focusOn = V3(SH.x, 1.2, SH.z - .2);
      if (id === 'shop2' && lt > 22 && lt < 35) focusOn = V3(cam.position.x, 1.6, SH.z - 1.7);
    }

    const KEYK = { night2: .9, night3: .8, after1: .7, cold: .5, shop2: .6, shop: .3, wake1: .4, wake2: .5, up1: .3, pipCard: .5, shopExt: .5, crossing1: .5, crossing2: .5, light: .3, tuesday: .2, park: .35 };
    if (KEYK[id] && focusOn) { const d = cam.position.distanceTo(focusOn); camKey.position.copy(cam.position).lerp(focusOn, .35); camKey.position.y += .4; const dd = camKey.position.distanceTo(focusOn); camKey.intensity = KEYK[id] * dd * dd * (id === 'night3' && t > T.lampOff ? .35 : 1); camKey.color.set(['night2', 'night3', 'after1', 'cold'].includes(id) ? '#ffd8b8' : '#fff0e0'); }
    cam.updateProjectionMatrix();
    const fo = focusOn || look || V3(0, 0, 0);
    post.dof.focus = cam.position.distanceTo(fo);
    const far = id === 'endWide' && lt > 14 || id === 'tram';
    post.dof.aper = far ? 420 : 240; post.dof.maxCoc = far ? 20 : 16;
    if (MACRO.includes(id)) { post.dof.aper = 110; post.dof.maxCoc = 14; }
    if (id === 'night2' || id === 'night3' || id === 'after1') { post.dof.aper = 150; post.dof.maxCoc = 14; }
    if (id === 'crossing1' || id === 'crossing2' || id === 'cold') { post.dof.aper = 70; post.dof.maxCoc = 8; }
    post.bloom.strength = RAINY.includes(id) ? .85 : night ? .7 : MACRO.includes(id) ? .55 : .45; post.bloom.threshold = night || RAINY.includes(id) ? .76 : .86;
    post.vig.uniforms.warm.value = ['shop', 'gold', 'flatNight'].includes(KEY_OF[id]) ? .2 : id === 'endWide' ? .06 : .1;
    post.vig.uniforms.amt.value = night || RAINY.includes(id) || MACRO.includes(id) ? .68 : .55;
    if (RAINY.includes(id)) { post.vig.uniforms.sat.value = .9; }
    if (['crossing1', 'crossing2', 'cold', 'after1'].includes(id)) { post.bloom.strength = .32; post.bloom.threshold = .93; post.bloom.radius = .4; }
    const band = id === 'endWide' ? 1 - ss(seg(t, 548, 554)) * .6 : 1;
    if (tiltW == null && (id === 'light')) tiltW = .2;
    return { tiltC, track: tiltC == null ? fo : null, tiltW, band, cocCap: ['crossing1', 'crossing2', 'cold'].includes(id) ? 9 : 22 };
  }
  const VOA = [];
  return { scene, update, setVoices(vs) { VOA.push(...vs); } };
}
