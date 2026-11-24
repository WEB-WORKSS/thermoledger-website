// Shared content: features, segments, steps, sources, comparisons, safeguards, plans, FAQ.
// Every product feature is in development: nothing here is presented as available today.
import { createRequire } from 'node:module';
import { esc } from './layout.mjs';
const require = createRequire(import.meta.url);
export const D = require('./assets/demo-core.js');

export const ship = (id) => {
  const s = D.SHIPMENTS.find((x) => x.id === id);
  const rd = D.readings(s);
  return { s, rd, a: D.analyze(s, rd) };
};

export const STATS = [
  { fig: '526 million t', text: 'of food production is lost each year because of a lack of effective refrigeration, about 12% of global food production.',
    src: 'UNEP and FAO, Sustainable Food Cold Chains (2022), based on 2017 data', url: 'https://www.unep.org/news-and-stories/press-release/amid-food-and-climate-crises-investing-sustainable-food-cold-chains' },
  { fig: '13.3%', text: 'of food produced worldwide is lost after harvest (on farm, in transport, storage, wholesale and processing) before it reaches retail. 2023 estimate.',
    src: 'FAO, SDG indicator 12.3.1(a) Food Loss Index', url: 'https://www.fao.org/sustainable-development-goals-data-portal/data/indicators/1231-global-food-losses' }
];

export const SEGMENTS = [
  { id: 'pharma', name: 'Pharmaceutical distribution', who: 'Pharmaceutical distributors and wholesalers moving vaccines, insulin, biologics and other 2–8 °C products.',
    problem: 'An excursion found at receipt means a quarantine, a stability review and often a write-off, plus a deviation report assembled by hand from logger files.',
    use: 'Quality teams see every live shipment ranked by risk, with time out of range and mean kinetic temperature calculated from each reading. Excursion summaries are drafted for deviation records.',
    benefit: 'Earlier intervention on shipments that can still be saved, and faster, consistent deviation documentation for QA release decisions.', demo: 'DEMO-S106' },
  { id: 'food', name: 'Food, seafood and produce', who: 'Food and beverage manufacturers, seafood suppliers and fresh produce exporters shipping chilled and frozen product.',
    problem: 'Shelf life is consumed in transit, but most teams only see the temperature record after delivery, when a claim or a rejected load is the only option left.',
    use: 'Each load is scored against its product profile, whether 0–2 °C berries, 0–4 °C fish or frozen desserts. Door-open spikes are separated from real excursions, and pallets are flagged for inspection before release.',
    benefit: 'Fewer rejected loads, inspection effort focused where it matters, and evidence ready for carrier or insurance claims.', demo: 'DEMO-S102' },
  { id: 'storage', name: 'Cold storage and grocery', who: 'Cold-storage warehouse operators and grocery and supermarket distribution centres receiving many inbound loads a day.',
    problem: 'Receiving teams cannot inspect every pallet. Without a risk signal, high-risk loads are handled like every other one, and shortfalls appear on the shelf.',
    use: 'Inbound loads arrive pre-ranked. High-risk loads get priority unloading, and the dock team knows which pallets to probe first.',
    benefit: 'Shorter dwell time for at-risk product, targeted receiving checks, and a clear record of the condition each load arrived in.', demo: 'DEMO-S105' },
  { id: 'carriers', name: 'Refrigerated carriers and 3PLs', who: 'Logistics companies and refrigerated trucking fleets carrying temperature-sensitive loads for shippers.',
    problem: 'Carriers are often held liable for losses, but reefer faults and door events are buried in telematics data that nobody reads until a dispute.',
    use: 'Dispatch sees which vehicles show warming trends or faults in progress and gets recommended actions, such as a reefer check at the next stop or a diversion to a cold store.',
    benefit: 'Problems fixed on the road instead of argued about afterwards, with an objective shipment record to share with customers.', demo: 'DEMO-S103' }
];

export const STEPS = [
  { t: 'Connect', d: 'Temperature loggers and reefer telematics stream readings, or teams upload logger files. Each shipment is linked to its product profile and route.' },
  { t: 'Monitor', d: 'Readings are validated and checked against the product range. Short door-open spikes are separated from sustained excursions and warming trends.' },
  { t: 'Score', d: 'Each shipment gets a 0–100 spoilage-risk score from exposure, excursions, trend, remaining route and lane history. Every factor is shown.' },
  { t: 'Explain', d: 'An incident summary is drafted from the calculated facts: what happened, when, for how long, and the evidence behind it.' },
  { t: 'Act', d: 'Recommended actions go to a person to approve or dismiss. Every decision is written to the shipment’s audit trail.' }
];

