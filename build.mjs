// Teethline static site generator. Zero dependencies.
// Usage: node src/build.mjs   (from the site folder)
// Output: dist/  — every page is real HTML, readable by Google, Bing and AI crawlers.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SITE, CLINICS, AREAS, GUIDES, FAQS, SAFETY } from './content.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const learned = readJson(path.join(ROOT, 'content/learned.json'), { faqs: [], notes: [], commonProblems: [], updated: null });
const INDEXNOW_KEY = 'b7c4e2f19a6d4e0c8f3a5b1d2e9c7a64';

const pages = []; // {path, title, description, text}
const byId = Object.fromEntries(CLINICS.map((c) => [c.id, c]));
const allFaqs = [...FAQS, ...(learned.faqs || []).map((f) => [f.q, f.a])];

function readJson(p, d) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } }
function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function strip(html) { return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
function miles(a, b) {
  const r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(s));
}
function niceDate(iso) { return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
const bookUrl = (c) => c.book + (SITE.bookUtm || '');
const bookBtn = (c, label, cls = 'btn') => `<a class="${cls}" href="${bookUrl(c)}" rel="noopener" data-book="${c.id}">${label || `Book at ${c.name.replace(' Dental Practice', '')}`}</a>`;
const RED_FLAG = `<p class="small redflag">Swelling affecting your breathing, swallowing or eye, or bleeding that won't stop? <strong>Call 999</strong>, don't book.</p>`;
const mapsUrl = (c) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.street}, ${c.city} ${c.postcode}`)}`;
const fullAddr = (c) => `${c.street}, ${c.city}, ${c.postcode}`;

// ---------- structured data ----------
const DAYMAP = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
const ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
function expandDays(spec) {
  const [a, b] = spec.split('-');
  if (!b) return [DAYMAP[a]];
  return ORDER.slice(ORDER.indexOf(a), ORDER.indexOf(b) + 1).map((d) => DAYMAP[d]);
}
function dentistLd(c) {
  return {
    '@type': 'Dentist',
    '@id': `${SITE.url}/clinics/${c.slug}/#dentist`,
    name: c.name,
    url: `${SITE.url}/clinics/${c.slug}/`,
    telephone: c.phone,
    address: { '@type': 'PostalAddress', streetAddress: c.street, addressLocality: c.city, addressRegion: c.region, postalCode: c.postcode, addressCountry: 'GB' },
    geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng },
    openingHoursSpecification: c.hours.map(([d, o, cl]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: expandDays(d), opens: o, closes: cl })),
    medicalSpecialty: 'Dentistry',
    availableService: [{ '@type': 'MedicalProcedure', name: 'Urgent NHS dental treatment' }],
    isAcceptingNewPatients: false,
    priceRange: `NHS urgent treatment ${SITE.urgentCharge}`,
    areaServed: c.nearby.map((n) => ({ '@type': 'Place', name: n })),
    sameAs: [c.nhsUrl, c.cqcUrl],
    identifier: { '@type': 'PropertyValue', propertyID: 'NHS ODS code', value: c.ods },
    parentOrganization: { '@id': `${SITE.url}/#org` },
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'Book an emergency NHS dental appointment',
      target: { '@type': 'EntryPoint', urlTemplate: bookUrl(c), actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
    },
  };
}
const ORG_LD = {
  '@type': 'MedicalOrganization',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  description: 'Free triage and referral service that sends your dental symptoms straight to an NHS dental practice in Leeds, Bradford or Ripon.',
  email: SITE.email,
  legalName: SITE.operator,
  areaServed: ['Leeds', 'Bradford', 'Ripon', 'Harrogate', 'West Yorkshire', 'North Yorkshire'],
  subOrganization: CLINICS.map((c) => ({ '@id': `${SITE.url}/clinics/${c.slug}/#dentist` })),
};
function faqLd(list) {
  return { '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
}
function crumbsLd(trail) {
  return { '@type': 'BreadcrumbList', itemListElement: trail.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + url })) };
}

// ---------- shared fragments ----------
const CSS = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const CSS_HASH = crypto.createHash('md5').update(CSS).digest('hex').slice(0, 8);

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap row">
<a class="logo" href="/" aria-label="Teethline home"><span class="dot"></span>Teethline</a>
<nav aria-label="Main"><a href="/clinics/">Clinics</a><a href="/guides/">Guides</a><a href="/nhs-urgent-dental-charges/">Costs</a><a href="/faq/">FAQ</a></nav>
<a class="btn sm" href="/#book" data-cta="header">Book emergency slot</a>
</div></header>`;
}
function safetyBox() {
  return `<aside class="safety" aria-label="When to call 999 or NHS 111">
