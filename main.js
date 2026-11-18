// What If Your Alarm Clock Could Rewind the Day? — page contract: window.DUR, window.render(t), window.READY, window.TEXTS, window.EV
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, shotAt, VO, T, CHIPS, REW } from './story.js';
import { buildWorld } from './world.js';
import { drawOverlay, overlayReady } from './ui.js';

const W = 1920, H = 1080, Q = new URLSearchParams(location.search);
const SS = +(Q.get('ss') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const camera = new THREE.PerspectiveCamera(32, W / H, .1, 2000);
const world = buildWorld();
const post = makePost(renderer, world.scene, camera, W, H, { ssaa: SS });
const V = post.vig.uniforms;
if (Q.has('nobloom')) post.bloom.enabled = false;
await overlayReady();
const DURS = await (await fetch('voices/dur.json')).json();
world.setVoices(VO.map(v => ({ id: v.id, t: v.t, d: DURS[v.id] || 2 })));

const TILT = !Q.has('notilt');
const _v = new THREE.Vector3();
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t);
  post.dof.scene = world.scene;
  V.fade.value = 1; V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .6; V.contrast.value = .2;
  post.bloom.radius = .7;
  const r = world.update(t, shot, camera, post, renderer) || {};
  if (TILT) {
    let c = r.tiltC;
    if (c == null && r.track) { camera.updateMatrixWorld(); _v.copy(r.track).project(camera); c = Math.min(.8, Math.max(.2, _v.y * .5 + .5)); }
    post.dof.tiltAmt = r.tiltAmt ?? 17; post.dof.tiltC = c ?? .45; post.dof.tiltW = (r.tiltW ?? .075) * (r.band ?? 1); post.dof.tiltF = .3;
    post.dof.maxCoc = Math.max(post.dof.maxCoc, r.cocCap ?? 22); V.sat.value *= 1.12; V.contrast.value = .26;
  }
  post.composer.render();
  drawOverlay(t);
};
window.TEXTS = t => drawOverlay(t);   // 2D only: cheap
// Sound events for the mixer (exported by events.mjs)
const ev = (t, type, o = {}) => ({ t, type, ...o });
const steps = (a, b, dt, surf) => { const o = []; for (let x = a; x < b; x += dt) o.push(ev(x, 'step', { surf })); return o; };
window.EV = [
  ...VO.map(v => ({ t: v.t, type: 'voice', id: v.id, dlg: !!v.dlg, sub: v.sub, who: v.who })),
  ...VO.filter(v => v.dlg).map(v => ev(v.t - .45, 'chime')),
  ...CHIPS.map(c => ev(c.a + .05, 'tick')),
  ...CHIPS.filter(c => c.run && c.run[1] - c.run[0] < 1).map(c => ev(c.run[1], 'tick')),
  // the alarm: bells ringing, then the slap
  ev(T.ring0, 'ring', { d: T.slap0 - T.ring0 }), ev(T.slap0, 'slap'), ev(T.ring1, 'ring', { d: T.slap1 - T.ring1, far: 1 }), ev(T.slap1, 'slap'),
  ev(T.ring1b, 'ring', { d: .9, far: 1 }), ev(T.ring2, 'ring', { d: 1.6, far: 1 }), ev(T.ring4, 'ring', { d: T.slap4 - T.ring4 }), ev(T.slap4, 'slap'),
  ev(T.snoozeRun[0], 'spin', { d: T.snoozeRun[1] - T.snoozeRun[0] }),
  // the knob: a ratchet, the hands racing back, a white rush
  ...[T.knob1, T.knob2, T.knob3].map(a => ev(a, 'rewind')), ...REW.map(r => ev(r - .35, 'rewind', { short: 1 })),
  // the crossing: rain, the beacons, tyres, then silence
  ev(T.flash1 - 1.3, 'screech'), ev(T.flash1, 'impact'), ev(T.flash2 - 1.3, 'screech'), ev(T.flash2, 'impact'), ev(19.6, 'screechFar'),
  ev(T.van[0] - .3, 'passby'), ev(T.grab, 'grabFx'),
  ...steps(T.runIn[0], T.runIn[1] - 1.0, .26, 'wet'), ...steps(T.runTram[0], T.runTram[1], .28, 'pave'), ...steps(112.2, 118.0, .48, 'wet'),
  ...steps(T.out1[0], T.out1[1], .26, 'wood'), ...steps(T.dash[0], T.dash[1], .27, 'wood'), ...steps(213.0, 216.0, .45, 'wood'),
  ...steps(T.enter1[0], T.enter1[1], .4, 'wood'), ...steps(T.leave1[0], T.leave1[1], .45, 'wood'), ...steps(T.leave4[0], T.leave4[1], .45, 'wood'),
  ...steps(T.door, T.door + 1.8, .45, 'wood'), ...steps(T.shopKnock, T.shopKnock + 1.0, .26, 'wood'), ...steps(T.pipOut, 289.6, .36, 'wood'),
  ...steps(T.walkX[0], T.walkX[1], .45, 'pave'), ...steps(T.walkOn[0], T.walkOn[1], .5, 'pave'), ...steps(520.2, 548, .5, 'pave'),
  ev(T.door - .2, 'shopBell'), ev(T.shopKnock - .1, 'shopBell'), ev(T.out1[0] + .8, 'door'), ev(T.dash[0] + 1.2, 'door'), ev(T.pipOut + 2.2, 'door'),
  ev(T.tramGo - .6, 'tramBell'), ev(T.tramGo, 'tramGo'), ev(T.curtain, 'curtain'), ev(T.lampOff, 'lightOff'), ev(T.setDown, 'setDown'), ev(T.phone4, 'buzz'), ev(T.phone3 - .8, 'dial'),
  ev(T.cheer, 'chair'), ev(88.0, 'chair'), ev(T.hug3, 'cloth'), ev(T.hug, 'cloth'),
];
window.READY = true;