export const COMPARE = [
  ['Temperature visibility during transit', 'After delivery, when the logger is downloaded', 'Live readings and location', 'Live readings scored against the product profile'],
  ['Door-open spikes vs. real excursions', 'Manual judgement per file', 'Threshold alerts on every spike', 'Classified by duration, peak and logged events'],
  ['Spoilage risk per shipment', 'Not available', 'Not available; alerts are per sensor', '0–100 score with every contributing factor shown'],
  ['Projected breach before arrival', 'Not available', 'Rarely', 'Trend projected against remaining transit time'],
  ['Incident documentation', 'Assembled by hand from exports', 'Raw data export', 'Drafted summary traced to readings, for review'],
  ['Recommended next action', 'Depends on who is on shift', 'Not available', 'Suggested, then approved or dismissed by a person'],
  ['Audit trail of decisions', 'Emails and spreadsheets', 'Partial', 'Every alert, decision and edit recorded']
];

export const SAFEGUARDS = [
  { t: 'Traceable scores', d: 'Every risk score lists the factors and the readings behind it. No unexplained numbers.' },
  { t: 'People approve actions', d: 'ThermoLedger recommends. A named person approves, edits or dismisses. Nothing is actioned automatically.' },
  { t: 'Readings are never altered', d: 'Raw sensor data is stored as received. Gaps stay gaps. Nothing is estimated or filled in.' },
  { t: 'AI explains, it does not calculate', d: 'Scores and excursions come from deterministic rules. The language model only drafts summaries of results already calculated.' },
  { t: 'A complete audit trail', d: 'Alerts, approvals, dismissals and report edits are logged with user and time.' }
];

