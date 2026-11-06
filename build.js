#!/usr/bin/env node
/**
 * Buddy Baths static site generator, zero dependencies (cloned from buddyfence/buddytile).
 * `node build.js` writes the whole site (HTML, sitemap, robots, assets) to site/.
 */
const fs = require('fs');
const path = require('path');
const { SITE, SERVICES, PATHS, HOME_PATH, CITIES, NEARBY_TOWNS, STEPS, TRUST, PROMISE, TESTIMONIALS, DESIGN, BALLPARK, DESIGNER } = require('./src/data');
// Real jobs from two sources: the platform's portfolio feed (refresh with
// `node scripts/fetch-projects.js`) plus the hand-curated galleries in
// projects-manual.json. Platform jobs list first, they're local and dated.
let PROJECTS = [];
try {
  PROJECTS = require('./src/projects.json');
} catch {
  /* no projects fetched yet */
}
try {
  PROJECTS = [...PROJECTS, ...require('./src/projects-manual.json')];
} catch {
  /* no manual galleries */
}
// Blog posts, written in the platform: refresh with `node scripts/fetch-posts.js`
let POSTS = [];
try {
  POSTS = require('./src/posts.json');
} catch {
  /* no posts yet, blog pages simply don't render */
}
// Tiny markdown renderer, enough for posts: ## headings, **bold**, *em*,
// [links](url), - lists, paragraphs. No dependencies, like everything here.
const mdInline = (t) =>
  esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, b) => `<a href="${b.startsWith('http') || b.startsWith('/') ? b : '#'}">${a}</a>`);
