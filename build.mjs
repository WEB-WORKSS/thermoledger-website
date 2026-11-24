// Build: node build.mjs  →  dist/ (deployable, clean URLs) and preview/ (relative links, opens from disk)
import { mkdirSync, writeFileSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './src/config.mjs';
import { page, LOGO, origin } from './src/layout.mjs';
import { pages } from './src/pages.mjs';
import { legal, notFound, demoPage } from './src/other.mjs';
import { D } from './src/content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROUTES = { ...pages, ...legal, '/demo/': demoPage(null) };
D.SHIPMENTS.forEach((s) => { ROUTES[`/demo/shipments/${s.id.toLowerCase()}/`] = demoPage(s.id); });

const warn = [];
if (!site.domain) warn.push('domain is empty: canonical URLs, og:url and sitemap.xml are omitted');
if (!site.email) warn.push('email is empty: no email address is shown');
if (site.domain && site.email && !site.email.endsWith('@' + site.domain)) warn.push(`email ${site.email} is not on ${site.domain}`);
if (!site.formEndpoint) warn.push('formEndpoint is empty: the contact form cannot submit');
if (!site.team.length) warn.push('team is empty: the leadership section is omitted from /about');
if (!site.legalName) warn.push('legalName is empty: legal pages name only the trading name');

const favicon = LOGO.replace('aria-hidden="true" focusable="false"', 'xmlns="http://www.w3.org/2000/svg"').replace(/var\(--teal\)/g, '#0a5563').replace(/var\(--teal-ink\)/g, '#ffffff');
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#06343d"/><g transform="translate(90 90) scale(4)">${favicon.replace(/<\/?svg[^>]*>/g, '')}</g><text x="90" y="380" font-family="Arial,sans-serif" font-size="84" font-weight="700" fill="#fff">${site.name}</text><text x="90" y="460" font-family="Arial,sans-serif" font-size="40" fill="#a9cdd2">${site.tagline}</text></svg>`;

function build(mode) {
  const out = join(here, mode);
  rmSync(out, { recursive: true, force: true });
  const write = (rel, content) => { const f = join(out, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, content); };

  for (const [path, def] of Object.entries(ROUTES)) {
    const html = page({ mode, path, title: def.title, description: def.description, demo: def.demo, scripts: def.scripts, body: def.body(linkFor(mode, path)) });
    write(path === '/' ? 'index.html' : path.slice(1) + 'index.html', html);
  }
  write('404.html', page({ mode, path: '/404', title: notFound.title, description: notFound.description, noindex: true, body: notFound.body(linkFor(mode, '/404')) }));
  if (mode === 'preview') write('404/index.html', page({ mode, path: '/404/', title: notFound.title, description: notFound.description, noindex: true, body: notFound.body(linkFor(mode, '/404/')) }));

  for (const f of readdirSync(join(here, 'src/assets'))) { mkdirSync(join(out, 'assets'), { recursive: true }); copyFileSync(join(here, 'src/assets', f), join(out, 'assets', f)); }
  write('assets/favicon.svg', favicon);
  write('assets/logo.svg', favicon);
  write('assets/og.svg', og);

  const o = origin();
  write('robots.txt', `User-agent: *\nAllow: /\n${o ? `Sitemap: ${o}/sitemap.xml\n` : ''}`);
  if (o) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(ROUTES).map((p) => `  <url><loc>${o}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
  return Object.keys(ROUTES).length + 1;
}

import { linker } from './src/layout.mjs';
const linkFor = (mode, path) => linker(mode, path);

const n1 = build('dist');
build('preview');
console.log(`Built ${n1} pages into dist/ and preview/.`);
if (warn.length) console.log('\nBefore publishing:\n- ' + warn.join('\n- '));
