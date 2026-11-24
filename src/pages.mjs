import { site, pricingConfirmed } from './config.mjs';
import { esc } from './layout.mjs';
import { D, ship, STATS, SEGMENTS, STEPS, COMPARE, SAFEGUARDS, PLANS, PLAN_ROWS, FAQ, FEATURES, ROADMAP, statusTag, vizShipment } from './content.mjs';

const N = esc(site.name);

// ---------- reusable sections ----------
const head = (kicker, title, lede) => `<div class="head rv">${kicker ? `<p class="kicker">${kicker}</p>` : ''}<h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ''}</div>`;

const stats = () => `<div class="grid g2 rv">${STATS.map((s) => `<div class="stat"><strong>${s.fig}</strong><p>${s.text}</p><a href="${s.url}" rel="noopener">Source: ${s.src}</a></div>`).join('')}</div>
<p class="note">These are published industry figures from UN agencies. They describe the scale of cold-chain loss worldwide, not ${N}’s results.</p>`;

const vs = () => `<div class="vs rv" style="margin-top:40px">
  <div><h3>Today</h3><ul>
    <li>Logger data is downloaded after delivery, once the damage is done</li>
    <li>Every door opening triggers the same alert as a failing compressor</li>
    <li>Nobody can say which of today’s 200 loads is most at risk</li>
    <li>Incident reports are rebuilt by hand from CSV exports and emails</li>
    <li>What happens next depends on who is on shift</li></ul></div>
  <div><h3>With ${N}</h3><ul>
    <li>Risk is scored while the load is still on the road</li>
    <li>Short spikes are separated from sustained excursions</li>
    <li>Shipments are ranked by spoilage risk, with the reasons shown</li>
    <li>Incident summaries are drafted from the readings, ready to review</li>
    <li>Recommended actions are approved by a person and logged</li></ul></div>
</div>`;