<div><h2>Call 999 or go to A&amp;E if you have:</h2><ul>${SAFETY.call999.map((s) => `<li>${s}</li>`).join('')}</ul></div>
<div><h2>Call NHS 111 if:</h2><ul>${SAFETY.call111.map((s) => `<li>${s}</li>`).join('')}</ul></div>
</aside>`;
}
function clinicCard(c, extra = '') {
  return `<article class="card clinic">
<h3><a href="/clinics/${c.slug}/">${c.name}</a></h3>
<p class="muted">${c.area}, ${c.city}${extra}</p>
<p>${esc(fullAddr(c))}</p>
<p><a class="tel" href="tel:${c.tel}" data-call="${c.id}">${c.phone}</a></p>
<p class="small">${c.hoursText}</p>
<p>${bookBtn(c, 'Book an emergency slot', 'btn sm')}</p>
</article>`;
}
function ctaBox(title = 'Need an urgent NHS dentist?') {
  return `<section class="cta-box">
<h2>${title}</h2>
<p>Book an emergency NHS appointment online. Slots are released every working day, Monday to Friday, and you don't need to be registered.</p>
<p class="bookrow">${CLINICS.map((c) => bookBtn(c, `${c.city} · ${c.area}`, 'btn light')).join(' ')}</p>
<p class="small">No slot that suits you? <a href="/triage/" data-cta="box">Send your symptoms</a> and the practice will call you back. Or phone: ${CLINICS.map((c) => `<a href="tel:${c.tel}" data-call="${c.id}">${c.city} ${c.phone}</a>`).join(' · ')}</p>
</section>`;
}
function footer() {
  return `<footer class="foot"><div class="wrap">
