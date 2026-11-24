/* ThermoLedger browser demo — fictional sample data, deterministic rules, scripted text. */
{
  const T = window.TLDemo;
  const app = document.getElementById('demo');
  if (T && app) {
    const root = document.body.dataset.root || '/';
    const mode = document.body.dataset.mode;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const url = (id) => mode === 'dist' ? '/demo/shipments/' + id.toLowerCase() + '/' : root + 'demo/shipments/' + id.toLowerCase() + '/index.html';
    const state = {};
    const st = (id) => state[id] || (state[id] = { extra: [], decisions: {}, log: [], edit: null, tab: 'risk', asked: [] });
    let filter = 'all';
    let current = app.dataset.ship || null;

    const calc = (s) => {
      const x = st(s.id);
      const rd = T.readings(s, x.extra);
      return { rd, a: T.analyze(Object.assign({}, s, { events: s.events.concat(x.extra) }), rd) };
    };
    const nowLabel = (s) => T.clock(calc(s).a.lastT);
    const log = (s, text, who) => st(s.id).log.unshift({ t: nowLabel(s), text, who: who || 'Demo user' });

    function kpis() {
      const all = T.SHIPMENTS.map((s) => ({ s, a: calc(s).a }));
      const n = (b) => all.filter((x) => x.a.band === b).length;
      const exc = all.reduce((k, x) => k + x.a.sustained.length, 0);
      document.getElementById('kpis').innerHTML = [['Shipments in transit', all.length], ['High risk', n('High')], ['Watch', n('Watch')], ['Sustained excursions', exc]]
        .map(([l, v]) => `<div><span>${l}</span><strong>${v}</strong></div>`).join('');
    }

    function list() {
      const items = T.SHIPMENTS.map((s) => ({ s, a: calc(s).a })).sort((x, y) => y.a.score - x.a.score).filter((x) => filter === 'all' || x.a.band === filter);
      document.getElementById('ship-list').innerHTML = items.length ? items.map(({ s, a }) => `<li><a href="${url(s.id)}" data-id="${s.id}" aria-current="${s.id === current}">
        <b>${s.id}</b><span>${esc(T.PRODUCTS[s.product].name)}</span><span>${esc(s.origin)} → ${esc(s.dest)}</span>
        <div class="sc score ${a.band}"><strong>${a.score}</strong><span class="tag ${a.band}">${a.band}</span></div></a></li>`).join('')
        : '<li class="panel-body small">No shipments in this band.</li>';
    }

    let ro = null;
    function detail() {
      const s = T.SHIPMENTS.find((x) => x.id === current);
      const box = document.getElementById('detail');
      if (ro) { ro.disconnect(); ro = null; }
      if (!s) { box.innerHTML = '<div class="panel-body">Select a shipment.</div>'; return; }
      const x = st(s.id);
      const { rd, a } = calc(s);
      const p = a.product;
      const outMin = a.segs.reduce((n, g) => n + g.minutes, 0);
      const tabs = [['risk', 'Risk score'], ['events', 'Anomalies'], ['report', 'Incident summary'], ['actions', 'Recommendations'], ['ask', 'Ask'], ['ledger', 'Ledger']];
      box.innerHTML = `
      <div class="panel-top"><b class="mono">${s.id}</b><span class="tag ${a.band}">${a.band} risk</span><span class="tag demo">Demo · Sample data</span></div>
      <div class="panel-body" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end">
        <div><div style="font-weight:650;font-size:18px">${esc(p.name)}</div><div class="small">${esc(s.origin)} → ${esc(s.dest)} · ${esc(s.unit)} · ${s.ambient} ambient</div></div>
        <div class="score ${a.band}"><strong>${a.score}</strong><span class="small">/ 100</span></div>
      </div>
      <div class="fig" id="fig" style="min-height:240px;margin:0 10px"></div>
      <div class="readout"><div><span>Now (${T.clock(a.lastT)})</span><strong>${a.last.toFixed(1)} °C</strong></div><div><span>Peak</span><strong>${a.peak.toFixed(1)} °C</strong></div><div><span>Out of range</span><strong>${outMin} min</strong></div><div><span>Remaining</span><strong>${a.remaining.toFixed(1)} h</strong></div></div>
      <div class="panel-body" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;border-top:1px solid var(--line)">
        <button class="btn ghost sm" id="sim"${x.extra.length ? ' disabled' : ''}>Simulate a 40-minute reefer fault now</button>
        <button class="btn ghost sm" id="reset"${x.extra.length || x.log.length ? '' : ' disabled'}>Reset this shipment</button>
        <span class="small">${x.extra.length ? 'Simulated fault added to the sample readings.' : 'Inject a fault to watch the score and recommendations update.'}</span>
      </div>
      <div class="tabs" role="tablist" aria-label="Shipment views">${tabs.map(([k, l]) => `<button role="tab" id="tab-${k}" aria-controls="pane" aria-selected="${x.tab === k}" tabindex="${x.tab === k ? 0 : -1}" data-tab="${k}">${l}</button>`).join('')}</div>
      <div class="panel-body" id="pane" role="tabpanel" aria-labelledby="tab-${x.tab}">${pane(s, a, x)}</div>`;

      const fig = document.getElementById('fig');
      const draw = () => { const W = Math.max(300, fig.clientWidth), H = fig.clientHeight || 240; fig.innerHTML = T.chart(rd, p, W, H, { segs: a.segs, compact: W < 520 }); };
      ro = new ResizeObserver(draw); ro.observe(fig);
      bind(s, a, x);
    }

    function pane(s, a, x) {
      if (x.tab === 'risk') {
        const max = { exposure: 40, sustained: 24, trend: 18, route: 12, lane: 9 };
        return `<table class="factors"><tbody>${a.factors.map((f) => `<tr><td><b>${f.label}</b><div class="small">${esc(f.detail)}</div><div class="bar"><i style="width:${Math.round(f.pts / max[f.key] * 100)}%"></i></div></td><td class="num" style="padding-left:16px">${f.pts} pts</td></tr>`).join('')}
          <tr><td>Product sensitivity (${'●'.repeat(p(s).sens)}${'○'.repeat(3 - p(s).sens)})</td><td class="num">×${a.mult.toFixed(2)}</td></tr><tr><td><b>Risk score</b> · Low &lt; 35 ≤ Watch &lt; 65 ≤ High</td><td class="num"><b>${a.score}</b></td></tr></tbody></table>
          ${a.mkt !== null ? `<p class="small" style="margin-top:14px">Mean kinetic temperature: <b class="mono">${a.mkt.toFixed(2)} °C</b> across ${a.count} readings.</p>` : ''}
          <p class="label-line">Calculated in your browser by the demo’s scoring rules from sample readings.</p>`;
      }
      if (x.tab === 'events') {
        return a.segs.length ? `<p class="small">Tolerance: up to ${p(s).tol} min and ${p(s).spike} °C beyond the ${p(s).min} to ${p(s).max} °C range is treated as transient.</p><ul class="events" style="margin:0 -18px">${a.segs.map((g) => `<li><time>${T.clock(g.start)}</time><span><b>${g.kind === 'sustained' ? 'Sustained excursion' : 'Transient spike'}</b> · ${g.minutes} min · peak ${g.peak.toFixed(1)} °C · ${Math.round(g.dm)} degree-min<br><span class="small">${esc(g.note)}</span></span><span class="tag ${g.kind === 'sustained' ? 'hot' : 'warm'}">${g.kind === 'sustained' ? 'Scored' : 'Not scored'}</span></li>`).join('')}</ul>${a.trend ? `<p style="margin-top:14px"><span class="tag Watch">Trend</span> Rising ${a.trend.slope.toFixed(2)} °C/h over the last 2 h${a.trend.beforeArrival ? `, projected to leave range in ${a.trend.breachIn.toFixed(1)} h, before arrival` : ''}.</p>` : ''}`
          : `<p>No out-of-range readings.${a.trend ? ` <span class="tag Watch">Trend</span> Rising ${a.trend.slope.toFixed(2)} °C/h, projected to leave range in ${a.trend.breachIn.toFixed(1)} h${a.trend.beforeArrival ? ', before arrival' : ''}.` : ''}</p>`;
      }
      if (x.tab === 'report') {
        const r = T.report(s, a);
        const sum = x.edit !== null ? x.edit : r.sections[0].t;
        return `<div class="report"><div class="small mono">${esc(r.head)}</div>
          <h4><label for="sum">Summary</label> ${x.edit !== null ? '<span class="tag ok">Edited by reviewer</span>' : '<span class="tag road">Draft</span>'}</h4>
          <textarea id="sum" rows="5" style="font-size:15px">${esc(sum)}</textarea>
          <div class="btns" style="margin-top:10px"><button class="btn primary sm" id="save">Save edit</button>${x.edit !== null ? '<button class="btn ghost sm" id="revert">Revert to draft</button>' : ''}</div>
          ${r.sections.slice(1).map((sec) => `<h4>${sec.h}</h4>${sec.t ? `<p>${esc(sec.t)}</p>` : `<ul>${sec.list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`}`).join('')}
          <p class="label-line">Sample output. Generated by demo rules from sample readings, not live AI. In the product, Amazon Bedrock is planned to draft this text from the same calculated facts, for a person to review.</p></div>`;
      }
      if (x.tab === 'actions') {
        return T.recommend(s, a).map((r) => {
          const d = x.decisions[r.id];
          return `<div class="rec"><div><b>${esc(r.title)}</b><p>${esc(r.why)}</p></div><div class="acts">${d ? `<span class="tag ${d === 'Approved' ? 'ok' : 'road'}">${d}</span><button class="btn ghost sm" data-undo="${r.id}">Undo</button>` : (r.id === 'none' ? '' : `<button class="btn primary sm" data-ok="${r.id}">Approve</button><button class="btn ghost sm" data-no="${r.id}">Dismiss</button>`)}</div></div>`;
        }).join('') + '<p class="label-line">Approving in the demo only records the decision in this page’s ledger. Nothing is sent anywhere.</p>';
      }
      if (x.tab === 'ask') {
        const qa = T.answers(s, a);
        return `<div class="qs">${qa.map((q, i) => `<button data-q="${i}">${esc(q.q)}</button>`).join('')}</div>
          <div class="chat">${x.asked.map((i) => `<div class="msg q">${esc(qa[i].q)}</div><div class="msg a"><small>ThermoLedger · scripted sample</small>${esc(qa[i].a)}</div>`).join('') || '<p class="small">Pick a question above.</p>'}</div>
          <p class="label-line">Answers are scripted from this shipment’s calculated results. They are not live AI output.</p>`;
      }
      const base = [{ t: T.clock(0), text: 'Shipment created with profile ' + p(s).name, who: 'System' }];
      a.segs.forEach((g) => base.push({ t: T.clock(g.start), text: (g.kind === 'sustained' ? 'Sustained excursion detected · alert raised' : 'Transient spike logged · not scored'), who: 'System' }));
      const all = x.log.concat(base.reverse());
      return `<ul class="audit">${all.map((e) => `<li><time>${esc(e.t)}</time><span>${esc(e.text)}<br><span class="small">${esc(e.who)}</span></span></li>`).join('')}</ul><p class="label-line">Ledger for this demo session only. It resets when you leave the page.</p>`;
    }
    const p = (s) => T.PRODUCTS[s.product];

    function bind(s, a, x) {
      const box = document.getElementById('detail');
      box.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { x.tab = b.dataset.tab; detail(); document.getElementById('tab-' + x.tab).focus(); }));
      box.querySelector('.tabs').addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const ks = [...box.querySelectorAll('[data-tab]')].map((b) => b.dataset.tab);
        const i = (ks.indexOf(x.tab) + (e.key === 'ArrowRight' ? 1 : -1) + ks.length) % ks.length;
        x.tab = ks[i]; detail(); document.getElementById('tab-' + x.tab).focus();
      });
      box.querySelector('#sim').addEventListener('click', () => {
        const at = a.lastT / 60;
        x.extra = [{ type: 'fault', at, dur: 40, d: Math.max(3, (p(s).max - p(s).target) + 2.5), note: 'Simulated reefer fault' }];
        log(s, 'Simulated 40-minute reefer fault injected', 'Demo user');
        refresh();
      });
      box.querySelector('#reset').addEventListener('click', () => {
        delete state[s.id]; refresh();
      });
      box.querySelectorAll('[data-ok],[data-no]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.ok || b.dataset.no, v = b.dataset.ok ? 'Approved' : 'Dismissed';
        x.decisions[id] = v;
        log(s, v + ': ' + T.recommend(s, a).find((r) => r.id === id).title, 'Demo user · Operations');
        detail();
      }));
      box.querySelectorAll('[data-undo]').forEach((b) => b.addEventListener('click', () => { delete x.decisions[b.dataset.undo]; log(s, 'Decision undone', 'Demo user · Operations'); detail(); }));
      box.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.q; x.asked = x.asked.filter((k) => k !== i).concat(i); detail(); }));
      const save = box.querySelector('#save');
      if (save) save.addEventListener('click', () => { x.edit = box.querySelector('#sum').value; log(s, 'Incident summary edited and saved', 'Demo user · QA'); detail(); });
      const rv = box.querySelector('#revert');
      if (rv) rv.addEventListener('click', () => { x.edit = null; log(s, 'Incident summary reverted to draft', 'Demo user · QA'); detail(); });
    }

    function refresh() { kpis(); list(); detail(); }

    function select(id, push) {
      current = id;
      if (push && mode === 'dist') history.pushState({ id }, '', url(id));
      document.title = id + ' · Demo · ThermoLedger';
      list(); detail();
    }

    document.getElementById('ship-list').addEventListener('click', (e) => {
      const l = e.target.closest('a[data-id]');
      if (!l || e.metaKey || e.ctrlKey) return;
      e.preventDefault(); select(l.dataset.id, true);
      if (innerWidth < 1000) document.getElementById('detail').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    document.querySelectorAll('.filters [data-f]').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.f;
      document.querySelectorAll('.filters [data-f]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      list();
    }));
    addEventListener('popstate', (e) => { if (e.state && e.state.id) select(e.state.id, false); });

    if (!current) current = T.SHIPMENTS.map((s) => ({ s, a: calc(s).a })).sort((x, y) => y.a.score - x.a.score)[0].s.id;
    if (mode === 'dist') history.replaceState({ id: current }, '');
    refresh();
  }
}
