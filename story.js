// Timeline (seconds): the single source of truth for shots, events, voice, chapter cards and the counters.
// "What If Your Alarm Clock Could Rewind the Day?" — one Monday, seven turns of a knob, and 6:14 p.m.
// 72 bpm in 3/4: one bar = 2.5 s.
export const BPM = 72, BAR = 180 / BPM;
export const bar = n => (n - 1) * BAR;
export const DUR = 555;
export const SHOTS = [
  { id: 'cold', a: 0, b: 24.6 },        // night, rain, the crossing: amber lights, a bike in the road, Remi running
  { id: 'title', a: 24.6, b: 35 },      // the brass clock rings, 7:00
  { id: 'wake1', a: 35, b: 49.6 },      // the bedroom: the alarm, snooze, the radio
  { id: 'snooze', a: 49.6, b: 52.2 },   // the clock: hands race to 7:40
  { id: 'up1', a: 52.2, b: 58 },        // "Seven forty?"
  { id: 'kitchen', a: 58, b: 74 },      // Pip: "Will you watch me ride?"
  { id: 'tram', a: 74, b: 86 },         // the tram leaves without her
  { id: 'office1', a: 86, b: 112 },     // forty minutes late; "We'll be in touch."
  { id: 'shopExt', a: 112, b: 119 },    // rain; the clock shop
  { id: 'shop', a: 119, b: 148 },       // the watchmaker and the clock with the seventh knob
  { id: 'night1', a: 148, b: 166 },     // she turns the knob
  { id: 'wake2', a: 166, b: 192 },      // the same Monday
  { id: 'light', a: 192, b: 204 },      // curtains open: light winds the body clock back
  { id: 'kitchen2', a: 204, b: 216 },   // Pip again; Remi mouths along
  { id: 'montage', a: 216, b: 250 },    // practising Monday: rewind, rewind, rewind
  { id: 'office2', a: 250, b: 272 },    // the perfect answer
  { id: 'dusk', a: 272, b: 280 },       // the final round runs late
  { id: 'pipCard', a: 280, b: 290 },    // Pip, a good-luck card, the bike
  { id: 'crossing1', a: 290, b: 299 },  // 6:14: headlights
  { id: 'after1', a: 299, b: 312 },     // the crossing: "This is my fault."
  { id: 'night2', a: 312, b: 324 },     // shaking hands on the knob
  { id: 'tryA', a: 324, b: 334 },       // "Promise me you'll stay home."
  { id: 'office3', a: 334, b: 346 },    // 6:13: "Pick up."
  { id: 'crossing2', a: 346, b: 352 },  // Pip with the umbrella; headlights again
  { id: 'turn2', a: 352, b: 356 },      // the knob, once more
  { id: 'shop2', a: 356, b: 401 },      // dawn: the watchmaker. "Then don't fix it. Live it."
  { id: 'kitchen3', a: 401, b: 416 },   // "Six o'clock. I'll be there."
  { id: 'office4', a: 416, b: 434 },    // "I made a promise."
  { id: 'park', a: 434, b: 468 },       // the park, the crossing, 6:14, together
  { id: 'night3', a: 468, b: 490 },     // one turn left; she doesn't take it
  { id: 'tuesM', a: 490, b: 497.2 },    // the clock: 7:00, Tuesday
  { id: 'tuesday', a: 497.2, b: 520 },  // the bedroom: a voicemail
  { id: 'endWide', a: 520, b: 555 },    // morning over Larkfield; end title
];
export const T = {
  runIn: [2.6, 6.0], kneel: 6.0, flare: 21.2, ring0: 24.6, slap0: 27.4,
  titleIn: 26.0, titleOut: 34.0,
  ring1: 35.6, slap1: 38.4, snoozeRun: [49.6, 51.8], ring1b: 51.9, up1: 52.2, out1: [55.6, 57.8],
  dash: [68.6, 72.6], tramGo: 75.0, runTram: [74.6, 81.0],
  enter1: [86.0, 87.6], leave1: [103.8, 108.0],
  door: 119.6, clockGive: 127.0,
  knob1: 162.8,
  ring2: 166.6, sitUp2: 168.0, curtain: 193.2,
  rewinds: [238.5, 247.5],
  cheer: 264.8,
  pipOut: 286.4, ride1: [290.4, 297.2], flash1: 297.2, black1: [297.4, 299.0],
  knob2: 318.6,
  phone3: 335.2, ride2: [346.2, 350.4], flash2: 350.4, knob3: 353.2,
  shopKnock: 356.6,
  hug3: 414.0, leave4: [432.6, 434.0],
  rideP: [436.0, 446.0], walkX: [446.0, 451.0], grab: 451.0, van: [451.4, 454.6], hug: 459.0, walkOn: [463.0, 468.0],
  hover: 476.0, setDown: 479.4, lampOff: 482.4,
  ring4: 490.8, slap4: 491.8, sitUp4: 494.0, phone4: 502.2,
  endTitle: 540.0,
};
// Chapter cards (overlay)
export const CHAPTERS = [
  { t: 35.2, n: 'I', name: 'Monday' },
  { t: 166.2, n: 'II', name: 'The Same Monday' },
  { t: 312.2, n: 'III', name: 'Fourteen Past Six' },
  { t: 401.2, n: 'IV', name: 'The Last Monday' },
  { t: 490.4, n: 'V', name: 'Tuesday' },
];
// Voice: t = start; dur from voices/dur.json. dlg = dialogue box (who = name plate). sub = on-screen text.
const RE = 'Remi', PI = 'Pip', WA = 'Watchmaker', IV = 'Interviewer', RA = 'Radio', VM = 'Voicemail';
export const VO = [
  { id: 'n01', t: 8.4, sub: 'At fourteen minutes past six on a Monday evening, Remi Hale would have given anything to have that morning back.' },
  { id: 'r01', t: 5.2, dlg: true, who: RE, sub: 'Pip! Pip!' },
  { id: 'n02', t: 18.4, sub: 'She was about to get it.' },
  { id: 'n03', t: 39.6, sub: 'Twelve hours earlier. Remi had one job that Monday. Be on time.' },
  { id: 'd01', t: 45.4, dlg: true, who: RA, sub: 'Seven o’clock, Monday morning. Rain by six.' },
  { id: 'r02', t: 52.6, dlg: true, who: RE, sub: 'Seven forty? No. No, no, no!' },
  { id: 'k01', t: 59.0, dlg: true, who: PI, sub: 'Remi! Will you watch me ride at the park? Six o’clock!' },
  { id: 'r03', t: 65.2, dlg: true, who: RE, sub: 'Can’t, Pip. Big day. Sorry.' },
  { id: 'n04', t: 77.4, sub: 'She missed the tram. Then she missed the next one.' },
  { id: 'i01', t: 88.0, dlg: true, who: IV, sub: 'You’re forty minutes late, Ms Hale.' },
  { id: 'i02', t: 92.4, dlg: true, who: IV, sub: 'Tell me. If you could build anything at all, what would you build?' },
  { id: 'r04', t: 98.3, dlg: true, who: RE, sub: 'I… um. I’m sorry. I don’t know.' },
  { id: 'i03', t: 102.6, dlg: true, who: IV, sub: 'We’ll be in touch.' },
  { id: 'n05', t: 106.4, sub: 'They would not be in touch.' },
  { id: 'n06', t: 112.6, sub: 'On the way home it rained, and Remi ducked into a clock shop she had never noticed before.' },
  { id: 'w01', t: 120.6, dlg: true, who: WA, sub: 'Ah. A bad day. I have just the thing.' },
  { id: 'w02', t: 126.6, dlg: true, who: WA, sub: 'Turn this knob before you sleep, and you’ll wake up to the same morning. Seven turns. After that, it’s only a clock.' },
  { id: 'r05', t: 136.8, dlg: true, who: RE, sub: 'How much?' },
  { id: 'w03', t: 139.6, dlg: true, who: WA, sub: 'Whatever you think a day is worth.' },
  { id: 'n07', t: 148.6, sub: 'One of the first alarm clocks in America was built in 1787. It could only ring at four in the morning, the hour its maker got up for work.' },
  { id: 'n08', t: 158.8, sub: 'Remi’s could do something stranger. She turned the knob.' },
  { id: 'd02', t: 167.8, dlg: true, who: RA, sub: 'Seven o’clock, Monday morning. Rain by six.' },
  { id: 'r06', t: 172.8, dlg: true, who: RE, sub: 'Monday. Again.' },
  { id: 'n09', t: 176.4, sub: 'About two in three people say they have felt déjà vu at least once. Remi was feeling it on purpose.' },
  { id: 'n10', t: 183.8, sub: 'Your body keeps its own clock: about twenty thousand nerve cells, just above the place where your optic nerves cross.' },
  { id: 'n11', t: 193.6, sub: 'Left alone, it runs about eleven minutes longer than a day. Every morning, the light puts it right again.' },
  { id: 'k02', t: 205.0, dlg: true, who: PI, sub: 'Remi! Will you watch me ride at the park? Six o’clock!' },
  { id: 'r07', t: 211.0, dlg: true, who: RE, sub: 'Big day, Pip. Next time.' },
  { id: 'n12', t: 216.8, sub: 'So she practised Monday.' },
  { id: 'r08', t: 219.6, dlg: true, who: RE, sub: 'A bridge. No. A tower?' },
  { id: 'n13', t: 225.0, sub: 'Once you know how something turns out, it feels as if you knew it all along. Psychologists call it hindsight bias.' },
  { id: 'n14', t: 233.2, sub: 'Remi didn’t just feel it. She really did know.' },
  { id: 'r10', t: 250.5, dlg: true, who: RE, sub: 'A school where every classroom gets the morning sun.' },
  { id: 'i05', t: 255.4, dlg: true, who: IV, sub: 'Ms Hale, that’s the best answer I’ve heard all year. Come back at five. The director wants to meet you.' },
  { id: 'r11', t: 264.8, dlg: true, who: RE, sub: 'Yes! I mean, yes. Thank you.' },
  { id: 'n15', t: 272.8, sub: 'The final round ran late. Remi didn’t look at the time. It was the perfect Monday.' },
  { id: 'n16', t: 280.6, sub: 'At home, Pip had made her a good luck card. And Pip knew the way to the tram stop.' },
  { id: 'r12', t: 301.2, dlg: true, who: RE, sub: 'This is my fault. This is all my fault.' },
  { id: 'n17', t: 305.6, sub: 'Pip would be all right, the doctors said. In time. But Remi still had turns left.' },
  { id: 'n18', t: 314.2, sub: 'That night, she turned the knob with shaking hands.' },
  { id: 'r13', t: 324.6, dlg: true, who: RE, sub: 'Pip. Promise me you’ll stay home tonight. Promise.' },
  { id: 'k03', t: 329.8, dlg: true, who: PI, sub: 'Okay, okay! I promise.' },
  { id: 'r14', t: 335.6, dlg: true, who: RE, sub: 'Pick up. Pip, pick up.' },
  { id: 'n19', t: 339.4, sub: 'Pip kept her promise. Until she saw the rain, and remembered her sister had no umbrella.' },
  { id: 'r15', t: 358.0, dlg: true, who: RE, sub: 'It keeps happening! Whatever I change, it happens at fourteen past six!' },
  { id: 'w04', t: 364.0, dlg: true, who: WA, sub: 'Because you keep the day you wanted, and only try to change the ending.' },
  { id: 'w05', t: 370.6, dlg: true, who: WA, sub: 'A day isn’t a recording, miss. It’s a promise. You only get to choose who it’s for.' },
  { id: 'n21', t: 379.6, sub: 'Every night, your brain replays the day by itself. In rats, scientists watched brain cells repeat the routes of the day while the animals slept.' },
  { id: 'n22', t: 389.4, sub: 'Replaying is the easy part. Choosing is hard.' },
  { id: 'r16', t: 393.2, dlg: true, who: RE, sub: 'This is the last Monday I can fix.' },
  { id: 'w06', t: 397.0, dlg: true, who: WA, sub: 'Then don’t fix it. Live it.' },
  { id: 'k04', t: 403.0, dlg: true, who: PI, sub: 'Remi! Will you watch me ride at the park? Six o’clock!' },
  { id: 'r17', t: 409.2, dlg: true, who: RE, sub: 'Six o’clock. I’ll be there. I promise.' },
  { id: 'k05', t: 413.4, dlg: true, who: PI, sub: 'Really?' },
  { id: 'i06', t: 417.0, dlg: true, who: IV, sub: 'Come back at five. The director wants to meet you.' },
  { id: 'r18', t: 422.0, dlg: true, who: RE, sub: 'I’m sorry. I can’t. I made a promise.' },
  { id: 'i07', t: 426.6, dlg: true, who: IV, sub: 'Then I’m afraid there won’t be a second chance.' },
  { id: 'r19', t: 431.7, dlg: true, who: RE, sub: 'I know.' },
  { id: 'r20', t: 451.0, dlg: true, who: RE, sub: 'Pip, wait!' },
  { id: 'k06', t: 455.4, dlg: true, who: PI, sub: 'Whoa. That was close.' },
  { id: 'k07', t: 458.6, dlg: true, who: PI, sub: 'You came!' },
  { id: 'r21', t: 460.8, dlg: true, who: RE, sub: 'I’ll always come.' },
  { id: 'n23', t: 470.6, sub: 'That night, Remi had one turn left. She didn’t take it.' },
  { id: 'd03', t: 492.4, dlg: true, who: RA, sub: 'Seven o’clock, Tuesday morning. Sunny all day.' },
  { id: 'r22', t: 498.0, dlg: true, who: RE, sub: 'Tuesday.' },
  { id: 'i08', t: 503.0, dlg: true, who: VM, sub: 'Ms Hale, it’s Halden Architects. The director heard why you left. She’d like to meet you on Thursday.' },
  { id: 'n24', t: 522.0, sub: 'Remi never turned the knob again. She didn’t need to.' },
  { id: 'n25', t: 527.0, sub: 'You can’t rewind a day. But every morning, you get to choose who it’s for.' },
];
const REWS = [241.0, 244.0, 247.0];   // the montage counter drops just after each rewind's flash
// Counters (top right). Rewinds: n0 → run [a, b, n1]. Clock: m0 minutes → run [a, b, m1]; shown as h:mm PM.
export const CHIPS = [
  { a: 151.0, b: 165.6, n0: 7, run: [163.0, 163.1, 6] },
  { a: 236.0, b: 249.6, n0: 6, steps: REWS },
  { a: 273.0, b: 279.6, m0: 18 * 60 + 2, run: [275.3, 277.6, 18 * 60 + 9] },
  { a: 290.4, b: 297.2, m0: 18 * 60 + 13, run: [293.6, 293.7, 18 * 60 + 14] },
  { a: 316.2, b: 323.6, n0: 3, run: [319.4, 319.5, 2] },
  { a: 334.4, b: 345.6, m0: 18 * 60 + 13, run: [343.0, 343.1, 18 * 60 + 14] },
  { a: 352.2, b: 357.3, n0: 2, run: [354.6, 354.7, 1] },
  { a: 434.6, b: 457.0, m0: 18 * 60 + 9, run: [437.0, 450.4, 18 * 60 + 14] },
  { a: 472.0, b: 481.6, n0: 1 },
];
export function chipState(c, t) {
  let n = c.n0 ?? c.m0;
  if (c.steps) n -= c.steps.filter(s => t >= s).length;
  if (c.run) { const [a, b, n1] = c.run, k = Math.max(0, Math.min(1, (t - a) / (b - a))); if (t >= a) n = Math.round(n + (n1 - n) * k); }
  if (c.m0 != null) { const h = Math.floor(n / 60) % 12 || 12, m = n % 60; return { n, text: h + ':' + String(m).padStart(2, '0') + ' PM', wide: '00:00 PM' }; }
  return { n, text: 'REWINDS LEFT ' + n, wide: 'REWINDS LEFT 0' };
}
// The montage rewinds: one flash per turn of the knob
export const REW = (() => { const o = [], [a, b] = T.rewinds; for (let i = 0; i < 3; i++) o.push(a + (b - a) * (i + .5) / 3); return o; })();
// What the brass clock shows (minutes after midnight) in each shot that sees it
export function clockMin(t) {
  if (t < 24.6) return 18 * 60 + 14;
  if (t < 49.6) return 7 * 60;
  if (t < 51.8) return 7 * 60 + 40 * (t - 49.6) / 2.2;
  if (t < 58) return 7 * 60 + 40;
  if (t < 148) return 7 * 60 + 40;
  if (t < 162.8) return 23 * 60 + 10;
  if (t < 165) return 23 * 60 + 10 - (16 * 60 + 10) * Math.min(1, (t - 162.8) / 1.6);
  if (t < 192) return 7 * 60 + (t - 166) / 60;
  if (t < 312) return 7 * 60;
  if (t < 324) return 23 * 60 + 40 - (t > T.knob2 ? (16 * 60 + 40) * Math.min(1, (t - T.knob2) / 1.6) : 0);
  if (t < 356) return 23 * 60 + 50 - (t > T.knob3 ? (16 * 60 + 50) * Math.min(1, (t - T.knob3) / 1.6) : 0);
  if (t < 490) return 23 * 60 + 5 + (t - 468) / 20;
  return 7 * 60 + Math.max(0, t - 490.8) / 60;
}
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
