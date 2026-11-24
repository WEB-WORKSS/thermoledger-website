/* ThermoLedger demo engine — sample data and deterministic rules only.
   Shared by the build (hero visual, static demo routes) and the browser demo.
   Nothing here is live data or live AI output. */
(function (root) {
  'use strict';
  var STEP = 5; // minutes between sample readings

  var PRODUCTS = {
    vaccine:  { name: 'Vaccines (2–8 °C)',           cat: 'pharma', min: 2,   max: 8,   target: 5,     tol: 15, spike: 2.5, budget: 60,  sens: 3 },
    insulin:  { name: 'Insulin (2–8 °C)',            cat: 'pharma', min: 2,   max: 8,   target: 5,     tol: 15, spike: 2.5, budget: 60,  sens: 3 },
    salmon:   { name: 'Fresh salmon (0–4 °C)',       cat: 'food',   min: 0,   max: 4,   target: 1.5,   tol: 20, spike: 3,   budget: 120, sens: 3 },
    berries:  { name: 'Fresh berries (0–2 °C)',      cat: 'food',   min: 0,   max: 2,   target: 1,     tol: 20, spike: 2,   budget: 90,  sens: 2 },
    icecream: { name: 'Ice cream (−25 to −18 °C)',   cat: 'food',   min: -25, max: -18, target: -21.5, tol: 20, spike: 4,   budget: 200, sens: 2 },
    dairy:    { name: 'Chilled dairy (1–5 °C)',      cat: 'food',   min: 1,   max: 5,   target: 3,     tol: 20, spike: 3,   budget: 150, sens: 2 }
  };
  var AMBIENT = { mild: 0.5, warm: 1, hot: 1.5 };
  var DEPART = Date.UTC(2026, 10, 24, 6, 0); // sample departure, 24 Nov 2026 06:00

  var SHIPMENTS = [
    { id: 'DEMO-S101', product: 'vaccine', origin: 'Kestrel Pharma Depot', dest: 'Ashby Ridge Distribution', unit: 'Demo Reefer 03', planned: 9, elapsed: 6, ambient: 'mild', lane: 0, seed: 11,
      events: [{ type: 'door', at: 1.5, dur: 10, d: 3.4, note: 'Loading dock door open' }, { type: 'door', at: 4.2, dur: 10, d: 2.0, note: 'Scheduled cross-dock stop' }] },
    { id: 'DEMO-S102', product: 'salmon', origin: 'Harbourline Seafood Dock', dest: 'Larkspur Market DC', unit: 'Demo Reefer 07', planned: 14, elapsed: 9, ambient: 'warm', lane: 1, seed: 23,
      events: [{ type: 'door', at: 1.2, dur: 10, d: 2.2, note: 'Seal check at weighbridge' }, { type: 'fault', at: 5.1, dur: 75, d: 5.6, note: 'Return-air temperature rising; compressor cycling irregularly' }] },
    { id: 'DEMO-S103', product: 'berries', origin: 'Ashby Ridge Packhouse', dest: 'Northfield Yard (export)', unit: 'Demo Reefer 12', planned: 30, elapsed: 12, ambient: 'warm', lane: 2, seed: 37,
      events: [{ type: 'precool', at: 0, dur: 150, d: 1.4, note: 'Product loaded above setpoint' }, { type: 'trend', at: 10.5, dur: 0, d: 0.35, note: 'Gradual warming' }] },
    { id: 'DEMO-S104', product: 'icecream', origin: 'Brightwater Cold Store', dest: 'Larkspur Market DC', unit: 'Demo Reefer 05', planned: 6, elapsed: 5, ambient: 'mild', lane: 0, seed: 41,
      events: [{ type: 'door', at: 1.0, dur: 15, d: 4.0, note: 'Multi-drop delivery stop 1' }, { type: 'door', at: 2.2, dur: 10, d: 3.0, note: 'Multi-drop delivery stop 2' }, { type: 'door', at: 3.3, dur: 15, d: 3.9, note: 'Multi-drop delivery stop 3' }] },
    { id: 'DEMO-S105', product: 'dairy', origin: 'Northfield Yard', dest: 'Harbourline Grocery DC', unit: 'Demo Reefer 09', planned: 11, elapsed: 5, ambient: 'hot', lane: 3, seed: 53,
      events: [{ type: 'trend', at: 2.0, dur: 0, d: 0.45, note: 'Cabin warming under high ambient' }] },
    { id: 'DEMO-S106', product: 'insulin', origin: 'Kestrel Pharma Depot', dest: 'Brightwater Clinical Store', unit: 'Demo Reefer 02', planned: 20, elapsed: 16, ambient: 'warm', lane: 3, seed: 67,
      events: [{ type: 'door', at: 3.0, dur: 10, d: 1.6, note: 'Driver changeover' }, { type: 'fault', at: 11.4, dur: 60, d: 4.6, note: 'Power interruption to reefer unit' }] }
  ];

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function eventOffset(e, m) {
    var start = e.at * 60, end = start + e.dur;
    if (e.type === 'trend') return m > start ? (m - start) / 60 * e.d : 0;
    if (e.type === 'precool') return m < end ? e.d * (1 - m / end) : 0;
    if (m < start) return 0;
    var rise = e.type === 'door' ? 5 : e.dur * 0.6;
    var decay = e.type === 'door' ? 20 : 40;
    if (m <= start + rise) return e.d * (m - start) / rise;
    if (m <= end) return e.d;
    var k = (m - end) / decay;
    return k < 1 ? e.d * (1 - k) : 0;
  }

  function readings(s, extra) {
    var p = PRODUCTS[s.product], r = rng(s.seed), out = [];
    var events = s.events.concat(extra || []);
    var last = s.elapsed * 60 + (extra && extra.length ? extra[0].dur + 30 : 0);
    for (var m = 0; m <= last; m += STEP) {
      var v = p.target + (r() - 0.5) * 0.5;
      for (var i = 0; i < events.length; i++) v += eventOffset(events[i], m);
      out.push({ t: m, v: Math.round(v * 10) / 10 });
    }
    return out;
  }

  function clock(min) {
    var d = new Date(DEPART + min * 60000);
    var day = Math.floor(min / 1440) + 1;
    var hh = String(d.getUTCHours()).padStart(2, '0'), mm = String(d.getUTCMinutes()).padStart(2, '0');
    return (day > 1 ? 'Day ' + day + ' ' : '') + hh + ':' + mm;
  }

  function analyze(s, rd) {
    var p = PRODUCTS[s.product];
    var segs = [], cur = null, dm = 0;
    rd.forEach(function (x) {
      var over = x.v > p.max ? x.v - p.max : x.v < p.min ? p.min - x.v : 0;
      if (over > 0) {
        dm += over * STEP;
        if (!cur) cur = { start: x.t, end: x.t, peak: x.v, peakOver: over, dir: x.v > p.max ? 'above' : 'below', dm: 0 };
        cur.end = x.t; cur.dm += over * STEP;
        if (over > cur.peakOver) { cur.peakOver = over; cur.peak = x.v; }
      } else if (cur) { segs.push(cur); cur = null; }
    });
    if (cur) segs.push(cur);
    segs.forEach(function (g) {
      g.minutes = g.end - g.start + STEP;
      g.kind = g.minutes <= p.tol && g.peakOver <= p.spike ? 'transient' : 'sustained';
      var hit = s.events.filter(function (e) { return Math.abs(e.at * 60 - g.start) < 40; })[0];
      g.note = hit ? hit.note : (g.dir === 'above' ? 'Temperature above range' : 'Temperature below range');
    });

    // Spikes that stay inside the range but match a logged door event are also shown as transient.
    var tail = rd.filter(function (x) { return x.t >= rd[rd.length - 1].t - 120; });
    var n = tail.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
    tail.forEach(function (x) { var h = x.t / 60; sx += h; sy += x.v; sxy += h * x.v; sxx += h * h; });
    var slope = n > 2 ? (n * sxy - sx * sy) / (n * sxx - sx * sx) : 0;
    var lastV = rd[rd.length - 1].v, lastT = rd[rd.length - 1].t;
    var remaining = Math.max(0, s.planned - lastT / 60);
    var trend = null;
    if (slope > 0.3 && lastV <= p.max) {
      var hrs = (p.max - lastV) / slope;
      trend = { slope: slope, breachIn: hrs, beforeArrival: hrs < remaining };
    }

    var peak = rd.reduce(function (a, x) { return Math.max(a, x.v); }, -99);
    var mkt = null;
    if (p.cat === 'pharma') {
      var sum = 0;
      rd.forEach(function (x) { sum += Math.exp(-10000 / (x.v + 273.15)); });
      mkt = 10000 / -Math.log(sum / rd.length) - 273.15;
    }

    var f = [];
    var sustained = segs.filter(function (g) { return g.kind === 'sustained'; });
    var transient = segs.filter(function (g) { return g.kind === 'transient'; });
    var exp = Math.min(40, 40 * dm / p.budget);
    f.push({ key: 'exposure', label: 'Thermal exposure', detail: Math.round(dm) + ' degree-minutes outside range (budget ' + p.budget + ')', pts: exp });
    f.push({ key: 'sustained', label: 'Sustained excursions', detail: sustained.length ? sustained.length + ' excursion' + (sustained.length > 1 ? 's' : '') + ' beyond the ' + p.tol + '-minute tolerance' : 'None detected', pts: Math.min(24, sustained.length * 12) });
    f.push({ key: 'trend', label: 'Temperature trend', detail: trend ? '+' + trend.slope.toFixed(2) + ' °C/h over the last 2 h' + (trend.beforeArrival ? '; projected to leave range before arrival' : '') : 'Stable over the last 2 h', pts: trend ? 10 + (trend.beforeArrival ? 8 : 0) : 0 });
    f.push({ key: 'route', label: 'Remaining route exposure', detail: remaining.toFixed(1) + ' h remaining · ' + s.ambient + ' ambient conditions', pts: Math.min(12, remaining * AMBIENT[s.ambient] * 0.8) });
    f.push({ key: 'lane', label: 'Lane history', detail: s.lane ? s.lane + ' incident' + (s.lane > 1 ? 's' : '') + ' on this sample lane in the last 90 days' : 'No incidents on this sample lane', pts: Math.min(9, s.lane * 3) });
    var base = f.reduce(function (a, x) { return a + x.pts; }, 0);
    var mult = 0.85 + 0.1 * p.sens;
    var score = Math.min(100, Math.round(base * mult));
    var band = score >= 65 ? 'High' : score >= 35 ? 'Watch' : 'Low';
    f.forEach(function (x) { x.pts = Math.round(x.pts * 10) / 10; });

    return { product: p, segs: segs, sustained: sustained, transient: transient, dm: dm, trend: trend, peak: peak, last: lastV, lastT: lastT,
      remaining: remaining, mkt: mkt, factors: f, mult: mult, score: score, band: band, count: rd.length };
  }

  function recommend(s, a) {
    var r = [], p = a.product;
    if (a.sustained.length && p.cat === 'pharma') r.push({ id: 'qa', title: 'Quarantine on arrival pending QA release', why: 'Sustained excursion on a temperature-critical medicine. Release decision belongs to the receiving QA team.' });
    if (a.sustained.length && p.cat === 'food') r.push({ id: 'inspect', title: 'Hold for quality inspection on arrival', why: 'Probe core temperature of pallets nearest the evaporator and door before release.' });
    if (a.band === 'High' && a.remaining > 4) r.push({ id: 'divert', title: 'Consider diverting to the nearest approved cold store', why: a.remaining.toFixed(1) + ' h of transit remain in ' + s.ambient + ' conditions.' });
    if (a.trend) r.push({ id: 'reefer', title: 'Check reefer setpoint and return-air reading at the next stop', why: 'Temperature rising ' + a.trend.slope.toFixed(2) + ' °C/h' + (a.trend.beforeArrival ? ', projected to breach in ' + a.trend.breachIn.toFixed(1) + ' h' : '') + '.' });
    if (a.band !== 'Low') r.push({ id: 'unload', title: 'Prioritise unloading and pre-alert the receiving dock', why: 'Reduces dwell time once the vehicle arrives at ' + s.dest + '.' });
    if (!r.length) r.push({ id: 'none', title: 'No action needed', why: a.transient.length ? a.transient.length + ' short spike' + (a.transient.length > 1 ? 's' : '') + ' recovered within tolerance (door openings).' : 'Readings stayed inside the product range.' });
    return r;
  }

  function report(s, a) {
    var p = a.product, lines = [];
    var head = s.id + ' · ' + p.name + ' · ' + s.origin + ' → ' + s.dest;
    var summary;
    if (a.sustained.length) {
      var g = a.sustained[0];
      summary = 'Between ' + clock(g.start) + ' and ' + clock(g.end + STEP) + ' the load temperature rose ' + (g.dir === 'above' ? 'above' : 'below') + ' the ' + p.min + '–' + p.max + ' °C range for ' + g.minutes +
        ' minutes, peaking at ' + g.peak.toFixed(1) + ' °C. Logged context: ' + g.note.toLowerCase() + '. Total exposure is ' + Math.round(a.dm) + ' degree-minutes against a budget of ' + p.budget + '. Current risk score ' + a.score + ' (' + a.band + ').';
    } else if (a.trend) {
      summary = 'No sustained excursion so far. Temperature has risen ' + a.trend.slope.toFixed(2) + ' °C/h over the last two hours and reads ' + a.last.toFixed(1) + ' °C. ' + (a.trend.beforeArrival ? 'At this rate it leaves range in about ' + a.trend.breachIn.toFixed(1) + ' h, before the planned arrival.' : 'At this rate it stays in range until arrival.') + ' Current risk score ' + a.score + ' (' + a.band + ').';
    } else {
      summary = 'Readings stayed within ' + p.min + '–' + p.max + ' °C apart from ' + a.transient.length + ' short spike' + (a.transient.length === 1 ? '' : 's') + ' matched to door openings, each recovering inside the ' + p.tol + '-minute tolerance. Current risk score ' + a.score + ' (' + a.band + ').';
    }
    lines.push({ h: 'Summary', t: summary });
    var tl = a.segs.map(function (g) { return clock(g.start) + ' — ' + (g.kind === 'sustained' ? 'Sustained excursion' : 'Transient spike') + ', ' + g.minutes + ' min, peak ' + g.peak.toFixed(1) + ' °C (' + g.note + ')'; });
    if (a.trend) tl.push(clock(a.lastT) + ' — Warming trend detected, +' + a.trend.slope.toFixed(2) + ' °C/h');
    lines.push({ h: 'Timeline', list: tl.length ? tl : ['No out-of-range readings recorded'] });
    if (a.mkt !== null) lines.push({ h: 'Mean kinetic temperature', t: a.mkt.toFixed(2) + ' °C across ' + a.count + ' readings (ΔH/R = 10,000 K).' });
    lines.push({ h: 'Evidence', list: [a.count + ' readings at ' + STEP + '-minute intervals from ' + s.unit, 'Event log: ' + s.events.length + ' entr' + (s.events.length === 1 ? 'y' : 'ies'), 'Record ID ' + s.id + '-EVID-01 (sample)'] });
    lines.push({ h: 'Recommended actions', list: recommend(s, a).map(function (x) { return x.title; }) });
    return { head: head, sections: lines };
  }

  function answers(s, a) {
    var top = a.factors.slice().sort(function (x, y) { return y.pts - x.pts; }).filter(function (x) { return x.pts > 0; }).slice(0, 2);
    return [
      { q: 'Why is this shipment rated ' + a.band + '?', a: 'The score is ' + a.score + '. The largest contributors are ' + (top.length ? top.map(function (x) { return x.label.toLowerCase() + ' (' + x.pts + ' pts: ' + x.detail + ')'; }).join(' and ') : 'none — every factor is at zero') + '. Product sensitivity applies a ×' + a.mult.toFixed(2) + ' multiplier.' },
      { q: 'Were any of the spikes just door openings?', a: a.transient.length ? a.transient.length + ' spike' + (a.transient.length > 1 ? 's were' : ' was') + ' classed as transient: each lasted ' + a.product.tol + ' minutes or less, peaked within ' + a.product.spike + ' °C of the limit and lines up with a logged stop. They are listed but not scored.' : 'No spikes were classed as transient on this shipment.' },
      { q: 'What should we do next?', a: recommend(s, a).map(function (x, i) { return (i + 1) + '. ' + x.title + ' — ' + x.why; }).join(' ') + ' Each action needs a person to approve it.' },
      { q: 'Can you estimate the temperature during a gap in the logger data?', a: 'No. ThermoLedger does not invent or fill in missing readings. A gap is reported as a gap, with its start and end time, so your QA team can decide how to treat it.' }
    ];
  }

  function chart(rd, p, W, H, opt) {
    opt = opt || {};
    var pad = { l: 36, r: 22, t: 12, b: 24 };
    var vals = rd.map(function (x) { return x.v; });
    var lo = Math.min(p.min - 1.5, Math.min.apply(null, vals) - 0.5), hi = Math.max(p.max + 1.5, Math.max.apply(null, vals) + 0.5);
    var tMax = Math.max(rd[rd.length - 1].t, 60);
    var X = function (t) { return pad.l + (W - pad.l - pad.r) * t / tMax; };
    var Y = function (v) { return pad.t + (H - pad.t - pad.b) * (hi - v) / (hi - lo); };
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Temperature trace with safe range ' + p.min + ' to ' + p.max + ' degrees Celsius">';
    o += '<rect x="' + pad.l + '" y="' + Y(p.max) + '" width="' + (W - pad.l - pad.r) + '" height="' + (Y(p.min) - Y(p.max)) + '" class="c-band"/>';
    (opt.segs || []).forEach(function (g) {
      o += '<rect x="' + X(g.start) + '" y="' + pad.t + '" width="' + Math.max(3, X(g.end + STEP) - X(g.start)) + '" height="' + (H - pad.t - pad.b) + '" class="' + (g.kind === 'sustained' ? 'c-hot' : 'c-warm') + '"/>';
    });
    [p.min, p.max].forEach(function (v) {
      o += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="c-limit"/>';
      o += '<text x="' + (pad.l - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" class="c-lbl">' + v + '°</text>';
    });
    var step = tMax > 900 ? 240 : tMax > 400 ? 120 : 60;
    if (!opt.compact || W > 420) for (var t = 0; t <= tMax - step * 0.4; t += step) o += '<text x="' + X(t) + '" y="' + (H - 6) + '" text-anchor="middle" class="c-lbl">' + clock(t).replace('Day ', 'D') + '</text>';
    o += '<polyline fill="none" class="c-line" points="' + rd.map(function (x) { return X(x.t).toFixed(1) + ',' + Y(x.v).toFixed(1); }).join(' ') + '"/>';
    var L = rd[rd.length - 1];
    o += '<circle cx="' + X(L.t) + '" cy="' + Y(L.v) + '" r="4" class="c-dot"/>';
    return o + '</svg>';
  }

  var api = { STEP: STEP, PRODUCTS: PRODUCTS, SHIPMENTS: SHIPMENTS, readings: readings, analyze: analyze, recommend: recommend, report: report, answers: answers, chart: chart, clock: clock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TLDemo = api;
})(typeof window !== 'undefined' ? window : this);
