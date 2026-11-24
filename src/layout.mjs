import { site } from './config.mjs';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const origin = () => (site.domain ? `https://www.${site.domain}` : '');

// Link helper. mode 'dist' = clean absolute URLs (/product/); mode 'preview' = relative file links (../product/index.html).
export function linker(mode, pagePath) {
  const depth = pagePath === '/' || pagePath === '/404' ? 0 : pagePath.split('/').filter(Boolean).length;
  const root = mode === 'dist' ? '/' : depth ? '../'.repeat(depth) : './';
  const h = (p) => {
    const [path, hash] = p.split('#');
    let out;
    if (mode === 'dist') out = path;
    else out = root + (path === '/' ? '' : path.replace(/^\//, '')) + 'index.html';
    return hash ? `${out}#${hash}` : out;
  };
  const a = (p) => root + p; // asset path
  return { h, a, root };
}

export const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="8" fill="var(--teal)"/><path d="M11 7.5a3 3 0 0 1 6 0v10.2a5.2 5.2 0 1 1-6 0Z" fill="none" stroke="var(--teal-ink)" stroke-width="2"/><circle cx="14" cy="22" r="2.4" fill="#ff6b50"/><path d="M14 20V12" stroke="#ff6b50" stroke-width="2" stroke-linecap="round"/><path d="M20.5 11h5M20.5 15.5h5M20.5 20h3.5" stroke="var(--teal-ink)" stroke-width="2" stroke-linecap="round"/></svg>`;

const NAV = [
  ['/product/', 'Product'],
  ['/how-it-works/', 'How it works'],
  ['/solutions/', 'Solutions'],
  ['/technology/', 'Technology'],
  ['/security/', 'Security'],
  ['/pricing/', 'Pricing'],
  ['/about/', 'About']
];

export function page({ mode, path, title, description, body, scripts = [], noindex = false, demo = false }) {
  const { h, a } = linker(mode, path);
  const o = origin();
  const canonical = o && path !== '/404' ? o + path : '';
  const fullTitle = path === '/' ? `${site.name} — Cold-chain spoilage risk intelligence` : `${title} · ${site.name}`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      Object.assign({ '@type': 'Organization', name: site.name, description: site.description, foundingDate: String(site.founded), slogan: site.tagline },
        o ? { url: o, logo: o + '/assets/logo.svg' } : {},
        site.legalName ? { legalName: site.legalName } : {},
        site.email ? { email: site.email } : {},
        site.linkedin ? { sameAs: [site.linkedin] } : {},
        site.address ? { address: site.address } : {},
        site.team.length ? { founder: site.team.map((t) => ({ '@type': 'Person', name: t.name, jobTitle: t.title })) } : {}),
      Object.assign({ '@type': 'SoftwareApplication', name: site.name, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: site.description, creativeWorkStatus: 'In development' }, o ? { url: o } : {})
    ]
  };
  const nav = NAV.map(([p, l]) => `<a href="${h(p)}"${path === p ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
${o ? `<meta property="og:image" content="${o}/assets/og.svg">` : ''}
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#06343d">
<link rel="icon" href="${a('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap">
<link rel="stylesheet" href="${a('assets/site.css')}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body data-root="${a('')}" data-mode="${mode}">
<a class="skip" href="#main">Skip to content</a>
${demo ? '<div class="demo-bar" role="note">Demo · Sample data — fictional shipments, readings and outputs. Not the launched product.</div>' : ''}
<header class="hdr">
  <div class="wrap">
    <a class="brand" href="${h('/')}" aria-label="${esc(site.name)} home">${LOGO}<span>${esc(site.name)}</span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <nav class="nav" id="nav" aria-label="Main">
      ${nav}
      <a class="demo-link" href="${h('/demo/')}"${path.startsWith('/demo') ? ' aria-current="page"' : ''}>Live demo</a>
      <a class="btn primary sm" href="${h('/contact/')}">Request early access</a>
    </nav>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="ftr">
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="brand" href="${h('/')}">${LOGO}<span>${esc(site.name)}</span></a>
        <p style="margin-top:16px;max-width:36ch">${esc(site.tagline)} Cold-chain spoilage risk intelligence, in development and accepting pilot partners.</p>
        ${site.email ? `<p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>` : ''}
        ${site.address ? `<p>${esc(site.address)}</p>` : ''}
      </div>
      <div><h4>Product</h4><ul>
        <li><a href="${h('/product/')}">Platform overview</a></li>
        <li><a href="${h('/how-it-works/')}">How it works</a></li>
        <li><a href="${h('/demo/')}">Live demo</a></li>
        <li><a href="${h('/pricing/')}">Pricing</a></li>
      </ul></div>
      <div><h4>Solutions</h4><ul>
        <li><a href="${h('/solutions/#pharma')}">Pharmaceutical distribution</a></li>
        <li><a href="${h('/solutions/#food')}">Food, seafood and produce</a></li>
        <li><a href="${h('/solutions/#storage')}">Cold storage and grocery</a></li>
        <li><a href="${h('/solutions/#carriers')}">Refrigerated carriers</a></li>
      </ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="${h('/about/')}">About</a></li>
        <li><a href="${h('/technology/')}">Technology</a></li>
        <li><a href="${h('/security/')}">Security</a></li>
        <li><a href="${h('/contact/')}">Contact</a></li>
        ${site.linkedin ? `<li><a href="${esc(site.linkedin)}" rel="noopener">LinkedIn</a></li>` : ''}
      </ul></div>
    </div>
    <div class="legal">
      <span>© ${site.founded} ${esc(site.legalName || site.name)}${site.country ? ` · Registered in ${esc(site.country)}` : ''}</span>
      <a href="${h('/privacy/')}">Privacy Policy</a>
      <a href="${h('/terms/')}">Terms of Service</a>
    </div>
  </div>
</footer>
<script>window.TL_CONFIG=${JSON.stringify({ formEndpoint: site.formEndpoint, email: site.email, mode })};</script>
<script src="${a('assets/site.js')}" defer></script>
${scripts.map((s) => `<script src="${a(s)}" defer></script>`).join('\n')}
</body>
</html>`;
}
