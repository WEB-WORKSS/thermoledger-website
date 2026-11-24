import { site } from './config.mjs';
import { esc } from './layout.mjs';
import { D } from './content.mjs';

const N = esc(site.name);
const who = esc(site.legalName || site.name);
const UPDATED = '25 November 2026';
const contactLine = (h) => `through our <a href="${h('/contact/')}">contact form</a>${site.email ? ` or by email at <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}`;

export const legal = {
  '/privacy/': {
    title: 'Privacy Policy',
    description: `How ${site.name} collects, uses and protects personal information submitted through this website.`,
    body: ({ h }) => `<section class="band"><div class="wrap prose">
<h1>Privacy Policy</h1><p class="small">Last updated ${UPDATED}</p>
<p>This policy explains how ${who} (“${N}”, “we”, “us”)${site.country ? `, a company registered in ${esc(site.country)},` : ''} handles personal information collected through this website. ${N} is in development; this policy covers the website and the demo only, not a production service.</p>
<h2>What we collect</h2>
<ul><li><b>Contact and early-access requests.</b> When you use the contact form we collect your name, work email, company, role, business type, plan interest, shipment volume and your message.</li>
<li><b>Technical data.</b> Our hosting provider records standard server logs (IP address, browser type, pages requested, time) to operate and secure the site.</li>
<li><b>The demo.</b> The demo runs entirely in your browser on fictional sample data. Actions you take in it are not sent to us or stored on a server.</li></ul>
<p>We do not use advertising or analytics cookies on this website.</p>
<h2>How we use it</h2>
<ul><li>To reply to your request and discuss a possible pilot (on the basis of your request and our legitimate interest in responding).</li>
<li>To keep the website secure and working.</li>
<li>We do not sell personal information, and we do not use it to train AI models.</li></ul>
<h2>Who we share it with</h2>
<p>Only with service providers that help us run the website and handle email, under contracts that require them to protect it. The site loads fonts from Google Fonts, which receives your IP address when fonts are requested. We may disclose information if required by law.</p>
<h2>How long we keep it</h2>
<p>We keep contact requests for up to 24 months after our last communication, unless you ask us to delete them sooner. Server logs are kept for a limited period for security.</p>
<h2>Your rights</h2>
<p>Depending on where you live, you may have the right to access, correct, delete or restrict use of your personal information, to object to processing, and to complain to your data protection authority. To make a request, contact us ${contactLine(h)}.</p>
<h2>Security</h2><p>We use reasonable technical and organisational measures to protect information, including encrypted connections (HTTPS). No method of transmission or storage is completely secure.</p>
<h2>International transfers</h2><p>Our service providers may process information in other countries. Where required, we rely on appropriate safeguards for such transfers.</p>
<h2>Changes</h2><p>We will update this page if our practices change, and revise the date above.</p>
<h2>Contact</h2><p>Questions about this policy can be sent ${contactLine(h)}.${site.address ? ` Postal address: ${esc(site.address)}.` : ''}</p>
</div></section>`
  },
  '/terms/': {
    title: 'Terms of Service',
    description: `Terms for using the ${site.name} website and browser demo.`,
    body: ({ h }) => `<section class="band"><div class="wrap prose">
<h1>Terms of Service</h1><p class="small">Last updated ${UPDATED}</p>
<p>These terms apply to your use of this website and the browser demo operated by ${who} (“${N}”, “we”, “us”). By using the site you agree to them. Use of a future ${N} service will be governed by a separate agreement.</p>
<h2>Product status</h2><p>${N} is in development. Descriptions of features, architecture and pricing on this site describe our plans and may change. Pricing shown is proposed and is not an offer.</p>
<h2>The demo</h2><p>The demo uses fictional sample data. Its scores, classifications, summaries and recommendations are illustrations only. They must not be used to make decisions about real products, shipments or patient safety.</p>
<h2>Acceptable use</h2><ul><li>Do not attempt to disrupt, overload or gain unauthorised access to the site.</li><li>Do not submit unlawful, misleading or harmful content through the contact form.</li><li>Do not copy or reuse the site’s content or code except as the law allows.</li></ul>
<h2>Intellectual property</h2><p>The site, its design, text, graphics and the ${N} name and logo belong to ${who}. Nothing here grants you a licence to use them except to view the site.</p>
<h2>Third-party links</h2><p>Links to other websites, including industry statistics sources, are provided for reference. We are not responsible for their content.</p>
<h2>No warranty</h2><p>The site and demo are provided “as is”, without warranties of any kind, to the extent permitted by law.</p>
<h2>Limitation of liability</h2><p>To the extent permitted by law, ${N} is not liable for any indirect or consequential loss arising from use of this website or the demo. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>Governing law</h2><p>${site.country ? `These terms are governed by the laws of ${esc(site.country)}.` : `These terms are governed by the laws of the country in which ${who} is registered.`}</p>
<h2>Changes and contact</h2><p>We may update these terms and will revise the date above. Questions can be sent ${contactLine(h)}.</p>
</div></section>`
  }
};

export const notFound = {
  title: 'Page not found',
  description: `This page does not exist on the ${site.name} website.`,
  body: ({ h }) => `<section class="band"><div class="wrap e404"><div>
<div class="code">404</div><h1 style="margin-top:12px">This page is out of range.</h1>
<p class="lede" style="margin:0 auto 28px">The page you’re looking for doesn’t exist or has moved.</p>
<div class="btns" style="justify-content:center"><a class="btn primary" href="${h('/')}">Back to home</a><a class="btn ghost" href="${h('/demo/')}">Open the demo</a></div></div></div></section>`
};

export const demoPage = (id) => {
  const s = id ? D.SHIPMENTS.find((x) => x.id === id) : null;
  return {
    title: s ? `${s.id} · Demo` : 'Live demo',
    description: s ? `Demo shipment ${s.id} (${D.PRODUCTS[s.product].name}) on fictional sample data: risk score, anomalies, incident summary and recommendations.`
      : `Try ${site.name} in your browser on fictional sample shipments: risk scores, anomaly detection, incident summaries and recommendations.`,
    demo: true,
    scripts: ['assets/demo-core.js', 'assets/demo.js'],
    body: () => `<section class="band tight soft"><div class="wrap">
  <div style="display:flex;flex-wrap:wrap;gap:12px 24px;align-items:end;justify-content:space-between;margin-bottom:22px">
    <div><p class="kicker">Live demo · runs in your browser</p><h1 style="font-size:clamp(28px,3.6vw,40px);margin:0">Cold-chain risk board</h1></div>
    <p class="small" style="margin:0;max-width:52ch">Six fictional shipments with sample readings. Scores and classifications are calculated in your browser by the demo rules. Summaries and answers are scripted from those results, not live AI.</p>
  </div>
  <div class="kpis" id="kpis" aria-live="polite"></div>
  <div class="demo-shell" id="demo" data-ship="${s ? s.id : ''}">
    <div class="panel"><div class="panel-top"><b>Shipments</b><span class="tag demo">Demo · Sample data</span></div>
      <div class="filters" role="group" aria-label="Filter by risk"><button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="High">High</button><button aria-pressed="false" data-f="Watch">Watch</button><button aria-pressed="false" data-f="Low">Low</button></div>
      <ul class="ship-list" id="ship-list"></ul></div>
    <div id="detail" class="panel" aria-live="polite"><noscript><div class="panel-body">The demo needs JavaScript.</div></noscript></div>
  </div>
</div></section>`
  };
};