<div class="grid3">${CLINICS.map((c) => `<div><strong><a href="/clinics/${c.slug}/">${c.name}</a></strong><br>${esc(fullAddr(c))}<br><a href="tel:${c.tel}" data-call="${c.id}">${c.phone}</a></div>`).join('')}</div>
<p class="small">Teethline is a free triage and referral service run by ${SITE.operator} (ICO ${SITE.ico}). It is not part of the NHS. Partner practices are NHS-contracted and CQC-registered. Urgent NHS dental treatment in England costs ${SITE.urgentCharge} unless you are exempt.</p>
<p class="small"><a href="/about/">About</a> · <a href="/guides/">Guides</a> · <a href="/faq/">FAQ</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/accessibility/">Accessibility</a></p>
</div></footer>`;
}

function layout({ url, title, description, body, ld = [], type = 'website' }) {
  const canonical = SITE.url + url;
  const graph = { '@context': 'https://schema.org', '@graph': [ORG_LD, { '@type': 'WebSite', '@id': `${SITE.url}/#site`, url: SITE.url, name: SITE.name, publisher: { '@id': `${SITE.url}/#org` } }, ...ld] };
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta name="theme-color" content="#F5F0E6">
${SITE.googleVerification ? `<meta name="google-site-verification" content="${SITE.googleVerification}">` : ''}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Teethline">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt">
<link rel="stylesheet" href="/assets/site-${CSS_HASH}.css">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
<script defer src="/t.js"></script>
</head>
<body>
${header()}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>`;
}

function emit(url, opts) {
  const html = layout({ url, ...opts });
  const dir = path.join(DIST, url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push({ path: url, title: opts.title, description: opts.description, text: strip(opts.body) });
}
function crumbs(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${trail.map(([n, u], i) => (i < trail.length - 1 ? `<a href="${u}">${n}</a> › ` : `<span>${n}</span>`)).join('')}</nav>`;
}
function faqHtml(list) {
  return `<div class="faq">${list.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
}
function reviewed() {
  return `<p class="small muted">Last reviewed ${niceDate(SITE.reviewed)}. Based on NHS guidance. This page is general information, not a diagnosis.</p>`;
}

// ---------- reset dist ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DIST, `assets/site-${CSS_HASH}.css`), CSS);

// ---------- home ----------
{
  const common = (learned.commonProblems || []).length
    ? `<p class="small muted">Most common reasons people used Teethline recently: ${learned.commonProblems.map(esc).join(', ')}.</p>` : '';
  emit('/', {
    title: 'Urgent NHS Dentist in Leeds, Bradford & Ripon | Teethline',
    description: `Need an urgent NHS dentist? Teethline sends your symptoms straight to an NHS practice in Leeds, Bradford or Ripon. Free to use. NHS urgent treatment ${SITE.urgentCharge}.`,
    ld: [faqLd(allFaqs), ...CLINICS.map(dentistLd)],
    body: `
<section class="hero"><div class="wrap">
<p class="kicker">NHS urgent dental care · West &amp; North Yorkshire</p>
<h1>Urgent NHS dentist in Leeds, Bradford and Ripon</h1>
<p class="lede"><strong>In dental pain and can't find an NHS dentist?</strong> Book an emergency NHS appointment online at one of our three practices. Slots are released every working day, and you don't need to be registered. Urgent NHS treatment costs ${SITE.urgentCharge} unless you're exempt.</p>
<div id="book" class="bookpick">${CLINICS.map((c) => `<a class="bookopt" href="${bookUrl(c)}" rel="noopener" data-book="${c.id}"><strong>${c.city}</strong><span>${c.name}, ${c.area}</span><span class="go">Book emergency slot →</span></a>`).join('')}</div>
${RED_FLAG}
<p class="small">No slot that suits you, or not sure how urgent it is? <a href="/triage/" data-cta="hero">Send your symptoms (2 minutes)</a> and the practice will call you back.</p>
<ul class="facts"><li>Emergency slots every working day</li><li>No registration needed</li><li>Book online</li><li>Under-18s treated free</li></ul>
</div></section>
<div class="wrap">
${safetyBox()}
<section><h2>Two ways to get seen</h2>
<ol class="steps"><li><strong>Book an emergency slot online.</strong> Each practice releases emergency NHS appointments every working day. Pick your practice above and choose a time.</li>
<li><strong>Or send your symptoms.</strong> Our <a href="/triage/" data-cta="how">2-minute triage</a> goes straight to the practice's NHS inbox, flags how urgent it is, and the practice calls you back.</li></ol>
<p class="small">Emergency slots and callbacks are Monday to Friday only. Evenings, weekends and bank holidays: call NHS 111.</p></section>
<section id="clinics"><h2>Our NHS practices</h2><div class="grid3">${CLINICS.map((c) => clinicCard(c)).join('')}</div></section>
<section><h2>What to do right now</h2><div class="grid3">${GUIDES.map((g) => `<a class="card link" href="/guides/${g.slug}/"><strong>${g.short}</strong><span class="small muted">${esc(g.answer.split('. ')[0])}.</span></a>`).join('')}</div></section>
${common}
<section><h2>Common questions</h2>${faqHtml(allFaqs)}</section>
${ctaBox()}
</div>`,
  });
}

// ---------- clinics ----------
emit('/clinics/', {
  title: 'Our NHS Dental Practices in Leeds, Bradford & Ripon | Teethline',
  description: 'Addresses, phone numbers and opening hours for our three NHS dental practices: Corner House (Moortown, Leeds), A One (Thornbury, Bradford) and Bridge House (Ripon).',
  ld: [crumbsLd([['Home', '/'], ['Clinics', '/clinics/']]), ...CLINICS.map(dentistLd)],
  body: `<div class="wrap">${crumbs([['Home', '/'], ['Clinics', '/clinics/']])}
<h1>Our NHS dental practices</h1>
<p class="lede">Three NHS-contracted, CQC-registered practices, all run by ${SITE.provider}. Each one offers urgent NHS appointments when slots are available.</p>
<div class="grid3">${CLINICS.map((c) => clinicCard(c)).join('')}</div>
${ctaBox()}</div>`,
});

for (const c of CLINICS) {
  const others = CLINICS.filter((o) => o.id !== c.id);
  const qa = [
    [`How do I get an urgent appointment at ${c.name}?`, `Book an emergency slot online at <a href="${bookUrl(c)}">${c.book.replace('https://', '').replace(/\/$/, '')}</a>. Slots are released every working day, Monday to Friday, for registered and unregistered patients. If none suit you, send your symptoms through the Teethline triage or phone ${c.phone}.`],
    [`What are ${c.name}'s opening hours?`, c.hoursText + ' Out of hours, call NHS 111.'],
    [`Is ${c.name} taking new NHS patients?`, `For routine care, check the practice's <a href="${c.nhsUrl}">nhs.uk page</a> for the latest status. Urgent NHS appointments are offered to anyone, registered or not, when slots are available.`],
    [`How much is an urgent appointment at ${c.name}?`, `${SITE.urgentCharge} on the NHS (Band 1), or free if you are exempt. Any further treatment is charged at the normal NHS band.`],
  ];
  const trail = [['Home', '/'], ['Clinics', '/clinics/'], [c.name, `/clinics/${c.slug}/`]];
  emit(`/clinics/${c.slug}/`, {
    title: `${c.name}, ${c.area} ${c.city} – Urgent NHS Dentist | Teethline`,
    description: `${c.name}, ${fullAddr(c)}. Urgent NHS dental appointments. Phone ${c.phone}. ${c.hoursText}`,
    ld: [dentistLd(c), faqLd(qa), crumbsLd(trail)],
    body: `<div class="wrap">${crumbs(trail)}
<h1>${c.name}: urgent NHS dentist in ${c.area}, ${c.city}</h1>
<p class="lede">${c.blurb} Emergency NHS slots are released every working day and anyone can book, registered or not.</p>
<p>${bookBtn(c, `Book an emergency slot at ${c.name.replace(' Dental Practice', '')}`, 'btn lg')}</p>
${RED_FLAG}
<p class="small">No suitable slot? <a href="/triage/" data-cta="clinic-${c.id}">Send your symptoms</a> and the practice will call you, or phone <a href="tel:${c.tel}" data-call="${c.id}">${c.phone}</a>.</p>
<table class="kv"><tbody>
<tr><th>Address</th><td>${esc(fullAddr(c))} · <a href="${mapsUrl(c)}" rel="noopener">Directions</a></td></tr>
<tr><th>Book online</th><td><a href="${bookUrl(c)}" rel="noopener" data-book="${c.id}">Emergency appointments, Monday to Friday</a></td></tr>
<tr><th>Phone</th><td><a href="tel:${c.tel}" data-call="${c.id}">${c.phone}</a></td></tr>
<tr><th>Opening hours</th><td>${c.hoursText}</td></tr>
<tr><th>Urgent NHS charge</th><td>${SITE.urgentCharge} (free if exempt)</td></tr>
<tr><th>Registration</th><td>Not needed for urgent care</td></tr>
<tr><th>NHS practice code</th><td>${c.ods} · <a href="${c.nhsUrl}" rel="noopener">nhs.uk profile</a></td></tr>
<tr><th>Regulator</th><td><a href="${c.cqcUrl}" rel="noopener">Care Quality Commission report</a></td></tr>
<tr><th>Run by</th><td>${SITE.provider}</td></tr>
</tbody></table>
<h2>Patients come to us from</h2><p>${c.nearby.join(', ')}.</p>
${ctaBox(`Get an urgent appointment at ${c.name}`)}
${safetyBox()}
<h2>Questions about ${c.name}</h2>${faqHtml(qa)}
<h2>Our other practices</h2><div class="grid3">${others.map((o) => clinicCard(o, ` · ${miles(c, o).toFixed(0)} miles away`)).join('')}</div>
</div>`,
  });
}