const mdToHtml = (md) => {
  const out = [];
  let list = null;
  for (const raw of String(md || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (list && !line.startsWith('- ')) {
      out.push(`<ul>${list.join('')}</ul>`);
      list = null;
    }
    if (!line) continue;
    if (line.startsWith('### ')) out.push(`<h3>${mdInline(line.slice(4)).toUpperCase()}</h3>`);
    else if (line.startsWith('## ')) out.push(`<h2>${mdInline(line.slice(3)).toUpperCase()}</h2>`);
    else if (line.startsWith('- ')) (list = list || []).push(`<li>${mdInline(line.slice(2))}</li>`);
    else out.push(`<p>${mdInline(line)}</p>`);
  }
  if (list) out.push(`<ul>${list.join('')}</ul>`);
  return out.join('\n');
};
const postDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Real Google reviews: refresh with `node scripts/fetch-reviews.js` (needs
// GOOGLE_MAPS_API_KEY). Until real ones exist, the curated cards render.
let GOOGLE_REVIEWS = null;
try {
  const gr = require('./src/reviews.json');
  if (gr.reviews?.length) GOOGLE_REVIEWS = gr;
} catch {
  /* not fetched yet */
}
const monthYear = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// Manual galleries may carry no city or date, say only what we know.
const projectByline = (pr) =>
  [pr.city ? `Shower remodel in ${pr.city}, ${pr.state}` : 'Showers and bath conversions', pr.completed ? `Completed ${monthYear(pr.completed)}` : null, `Built by ${pr.brand || SITE.name}`]
    .filter(Boolean)
    .join(' · ');
const projectCard = (pr) => {
  const cover = pr.photos.find((x) => x.phase === 'after') || pr.photos[0];
  const sub = [pr.city ? `${pr.city}, ${pr.state}` : `${pr.photos.length} photos`, pr.completed ? monthYear(pr.completed) : null].filter(Boolean).join(' · ');
  return `<a class="card" href="/projects/${pr.slug}/"><img src="/assets/img/projects/${cover.file}" alt="${esc(pr.title)}${pr.city ? `, ${esc(pr.city)}, ${esc(pr.state)}` : ''}" loading="lazy" /><div class="body"><h3>${esc((pr.title || '').toUpperCase())}</h3><p>${esc(sub)}</p><div class="go">See this project →</div></div></a>`;
};

const OUT = path.join(__dirname, 'docs');
const V = Date.now().toString(36); // cache-buster for css/js
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- Icon set: one stroke style everywhere (Lucide-style paths) -----------
const ICON_PATHS = {
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  hammer: '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  chev: '<polyline points="6 9 12 15 18 9"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  fence: '<path d="M4 21V8l2-3 2 3v13"/><path d="M10 21V8l2-3 2 3v13"/><path d="M16 21V8l2-3 2 3v13"/><path d="M2 12h20"/><path d="M2 17h20"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  rows: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561z"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  tree: '<path d="M12 2 4 12h4l-3 5h5v5h4v-5h5l-3-5h4z"/>',
  shower: '<path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="M14 17v.01"/><path d="M10 16v.01"/><path d="M13 13v.01"/><path d="M16 10v.01"/><path d="M11 20v.01"/><path d="M17 14v.01"/><path d="M20 11v.01"/>',
  bath: '<path d="M10 4 8 6"/><path d="M17 19v2"/><path d="M2 12h20"/><path d="M7 19v2"/><path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v7"/><path d="M5 12h14a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2"/>',
  glass: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M8 10v4"/><path d="M16 10v4"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/>',
  sparkles: '<path d="M9.94 14.34 12 20l2.06-5.66L20 12l-5.94-2.34L12 4l-2.06 5.66L4 12z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  ruler: '<path d="M21.3 8.7 8.7 21.3a2.4 2.4 0 0 1-3.4 0L2.7 18.7a2.4 2.4 0 0 1 0-3.4L15.3 2.7a2.4 2.4 0 0 1 3.4 0l2.6 2.6a2.4 2.4 0 0 1 0 3.4z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
};
const ico = (name, size = 24) =>
  `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
const iconCircle = (name) => `<span class="ic">${ico(name, 26)}</span>`;
const PROJECT_OPTIONS = ['One-day shower replacement', 'Tub-to-shower conversion', 'Walk-in shower', 'Custom tile shower', 'Full bathroom remodel', 'Heated tile floor', 'Shower door or glass', 'New bathtub', 'Accessible / safety shower', 'Something else'].map((o) => `<option>${o}</option>`).join('\n        ');
const telHref = () => `tel:${SITE.phone.replace(/[^0-9+]/g, '')}`;

// ---------- shared chrome ----------------------------------------------------

const pathPill = (path) => `<span class="path-pill" role="navigation" aria-label="Choose a path">
        ${Object.values(PATHS).map((P) => `<a href="${P.url}"${path === P.key ? ' class="on" aria-current="page"' : ''}>${P.label}</a>`).join('')}
      </span>`;
const header = (isHome, path) => `
<div class="topbar">
  <div class="container wide">
    <span class="tb-left"><span class="tb-brand">a <b>BUDDY BUILT</b> company</span></span>
    <span class="tb-mid">Vancouver, WA <span class="tb-sep">·</span> Portland, OR <span class="tb-sep">·</span> ${ico('shield', 14)} Licensed in WA + OR</span>
    <span class="tb-right"><a class="tb-book" href="/book/">${ico('calendar', 14)} Book your free estimate online</a><a href="https://buddybuilt.com/portal" target="_blank" rel="noopener">Customer Login</a><a href="/pay/">Make a Payment</a></span>
  </div>
</div>
<header class="site-header${isHome ? ' home' : ''}">
  <div class="container wide">
    <a class="brand" href="/">
      <img class="brand-mark" src="/assets/img/buddy-baths-wordmark-white.png" alt="Buddy Baths" />
    </a>
    <nav class="site-nav">
      ${pathPill(path)}
      <a class="hide-m" href="/design-options/">Design Options</a>
      ${PROJECTS.length ? '<a class="hide-m" href="/projects/">Our Work</a>' : ''}
      <a class="phone-link" href="${telHref()}">${ico('phone', 16)} ${SITE.phone}</a>
      <a class="btn" href="#estimate"${isHome ? ' data-open-estimate' : ''}>Free Estimate</a>
    </nav>
  </div>
</header>`;


// ---- Online booking block (2026-11-05) ---------------------------------------
// A collapsed "Pick your visit time" row inside every lead form. main.js fills
// it from the platform's /api/public/availability and, once a time is picked,
// posts the whole form to /api/public/book (lead + visit + alerts in one call).
// city: add a City box (forms without a city select); email: add an email box
// (forms without one, for the confirmation); open: expanded on page load.
const bookingBlock = ({ city = true, email = false, open = false } = {}) => `
  <div class="book full"${open ? ' data-open' : ''}>
    <button class="book-toggle" type="button">${ico('calendar', 16)} Pick your visit time <span>optional</span></button>
    <div class="book-panel" hidden>
      <div class="book-head"><span>${ico('calendar', 16)} Choose a day and time</span><button class="book-skip" type="button">Skip, just call me</button></div>
      <div class="book-days" aria-label="Days"></div>
      <div class="book-times" aria-label="Times"></div>
      <p class="book-note"></p>
      <p class="book-pick" hidden>${ico('check', 14)} <b></b><small>Pacific time</small></p>
      <div class="book-addr" hidden>
        <input name="addressLine1" placeholder="Home address *" maxlength="160" autocomplete="street-address" data-req />
        ${city ? '<input name="bookCity" placeholder="City *" maxlength="80" autocomplete="address-level2" data-req />' : ''}
        <input name="zip" placeholder="ZIP" maxlength="10" inputmode="numeric" autocomplete="postal-code" />
        ${email ? '<input name="bookEmail" type="email" placeholder="Email for your confirmation" maxlength="200" autocomplete="email" />' : ''}
      </div>
    </div>
    <p class="book-done" hidden></p>
    <input type="hidden" name="startAt" />
  </div>`;

const leadForm = (context) => `
<section class="estimate-band" id="estimate">
  <div class="container">
    <h2>READY FOR A <span class="hl">NEW SHOWER</span>?</h2>
    <p class="cta-sub">Two minutes now, an in-home design visit this week, and your written price the same day. No pressure, ever.</p>
    <div class="estimate-card">
    <form class="lead-form" data-context="${esc(context)}">
      <input name="name" placeholder="Your name *" required maxlength="120" />
      <input name="phone" placeholder="Phone" maxlength="30" />
      <input name="email" type="email" placeholder="Email" class="full" maxlength="200" />
      <select name="city">
        <option value="">City…</option>
        ${CITIES.map((c) => `<option>${c.name}, ${c.state}</option>`).join('')}
      </select>
      <select name="projectType">
        <option value="">Project type…</option>
        ${PROJECT_OPTIONS}
      </select>
      <textarea name="description" placeholder="Tell us about your bathroom…" maxlength="3000"></textarea>
      ${bookingBlock({ city: false, email: false })}
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" />
      <div class="human-check full">
        <label><span class="hc-text">Quick human check: what is <span class="hc-q">…</span>?</span>
          <input name="humanCheck" inputmode="numeric" autocomplete="off" placeholder="?" required />
        </label>
      </div>
      <button class="btn" type="submit">Get My Free Estimate</button>
      <p class="form-status" hidden></p>
      <p class="form-note">We reply the same business day. Your info never gets sold. You're a neighbor, not a lead.</p>
    </form>
    </div>
  </div>
</section>`;

const footer = `
<footer class="site-footer">
  <div class="container">
    <div class="cols">
      <div class="badge-lockup">
        <div class="foot-lockup">
          <img class="foot-mark" src="/assets/img/buddy-baths-wordmark-white.png" alt="Buddy Baths" loading="lazy" />
          <div class="caption">a BUDDY BUILT company</div>
        </div>
        <p class="foot-blurb">One-day shower systems and hand-built custom tile bathrooms for Vancouver, WA and the Portland, OR metro. Family owned, licensed, bonded, and insured in both states.</p>
        <p class="foot-blurb foot-partner">Shower and bath systems made in the USA, lifetime warranty.</p>
      </div>
      <div>
        <h3><a href="${PATHS['one-day'].url}">ONE-DAY SHOWERS</a></h3>
        <ul>${SERVICES.filter((s) => s.path === 'one-day').map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}<li><a href="/design-options/">Design Options</a></li></ul>
        <h3 class="foot-h3-gap"><a href="${PATHS.custom.url}">CUSTOM BATHROOMS</a></h3>
        <ul>${SERVICES.filter((s) => s.path === 'custom').map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h3>SERVICE AREA</h3>
        <ul>${CITIES.map((c) => `<li><a href="/shower-remodel/${c.slug}/">${c.name}, ${c.state}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h3>CONTACT</h3>
        <ul>
          <li><a href="tel:${SITE.phone.replace(/[^0-9+]/g, '')}">${SITE.phone}</a></li>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="/book/">Book an estimate visit</a></li>
          <li><a href="/about/">About Buddy Baths</a></li>
          ${POSTS.length ? '<li><a href="/blog/">Bath Talk, advice from the crew</a></li>' : ''}
          <li><a href="https://buddybuilt.com" rel="noopener">The Buddy Built family</a></li>
          <li><a href="/privacy/">Privacy Policy</a></li>
          <li class="pay-row">
            <a href="https://buddybuilt.com/portal" target="_blank" rel="noopener">Customer Portal, track your project</a>
            <a class="pay-link" href="/pay/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>Make a Payment</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="legal">
      <p>${SITE.legalLine}</p>
      <p>${SITE.oneDayNote}</p>
      <p>© ${new Date().getFullYear()} Buddy Built LLC · ${SITE.tagline} · <a href="https://buddybuilt.com">buddybuilt.com</a></p>
    </div>
  </div>
</footer>
<div class="mobile-cta">
  <a class="mc-call" href="tel:${SITE.phone.replace(/[^0-9+]/g, '')}">Call ${SITE.phone}</a>
  <a class="mc-est" href="#estimate">Free Estimate</a>
</div>
<script src="/assets/ballpark-config.js?v=${V}"></script>
<script src="/assets/main.js?v=${V}" defer></script>`;

const page = ({ url, title, description, jsonLd, body, path }) => `<!doctype html>
<html lang="en"${path ? ` data-path="${path}"` : ''}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${SITE.domain}${url}" />
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/img/buddy-baths-icon.png" />
  <link rel="icon" href="/assets/img/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
  <link rel="stylesheet" href="/assets/styles.css?v=${V}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${SITE.domain}/assets/img/${path === 'custom' ? 'hero-custom-bathroom.jpg' : 'hero-one-day-shower.jpg'}" />
  <meta property="og:url" content="${SITE.domain}${url}" />
  <meta property="og:type" content="website" />
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
${header(url === '/', path)}
${body}
${footer}
</body>
</html>`;

const faqSection = (faqs) =>
  !faqs?.length
    ? ''
    : `
<section>
  <div class="container" style="max-width:840px;">
    <h2>QUESTIONS WE HEAR EVERY WEEK</h2>
    <hr class="gold-bar" />
    ${faqs
      .map(
        (f) => `<details style="border-bottom:1px solid #E5E7EB;padding:14px 0;"><summary style="font-weight:700;cursor:pointer;font-size:17px;">${esc(f.q)}</summary><p style="color:var(--stone);margin:10px 0 0;">${esc(f.a)}</p></details>`
      )
      .join('')}
  </div>
</section>`;

const faqLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (faqs || []).map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const businessLd = (extra = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Buddy Baths',
  url: SITE.domain,
  telephone: SITE.phone,
  email: SITE.email,
  image: [`${SITE.domain}/assets/img/hero-one-day-shower.jpg`],
  logo: `${SITE.domain}/assets/img/buddy-baths-wordmark-lg.png`,
  slogan: SITE.tagline,
  parentOrganization: { '@type': 'Organization', name: 'Buddy Built LLC', url: 'https://buddybuilt.com' },
  areaServed: [...CITIES, ...NEARBY_TOWNS].map((c) => ({ '@type': 'City', name: `${c.name}, ${c.state}` })),
  priceRange: '$$',
  ...extra,
});

// ---------- pages ------------------------------------------------------------

// How-it-works step icons: clean filled SVGs instead of the old unicode glyphs
const hiwSvg = (d) => `<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
const HIW_ICONS = [
  hiwSvg('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'),
  hiwSvg('M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'),
  hiwSvg('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'),
  hiwSvg('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'),
];

// Featured on the homepage: one hero service, then four. Everything else is
// one click away on "Explore all services" (and still gets its own SEO page).
const svc = (slug) => SERVICES.find((x) => x.slug === slug);
const projectBySlug = (slug) => PROJECTS.find((x) => x.slug === slug);
const projectHref = (slug) => (projectBySlug(slug) ? `/projects/${slug}/` : '/projects/');
// Before/after only renders when a gallery actually has a "before" photo.
const BEFORE_AFTER = (() => {
  for (const pr of PROJECTS) {
    const before = (pr.photos || []).find((ph) => ph.phase === 'before');
    const after = (pr.photos || []).find((ph) => ph.phase === 'after');
    if (before && after) return { pr, before, after };
  }
  return null;
})();
const ratingLine = GOOGLE_REVIEWS && GOOGLE_REVIEWS.rating
  ? `<div class="hero-rating"><span class="stars">★★★★★</span> ${GOOGLE_REVIEWS.rating.toFixed(1)} from local homeowners on Google</div>`
  : `<div class="hero-rating">Family owned · Same-day written estimates · Licensed &amp; bonded</div>`;
const featuredReview = GOOGLE_REVIEWS && GOOGLE_REVIEWS.reviews?.length
  ? { text: GOOGLE_REVIEWS.reviews[0].text, who: GOOGLE_REVIEWS.reviews[0].author, where: 'Google review' }
  : { text: TESTIMONIALS[0].quote, who: TESTIMONIALS[0].name, where: TESTIMONIALS[0].where };

const estimateForm = (context, { compact = false, hero = false, book = true } = {}) => `
<form class="lead-form hero-lead${hero ? ' hero-mini' : ''}" data-context="${esc(context)}">
  <input name="name" placeholder="Your name *" required maxlength="120" class="full" />
  <input name="phone" type="tel" placeholder="Phone *" required maxlength="30"${hero ? ' class="full"' : ''} />
  ${hero ? '' : '<input name="email" type="email" placeholder="Email" maxlength="200" />'}
  <select name="projectType" class="full">
    <option value="">Project type</option>
        ${PROJECT_OPTIONS}
  </select>
  ${compact || hero ? '' : '<textarea name="description" placeholder="Tell us about your bathroom…" maxlength="3000"></textarea>'}
  ${book ? bookingBlock({ city: true, email: hero, open: book === 'open' }) : ''}
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" />
  ${hero ? '' : `<div class="human-check full">
    <label><span class="hc-text">Quick human check: what is <span class="hc-q">…</span>?</span>
          <input name="humanCheck" inputmode="numeric" autocomplete="off" placeholder="?" required />
    </label>
  </div>`}
  <button class="btn full" type="submit">Get My Free Estimate</button>
  <p class="form-status" hidden></p>
  ${hero ? `<ul class="hero-checks"><li>${ico('check', 16)} No pressure</li><li>${ico('check', 16)} Your information stays private</li></ul>` : '<p class="form-note">We reply the same business day. Your info never gets sold. You\'re a neighbor, not a lead.</p>'}
</form>`;

// Homepage v3 (2026-09): contractor-marketing rhythm. Every section carries a
// photo, an icon, or brand color; Buddy appears three times; one CTA repeats.
const PATH_SERVICES = (P) => SERVICES.filter((x) => x.path === P.key);
const pathFaqs = (P) => [...(P.faqSlugs || []).flatMap(([slug, n]) => (svc(slug).faqs || []).slice(0, n)), ...(P.extraFaqs || [])];
const firstSentence = (t) => {
  const m = String(t || '').match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : String(t || '');
};
const PROC_PHOTOS = []; // no crew photos yet: process cards render icon-only
const PROC_ICONS = ['phone', 'palette', 'hammer', 'smile'];
const WHY_ICONS = ['home', 'camera', 'lock', 'smile'];
const BLOG_FALLBACK = ['gallery-tundra.jpg', 'gallery-sahara.jpg', 'gallery-gray-marble.jpg'];
const GOOGLE_REVIEWS_URL = GOOGLE_REVIEWS ? GOOGLE_REVIEWS.mapsUrl || `https://www.google.com/maps/place/?q=place_id:${GOOGLE_REVIEWS.placeId}` : 'https://www.google.com/maps/search/Buddy+Baths+Vancouver+WA';
const cityLink = (c) => `<li><a href="/shower-remodel/${c.slug}/">${ico('check', 14)} ${esc(c.name)}</a></li>`;
const townItem = (t) => `<li><span>${ico('check', 14)} ${esc(t.name)}</span></li>`;

const swatch = (sw, dir = 'swatches') => `<figure class="swatch"><img src="/assets/img/${dir}/${sw.img}" alt="${esc(sw.name)}" loading="lazy" /><figcaption>${esc(sw.name)}${sw.note ? `<span>${esc(sw.note)}</span>` : ''}</figcaption></figure>`;

const siteBody = (P) => `
${P.split ? splitHero() : `<div class="home-hero v3 fence baths">
  <div class="bg" style="background-image:url('/assets/img/${P.hero.photo}')"></div>
  <div class="scrim"></div>
  <div class="container wide hero-v3">
    <div class="hero-copy enter">
      <p class="eyebrow light">${ico('pin', 14)} Vancouver, WA · Portland, OR</p>
      <h1>${P.hero.h1a}<br /><span class="gold">${P.hero.h1b}</span></h1>
      <p class="hero-tags">${P.hero.tags.map((t) => `<span>${t}</span>`).join('')}</p>
      <ul class="hero-points">
        ${P.hero.points.map(([ic, a, b]) => `<li>${iconCircle(ic)}<div><strong>${a}</strong><span>${b}</span></div></li>`).join('\n        ')}
      </ul>
      <div class="hero-btns">
        <a class="btn btn-lg" href="${telHref()}">${ico('phone', 18)} ${SITE.phone}</a>
        <a class="btn ghost btn-lg" href="${P.hero.ctaHref}">${P.hero.cta}</a>
      </div>
    </div>
    <div class="hero-side">
    <div class="hero-card enter" style="--i:2">
      <span class="card-buddy-wrap"><img class="card-buddy" src="/assets/img/buddy-bust.webp" alt="Buddy, the Buddy Baths mascot, giving a thumbs up" width="420" height="440" /></span>
      <div class="hero-card-head">
        <p class="eyebrow">Free Estimate</p>
        <h3>${P.hero.cardH3}</h3>
      </div>
      <p class="hero-card-sub">${P.hero.cardSub}</p>
      ${estimateForm('hero', { compact: true })}
    </div>
    </div>
  </div>
</div>`}

<div class="trust-row hero-trust">
  <div class="container wide">
    <span>${ico('checkCircle', 22)} Family owned &amp; local</span>
    <span>${ico('checkCircle', 22)} Licensed &amp; insured</span>
    <span>${ico('checkCircle', 22)} One written price</span>
    <span>${ico('checkCircle', 22)} Lifetime warranty</span>
  </div>
</div>

<section class="sec" id="about">
  <div class="container wide intro-grid">
    <div class="reveal">
      <p class="eyebrow">${P.intro.eyebrow}</p>
      <h2 class="h-xl">${P.intro.h2[0]}<span class="hl">${P.intro.h2[1]}</span></h2>
      <p class="sub">${esc(P.intro.p1)}</p>
      <p class="sub">${esc(P.intro.p2)}</p>
      <ul class="check-list">
        ${TRUST.slice(0, 4).map((t) => `<li>${ico('checkCircle', 20)}<div><strong>${esc(t.title)}</strong><span>${esc(t.body)}</span></div></li>`).join('')}
      </ul>
      <a class="btn" href="#estimate" data-open-estimate>Get a Free Estimate</a>
    </div>
    <figure class="intro-photo reveal reveal-img" style="--i:1">
      <div class="frame"><img src="/assets/img/${P.intro.photo}" alt="${esc(P.intro.caption)}" loading="lazy" /></div>
      <figcaption>${esc(P.intro.caption)}</figcaption>
    </figure>
  </div>
</section>

<div class="trust-row">
  <div class="container wide">
    ${P.trust2.map(([ic, t]) => `<span>${ico(ic, 22)} ${t}</span>`).join('\n    ')}
  </div>
</div>

${P.split ? chooseSection() : `<section class="sec paper" id="services">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">${P.servicesHead.eyebrow}</p>
      <h2 class="h-xl">${P.servicesHead.h2[0]}<span class="hl">${P.servicesHead.h2[1]}</span></h2>
      <p class="sub">${P.servicesHead.sub}</p>
    </div>
    <div class="svc-cards">
      ${PATH_SERVICES(P).slice(0, 6).map((x, i) => {
        return `<a class="svc-card reveal" style="--i:${i}" href="/services/${x.slug}/">
        ${x.photo ? `<div class="svc-img"><img src="/assets/img/${x.photo}" alt="${esc(x.name)}" loading="lazy" /></div>` : `<div class="svc-img svc-icon">${ico(x.icon || 'shower', 56)}</div>`}
        <div class="svc-body">
          <h3>${esc(x.name)}</h3>
          <p>${esc(firstSentence(x.intro))}</p>
          <span class="btn sm">Explore ${esc(x.name.toLowerCase())} →</span>
        </div>
      </a>`;
      }).join('')}
    </div>
    <div class="all-services v3 reveal">
      <span class="all-label">${P.name}:</span>
      ${PATH_SERVICES(P).map((x) => `<a href="/services/${x.slug}/">${esc(x.name)}</a>`).join('')}
      ${P.design ? '<a href="/design-options/">Design Options</a>' : ''}
      <a class="all-switch" href="${P.key === 'custom' ? PATHS['one-day'].url : PATHS.custom.url}">${P.key === 'custom' ? 'Need it in a day? One-day showers →' : 'Want tile? Custom bathrooms →'}</a>
    </div>
  </div>
</section>`}

${P.design ? `<section class="sec" id="design">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">Design options</p>
      <h2 class="h-xl">Your look. <span class="hl">Your choice.</span></h2>
      <p class="sub">30 wall colors, 17 laser-etched tile patterns, PuroStone engineered stone, four glass finishes, and four hardware finishes. We bring the samples to your bathroom.</p>
    </div>
    <div class="swatch-grid reveal">
      ${[...DESIGN.purostone.slice(0, 4), ...DESIGN.colors.slice(0, 4), ...DESIGN.patterns.slice(0, 4)].map((sw) => swatch(sw)).join('')}
    </div>
    <div class="sec-foot center reveal"><a class="btn ghost-dark" href="/design-options/">See every color, pattern &amp; glass option →</a></div>
  </div>
</section>` : ''}

${
  PROJECTS.length
    ? `<section class="sec paper" id="work">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">Our work</p>
      <h2 class="h-xl">Real jobs. Real homes. <span class="hl">Real photos.</span></h2>
      <p class="sub">Photographed by the crew that installed it. No stock photos, ever.</p>
    </div>
    <div class="grid cols-3">${PROJECTS.slice(0, 3).map(projectCard).join('')}</div>
    <div class="sec-foot center reveal"><a class="btn ghost-dark" href="/projects/">See all projects →</a></div>
  </div>
</section>`
    : ''
}

<section class="cta-band">
  <img class="cta-buddy" src="/assets/img/buddy-mascot-thumbs.webp" alt="" aria-hidden="true" loading="lazy" />
  <div class="container center reveal">
    <p class="eyebrow light">We're ready when you are</p>
    <h2 class="h-xl light">${P.ctaH2[0]}<span class="hl">${P.ctaH2[1]}</span></h2>
    <a class="btn btn-lg" href="#estimate" data-open-estimate>Get a Free Estimate</a>
  </div>
</section>

<section class="sec" id="how-it-works">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">How it works</p>
      <h2 class="h-xl">From first call to first shower in <span class="hl">four steps</span></h2>
      <p class="sub">From your first call to the final walkthrough, you always know what happens next and who's doing it.</p>
    </div>
    <div class="proc-cards">
      ${STEPS.map(
        (st, i) => `<div class="pc reveal${PROC_PHOTOS[i] ? '' : ' no-photo'}" style="--i:${i}">
        ${PROC_PHOTOS[i] ? `<div class="pc-photo"><img src="/assets/img/${PROC_PHOTOS[i]}" alt="" loading="lazy" /><span class="pc-num">${i + 1}</span></div>` : `<span class="pc-num pc-num-solo">${i + 1}</span>`}
        ${iconCircle(PROC_ICONS[i])}
        <h3>${esc(st.title)}</h3>
        <p>${esc(st.body)}</p>
      </div>`
      ).join('')}
    </div>
  </div>
</section>

<section class="why" id="standard">
  <div class="why-bg" style="background-image:url('/assets/img/why-bg.jpg')"></div>
  <div class="container wide why-in">
    <div class="sec-head center reveal">
      <p class="eyebrow light">The Buddy standard</p>
      <h2 class="h-xl light">Why homeowners trust <span class="hl">Buddy Baths</span></h2>
      <p class="sub light">No disappearing contractors. No mystery schedules. No wondering what's next.</p>
    </div>
    <div class="why-grid">
      ${PROMISE.map((pr, i) => `<div class="wc reveal" style="--i:${i}">${iconCircle(WHY_ICONS[i])}<div><h3>${esc(pr.title)}</h3><p>${esc(pr.body)}</p></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="area-sec" id="service-area">
  <div id="service-map" class="area-bg" aria-label="Map of Buddy Baths service cities in Washington and Oregon"></div>
  <div class="container wide area-over">
    <div class="area-card reveal">
      <p class="eyebrow">Service Area</p>
      <h2>Two states. One standard.</h2>
      <p class="area-sub">Crews roll out of Vancouver every morning and cover both sides of the river. Tap a city to find it on the map.</p>
      <div class="area-cols">
        ${['OR', 'WA']
          .map(
            (st) => `<div class="area-col ${st === 'OR' ? 'or' : 'wa'}">
          <div class="state">${st === 'WA' ? 'Washington' : 'Oregon'}</div>
          <ul class="city-list${st === 'OR' ? ' cols2' : ''}">
            ${CITIES.filter((c) => c.state === st)
              .map((c) => `<li><button type="button" class="city-btn" data-city="${c.slug}">${esc(c.name)}</button><a class="city-go" href="/shower-remodel/${c.slug}/" aria-label="Shower remodels in ${esc(c.name)}">→</a></li>`)
              .join('')}
            ${NEARBY_TOWNS.filter((t) => t.state === st)
              .map((t) => `<li><button type="button" class="city-btn" data-town="${esc(t.name)}">${esc(t.name)}</button></li>`)
              .join('')}
          </ul>
        </div>`
          )
          .join('')}
      </div>
      <p class="map-note">Don't see your town? <a href="#estimate" data-open-estimate>Ask us</a>, we may still come to you.</p>
    </div>
  </div>
</section>
<script>window.BT_SERVICE_AREA = ${JSON.stringify({
  cities: CITIES.map((c) => ({ slug: c.slug, name: c.name, state: c.state, lat: c.lat, lng: c.lng, url: `/shower-remodel/${c.slug}/`, hoods: c.neighborhoods.slice(0, 4) })),
  towns: NEARBY_TOWNS,
})};</script>

<section class="sec" id="reviews">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">Reviews</p>
      <h2 class="h-xl">Trusted by families across <span class="hl">Vancouver &amp; Portland</span></h2>
      <p class="sub">We treat every home like it's ours. Here's what that looks like from the homeowner's side.</p>
    </div>
    <div class="quote-grid">
      ${(GOOGLE_REVIEWS && GOOGLE_REVIEWS.reviews?.length ? GOOGLE_REVIEWS.reviews.slice(0, 3).map((r) => ({ quote: r.text, name: r.author, where: 'Google review' })) : TESTIMONIALS)
        .map((t, i) => `<div class="quote-card reveal" style="--i:${i}"><div class="stars">★★★★★</div><blockquote>“${esc(t.quote)}”</blockquote><div class="who">${esc(t.name)}</div><div class="where">${esc(t.where)}</div></div>`)
        .join('')}
    </div>
    <div class="sec-foot center reveal"><a class="btn ghost-dark" href="${esc(GOOGLE_REVIEWS_URL)}" target="_blank" rel="noopener">Read our Google reviews →</a></div>
  </div>
</section>

${
  POSTS.length
    ? `<section class="sec navy" id="bath-talk">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow light">Bath Talk</p>
      <h2 class="h-xl light">Straight answers for Northwest <span class="hl">homeowners</span></h2>
      <p class="sub light">Prices, materials, and what to expect, written by the people who do the installs.</p>
    </div>
    <div class="post-cards">
      ${POSTS.slice(0, 3)
        .map(
          (p, i) => `<a class="post-card reveal" style="--i:${i}" href="/blog/${p.slug}/">
        <img src="/assets/img/${BLOG_FALLBACK[i % BLOG_FALLBACK.length]}" alt="" loading="lazy" />
        <div class="body"><div class="date">${postDate(p.publishedAt)}</div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt || '')}</p><span class="btn sm">Read more →</span></div>
      </a>`
        )
        .join('')}
    </div>
    <div class="sec-foot center reveal"><a class="btn ghost" href="/blog/">All articles →</a></div>
  </div>
</section>`
    : ''
}

<section class="sec paper" id="faq">
  <div class="container faq-wrap">
    <div class="sec-head center reveal">
      <p class="eyebrow">FAQ</p>
      <h2 class="h-xl">Questions we hear <span class="hl">every week</span></h2>
    </div>
    <div class="faq-list reveal">
      ${pathFaqs(P).map((f) => `<details class="faq"><summary>${esc(f.q)}${ico('chev', 20)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>

<section class="final v3" id="estimate">
  <div class="container wide final-grid">
    <div class="final-copy reveal">
      <p class="eyebrow light">${P.final.eyebrow}</p>
      <h2 class="h-xl light">${P.final.h2[0]}<span class="hl">${P.final.h2[1]}</span></h2>
      <p class="sub light">Two minutes now, an in-home visit this week with samples in hand, and your written price the same day. No pressure, ever.</p>
      <div class="final-contact">
        <a href="${telHref()}">${ico('phone', 20)} ${SITE.phone}</a>
        <a href="mailto:${SITE.email}">${ico('mail', 20)} ${SITE.email}</a>
      </div>
    </div>
    <div class="estimate-card reveal" style="--i:1">
      ${estimateForm('home')}
    </div>
  </div>
</section>

<div class="modal" id="estimate-modal" hidden>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="estimate-modal-title">
    <button class="modal-x" type="button" aria-label="Close" data-close-estimate>×</button>
    <p class="eyebrow">Free In-Home Estimate</p>
    <h3 id="estimate-modal-title">Tell us about your bathroom.</h3>
    <p class="hero-card-sub">We measure your space, bring the samples, and your written price arrives the same day.</p>
    ${estimateForm('modal', { compact: true })}
  </div>
</div>`;

// ---- Home: the split-screen chooser + the comparison section (2026-11-05) ----
const splitHalf = (P, pts) => `
  <a class="split ${P.key}" data-path="${P.key}" href="${P.url}">
    <div class="bg" style="background-image:url('/assets/img/${P.hero.photo}')"></div>
    <div class="scrim"></div>
    <div class="split-in">
      <p class="eyebrow light">${ico(P.key === 'custom' ? 'ruler' : 'clock', 14)} ${P.blurb}</p>
      <h2>${P.hero.h1a}<br /><span class="gold">${P.hero.h1b}</span></h2>
      <p class="lead">${pts.lead}</p>
      <ul class="split-points">${pts.points.map((t) => `<li>${t}</li>`).join('')}</ul>
      <span class="btn btn-lg">${pts.cta}</span>
      <span class="remembered-tag">${ico('check', 14)} Welcome back, pick up where you left off</span>
    </div>
  </a>`;
const splitHero = () => `
<section class="split-hero" aria-label="Choose your bathroom project">
  <h1 class="sr-only">Bathroom Remodeling in Vancouver, WA and Portland, OR: One-Day Showers and Custom Tile Bathrooms</h1>
  ${splitHalf(PATHS['one-day'], { lead: 'Grout-free wall systems measured to your bathroom, installed in a day, lifetime warranty.', points: ['Shower replacements', 'Tub-to-shower conversions', 'Walk-in &amp; accessible'], cta: 'Explore one-day showers →' })}
  <div class="split-mid">
    <span class="split-pill">
      <img src="/assets/img/buddy-bust.webp" alt="" aria-hidden="true" width="420" height="440" />
      <span><b>Not sure which?</b><a href="${telHref()}">${SITE.phone}</a></span>
    </span>
  </div>
  ${splitHalf(PATHS.custom, { lead: 'Hand-set tile, heated floors, waterproofing, vanities, and full remodels, designed around you.', points: ['Custom tile showers', 'Full bathroom remodels', 'Heated floors &amp; tile'], cta: 'Explore custom bathrooms →' })}
</section>`;

const chooseSection = () => `
<section class="sec paper choose" id="services">
  <div class="container wide">
    <div class="sec-head center reveal">
      <p class="eyebrow">Two ways to a new bathroom</p>
      <h2 class="h-xl">Which one is <span class="hl">right for you?</span></h2>
      <p class="sub">Same crews, same written price, same lifetime of standing behind it. The difference is how it's built and how fast you're showering.</p>
    </div>
    <div class="choose-grid">
      ${Object.values(PATHS).map((P, i) => {
        const rows = P.key === 'custom'
          ? [['Timeline', '1 to 4 weeks'], ['Walls', 'Hand-set tile on flood-tested waterproofing'], ['Best for', 'A specific look, a new layout, heated floors, the whole room'], ['Pricing', 'Tile showers from about $7,000 in labor; remodels priced from a written scope']]
          : [['Timeline', 'As little as one day'], ['Walls', 'Seamless grout-free panels, lifetime warranty'], ['Best for', 'A straight swap, tub-to-shower, aging in place'], ['Pricing', '$9,000 to $17,000 installed, written before we start']];
        return `<div class="choose-card ${P.key} reveal" style="--i:${i}">
        <div class="choose-img"><img src="/assets/img/${P.hero.photo}" alt="${esc(P.name)}" loading="lazy" /><span class="choose-tag">${esc(P.blurb)}</span></div>
        <div class="choose-body">
          <h3>${esc(P.name)}</h3>
          <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
          <ul class="choose-svcs">${PATH_SERVICES(P).map((x) => `<li><a href="/services/${x.slug}/">${ico('check', 14)} ${esc(x.name)}</a></li>`).join('')}</ul>
          <a class="btn" href="${P.url}">${P.key === 'custom' ? 'Explore custom bathrooms' : 'Explore one-day showers'} →</a>
        </div>
      </div>`;
      }).join('')}
    </div>
    <div class="sec-foot center reveal"><a class="btn ghost-dark" href="/design-options/">See one-day wall colors, patterns &amp; glass →</a></div>
  </div>
</section>`;

const homeBody = siteBody(HOME_PATH);

const HERO_CHIPS = `<div class="chips">
        <span>Family owned</span><span>Licensed &amp; bonded</span><span>Lifetime warranty</span><span>Installed in as little as one day</span>
      </div>`;

const heroCard = (context) => `
    <div class="hero-card">
      <h3>GET A FREE IN-HOME ESTIMATE</h3>
      <p class="hero-card-sub">We measure your space, and your written price arrives the same day.</p>
      <form class="lead-form hero-lead" data-context="${context}">
        <input name="name" placeholder="Your name *" required maxlength="120" class="full" />
        <input name="phone" type="tel" placeholder="Phone *" required maxlength="30" />
        <select name="projectType">
          <option value="">Project…</option>
        ${PROJECT_OPTIONS}
        </select>
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" />
        <div class="human-check full">
        <label><span class="hc-text">Quick human check: what is <span class="hc-q">…</span>?</span>
          <input name="humanCheck" inputmode="numeric" autocomplete="off" placeholder="?" required />
        </label>
      </div>
        <button class="btn full" type="submit">Get My Free Estimate</button>
        <p class="form-status" hidden></p>
      </form>
    </div>`;

const pageHero = ({ h1, lead, photo, context }) => `
<div class="hero">
  <div class="bg" style="background-image:url('/assets/img/${photo}')"></div>
  <div class="scrim"></div>
  <div class="container hero-grid">
    <div>
      <h1>${h1}</h1>
      <hr class="gold-bar" />
      <p class="lead">${lead}</p>
      ${HERO_CHIPS}
    </div>
${heroCard(context)}
  </div>
</div>`;


const servicePage = (s) => `
${pageHero({
  h1: `${s.h1.toUpperCase()} IN <span class="gold">VANCOUVER, WA</span> &amp; PORTLAND, OR`,
  lead: esc(s.intro),
  photo: s.photo,
  context: `service:${s.slug}`,
})}
<div class="container breadcrumbs crumbs-after-hero"><a href="/">Home</a> / <a href="${PATHS[s.path].url}">${PATHS[s.path].name}</a> / ${s.name}</div>
<section style="padding-top:26px;">
  <div class="container two-col">
    <div>
      <h2>WHAT'S INCLUDED</h2>
      <hr class="gold-bar" />
      <ul class="tick-list">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p><a class="btn" href="#estimate">Get My Free Estimate</a></p>
    </div>
    <div>
      <img class="rounded-img" src="/assets/img/${s.photo || 'hero-one-day-shower.jpg'}" alt="${esc(s.h1)} in Vancouver, WA and Portland, OR" />
      <p style="color:var(--stone);font-size:14px;margin-top:12px;">${SITE.serviceAreaBlurb}</p>
    </div>
  </div>
</section>
<section class="alt">
  <div class="container">
    <h2>MORE FROM BUDDY BATHS</h2>
    <hr class="gold-bar" />
    <div class="grid cols-3">
      ${SERVICES.filter((x) => x.slug !== s.slug && x.path === s.path)
        .slice(0, 3)
        .map((x) => `<a class="card" href="/services/${x.slug}/"><div class="body"><h3>${x.name.toUpperCase()}</h3><div class="go">Learn more →</div></div></a>`)
        .join('')}
    </div>
  </div>
</section>
${faqSection(s.faqs)}
<section class="alt">
  <div class="container">
    <h2>${s.name.toUpperCase()} NEAR YOU</h2>
    <hr class="gold-bar" />
    <div class="grid cols-3">
      ${CITIES.map(
        (c) => `<a class="card" href="/services/${s.slug}/${c.slug}/"><div class="body"><h3>${c.name.toUpperCase()}, ${c.state}</h3><div class="go">${esc(s.name)} in ${c.name} →</div></div></a>`
      ).join('')}
    </div>
  </div>
</section>
${leadForm(`service:${s.slug}`)}`;

// The matrix page: one service in one city, localized copy, prices, and
// neighborhoods so every page earns its ranking instead of being a doorway.
const serviceCityPage = (s, c) => `
${pageHero({
  h1: `${s.h1.toUpperCase()} IN <span class="gold">${c.name.toUpperCase()}, ${c.state}</span>`,
  lead: esc(s.intro),
  photo: s.photo,
  context: `service:${s.slug}:${c.slug}`,
})}
<div class="container breadcrumbs crumbs-after-hero"><a href="/">Home</a> / <a href="/services/${s.slug}/">${esc(s.name)}</a> / ${c.name}, ${c.state}</div>
<section style="padding-top:26px;">
  <div class="container two-col">
    <div>
      <h2>${s.name.toUpperCase()} IN ${c.name.toUpperCase()}, ${c.state}</h2>
      <hr class="gold-bar" />
      <p>${esc(c.blurb)} We regularly work in ${c.neighborhoods.slice(0, -1).join(', ')} and ${c.neighborhoods[c.neighborhoods.length - 1]}, free on-site estimates, written the same day.</p>
      <ul class="tick-list">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p><a class="btn" href="#estimate">Get My ${c.name} Estimate</a></p>
    </div>
    <div>
      <img class="rounded-img" src="/assets/img/${s.photo || 'hero-one-day-shower.jpg'}" alt="${esc(s.h1)} in ${esc(c.name)}, ${c.state}" />
      <p style="color:var(--stone);font-size:14px;margin-top:12px;">Licensed, bonded &amp; insured · Serving ${c.name} and the surrounding metro.</p>
    </div>
  </div>
</section>
${faqSection(s.faqs)}
<section class="alt">
  <div class="container">
    <h2>MORE SHOWER WORK IN ${c.name.toUpperCase()}</h2>
    <hr class="gold-bar" />
    <div class="grid cols-3">
      ${SERVICES.filter((x) => x.slug !== s.slug && x.path === s.path)
        .slice(0, 6)
        .map((x) => `<a class="card" href="/services/${x.slug}/${c.slug}/"><div class="body"><h3>${x.name.toUpperCase()}</h3><div class="go">${esc(x.name)} in ${c.name} →</div></div></a>`)
        .join('')}
    </div>
    <p style="margin-top:18px;"><a href="/shower-remodel/${c.slug}/">Everything we do in ${c.name}, ${c.state} →</a>
      ${CITIES.filter((x) => x.slug !== c.slug).slice(0, 3).map((x) => ` · <a href="/services/${s.slug}/${x.slug}/">${esc(s.name)} in ${x.name}</a>`).join('')}
    </p>
  </div>
</section>
${leadForm(`service:${s.slug}:${c.slug}`)}`;

const cityPage = (c) => `
${pageHero({
  h1: `BATHROOM REMODELS IN <span class="gold">${c.name.toUpperCase()}, ${c.state}</span>`,
  lead: `One-day shower systems and hand-built custom tile bathrooms for ${c.name} homeowners: shower replacements, tub-to-shower conversions, tile showers, heated floors, and full remodels. ${esc(c.blurb)}`,
  photo: 'hero-one-day-shower.jpg',
  context: `city:${c.slug}`,
})}
<div class="container breadcrumbs crumbs-after-hero"><a href="/">Home</a> / <a href="/#service-area">Service Area</a> / ${c.name}, ${c.state}</div>
<section style="padding-top:26px;">
  <div class="container two-col">
    <div>
      <h2>WHY ${c.name.toUpperCase()} HOMEOWNERS CALL US</h2>
      <hr class="gold-bar" />
      <ul class="tick-list">
        <li>Free in-home design visits in ${c.name}, written price the same day</li>
        <li>Licensed, bonded &amp; insured in Washington and Oregon</li>
        <li>One-day shower systems, grout-free, lifetime warranty</li>
        <li>Custom tile showers and full remodels on flood-tested waterproofing</li>
      </ul>
      <p><a class="btn" href="#estimate">Get My ${c.name} Estimate</a></p>
    </div>
    <div>
      <img class="rounded-img" src="/assets/img/hero-one-day-shower.jpg" alt="One-day shower replacement in ${esc(c.name)}, ${c.state}" />
    </div>
  </div>
</section>
<section class="alt">
  <div class="container">
    <h2>EVERYTHING WE DO IN ${c.name.toUpperCase()}</h2>
    <hr class="gold-bar" />
    <div class="grid cols-3">
      ${SERVICES.map(
        (x) => `<a class="card" href="/services/${x.slug}/${c.slug}/"><img src="/assets/img/${x.photo || 'hero-one-day-shower.jpg'}" alt="${esc(x.name)} in ${esc(c.name)}, ${c.state}" loading="lazy" /><div class="body"><p class="eyebrow">${PATHS[x.path].name}</p><h3>${x.name.toUpperCase()}</h3><div class="go">${esc(x.name)} in ${c.name} →</div></div></a>`
      ).join('')}
    </div>
  </div>
</section>
${leadForm(`city:${c.slug}`)}`;

const projectsIndexBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Our Work</div>
<section style="padding-top:26px;">
  <div class="container">
    <h1>REAL JOBS. REAL BATHROOMS. REAL PHOTOS.</h1>
    <hr class="gold-bar" />
    <p class="lead" style="max-width:760px;">Every project below is a real ${SITE.name} job, photographed by the crew that installed it. No stock photos, ever.</p>
    <div class="grid cols-3" style="margin-top:22px;">
      ${PROJECTS.map(projectCard).join('')}
    </div>
    ${PROJECTS.length === 0 ? '<p style="color:var(--stone);">Fresh projects are on the way, check back soon.</p>' : ''}
  </div>
</section>
${leadForm('projects')}`;

const projectPage = (pr) => {
  const cityMatch = CITIES.find((c) => c.name.toLowerCase() === (pr.city || '').toLowerCase());
  return `
<div class="container breadcrumbs"><a href="/">Home</a> / <a href="/projects/">Our Work</a> / ${esc(pr.city || 'Project')}</div>
<section style="padding-top:26px;">
  <div class="container">
    <h1>${esc(pr.title.toUpperCase())}</h1>
    <hr class="gold-bar" />
    <p class="lead">${esc(projectByline(pr))}</p>
    <div class="grid cols-2" style="margin-top:20px;">
      ${pr.photos
        .map(
          (ph) => `<figure style="margin:0;">
        <img class="rounded-img" src="/assets/img/projects/${ph.file}" alt="${esc(ph.caption || pr.title)}" loading="lazy" />
        <figcaption style="color:var(--stone);font-size:14px;margin-top:8px;">${ph.phase ? `<strong style="color:var(--navy);text-transform:uppercase;font-size:12px;letter-spacing:.06em;">${esc(ph.phase)}</strong> · ` : ''}${esc(ph.caption || '')}</figcaption>
      </figure>`
        )
        .join('')}
    </div>
    <p style="margin-top:24px;"><a class="btn" href="#estimate">Get a project like this priced free</a></p>
  </div>
</section>
<section class="alt">
  <div class="container">
    <h2>WANT THIS IN YOUR HOME?</h2>
    <hr class="gold-bar" />
    <div class="grid cols-3">
      ${SERVICES.slice(0, 3)
        .map((x) => `<a class="card" href="/services/${x.slug}/${cityMatch ? cityMatch.slug + '/' : ''}"><div class="body"><h3>${x.name.toUpperCase()}</h3><div class="go">${esc(x.name)}${cityMatch ? ` in ${cityMatch.name}` : ''} →</div></div></a>`)
        .join('')}
    </div>
    ${cityMatch ? `<p style="margin-top:18px;"><a href="/shower-remodel/${cityMatch.slug}/">Everything we do in ${cityMatch.name}, ${cityMatch.state} →</a></p>` : ''}
  </div>
</section>
${leadForm(`project:${pr.slug}`)}`;
};

const aboutBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / About</div>
<section style="padding-top:26px;">
  <div class="container two-col">
    <div>
      <h1>ONE COMPANY. EXPERTS IN EVERY TRADE.</h1>
      <hr class="gold-bar" />
      <p class="lead">Buddy Baths is the one-day shower division of Buddy Built, a family of home-service brands built on one idea: hire the company, not a stranger from a listing. One standard, one warranty, one number to call.</p>
      <p>Every Buddy crew works to one standard, carries one warranty, and answers to one phone number. Your designer measures the bathroom with you, brings the wall, glass, and hardware samples to your home, and your written price lands in your inbox the same day.</p>
      <p>${esc(SITE.manufacturer.blurb)} Buddy Baths designs and installs them across Southwest Washington and the Portland metro.</p>
      <p>Want the rest of the bathroom done too, tile floors, a new vanity, paint? That's the point of the family: one call brings the right Buddy trade, and everything lands on one schedule and one invoice.</p>
      <p><a class="btn" href="#estimate">Get My Free Estimate</a></p>
    </div>
    <div>
      <img class="rounded-img" src="/assets/img/hero-one-day-shower.jpg" alt="Buddy Baths one-day shower with marble wall system and black-framed glass door" />
    </div>
  </div>
</section>
${leadForm('about')}`;

// Design Options: the wall, glass, and hardware catalog we install, grouped the way the
// in-home designer walks through it (walls, patterns, glass, hardware).
const designBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Design Options</div>
<section style="padding-top:26px;">
  <div class="container wide">
    <h1>DESIGN YOUR <span class="hl">SHOWER</span></h1>
    <hr class="gold-bar" />
    <p class="lead" style="max-width:760px;">Every Buddy Baths shower is built from four choices: the wall finish, the pattern etched into it, the glass, and the hardware finish. Pick what you like here, and we bring the real samples to your bathroom at the free design visit.</p>
  </div>
</section>
<section class="alt">
  <div class="container wide">
    <p class="eyebrow">Step 1</p>
    <h2>PUROSTONE <span class="hl">ENGINEERED STONE</span></h2>
    <p class="sub">The premium wall. Matte, warm to the touch, non-porous, GREENGUARD certified, and backed by a lifetime limited warranty. Five natural stone colors.</p>
    <div class="swatch-grid five">${DESIGN.purostone.map((sw) => swatch(sw)).join('')}</div>
  </div>
</section>
<section>
  <div class="container wide">
    <p class="eyebrow">Step 1, continued</p>
    <h2>WALL <span class="hl">COLORS &amp; FINISHES</span></h2>
    <p class="sub">Seamless high-tech polymer panels in marble, travertine, concrete, and solid looks. Non-porous, no grout, cleans with soap and water.</p>
    <div class="swatch-grid">${DESIGN.colors.map((sw) => swatch(sw)).join('')}</div>
    <p class="more-list"><strong>Also available:</strong> ${DESIGN.moreColors.join(' · ')}</p>
  </div>
</section>
<section class="alt">
  <div class="container wide">
    <p class="eyebrow">Step 2</p>
    <h2>LASER-ETCHED <span class="hl">TILE PATTERNS</span></h2>
    <p class="sub">The look of real tile without a single grout line. Patterns are laser-etched into the wall panel, so the texture is real and the maintenance is not.</p>
    <div class="swatch-grid">${DESIGN.patterns.map((sw) => swatch(sw)).join('')}</div>
    <p class="more-list"><strong>Also available:</strong> ${DESIGN.morePatterns.join(' · ')}</p>
    <figure class="design-photo"><img src="/assets/img/laser-etched-subway.jpg" alt="Laser-etched subway tile pattern on a seamless shower wall panel" loading="lazy" /><figcaption>Othello subway, laser-etched. No grout to scrub, ever.</figcaption></figure>
  </div>
</section>
<section>
  <div class="container wide">
    <p class="eyebrow">Step 3</p>
    <h2>GLASS &amp; <span class="hl">ENCLOSURES</span></h2>
    <p class="sub">Sliding or swinging doors in 1/4", 5/16", or 3/8" glass. Four finishes, plus V-groove patterns (${DESIGN.vgroove.join(', ')}) on select models.</p>
    <div class="swatch-grid four">${DESIGN.glass.map((sw) => swatch(sw)).join('')}</div>
  </div>
</section>
<section class="alt">
  <div class="container wide two-col">
    <div>
      <p class="eyebrow">Step 4</p>
      <h2>HARDWARE <span class="hl">FINISHES</span></h2>
      <p class="sub">Door hardware, grab bars, shower heads, and towel bars all come in the same four finishes, so everything matches.</p>
      <ul class="tick-list">${DESIGN.finishes.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <h3 style="margin-top:28px;">ACCESSORIES</h3>
      <ul class="tick-list">${DESIGN.accessories.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <p style="margin-top:22px;"><a class="btn" href="#estimate">Book My Free Design Visit</a></p>
    </div>
    <div>
      <img class="rounded-img" src="/assets/img/door-hardware-closeup.jpg" alt="Matte black sliding shower door hardware" loading="lazy" />
      <p style="color:var(--stone);font-size:14px;margin-top:12px;">Matte black bypass hardware on a Denali sliding door.</p>
    </div>
  </div>
</section>
<section>
  <div class="container wide">
    <h2>SEE IT <span class="hl">INSTALLED</span></h2>
    <div class="grid cols-2">
      ${[['gallery-tundra.jpg', 'PuroStone Tundra walk-in shower with frameless glass'], ['gallery-sahara.jpg', 'PuroStone Sahara shower with hand-held fixture'], ['gallery-brown-marble.jpg', 'Brown marble wall system with sliding door'], ['gallery-gray-marble.jpg', 'Gray marble walk-in shower with built-in shelves']]
        .map(([f, alt]) => `<figure style="margin:0;"><img class="rounded-img" src="/assets/img/${f}" alt="${esc(alt)}" loading="lazy" /><figcaption style="color:var(--stone);font-size:14px;margin-top:8px;">${esc(alt)}</figcaption></figure>`)
        .join('')}
    </div>
    <p style="color:var(--stone);font-size:13px;margin-top:18px;">Colors on screen are approximate; the free design visit brings real samples to your bathroom.</p>
  </div>
</section>
${leadForm('design-options')}`;

// ---------- build ------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.cpSync(path.join(__dirname, 'assets'), path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'src/styles.css'), path.join(OUT, 'assets/styles.css'));
fs.copyFileSync(path.join(__dirname, 'src/main.js'), path.join(OUT, 'assets/main.js'));
fs.writeFileSync(path.join(OUT, 'assets/ballpark-config.js'), `window.BT_BALLPARK = ${JSON.stringify(BALLPARK)};\nwindow.BT_DESIGNER = ${JSON.stringify(DESIGNER)};`);

// Stamp every local image URL with the build version. Without it a browser
// keeps serving the copy it cached the first time, so swapping a photo or the
// mascot looks like "nothing changed" until a hard refresh.
const bustImages = (html) => html.replace(/\/assets\/img\/([A-Za-z0-9_\-./]+?\.(?:jpg|jpeg|png|webp|svg))(\?v=[A-Za-z0-9]+)?/g, `/assets/img/$1?v=${V}`);

const write = (url, html) => {
  const dir = path.join(OUT, url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), bustImages(html));
};

const urls = [];
const add = (url, opts) => {
  urls.push(url);
  write(url, page({ url, ...opts }));
};

add('/', {
  title: 'Buddy Baths | One-Day Showers & Custom Bathroom Remodels | Vancouver WA & Portland OR',
  description:
    'Bathroom remodeling two ways: a new shower in as little as one day, or a custom tile shower and full bathroom remodel built by hand. Vancouver WA and Portland OR. Free in-home design visits. A Buddy Built company.',
  jsonLd: businessLd(),
  body: homeBody,
});
for (const P of Object.values(PATHS)) {
  add(P.url, { title: P.metaTitle, description: P.metaDescription, jsonLd: businessLd(), body: siteBody(P), path: P.key });
}

for (const s of SERVICES) {
  add(`/services/${s.slug}/`, {
    title: s.metaTitle,
    description: s.metaDescription,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: s.h1,
        description: s.metaDescription,
        provider: businessLd(),
        areaServed: CITIES.map((c) => `${c.name}, ${c.state}`),
      },
      faqLd(s.faqs),
    ],
    body: servicePage(s),
    path: s.path,
  });
  // One page per service per city, the long-tail matrix
  for (const c of CITIES) {
    add(`/services/${s.slug}/${c.slug}/`, {
      title: `${s.name} in ${c.name}, ${c.state} | Buddy Baths`,
      description: `${s.name} for ${c.name}, ${c.state} homeowners, free in-home estimates, licensed & bonded. ${s.metaDescription}`.slice(0, 300),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `${s.h1} in ${c.name}, ${c.state}`,
          description: s.metaDescription,
          provider: businessLd(),
          areaServed: { '@type': 'City', name: `${c.name}, ${c.state}` },
        },
        faqLd(s.faqs),
      ],
      body: serviceCityPage(s, c),
      path: s.path,
    });
  }
}

for (const c of CITIES) {
  add(`/shower-remodel/${c.slug}/`, {
    title: `Bathroom Remodeling in ${c.name}, ${c.state} | One-Day Showers & Custom Tile | Buddy Baths`,
    description: `Buddy Baths installs one-day shower systems and hand-built custom tile bathrooms in ${c.name}, ${c.state}: shower replacements, tub-to-shower conversions, tile showers, heated floors, full remodels. Free in-home estimates, a Buddy Built company.`,
    jsonLd: businessLd({ areaServed: { '@type': 'City', name: `${c.name}, ${c.state}` } }),
    body: cityPage(c),
  });
}

if (PROJECTS.length) add('/projects/', {
  title: `Our Work, Real One-Day Shower Projects in Vancouver WA & Portland OR | ${SITE.name}`,
  description:
    'Real shower replacements and tub conversions photographed by the crews that installed them. Vancouver WA and Portland OR.',
  jsonLd: businessLd(),
  body: projectsIndexBody,
});
for (const pr of PROJECTS) {
  add(`/projects/${pr.slug}/`, {
    title: `${pr.title}${pr.city ? `, ${pr.city}, ${pr.state}` : ''} | ${SITE.name} Project`,
    description: `${pr.title}: a real ${SITE.name} project${pr.city ? ` in ${pr.city}, ${pr.state}` : ''}${pr.completed ? `, completed ${monthYear(pr.completed)}` : ''}, with the crew's own photos.`,
    jsonLd: [
      businessLd(),
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: pr.title,
        description: pr.city ? `Shower project in ${pr.city}, ${pr.state}` : `A real ${SITE.name} shower project`,
        image: pr.photos.map((ph) => `${SITE.domain}/assets/img/projects/${ph.file}`),
      },
    ],
    body: projectPage(pr),
  });
}


const payBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Make a Payment</div>
<section style="padding-top:26px;">
  <div class="container" style="max-width:640px;">
    <h1>MAKE A <span class="hl">PAYMENT</span></h1>
    <p class="lead">Pay your deposit or invoice online. Enter your invoice number and the email we have on file, and we'll send your secure payment page, card or Zelle.</p>
    <form id="pay-lookup" class="lead-form" style="max-width:520px;">
      <input name="number" placeholder="Invoice number *" required maxlength="40" />
      <input name="email" type="email" placeholder="Email on the invoice *" required maxlength="200" />
      <button class="btn full" type="submit">Email Me My Payment Link</button>
      <p class="form-status" hidden></p>
      <p class="form-note" style="color:var(--stone);">Your invoice number is at the top of the invoice we emailed you. The payment page is private to you, that's why we send it to your email instead of showing it here.</p>
    </form>
    <div style="margin-top:34px;border-top:1px solid var(--line);padding-top:22px;">
      <h3>PREFER TO TALK TO A PERSON?</h3>
      <p style="color:var(--stone);">Call <a href="tel:${SITE.phone.replace(/[^0-9+]/g, '')}" style="font-weight:700;">${SITE.phone}</a> and we'll take your payment over the phone or answer anything about your invoice. Card, Zelle, or check, whatever is easiest for you.</p>
    </div>
  </div>
</section>`;

add('/pay/', {
  title: 'Make a Payment | Buddy Baths',
  description:
    'Pay your Buddy Baths deposit or invoice online, card or Zelle. Enter your invoice number and we email your secure payment link.',
  jsonLd: null,
  body: payBody,
});

if (POSTS.length) {
  const blogIndexBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Bath Talk</div>
<section style="padding-top:26px;">
  <div class="container">
    <h1>FENCE <span class="hl">TALK</span></h1>
    <p class="lead" style="max-width:720px;">Straight answers about one-day showers, tub conversions, and grout-free walls, written by the people who do the installs. No fluff, real prices, real photos.</p>
    <div class="grid cols-3" style="margin-top:22px;">
      ${POSTS.map(
        (p) => `<a class="card" href="/blog/${p.slug}/"><div class="body"><h3>${esc(p.title.toUpperCase())}</h3><p>${esc(p.excerpt || '')}</p><div class="go">Read it →</div></div></a>`
      ).join('')}
    </div>
  </div>
</section>
${leadForm('blog')}`;

  add('/blog/', {
    title: `Bath Talk, Advice From the Crew | ${SITE.name}`,
    description:
      'Straight answers about one-day showers, tub-to-shower conversions, and grout-free wall systems from a working install crew in Vancouver WA and Portland OR.',
    jsonLd: businessLd(),
    body: blogIndexBody,
  });

  for (const p of POSTS) {
    add(`/blog/${p.slug}/`, {
      title: `${p.title} | ${SITE.name}`,
      description: (p.excerpt || p.title).slice(0, 300),
      jsonLd: [
        businessLd(),
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: p.title,
          description: p.excerpt || undefined,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt || p.publishedAt,
          author: { '@type': 'Organization', name: SITE.name },
          publisher: { '@type': 'Organization', name: SITE.name },
          mainEntityOfPage: `${SITE.domain}/blog/${p.slug}/`,
        },
      ],
      body: `
<div class="container breadcrumbs"><a href="/">Home</a> / <a href="/blog/">Bath Talk</a> / ${esc(p.title)}</div>
<section style="padding-top:26px;">
  <div class="container" style="max-width:760px;">
    <h1>${esc(p.title.toUpperCase())}</h1>
    <p style="color:var(--stone);font-size:14px;">${postDate(p.publishedAt)} · ${SITE.name}</p>
    <div class="post-body">${mdToHtml(p.bodyMd)}</div>
    <p style="margin-top:30px;"><a class="btn" href="#estimate">Get My Free Estimate</a></p>
  </div>
</section>
${leadForm('blog-post')}`,
    });
  }
}




const privacyBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Privacy Policy</div>
<section style="padding-top:26px;">
  <div class="container" style="max-width:760px;">
    <h1>PRIVACY POLICY</h1>
    <hr class="gold-bar" />
    <p style="color:var(--stone);font-size:14px;">Effective August 4, 2026 · Buddy Baths, a registered trade name of Buddy Built LLC</p>

    <h3 style="margin-top:28px;">WHAT WE COLLECT</h3>
    <p>When you request an estimate (on buddybaths.com, by phone, or through a Facebook or Instagram lead form), we collect the information you provide: your name, phone number, email, project address, and details about your project. Our website keeps standard server logs; we do not run third-party advertising trackers on buddybaths.com.</p>

    <h3>HOW WE USE IT</h3>
    <p>We use your information to respond to your request, schedule visits, prepare and deliver estimates, send appointment reminders and project updates, and provide the services you hire us for. If you provide your phone number, we may call or text you about your project; reply STOP to any text to opt out. Message and data rates may apply.</p>

    <h3>WHAT WE NEVER DO</h3>
    <p>We never sell your personal information, and we never share it with other contractors or lead-generation networks. You contacted Buddy Baths; only Buddy Baths (and the Buddy Built family it belongs to) will contact you.</p>

    <h3>WHO WE SHARE IT WITH</h3>
    <p>Your information lives in our own project-management system and is shared only with the service providers that make our business run, such as email and text-message delivery services and payment processors, and with our crews as needed to perform your work, or where the law requires it.</p>

    <h3>FACEBOOK &amp; INSTAGRAM LEAD FORMS</h3>
    <p>If you submit a Meta lead form, Meta transmits your responses to us and also processes them under its own <a href="https://www.facebook.com/privacy/policy/" rel="noopener">Data Policy</a>. We use those responses only as described above.</p>

    <h3>RETENTION &amp; YOUR RIGHTS</h3>
    <p>We keep project records as long as needed to honor warranties and meet legal obligations. You may request a copy of the personal information we hold about you, ask us to correct it, or ask us to delete it (where the law doesn't require us to keep it) by emailing <a href="mailto:${SITE.email}">${SITE.email}</a> or calling <a href="tel:${SITE.phone.replace(/[^0-9+]/g, '')}">${SITE.phone}</a>.</p>

    <h3>CHANGES</h3>
    <p>If we update this policy, the new version will be posted here with a new effective date.</p>

    <p style="margin-top:24px;color:var(--stone);font-size:14px;">${SITE.legalLine}</p>
  </div>
</section>`;

add('/privacy/', {
  title: 'Privacy Policy | Buddy Baths',
  description:
    'How Buddy Baths collects and uses your information: only to deliver your project. Never sold, never shared with other contractors.',
  jsonLd: null,
  body: privacyBody,
});


add('/design-options/', {
  path: 'one-day',
  title: 'Shower Design Options: Wall Colors, Tile Patterns, Glass & Hardware | Buddy Baths',
  description:
    'Design your one-day shower: PuroStone engineered stone, 30 grout-free wall colors, 17 laser-etched tile patterns, four glass finishes, and four hardware finishes. Vancouver WA and Portland OR.',
  jsonLd: businessLd(),
  body: designBody,
});




// ---- /book/: the booking calendar as a page (ads, emails, the footer link) ----
const bookBody = `
<div class="container breadcrumbs"><a href="/">Home</a> / Book a Visit</div>
<section class="book-page" style="padding-top:26px;">
  <div class="container two-col">
    <div>
      <h1>BOOK YOUR FREE <span class="hl">IN-HOME</span> ESTIMATE</h1>
      <hr class="gold-bar" />
      <p class="lead">Pick a day and time that works for you, tell us a little about your bathroom, and your designer shows up with the samples. Your written price arrives the same day.</p>
      <ul class="steps">
        <li>${iconCircle('calendar')}<div><strong>Pick a time</strong><span>Open times for the next few weeks, Monday through Friday. Takes ten seconds.</span></div></li>
        <li>${iconCircle('mail')}<div><strong>We confirm by email</strong><span>Who is coming, when, and a short video on what to expect at the visit.</span></div></li>
        <li>${iconCircle('ruler')}<div><strong>The visit</strong><span>About an hour. We measure the space, go through wall, glass, and hardware options, and leave you a written price. No pressure, ever.</span></div></li>
      </ul>
      <p style="margin-top:22px;">Rather talk it through? Call <a href="${telHref()}"><strong>${SITE.phone}</strong></a> and we will book it with you on the phone.</p>
    </div>
    <div class="estimate-card">
      <p class="eyebrow">Free Estimate</p>
      <h3 style="margin:0 0 12px;">Pick a time, tell us about the project.</h3>
      ${estimateForm('book', { book: 'open' })}
    </div>
  </div>
</section>`;

add('/book/', {
  title: 'Book Your Free In-Home Estimate | Buddy Baths',
  description:
    'Pick a day and time for your free in-home shower or bathroom estimate in Vancouver, WA or Portland, OR. Live calendar, instant confirmation, written price the same day.',
  jsonLd: businessLd(),
  body: bookBody,
});

add('/about/', {
  title: 'About Buddy Baths, a Buddy Built Company',
  description:
    'Buddy Baths is the one-day shower division of Buddy Built one standard, one warranty, one number. Meet the family of home-service brands built for your home.',
  jsonLd: businessLd(),
  body: aboutBody,
});

// sitemap + robots
fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.domain}${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.domain}/sitemap.xml\n`);
// GitHub Pages: custom domain + skip Jekyll processing
fs.writeFileSync(path.join(OUT, 'CNAME'), 'buddybaths.com\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Built ${urls.length} pages → docs/`);