export const PLANS = [
  { id: 'pilot', name: 'Pilot', price: 'No charge', unit: '60-day pilot', for: 'One site or lane, to prove value on your own shipments.',
    items: ['Up to 25 monitored shipments a month', 'Logger file import and one telemetry integration', 'Risk scoring and anomaly classification', 'Incident summaries for review', 'Weekly review with the ThermoLedger team'] },
  { id: 'growth', name: 'Growth', price: '$490', unit: 'per month', feat: true, for: 'Operations and QA teams running cold chain across several sites.',
    items: ['Up to 500 monitored shipments a month', 'Up to 5 sites and unlimited users', 'Recommendations and approval workflow', 'Audit trail export for claims and deviations', 'API access for TMS and WMS integration'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', unit: 'annual agreement', for: 'Networks with high volume, custom product profiles or integration needs.',
    items: ['Volume-based shipment pricing', 'Custom product and lane risk profiles', 'Dedicated onboarding and integration support', 'Data residency and retention options', 'Security review support'] }
];

export const PLAN_ROWS = [
  ['Monitored shipments / month', '25', '500', 'Volume-based'],
  ['Sites', '1', '5', 'Unlimited'],
  ['Users', '5', 'Unlimited', 'Unlimited'],
  ['Risk scoring and anomaly classification', '✓', '✓', '✓'],
  ['Incident summaries', '✓', '✓', '✓'],
  ['Recommendations and approval workflow', 'Basic', '✓', '✓'],
  ['Audit trail export', '—', '✓', '✓'],
  ['API access', '—', '✓', '✓'],
  ['Custom product / lane profiles', '—', '—', '✓'],
  ['Support', 'Weekly pilot review', 'Email, next business day', 'Named contact']
];

export const FAQ = [
  ['Is ThermoLedger available today?', 'Not yet. The platform is in development and we are looking for pilot partners. The live demo runs in your browser on fictional sample data so you can see how risk scoring, incident summaries and recommendations will work.'],
  ['Do I need new sensors?', 'The plan is to work with the temperature loggers and reefer telematics you already use, through a device connection or file import. Which devices we support first will be decided with our pilot partners.'],
  ['How is the risk score calculated?', 'From rules you can inspect: thermal exposure outside the product range, sustained excursions, temperature trend, remaining route time and conditions, and lane incident history, weighted by product sensitivity. The score always shows its factors.'],
  ['What does the AI actually do?', 'It drafts plain-language incident summaries and answers questions using results that have already been calculated. It does not set scores, change readings or make release decisions.'],
  ['Can ThermoLedger decide whether product is safe to use?', 'No. Release and disposal decisions stay with your quality team. ThermoLedger gives them the evidence and a consistent summary faster.'],
  ['What does a pilot involve?', 'One site or lane, your existing temperature data, and a short weekly review with our team. Together we agree the product profiles and what a useful alert looks like for your operation.']
];

// ---------- visuals (mirroring /demo, always labelled) ----------
export function vizShipment(id, { h, title = true, W = 560, H = 210 } = {}) {
  const { s, rd, a } = ship(id);
  const p = a.product;
  const outMin = a.segs.reduce((n, g) => n + g.minutes, 0);
  const ev = a.segs.slice(0, 3).map((g) => `<li><time>${D.clock(g.start)}</time><span>${esc(g.note)} · ${g.minutes} min · peak ${g.peak.toFixed(1)} °C</span><span class="tag ${g.kind === 'sustained' ? 'hot' : 'warm'}">${g.kind === 'sustained' ? 'Excursion' : 'Transient'}</span></li>`).join('');
  return `<figure class="panel" style="margin:0" aria-label="Product concept: shipment ${s.id} risk view, demo data">
  <div class="panel-top"><b class="mono">${s.id}</b><span class="tag ${a.band}">${a.band} risk</span><span class="tag demo">Demo data</span></div>
  <div class="panel-body" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end">
    <div><div style="font-weight:600">${esc(p.name)}</div><div class="small">${esc(s.origin)} → ${esc(s.dest)}</div></div>
    <div class="score ${a.band}"><strong>${a.score}</strong><span class="small">/ 100 risk</span></div>
  </div>
  <div class="chart" style="padding:0 10px 6px">${D.chart(rd, p, W, H, { segs: a.segs })}</div>
  <div class="readout">
    <div><span>Now</span><strong>${a.last.toFixed(1)} °C</strong></div>
    <div><span>Peak</span><strong>${a.peak.toFixed(1)} °C</strong></div>
    <div><span>Out of range</span><strong>${outMin} min</strong></div>
    <div><span>Remaining</span><strong>${a.remaining.toFixed(1)} h</strong></div>
  </div>
  ${ev ? `<ul class="events">${ev}</ul>` : ''}
</figure>`;
}

export function vizEvents(id) {
  const { s, a } = ship(id);
  const rows = a.segs.map((g) => `<li><time>${D.clock(g.start)}</time><span><b>${g.kind === 'sustained' ? 'Sustained excursion' : 'Transient spike'}</b> · ${g.minutes} min · peak ${g.peak.toFixed(1)} °C<br><span class="small">${esc(g.note)}${g.kind === 'transient' ? ' — recovered within tolerance, not scored' : ''}</span></span><span class="tag ${g.kind === 'sustained' ? 'hot' : 'warm'}">${g.kind === 'sustained' ? 'Scored' : 'Not scored'}</span></li>`).join('');
  return `<figure class="panel" style="margin:0"><div class="panel-top"><b>Anomaly review · <span class="mono">${s.id}</span></b><span class="tag demo">Demo data</span></div><div class="panel-body small">Tolerance for ${esc(a.product.name)}: up to ${a.product.tol} min and ${a.product.spike} °C beyond range.</div><ul class="events">${rows}</ul></figure>`;
}

export function vizFactors(id) {
  const { s, a } = ship(id);
  const max = { exposure: 40, sustained: 24, trend: 18, route: 12, lane: 9 };
  const rows = a.factors.map((f) => `<tr><td><b>${f.label}</b><div class="small">${esc(f.detail)}</div><div class="bar"><i style="width:${Math.round((f.pts / max[f.key]) * 100)}%"></i></div></td><td class="num" style="padding-left:16px">${f.pts}</td></tr>`).join('');
  return `<figure class="panel" style="margin:0"><div class="panel-top"><b>Risk score · <span class="mono">${s.id}</span></b><span class="tag ${a.band}">${a.score} · ${a.band}</span><span class="tag demo">Demo data</span></div><div class="panel-body"><table class="factors"><tbody>${rows}<tr><td>Product sensitivity multiplier</td><td class="num">×${a.mult.toFixed(2)}</td></tr></tbody></table></div></figure>`;
}

export function vizReport(id) {
  const { s, a } = ship(id);
  const r = D.report(s, a);
  const body = r.sections.slice(0, 3).map((x) => `<h4>${x.h}</h4>${x.t ? `<p>${esc(x.t)}</p>` : `<ul>${x.list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`}`).join('');
  return `<figure class="panel report" style="margin:0"><div class="panel-top"><b>Incident summary — draft</b><span class="tag demo">Sample output</span></div><div class="panel-body"><div class="small mono">${esc(r.head)}</div>${body}<p class="label-line">Drafted from calculated results on sample data. Awaiting review.</p></div></figure>`;
}

export function vizQueue(id, h) {
  const { s, a } = ship(id);
  const recs = D.recommend(s, a).map((r) => `<div class="rec"><div><b>${esc(r.title)}</b><p>${esc(r.why)}</p></div><span class="tag road">Needs approval</span></div>`).join('');
  return `<figure class="panel" style="margin:0"><div class="panel-top"><b>Recommended actions · <span class="mono">${s.id}</span></b><span class="tag demo">Demo data</span></div><div class="panel-body" style="padding-top:4px">${recs}<p class="small" style="margin-top:12px"><a href="${h('/demo/shipments/' + s.id.toLowerCase() + '/')}">Approve or dismiss these in the demo →</a></p></div></figure>`;
}

export function vizLedger(id) {
  const { s, a } = ship(id);
  const g = a.sustained[0];
  const t0 = g ? g.start : 300;
  const rows = [
    [D.clock(0), 'Shipment created · product profile ' + a.product.name, 'System'],
    [D.clock(t0), 'Excursion detected · alert raised', 'System'],
    [D.clock(t0 + 10), 'Alert acknowledged', 'Demo user · QA'],
    [D.clock(t0 + 25), 'Incident summary drafted', 'System'],
    [D.clock(t0 + 40), 'Recommendation approved: hold for inspection', 'Demo user · Operations']
  ].map((r) => `<li><time>${r[0]}</time><span>${esc(r[1])}<br><span class="small">${esc(r[2])}</span></span></li>`).join('');
  return `<figure class="panel" style="margin:0"><div class="panel-top"><b>Shipment ledger · <span class="mono">${s.id}</span></b><span class="tag demo">Demo data</span></div><div class="panel-body"><ul class="audit">${rows}</ul></div></figure>`;
}

export const FEATURES = [
  { id: 'predict', name: 'Predictive spoilage risk', status: 'dev', demo: 'DEMO-S103',
    what: 'Projects whether a load is heading out of its safe range before it arrives, from the recent temperature trend and the transit time left.',
    benefit: 'Teams get hours of warning instead of a surprise at the receiving dock.', step: 'Score',
    viz: (h) => vizShipment('DEMO-S103', { h }) },
  { id: 'anomaly', name: 'Smart temperature anomaly detection', status: 'dev', demo: 'DEMO-S104',
    what: 'Classifies every out-of-range event by duration, peak and logged context, so a 10-minute door opening is not treated like a failing compressor.',
    benefit: 'Fewer false alarms, and real excursions are not lost among them.', step: 'Monitor',
    viz: () => vizEvents('DEMO-S102') },
  { id: 'score', name: 'Shipment risk scoring', status: 'dev', demo: 'DEMO-S106',
    what: 'A 0–100 score per shipment combining thermal exposure, sustained excursions, trend, remaining route conditions and lane history, weighted by product sensitivity.',
    benefit: 'One ranked list of what needs attention, with the reasoning visible.', step: 'Score',
    viz: () => vizFactors('DEMO-S106') },
  { id: 'reports', name: 'AI incident reports', status: 'dev', demo: 'DEMO-S102',
    what: 'Turns readings and shipment events into a concise incident summary with a timeline, evidence list and recommended actions, drafted for a person to review.',
    benefit: 'Claims and deviation records in minutes instead of an afternoon of spreadsheet work.', step: 'Explain',
    viz: () => vizReport('DEMO-S102') },
  { id: 'actions', name: 'Loss prevention recommendations', status: 'dev', demo: 'DEMO-S102',
    what: 'Suggests the next step for each at-risk load, such as a reefer check, priority unloading, inspection on arrival, quarantine or diversion.',
    benefit: 'Consistent responses across shifts and sites, with every decision recorded.', step: 'Act',
    viz: (h) => vizQueue('DEMO-S102', h) },
  { id: 'ledger', name: 'Shipment ledger and audit trail', status: 'dev', demo: 'DEMO-S102',
    what: 'A time-ordered record of every reading, alert, approval and report edit for each shipment.',
    benefit: 'One source of truth when a customer, insurer or auditor asks what happened.', step: 'Act',
    viz: () => vizLedger('DEMO-S102') }
];

export const ROADMAP = [
  'Direct integrations with transport and warehouse management systems',
  'Driver and dispatcher mobile alerts',
  'Carrier and lane performance scorecards',
  'Shelf-life remaining estimates for fresh produce, once validated with pilot data'
];

export const statusTag = (s) => (s === 'dev' ? '<span class="tag dev">In development</span>' : s === 'road' ? '<span class="tag road">Roadmap</span>' : '<span class="tag ok">Available</span>');