// ---------- areas ----------
for (const a of AREAS) {
  const ranked = CLINICS.map((c) => ({ c, d: miles(a, c) })).sort((x, y) => x.d - y.d);
  const main = byId[a.clinic];
  const trail = [['Home', '/'], [`Emergency dentist ${a.town}`, `/${a.slug}/`]];
  const qa = [
    [`How do I find an emergency NHS dentist in ${a.town}?`, `Book an emergency slot online at ${main.name}${a.alt ? ` or ${byId[a.alt].name}` : ''}. Slots are released every working day, Monday to Friday, and you do not need to be registered. You can also send your symptoms through the Teethline triage, or phone the practice. Out of hours, call NHS 111.`],
    [`How much does an emergency dentist cost in ${a.town}?`, `On the NHS, urgent treatment costs ${SITE.urgentCharge} in England (since ${SITE.chargeSince}), or is free if you are exempt. Private emergency appointments usually cost more.`],
    [`Is there an emergency dentist open at the weekend in ${a.town}?`, `Our practices are open Monday to Friday. At weekends and in the evening, call NHS 111, which can book you into an out-of-hours urgent dental service.`],
  ];
  emit(`/${a.slug}/`, {
    title: `Emergency NHS Dentist ${a.town} – Urgent Appointments | Teethline`,
    description: `Need an emergency NHS dentist in ${a.town}? Our nearest practice is ${main.name} (${main.phone}). Send your symptoms in 2 minutes. NHS urgent treatment ${SITE.urgentCharge}.`,
    ld: [faqLd(qa), crumbsLd(trail), dentistLd(main)],
    body: `<div class="wrap">${crumbs(trail)}
<h1>Emergency NHS dentist in ${a.town}</h1>
<p class="lede"><strong>Quick answer:</strong> ${a.intro} You can <a href="${bookUrl(main)}" rel="noopener" data-book="${main.id}">book an emergency NHS slot online</a>. Slots are released every working day and you don't need to be registered. You can also <a href="/triage/" data-cta="area-${a.slug}">send your symptoms</a> for a callback, or phone <a href="tel:${main.tel}" data-call="${main.id}">${main.phone}</a>. Urgent NHS treatment costs ${SITE.urgentCharge}.</p>
<p>${bookBtn(main, `Book an emergency slot at ${main.name.replace(' Dental Practice', '')}`, 'btn lg')}${a.alt ? ' ' + bookBtn(byId[a.alt], `Or ${byId[a.alt].name.replace(' Dental Practice', '')}, ${byId[a.alt].city}`, 'btn ghost') : ''}</p>
${RED_FLAG}
<h2>Nearest Teethline practices to ${a.town}</h2>
<div class="grid3">${ranked.map(({ c, d }) => clinicCard(c, ` · about ${d < 1.5 ? '1' : d.toFixed(0)} mile${d < 1.5 ? '' : 's'} from ${a.town} centre`)).join('')}</div>
${safetyBox()}
<h2>Common dental emergencies</h2><ul>${GUIDES.slice(0, 7).map((g) => `<li><a href="/guides/${g.slug}/">${g.short}</a></li>`).join('')}</ul>
<h2>Questions</h2>${faqHtml(qa)}
${ctaBox()}</div>`,
  });
}