const steps = () => `<ol class="steps rv">${STEPS.map((s) => `<li><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}</ol>`;

const compare = () => `<div class="scroll rv"><table class="stack"><thead><tr><th scope="col">Capability</th><th scope="col">Spreadsheets and logger downloads</th><th scope="col">Generic GPS and temperature tracking</th><th scope="col">${N} (in development)</th></tr></thead>
<tbody>${COMPARE.map((r) => `<tr><th scope="row">${r[0]}</th><td class="n">${r[1]}</td><td class="n">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;

const aiBlock = (h) => {
  const { s, a } = ship('DEMO-S102');
  const qa = D.answers(s, a);
  return `<div class="grid g2" style="align-items:start">
  <div class="rv">
    <h3>What the AI does</h3>
    <ul class="does yes">
      <li>Drafts incident summaries from excursions, timings and evidence that have already been calculated</li>
      <li>Answers questions about a shipment using its calculated score and factors</li>
      <li>Writes recommendations in plain language for the person approving them</li>
    </ul>
    <h3 style="margin-top:28px">What it does not do</h3>
    <ul class="does no">
      <li>It never sets or changes a risk score. Scores come from deterministic rules</li>
      <li>It never fills in missing readings or estimates temperatures it did not receive</li>
      <li>It never approves an action, releases product or contacts anyone on its own</li>
    </ul>
  </div>
  <div class="panel rv"><div class="panel-top"><b>Ask about <span class="mono">${s.id}</span></b><span class="tag demo">Sample data</span></div>
    <div class="panel-body chat">
      <div class="msg q">${esc(qa[0].q)}</div>
      <div class="msg a"><small>${N} · scripted sample</small>${esc(qa[0].a)}</div>
      <div class="msg q">${esc(qa[3].q)}</div>
      <div class="msg a"><small>${N} · scripted sample</small>${esc(qa[3].a)}</div>
      <p class="small" style="margin:6px 0 0">Scripted from calculated results on sample data, not live AI output. <a href="${h('/demo/shipments/demo-s102/')}">Try it in the demo →</a></p>
    </div>
  </div>
</div>`;
};

const safeguards = (h, link = true) => `<div class="grid g3">${SAFEGUARDS.map((s) => `<div class="hl rv"><h3>${s.t}</h3><p>${s.d}</p></div>`).join('')}
${link ? `<div class="hl rv"><h3>What is and isn’t built yet</h3><p>We publish exactly which safeguards exist today and which are planned. <a href="${h('/security/')}">Read the security overview →</a></p></div>` : ''}</div>`;

const faq = () => `<div class="rv" style="max-width:860px">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;

const cta = (h, title = 'Pilot ThermoLedger on your own lanes', text = 'We are working with a small number of early partners to shape product profiles, alerts and reports around real operations. Pilots start with one site or lane and the temperature data you already collect.') =>
  `<section class="band deep"><div class="wrap" style="display:grid;grid-template-columns:minmax(0,1.4fr) auto;gap:32px;align-items:center">
  <div><h2 style="color:#fff">${title}</h2><p class="lede" style="margin:0">${text}</p></div>
  <div class="btns"><a class="btn primary" href="${h('/contact/')}">Request early access</a><a class="btn ghost" href="${h('/demo/')}">Explore the live demo</a></div>
</div></section>`;

const proposedNote = () => pricingConfirmed ? '' : `<p class="proposed rv" role="note"><strong>Proposed pricing.</strong> These prices are not final. ${N} is in development, and pricing will be confirmed with pilot partners before general availability.</p>`;

const plansGrid = (h) => `<div class="plans">${PLANS.map((p) => `<div class="plan rv${p.feat ? ' feat' : ''}">
  <h3>${p.name}</h3><p class="small" style="margin:0">${p.for}</p>
  <div class="price">${p.price}</div><div class="small">${pricingConfirmed ? '' : 'Proposed · '}${p.unit}</div>
  <ul>${p.items.map((i) => `<li>${i}</li>`).join('')}</ul>
  <a class="btn ${p.feat ? 'primary' : 'ghost'}" href="${h('/contact/')}?plan=${p.id}">${p.id === 'enterprise' ? 'Talk to us' : p.id === 'pilot' ? 'Apply for a pilot' : 'Request early access'}</a>
</div>`).join('')}</div>`;

const archSvg = () => {
  const box = (x, y, t, s, aws) => `<g><rect x="${x}" y="${y}" width="270" height="92" rx="12" class="${aws ? 'a-aws' : 'a-box'}"/><text x="${x + 18}" y="${y + 38}" class="a-t">${t}</text><text x="${x + 18}" y="${y + 62}" class="a-s">${s}</text></g>`;
  const arrow = (d) => `<path d="${d}" class="a-arrow" marker-end="url(#ah)"/>`;
  return `<svg viewBox="0 0 1000 470" role="img" aria-labelledby="arch-t arch-d"><title id="arch-t">Proposed ThermoLedger architecture on AWS</title><desc id="arch-d">Sensors send telemetry to AWS IoT Core, which triggers AWS Lambda for validation, anomaly detection and risk scoring. Results go to Amazon DynamoDB and raw data to Amazon S3. Amazon Bedrock drafts summaries from calculated facts. Amazon API Gateway serves dashboards and external systems.</desc>
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="a-head"/></marker></defs>
${box(20, 30, 'Loggers and reefer units', 'Telemetry, door and power events', false)}
${box(365, 30, 'AWS IoT Core', 'Device identity, MQTT ingestion, rules', true)}
${box(710, 30, 'AWS Lambda', 'Validate · detect anomalies · score', true)}
${box(20, 190, 'Amazon Bedrock', 'Drafts summaries from facts', true)}
${box(365, 190, 'Amazon DynamoDB', 'Shipments, scores, alerts, audit', true)}
${box(710, 190, 'Amazon S3', 'Raw telemetry, logger files, evidence', true)}
${box(20, 350, 'Dashboards', 'Operations and QA teams', false)}
${box(365, 350, 'Amazon API Gateway', 'Authenticated REST API', true)}
${box(710, 350, 'TMS / WMS / ERP', 'Shipment and order data', false)}
${arrow('M290 76H361')}${arrow('M635 76H706')}
${arrow('M845 122V186')}${arrow('M760 122L600 186')}
${arrow('M365 236H294')}
${arrow('M500 346V286')}
${arrow('M290 396H361')}${arrow('M710 396H639')}
<text x="300" y="226" class="a-s">calculated facts only</text>
</svg>`;
};

const archList = () => `<ol class="arch-list">
<li><b>Loggers and reefer units</b> send readings and door/power events to <b>AWS IoT Core</b>.</li>
<li><b>AWS Lambda</b> validates readings, classifies anomalies and calculates the risk score.</li>
<li>Scores, alerts and the audit trail are stored in <b>Amazon DynamoDB</b>; raw telemetry and evidence in <b>Amazon S3</b>.</li>
<li><b>Amazon Bedrock</b> drafts incident summaries from the calculated facts only.</li>
<li><b>Amazon API Gateway</b> serves dashboards and connects TMS, WMS and ERP systems.</li></ol>`;

export const AWS = [
  ['Amazon Bedrock', 'Drafts incident summaries and plain-language explanations from calculated results. Receives no raw authority over scores or readings.'],
  ['AWS IoT Core', 'Ingests telemetry from connected temperature loggers and reefer units, with per-device identity.'],
  ['Amazon S3', 'Stores raw telemetry history, uploaded logger files and incident evidence.'],
  ['AWS Lambda', 'Runs validation, anomaly classification, risk calculation, alerting and report workflows.'],
  ['Amazon DynamoDB', 'Stores shipment status, risk scores, alerts and the audit trail.'],
  ['Amazon API Gateway', 'Connects customer dashboards and external systems to the backend through an authenticated API.']
];

// ---------- pages ----------
export const pages = {
  '/': {
    title: 'Home',
    description: `${site.name} is cold-chain risk intelligence software in development: spoilage-risk scores per shipment, smart anomaly detection, incident summaries and recommended actions. Now accepting pilot partners.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap">
  <div>
    <span class="pill">${esc(site.stage)}</span>
    <h1>Know which shipments are at risk while there’s still time to save them.</h1>
    <p class="lede">${N} turns temperature readings, transit time and route conditions into a spoilage-risk score for every shipment. It separates door-open spikes from real excursions, drafts the incident report, and recommends what to do next.</p>
    <div class="btns"><a class="btn primary" href="${h('/contact/')}">Request early access</a><a class="btn ghost" href="${h('/demo/')}">Explore the live demo</a></div>
  </div>
  <div>${vizShipment('DEMO-S102', { h })}</div>
</div></section>

<section class="strip" aria-label="Who it is built for"><div class="wrap"><p>Built for</p><ul>
  <li>Pharmaceutical distributors</li><li>Food and beverage manufacturers</li><li>Cold-storage operators</li><li>Fresh produce exporters</li><li>Seafood suppliers</li><li>Grocery supply chains</li><li>Refrigerated carriers</li></ul></div></section>

<section class="band"><div class="wrap"><div class="grid g4">
  <div class="hl rv"><h3>Risk per shipment, not per sensor</h3><p>One score for each load, combining exposure, trend, route and history.</p></div>
  <div class="hl rv"><h3>Spikes vs. real excursions</h3><p>Door openings that recover in minutes are logged, not escalated.</p></div>
  <div class="hl rv"><h3>Reports traced to readings</h3><p>Incident summaries list the evidence behind every statement.</p></div>
  <div class="hl rv"><h3>People stay in charge</h3><p>Recommendations are approved or dismissed by your team, and logged.</p></div>
</div></div></section>

<section class="band ice"><div class="wrap">
  ${head('The problem', 'Cold-chain records explain losses after the fact.', 'Most temperature monitoring tells you what went wrong once the load has arrived. By then the only options are a claim, a write-off or a stability investigation. Threshold alerts help on the road, but they fire for every door opening, so teams learn to ignore them, and a failing reefer unit looks the same as a delivery stop. As networks grow to hundreds of loads a day, nobody can manually decide which shipments need attention first. The cost shows up as rejected loads, quarantined medicines, shrink on the shelf and hours spent rebuilding incident timelines.')}
  ${stats()}
  ${vs()}
</div></section>

<section class="band"><div class="wrap">
  ${head('Platform', 'Six capabilities, one workflow.', `Every capability below is in development. You can try each one on sample data in the <a href="${h('/demo/')}">live demo</a>.`)}
  <div class="grid g3">${FEATURES.map((f) => `<div class="card rv" style="display:flex;flex-direction:column"><div class="status">${statusTag(f.status)}<span class="small">Step: ${f.step}</span></div><h3>${f.name}</h3><p>${f.what}</p><p class="small"><b>Benefit:</b> ${f.benefit}</p><a class="small" style="margin-top:auto" href="${h('/product/#' + f.id)}">Details →</a></div>`).join('')}</div>
</div></section>

<section class="band soft"><div class="wrap">
  ${head('How it works', 'From reading to decision in five steps.', '')}
  ${steps()}
  <p class="rv" style="margin-top:32px"><a class="btn ghost" href="${h('/how-it-works/')}">See the full workflow</a></p>
</div></section>

<section class="band"><div class="wrap">
  ${head('Who it’s for', 'Built around how each part of the cold chain works.', '')}
  <div class="grid g2">${SEGMENTS.map((s) => `<a class="card rv" href="${h('/solutions/#' + s.id)}" style="color:inherit;text-decoration:none;display:block"><h3>${s.name}</h3><p class="small" style="margin-bottom:10px">${s.who}</p><p><b>Problem:</b> ${s.problem}</p><p><b>With ${N}:</b> ${s.benefit}</p><span class="small" style="color:var(--teal);font-weight:600">Read more →</span></a>`).join('')}</div>
</div></section>

<section class="band soft"><div class="wrap">
  ${head('Comparison', 'How it compares with the way the job is done today.', 'Compared with common methods, not named products.')}
  ${compare()}
</div></section>

<section class="band"><div class="wrap">
  ${head('How the AI is used', 'AI that explains results. It does not invent them.', 'Risk scores and excursions are calculated by transparent rules. A language model is used for one job: turning those calculated results into clear, reviewable text.')}
  ${aiBlock(h)}
</div></section>

<section class="band ice"><div class="wrap">
  ${head('Safeguards', 'Designed for teams who have to defend every decision.', '')}
  ${safeguards(h)}
</div></section>

<section class="band"><div class="wrap grid g2" style="align-items:center">
  <div class="rv"><p class="kicker">Technology</p><h2>A planned architecture on AWS.</h2><p class="lede">Our planned architecture uses AWS IoT Core for device telemetry, AWS Lambda for anomaly detection and scoring, Amazon DynamoDB and Amazon S3 for shipment records and evidence, Amazon API Gateway for integrations, and Amazon Bedrock for incident summaries.</p><a class="btn ghost" href="${h('/technology/')}">View the architecture</a></div>
  <div class="rv"><div class="arch arch-wide">${archSvg()}</div><div class="arch arch-narrow">${archList()}</div></div>
</div></section>

<section class="band soft"><div class="wrap">
  ${head('Pricing', 'Start with a pilot on one lane.', '')}
  ${proposedNote()}
  ${plansGrid(h)}
  <p class="rv" style="margin-top:24px"><a href="${h('/pricing/')}">Compare plans in detail →</a></p>
</div></section>

<section class="band"><div class="wrap">
  ${head('Questions', 'Frequently asked questions', '')}
  ${faq()}
</div></section>
${cta(h)}`
  },

  '/product/': {
    title: 'Platform',
    description: `The ${site.name} platform: predictive spoilage risk, smart temperature anomaly detection, shipment risk scoring, AI incident reports, loss prevention recommendations and an audit trail. All in development.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)">
  <div style="max-width:820px"><span class="pill">${esc(site.stage)}</span><h1>The platform, feature by feature.</h1>
  <p class="lede">${N} is built around one question: which shipments are likely to lose product, and what should we do about it now? Each capability below is in development. The visuals are product concepts rendered from the demo’s sample data.</p>
  <div class="btns"><a class="btn primary" href="${h('/demo/')}">Try every feature in the demo</a><a class="btn ghost" href="${h('/contact/')}">Request early access</a></div></div>
</div></section>
<section class="band"><div class="wrap">
${FEATURES.map((f, i) => `<article class="feature${i % 2 ? ' flip' : ''}" id="${f.id}">
  <div class="rv"><div class="status">${statusTag(f.status)}</div><h2>${f.name}</h2><p class="lede">${f.what}</p>
  <dl><dt>Benefit</dt><dd>${f.benefit}</dd><dt>Workflow step</dt><dd>${f.step}</dd><dt>Try it</dt><dd><a href="${h('/demo/shipments/' + f.demo.toLowerCase() + '/')}">${f.demo} in the demo</a></dd></dl></div>
  <div class="rv">${f.viz(h)}</div>
</article>`).join('')}
</div></section>
<section class="band soft"><div class="wrap grid g2">
  <div class="rv"><p class="kicker">Roadmap</p><h2>Planned after the first release</h2><p class="lede">These are on the roadmap and not yet in development. Their order will depend on what pilot partners need most.</p></div>
  <ul class="does rv" style="list-style:none">${ROADMAP.map((r) => `<li style="padding-left:0"><span class="tag road" style="margin-right:10px">Roadmap</span>${r}</li>`).join('')}</ul>
</div></section>
${cta(h)}`
  },

  '/how-it-works/': {
    title: 'How it works',
    description: `How ${site.name} works: connect temperature data, monitor for anomalies, score spoilage risk, explain incidents and act on approved recommendations.`,
    body: ({ h }) => {
      const detail = [
        ['You provide', 'Logger and reefer telemetry (device connection or file upload), shipment details, product type and planned route.', 'Readings are linked to a shipment and a product profile that defines the safe range, the tolerance for short spikes and the exposure budget.', 'A shipment record with a live temperature trace.'],
        ['Automatic', 'Nothing. Monitoring runs continuously.', 'Every reading is checked against the profile. Out-of-range periods are classified as transient (short, small, matched to a logged stop) or sustained. Rising trends are projected forward.', 'Classified events: transient spikes are logged but not scored.'],
        ['Automatic', 'Nothing. You can adjust product profiles with your QA team.', 'The score combines thermal exposure, sustained excursions, trend, remaining route time and conditions, and lane history, then applies the product’s sensitivity.', 'A 0–100 score with Low, Watch or High banding and every factor listed.'],
        ['Review', 'Read and edit the draft.', 'For any excursion or high-risk shipment, an incident summary is drafted from the calculated facts: timeline, peak, duration, exposure and evidence.', 'An editable incident summary, ready for claims or deviation records.'],
        ['Decide', 'Approve, edit or dismiss each recommendation.', 'Suggested actions follow from the findings: reefer check, priority unloading, inspection, quarantine or diversion.', 'Decisions written to the shipment ledger with user and time.']
      ];
      return `
<section class="hero"><div class="wrap">
  <div><span class="pill">${esc(site.stage)}</span><h1>From a temperature reading to a decision.</h1><p class="lede">${N} follows each shipment from departure to receipt. Here is what happens at each step, what your team does, and what you get.</p>
  <div class="btns"><a class="btn primary" href="${h('/demo/shipments/demo-s106/')}">Follow a shipment in the demo</a></div></div>
  <div>${vizShipment('DEMO-S106', { h })}</div>
</div></section>
<section class="band soft"><div class="wrap">${steps()}</div></section>
<section class="band"><div class="wrap">
${STEPS.map((s, i) => `<article class="feature" id="${s.t.toLowerCase()}" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)">
  <div class="rv"><p class="kicker">Step ${i + 1} · ${detail[i][0]}</p><h2>${s.t}</h2><p class="lede">${s.d}</p></div>
  <div class="rv"><dl style="grid-template-columns:9em minmax(0,1fr)"><dt>Your team</dt><dd>${detail[i][1]}</dd><dt>${N}</dt><dd>${detail[i][2]}</dd><dt>Output</dt><dd>${detail[i][3]}</dd></dl></div>
</article>`).join('')}
</div></section>
<section class="band ice"><div class="wrap grid g2">
  <div class="rv"><h2>What a pilot needs from you</h2><p class="lede">We keep pilots small and specific so results are clear.</p></div>
  <ul class="does yes rv"><li>One site, lane or customer account to start with</li><li>Access to temperature data you already collect: logger exports or a telematics feed</li><li>Your product temperature ranges and any existing excursion procedures</li><li>A named contact in operations or QA for a short weekly review</li></ul>
</div></section>
${cta(h)}`;
    }
  },

  '/solutions/': {
    title: 'Solutions',
    description: `${site.name} for pharmaceutical distributors, food, seafood and produce shippers, cold-storage and grocery operators, and refrigerated carriers.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)"><div style="max-width:820px">
  <span class="pill">${esc(site.stage)}</span><h1>One risk signal, used differently across the cold chain.</h1>
  <p class="lede">Distributors, producers, warehouses and carriers each lose product at different points. Here is how each would use ${N}.</p>
  <nav class="btns" aria-label="Segments">${SEGMENTS.map((s) => `<a class="btn ghost sm" href="#${s.id}">${s.name}</a>`).join('')}</nav>
</div></div></section>
${SEGMENTS.map((s, i) => `<section class="band${i % 2 ? ' soft' : ''}" id="${s.id}"><div class="wrap feature${i % 2 ? ' flip' : ''}" style="border:0;padding:0">
  <div class="rv"><p class="kicker">${s.name}</p><h2>${s.who}</h2>
    <dl><dt>The problem</dt><dd>${s.problem}</dd><dt>How they use it</dt><dd>${s.use}</dd><dt>The benefit</dt><dd>${s.benefit}</dd></dl>
    <div class="btns" style="margin-top:24px"><a class="btn primary" href="${h('/contact/')}">Discuss a pilot</a><a class="btn ghost" href="${h('/demo/shipments/' + s.demo.toLowerCase() + '/')}">See ${s.demo}</a></div></div>
  <div class="rv">${vizShipment(s.demo, { h })}</div>
</div></section>`).join('')}
${cta(h)}`
  },

  '/technology/': {
    title: 'Technology',
    description: `The planned ${site.name} architecture on AWS: AWS IoT Core, AWS Lambda, Amazon DynamoDB, Amazon S3, Amazon API Gateway and Amazon Bedrock.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)"><div style="max-width:860px">
  <span class="pill">Proposed architecture · not yet deployed</span><h1>The architecture we are building on AWS.</h1>
  <p class="lede">${N} is in development. This page describes our planned architecture. None of these services are running in production yet, and we will update this page as each component is deployed and tested.</p>
</div></div></section>
<section class="band soft"><div class="wrap"><div class="arch rv arch-wide">${archSvg()}</div><div class="arch rv arch-narrow">${archList()}</div></div></section>
<section class="band"><div class="wrap">
  ${head('Services', 'What each AWS service is for', '')}
  <div class="scroll rv"><table class="stack"><thead><tr><th scope="col">Service</th><th scope="col">Planned role</th><th scope="col">Status</th></tr></thead><tbody>
  ${AWS.map(([n, r]) => `<tr><th scope="row">${n}</th><td>${r}</td><td class="p">Proposed</td></tr>`).join('')}
  </tbody></table></div>
  <p class="note">Status key: <b>Deployed and tested</b> means running and verified. <b>Configured</b> means set up but not yet tested. <b>Proposed</b> means part of the design, not yet set up. All services are currently proposed.</p>
</div></section>
<section class="band ice"><div class="wrap">
  ${head('Design decisions', 'Choices that keep results explainable', '')}
  <div class="grid g2">
    <div class="card rv"><h3>Deterministic scoring</h3><p>Excursion classification and risk scores run as code in AWS Lambda, with fixed, versioned rules. The same readings always produce the same score.</p></div>
    <div class="card rv"><h3>Language model with a narrow job</h3><p>Amazon Bedrock is planned for summaries and explanations only. It receives calculated facts (times, durations, peaks, scores), not the authority to change them, and its drafts are reviewed by people.</p></div>
    <div class="card rv"><h3>Raw data kept as received</h3><p>Telemetry and logger files are planned to be stored unaltered in Amazon S3, separate from derived results, so any score can be recalculated and checked.</p></div>
    <div class="card rv"><h3>Event-driven processing</h3><p>Readings arriving through AWS IoT Core trigger processing as they land, so alerts reflect the latest data rather than a nightly batch.</p></div>
  </div>
</div></section>
<section class="band"><div class="wrap grid g2" style="align-items:center">
  <div class="rv"><h2>See the scoring logic working</h2><p class="lede">The demo runs the same scoring rules in your browser on fictional shipments. You can inject a reefer fault and watch the score change.</p></div>
  <div class="btns rv"><a class="btn primary" href="${h('/demo/')}">Open the live demo</a><a class="btn ghost" href="${h('/security/')}">Security overview</a></div>
</div></section>`
  },

  '/security/': {
    title: 'Security',
    description: `How ${site.name} approaches data handling, access roles, audit trails and AI constraints, and what is built today versus planned.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)"><div style="max-width:860px">
  <span class="pill">${esc(site.stage)}</span><h1>Safeguards, stated plainly.</h1>
  <p class="lede">Cold-chain records end up in claims, deviation reports and audits. We are designing ${N} so every number can be traced and every decision has an owner. This page also says what exists today and what does not.</p>
</div></div></section>
<section class="band"><div class="wrap">${head('Principles', 'Five rules the product is built around', '')}${safeguards(h, false)}</div></section>
<section class="band soft"><div class="wrap grid g2">
  <div class="rv"><h2>Data handling (planned)</h2>
  <ul class="does yes"><li>Encryption in transit (TLS) and at rest for stored telemetry and records</li><li>Raw readings stored unaltered, separately from calculated results</li><li>Customer data logically separated by account</li><li>Configurable retention, agreed with each customer</li><li>Customer data is not used to train third-party AI models</li></ul></div>
  <div class="rv"><h2>Access roles (planned)</h2>
  <div class="scroll"><table class="stack"><thead><tr><th scope="col">Role</th><th scope="col">Can</th></tr></thead><tbody>
  <tr><th scope="row">Administrator</th><td>Manage users, sites, product profiles and integrations</td></tr>
  <tr><th scope="row">QA reviewer</th><td>Review excursions, edit and approve incident summaries, release decisions</td></tr>
  <tr><th scope="row">Operations</th><td>View risk, approve or dismiss recommended actions</td></tr>
  <tr><th scope="row">Viewer</th><td>Read-only access to shipments and reports</td></tr></tbody></table></div></div>
</div></section>
<section class="band"><div class="wrap grid g2">
  <div class="rv"><h2>Audit trail</h2><p>Each shipment will keep a time-ordered ledger: readings received, events classified, alerts raised, scores recalculated, summaries drafted and edited, and recommendations approved or dismissed, each with the user and time. Entries are append-only.</p>
  <h2 style="margin-top:32px">How the AI is constrained</h2><ul class="does no"><li>No authority to set scores, classify excursions or change readings</li><li>No filling of data gaps or estimates of missing temperatures</li><li>No actions without a person’s approval</li><li>Prompts contain only that shipment’s calculated facts</li></ul></div>
  <div class="rv"><h2>What is and isn’t built yet</h2>
  <div class="scroll"><table class="stack"><thead><tr><th scope="col">Item</th><th scope="col">Status</th></tr></thead><tbody>
  <tr><th scope="row">Public website and browser demo on sample data</th><td class="y">Built</td></tr>
  <tr><th scope="row">Scoring and anomaly rules (demo version)</th><td class="y">Built, sample data only</td></tr>
  <tr><th scope="row">Production platform and customer accounts</th><td class="p">In development</td></tr>
  <tr><th scope="row">Device and telematics integrations</th><td class="p">In development</td></tr>
  <tr><th scope="row">Role-based access and audit trail</th><td class="p">In development</td></tr>
  <tr><th scope="row">Security certifications (e.g. SOC 2, ISO 27001)</th><td class="n">None held</td></tr>
  </tbody></table></div>
  <p class="small" style="margin-top:16px">The demo stores nothing on a server. Contact form submissions are handled as described in our <a href="${h('/privacy/')}">Privacy Policy</a>.</p></div>
</div></section>
<section class="band ice"><div class="wrap"><h2 class="rv">Reporting a security issue</h2><p class="lede rv">If you believe you have found a vulnerability on this website, please tell us through the <a href="${h('/contact/')}">contact form</a>${site.email ? ` or at <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}. We will acknowledge it and keep you informed.</p></div></section>`
  },

  '/pricing/': {
    title: 'Pricing',
    description: `${site.name} proposed pricing: a no-charge pilot, a Growth plan and Enterprise agreements. Pricing will be confirmed with pilot partners.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)"><div style="max-width:820px">
  <span class="pill">${esc(site.stage)}</span><h1>Pricing based on the shipments you monitor.</h1>
  <p class="lede">Start with a pilot on one lane. Plans scale with the number of monitored shipments, not with sensors or seats.</p></div></div></section>
<section class="band soft"><div class="wrap">${proposedNote()}${plansGrid(h)}</div></section>
<section class="band"><div class="wrap">${head('Compare', 'Plan comparison', pricingConfirmed ? '' : 'Proposed plan contents. Subject to change before general availability.')}
<div class="scroll rv"><table class="stack"><thead><tr><th scope="col">Feature</th>${PLANS.map((p) => `<th scope="col">${p.name}</th>`).join('')}</tr></thead><tbody>
${PLAN_ROWS.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((c) => `<td class="${c === '✓' ? 'y' : c === '—' ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('')}
</tbody></table></div>
<p class="note">A monitored shipment is one trip from origin to destination with at least one temperature source. Prices exclude any applicable taxes.</p></div></section>
<section class="band ice"><div class="wrap">${head('', 'Pricing questions', '')}
<div style="max-width:860px" class="rv">
<details><summary>Why is pricing proposed rather than fixed?</summary><p>${N} is in development. We will confirm pricing with pilot partners once we know which integrations and volumes matter most.</p></details>
<details><summary>What happens at the end of a pilot?</summary><p>We review results with you. Continuing on a paid plan is your choice, and nothing renews automatically.</p></details>
<details><summary>Do you charge for sensors?</summary><p>No. ${N} is software. It is designed to use the loggers and telematics you already have.</p></details>
</div></div></section>
${cta(h)}`
  },

  '/about/': {
    title: 'About',
    description: `About ${site.name}: a cold-chain risk intelligence company founded in ${site.founded}, building software that helps teams act on spoilage risk before product is lost.`,
    body: ({ h }) => {
      const facts = [['Company', site.legalName || site.name], ['Founded', site.founded], ['Industry', site.industry], ['Company type', 'Privately held'], ['Stage', site.stageShort + ' · accepting pilot partners'],
        site.country ? ['Registered in', site.country] : null, site.address ? ['Address', site.address] : null].filter(Boolean);
      const team = site.team.length ? `<section class="band soft" id="team"><div class="wrap">${head('Team', 'Leadership', '')}<div class="grid g2">${site.team.map((t) => `<div class="person card rv">${t.photo ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" width="96" height="96" loading="lazy">` : `<div class="ph" aria-hidden="true">${esc(t.name.split(' ').map((w) => w[0]).join('').slice(0, 2))}</div>`}<div><h3 style="margin-bottom:4px">${esc(t.name)}</h3><p class="small" style="margin:0 0 8px">${esc(t.title)}</p>${t.bio ? `<p>${esc(t.bio)}</p>` : ''}${t.linkedin ? `<a href="${esc(t.linkedin)}" rel="noopener">LinkedIn profile</a>` : ''}</div></div>`).join('')}</div></div></section>` : '';
      return `
<section class="hero"><div class="wrap" style="grid-template-columns:minmax(0,1fr)"><div style="max-width:860px">
  <span class="pill">Founded ${site.founded}</span><h1>We want cold-chain data to prevent losses, not just record them.</h1>
  <p class="lede">${esc(site.positioning)}</p></div></div></section>
<section class="band"><div class="wrap grid g2" style="align-items:start">
  <div class="rv"><h2>Why we started</h2>
  <p>Temperature-sensitive goods are monitored more closely than ever. Loggers ride with almost every pharmaceutical shipment and many food loads. Yet most of that data is read only after delivery, to settle what went wrong.</p>
  <p>Losses come from a small number of loads where a reefer unit is failing, product was loaded warm, or a delay pushes exposure past what the product can take. Those loads are hard to spot among hundreds of normal ones and hundreds of harmless door-open alerts.</p>
  <p>${N} exists to find them early, explain why they are at risk, and help the team decide what to do while there is still time.</p>
  <h2 style="margin-top:32px">Mission</h2><p class="lede">Reduce the amount of temperature-sensitive product lost in transit and storage by giving the people responsible for it an early, explained signal.</p>
  <h2 style="margin-top:32px">Where we are</h2><p>${N} is in development. We have built this website and a browser demo that runs our scoring approach on fictional data. We are now looking for pilot partners to test it on real lanes. We will only describe the product as available once real customers are using it.</p></div>
  <div class="card rv"><h3>Company facts</h3><table><tbody>${facts.map(([k, v]) => `<tr><th scope="row" style="width:40%;color:var(--muted);font-weight:600">${k}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
  <div class="btns" style="margin-top:20px"><a class="btn primary" href="${h('/contact/')}">Contact us</a>${site.linkedin ? `<a class="btn ghost" href="${esc(site.linkedin)}" rel="noopener">LinkedIn</a>` : ''}</div></div>
</div></section>
${team}
${cta(h, 'Help shape the first release', 'Pilot partners decide which product profiles, integrations and reports we build first.')}`;
    }
  },

  '/contact/': {
    title: 'Request early access',
    description: `Request early access to ${site.name} or apply for a pilot. Tell us about your cold-chain operation and we will reply personally.`,
    body: ({ h }) => `
<section class="hero"><div class="wrap" style="align-items:start">
  <div><span class="pill">${esc(site.stage)}</span><h1>Request early access</h1>
  <p class="lede">Tell us about your operation. We reply to every request personally and will be clear about what ${N} can and can’t do yet.</p>
  <h3 style="margin-top:32px">What happens next</h3>
  <ol class="steps" style="grid-template-columns:minmax(0,1fr)"><li style="padding:0 0 22px 60px"><h3>A short call</h3><p>We learn how you monitor temperature today and where losses happen.</p></li><li style="padding:0 0 22px 60px"><h3>Pilot scope</h3><p>If it’s a fit, we agree one site or lane, the data source and what success looks like.</p></li><li style="padding:0 0 0 60px"><h3>Weekly reviews</h3><p>We review scores, alerts and reports with your team and adjust them together.</p></li></ol>
  ${site.email ? `<p>Prefer email? <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>` : ''}</div>
  <div class="card">
  <form id="contact-form" novalidate>
    <div class="row"><div class="field"><label for="name">Full name</label><input id="name" name="name" autocomplete="name" required><span class="err" id="name-err" aria-live="polite"></span></div>
    <div class="field"><label for="email">Work email</label><input id="email" name="email" type="email" autocomplete="email" required><span class="err" id="email-err" aria-live="polite"></span></div></div>
    <div class="row"><div class="field"><label for="company">Company</label><input id="company" name="company" autocomplete="organization" required><span class="err" id="company-err" aria-live="polite"></span></div>
    <div class="field"><label for="role">Role</label><input id="role" name="role" autocomplete="organization-title"></div></div>
    <div class="row"><div class="field"><label for="segment">Your business</label><select id="segment" name="segment"><option value="">Select…</option>${SEGMENTS.map((s) => `<option>${s.name}</option>`).join('')}<option>Other</option></select></div>
    <div class="field"><label for="plan">Interested in</label><select id="plan" name="plan"><option value="">Not sure yet</option>${PLANS.map((p) => `<option value="${p.id}">${p.name}${pricingConfirmed ? '' : ' (proposed)'}</option>`).join('')}</select></div></div>
    <div class="field"><label for="volume">Temperature-controlled shipments per month</label><select id="volume" name="volume"><option value="">Select…</option><option>Fewer than 50</option><option>50–500</option><option>500–5,000</option><option>More than 5,000</option></select></div>
    <div class="field"><label for="message">How do you monitor temperature today, and where do losses happen?</label><textarea id="message" name="message"></textarea></div>
    <div class="hp" aria-hidden="true"><label for="website">Leave this field empty</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
    <div class="field"><label class="check"><input type="checkbox" id="consent" name="consent" value="yes" required> <span>I agree that ${N} may use these details to respond to my request, as described in the <a href="${h('/privacy/')}">Privacy Policy</a>.</span></label><span class="err" id="consent-err" aria-live="polite"></span></div>
    <button class="btn primary" type="submit" style="width:100%">Send request</button>
    <div id="form-msg" class="form-msg" role="status" tabindex="-1" hidden></div>
  </form></div>
</div></section>`
  }
};