// ---------- guides ----------
emit('/guides/', {
  title: 'Dental Emergency Guides: What to Do Now | Teethline',
  description: 'Clear, NHS-based advice for toothache, abscesses, knocked-out and broken teeth, lost fillings, bleeding after extractions and children’s dental emergencies.',
  ld: [crumbsLd([['Home', '/'], ['Guides', '/guides/']])],
  body: `<div class="wrap">${crumbs([['Home', '/'], ['Guides', '/guides/']])}
<h1>Dental emergency guides</h1><p class="lede">What to do right now, how urgent it is, and when to call 999 or NHS 111.</p>
<div class="grid3">${GUIDES.map((g) => `<a class="card link" href="/guides/${g.slug}/"><strong>${g.short}</strong><span class="small muted">${esc(g.answer.split('. ')[0])}.</span></a>`).join('')}</div>
${safetyBox()}</div>`,
});
for (const g of GUIDES) {
  const trail = [['Home', '/'], ['Guides', '/guides/'], [g.short, `/guides/${g.slug}/`]];
  const extra = (learned.guideNotes || {})[g.slug];
  emit(`/guides/${g.slug}/`, {
    title: `${g.title} | Teethline`,
    description: g.answer.slice(0, 155).replace(/\s\S*$/, '') + '…',
    type: 'article',
    ld: [{
      '@type': 'MedicalWebPage', '@id': `${SITE.url}/guides/${g.slug}/#page`, name: g.title, url: `${SITE.url}/guides/${g.slug}/`,
      lastReviewed: SITE.reviewed, audience: { '@type': 'PeopleAudience', geographicArea: { '@type': 'AdministrativeArea', name: 'England' } },
      publisher: { '@id': `${SITE.url}/#org` }, inLanguage: 'en-GB', abstract: g.answer,
    }, faqLd([[g.title.split(':')[0] + '?', g.answer]]), crumbsLd(trail)],
    body: `<div class="wrap narrow">${crumbs(trail)}
<h1>${g.title}</h1>
<div class="answer"><p><strong>Quick answer:</strong> ${g.answer}</p></div>
${g.body}
${extra ? `<h2>What patients ask us</h2><p>${extra}</p>` : ''}
${safetyBox()}
${ctaBox()}
${reviewed()}
<p class="small">Sources: <a href="https://www.nhs.uk/nhs-services/dentists/how-to-get-urgent-or-emergency-dental-care/">NHS: urgent and emergency dental care</a> · <a href="https://www.nhs.uk/nhs-services/dentists/dental-costs/">NHS dental charges</a></p>
</div>`,
  });
}

// ---------- charges ----------
{
  const qa = [
    ['How much is an emergency NHS dentist?', `${SITE.urgentCharge} in England since ${SITE.chargeSince}. Urgent treatment is charged at the Band 1 rate.`],
    ['What does the urgent charge cover?', 'An examination, X-rays if needed, and treatment to stabilise the problem, such as a dressing or temporary filling, draining an abscess, or in some cases an extraction.'],
    ['Who gets free NHS dental treatment?', 'Under-18s, under-19s in full-time education, people who are pregnant or have had a baby in the last 12 months, NHS inpatients treated by a hospital dentist, and people receiving certain benefits such as Income Support, income-related JSA or ESA, Pension Credit Guarantee Credit or Universal Credit (within earnings limits), or with an HC2 certificate.'],
  ];
  emit('/nhs-urgent-dental-charges/', {
    title: `NHS Emergency Dentist Cost 2026: ${SITE.urgentCharge} | Teethline`,
    description: `An urgent NHS dental appointment in England costs ${SITE.urgentCharge} (Band 1) from ${SITE.chargeSince}. See all NHS dental bands and who gets free treatment.`,
    ld: [faqLd(qa), crumbsLd([['Home', '/'], ['NHS charges', '/nhs-urgent-dental-charges/']])],
    body: `<div class="wrap narrow">${crumbs([['Home', '/'], ['NHS charges', '/nhs-urgent-dental-charges/']])}
<h1>How much does an urgent NHS dentist cost?</h1>
<div class="answer"><p><strong>Quick answer:</strong> urgent NHS dental treatment in England costs <strong>${SITE.urgentCharge}</strong> from ${SITE.chargeSince}. It's free for under-18s and other exempt groups. Using Teethline is free.</p></div>
<table class="kv"><thead><tr><th>NHS band (England)</th><th>Charge from ${SITE.chargeSince}</th></tr></thead><tbody>
<tr><td>Urgent treatment</td><td>${SITE.urgentCharge}</td></tr>
<tr><td>Band 1 – check-up, X-rays, scale and polish if needed</td><td>£27.90</td></tr>
<tr><td>Band 2 – fillings, root canal, extractions</td><td>£76.60</td></tr>
<tr><td>Band 3 – crowns, dentures, bridges</td><td>£332.10</td></tr>
</tbody></table>
<p>If your urgent problem needs further treatment, such as a permanent filling or a root canal, you may pay the higher band for that course of treatment. You pay one charge per course, however many visits it takes.</p>
<h2>Questions</h2>${faqHtml(qa)}
${ctaBox()}
<p class="small">Source: <a href="https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-02003">NHS Business Services Authority – current NHS dental charges</a>. Last checked ${niceDate(SITE.reviewed)}.</p></div>`,
  });
}

// ---------- faq ----------
emit('/faq/', {
  title: 'Urgent NHS Dentist FAQ | Teethline',
  description: 'Answers about getting an urgent NHS dentist in Leeds, Bradford and Ripon: registration, cost, callbacks, out-of-hours care and your data.',
  ld: [faqLd(allFaqs), crumbsLd([['Home', '/'], ['FAQ', '/faq/']])],
  body: `<div class="wrap narrow">${crumbs([['Home', '/'], ['FAQ', '/faq/']])}<h1>Frequently asked questions</h1>${faqHtml(allFaqs)}${ctaBox()}</div>`,
});

// ---------- about ----------
emit('/about/', {
  title: 'About Teethline | Who Runs It and How It Works',
  description: `Teethline is run by ${SITE.operator} and works with three NHS dental practices in Leeds, Bradford and Ripon run by ${SITE.provider}.`,
  ld: [crumbsLd([['Home', '/'], ['About', '/about/']])],
  body: `<div class="wrap narrow">${crumbs([['Home', '/'], ['About', '/about/']])}
<h1>About Teethline</h1>
<p class="lede">Teethline exists because finding an NHS dentist when you're in pain shouldn't mean ringing round practice after practice.</p>
<h2>Who runs it</h2>
<p>Teethline is operated by ${SITE.operator}, registered with the Information Commissioner's Office (${SITE.ico}). Our three partner practices, ${CLINICS.map((c) => `<a href="/clinics/${c.slug}/">${c.name}</a>`).join(', ')}, are NHS-contracted, CQC-registered dental practices run by ${SITE.provider}, a dentist practising in the UK since 2006.</p>
<h2>How it works</h2>
<p>You complete a short clinical triage covering safety red flags, pain, swelling, location and timeline. It suggests how urgently you need to be seen and ranks our practices by distance from your postcode. When you submit, the full triage is emailed to the practice's secure NHS mailbox and you receive a confirmation with a reference number. The practice then calls you to arrange an appointment.</p>
<p>The triage does not diagnose you and does not replace NHS 111 or 999. Anyone reporting breathing, swallowing or serious bleeding problems is directed to emergency services before the triage continues.</p>
<h2>Is Teethline part of the NHS?</h2>
<p>No. Teethline is independent and free to use. Treatment at our practices is provided under the practices' NHS contracts at standard NHS charges.</p>
<h2>Your data</h2>
<p>Triage data is stored in the UK (London region) and shared only with the practice you choose. See our <a href="/privacy/">privacy policy</a>.</p>
<h2>Contact</h2><p>Email <a href="mailto:${SITE.email}">${SITE.email}</a>. For clinical questions, please phone the practice directly.</p></div>`,
});

// ---------- triage (SPA) ----------
{
  const assetsDir = path.join(ROOT, 'app');
  const js = fs.readdirSync(assetsDir).find((f) => f.endsWith('.js'));
  const css = fs.readdirSync(assetsDir).find((f) => f.endsWith('.css'));
  fs.copyFileSync(path.join(assetsDir, js), path.join(DIST, 'assets', js));
  fs.copyFileSync(path.join(assetsDir, css), path.join(DIST, 'assets', css));
  const shell = (url, title) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F5F0E6"><title>${title}</title>
<meta name="description" content="Answer a short dental triage and we'll send it straight to an NHS practice in Leeds, Bradford or Ripon.">
<link rel="canonical" href="${SITE.url}${url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script defer src="/t.js"></script>
<script type="module" crossorigin src="/assets/${js}"></script><link rel="stylesheet" crossorigin href="/assets/${css}"></head>
<body><div id="root"><noscript><div style="max-width:640px;margin:40px auto;font-family:sans-serif;padding:0 20px">
<h1>Urgent dental triage</h1><p>The triage needs JavaScript. Please phone a practice instead:</p>
<ul>${CLINICS.map((c) => `<li>${c.name}, ${c.city}: <a href="tel:${c.tel}">${c.phone}</a></li>`).join('')}</ul>
<p>Out of hours call NHS 111. If swelling affects breathing or swallowing, call 999.</p></div></noscript></div></body></html>`;
  fs.mkdirSync(path.join(DIST, 'triage'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'triage/index.html'), shell('/triage/', 'Start your urgent dental triage | Teethline'));
  fs.writeFileSync(path.join(DIST, 'app.html'), shell('/', 'Teethline feedback'));
}

// ---------- legal pages (kept from the live site) ----------
for (const p of ['privacy', 'terms', 'accessibility']) {
  const src = path.join(ROOT, 'legal', `${p}.html`);
  if (!fs.existsSync(src)) continue;
  let html = fs.readFileSync(src, 'utf8');
  if (!html.includes('/t.js')) html = html.replace('</head>', '<script defer src="/t.js"></script>\n</head>');
  fs.mkdirSync(path.join(DIST, p), { recursive: true });
  fs.writeFileSync(path.join(DIST, p, 'index.html'), html);
  pages.push({ path: `/${p}/`, title: p, description: '', text: '' });
}

// ---------- 404 ----------
fs.writeFileSync(path.join(DIST, '404.html'), layout({
  url: '/404', title: 'Page not found | Teethline', description: 'Page not found.',
  body: `<div class="wrap narrow"><h1>Page not found</h1><p>Try the <a href="/">home page</a> or <a href="/triage/">start a triage</a>.</p>${safetyBox()}</div>`,
}).replace('index,follow,max-snippet:-1,max-image-preview:large', 'noindex'));

// ---------- static files ----------
fs.copyFileSync(path.join(ROOT, 'src/t.js'), path.join(DIST, 't.js'));
fs.copyFileSync(path.join(ROOT, 'src/favicon.svg'), path.join(DIST, 'favicon.svg'));
fs.writeFileSync(path.join(DIST, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = pages.filter((p) => !p.path.includes('404'));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...sitemapUrls.map((p) => p.path), '/triage/'].map((u) => `<url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);

// robots.txt is served by a function (to log crawler visits) but a static copy is the fallback.
const ROBOTS = `# Teethline — all search engines and AI assistants are welcome.
User-agent: *
Allow: /
Disallow: /feedback/
Disallow: /.netlify/

# AI search and assistant crawlers (explicitly allowed)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: Bingbot
User-agent: DuckAssistBot
User-agent: Meta-ExternalAgent
User-agent: MistralAI-User
User-agent: CCBot
Allow: /
Disallow: /feedback/

Sitemap: ${SITE.url}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST, 'robots-static.txt'), ROBOTS);

// llms.txt — concise map for AI assistants; llms-full.txt — all page text.
const LLMS = `# Teethline

> Teethline is a free triage and referral service for urgent NHS dental care in Leeds, Bradford and Ripon (West and North Yorkshire, England). Patients can book an emergency NHS appointment online at one of three practices, or answer a 2-minute triage that is emailed to the practice, which calls them back. No registration with a dentist is needed. Urgent NHS dental treatment in England costs ${SITE.urgentCharge} (from ${SITE.chargeSince}) unless exempt.

Key facts (checked ${niceDate(SITE.reviewed)}):
${CLINICS.map((c) => `- ${c.name} — ${fullAddr(c)}. Phone ${c.phone}. Book emergency appointments online: ${c.book}. ${c.hoursText} NHS practice code ${c.ods}. Serves ${c.nearby.slice(0, 5).join(', ')}.`).join('\n')}
- All three practices release emergency NHS appointment slots every working day (Monday to Friday) that anyone can book online, registered or not. No weekend or out-of-hours slots.
- Start an urgent triage: ${SITE.url}/triage/
- Out of hours: NHS 111. Facial swelling affecting breathing or swallowing, uncontrolled bleeding or serious injury: 999.
- Operated by ${SITE.operator} (ICO ${SITE.ico}). Not part of the NHS. Practices are NHS-contracted and CQC-registered, run by ${SITE.provider}.

## Practices
${CLINICS.map((c) => `- [${c.name}, ${c.city}](${SITE.url}/clinics/${c.slug}/): urgent NHS dentist in ${c.area}, ${c.city}`).join('\n')}

## Areas
${AREAS.map((a) => `- [Emergency NHS dentist in ${a.town}](${SITE.url}/${a.slug}/)`).join('\n')}

## Dental emergency guides
${GUIDES.map((g) => `- [${g.short}](${SITE.url}/guides/${g.slug}/): ${g.answer.split('. ')[0]}.`).join('\n')}

## Other
- [NHS urgent dental charges](${SITE.url}/nhs-urgent-dental-charges/)
- [FAQ](${SITE.url}/faq/)
- [About Teethline](${SITE.url}/about/)
- [Full text of this site](${SITE.url}/llms-full.txt)
`;
fs.writeFileSync(path.join(DIST, 'llms.txt'), LLMS);
fs.writeFileSync(path.join(DIST, 'llms-full.txt'),
  `# Teethline — full site text\n\n` + pages.filter((p) => p.text).map((p) => `## ${p.title}\nURL: ${SITE.url}${p.path}\n\n${p.text}\n`).join('\n'));

// Netlify routing and headers
fs.writeFileSync(path.join(DIST, '_redirects'), `/robots.txt   /.netlify/functions/robots   200
/llms.txt     /.netlify/functions/robots?f=llms   200
/feedback/*   /app.html   200
/triage       /triage/    301
/clinics/corner-house-dental-practice/  /clinics/corner-house-dental-leeds/  301
`);
fs.writeFileSync(path.join(DIST, '_headers'), `/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);

// The robots function serves these (and logs which crawler asked).
fs.writeFileSync(path.join(ROOT, 'netlify/functions/lib/static-text.js'),
  `// Generated by src/build.mjs — do not edit.\nmodule.exports = ${JSON.stringify({ robots: ROBOTS, llms: LLMS })};\n`);

fs.writeFileSync(path.join(ROOT, 'urls.txt'), [...sitemapUrls.map((p) => SITE.url + p.path), SITE.url + '/triage/', SITE.url + '/llms.txt'].join('\n'));
console.log(`Built ${pages.length} pages into dist/`);
