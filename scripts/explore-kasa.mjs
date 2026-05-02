import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = '/Users/filipegabriel/loomi-qa-challenge-kasa/docs/site-snapshots/exploration';
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const page = await context.newPage();

const visited = new Map();
const queue = ['https://www.kasa.live/'];
const seen = new Set(queue);
let count = 0;

async function snapshot(url, label) {
  console.log(`\n=== Visiting: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    return null;
  }

  const data = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      href: a.href,
      text: (a.textContent || '').trim().slice(0, 60),
      inner: a.outerHTML.length < 200 ? a.outerHTML : null,
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: (b.textContent || '').trim().slice(0, 60),
      ariaLabel: b.getAttribute('aria-label'),
      testid: b.getAttribute('data-testid'),
      disabled: b.disabled,
    }));
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map((i) => ({
      type: i.type || i.tagName.toLowerCase(),
      name: i.name,
      placeholder: i.placeholder,
      ariaLabel: i.getAttribute('aria-label'),
      testid: i.getAttribute('data-testid'),
    }));
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => ({
      level: h.tagName,
      text: (h.textContent || '').trim().slice(0, 100),
    }));
    const testids = Array.from(document.querySelectorAll('[data-testid]'))
      .map((e) => e.getAttribute('data-testid'))
      .filter((v, i, a) => a.indexOf(v) === i);
    const ariaLabels = Array.from(document.querySelectorAll('[aria-label]'))
      .map((e) => e.getAttribute('aria-label'))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 30);
    const roles = Array.from(document.querySelectorAll('[role]'))
      .map((e) => e.getAttribute('role'))
      .filter((v, i, a) => a.indexOf(v) === i);
    const iframes = Array.from(document.querySelectorAll('iframe')).map((f) => f.src);
    const videos = Array.from(document.querySelectorAll('video')).map((v) => v.currentSrc || v.src);
    return {
      title: document.title,
      url: location.href,
      links,
      buttons,
      inputs,
      headings,
      testids,
      ariaLabels,
      roles,
      iframes,
      videos,
    };
  });

  // capture network: list of requests already made (best-effort)
  const screenshot = path.join(OUT_DIR, `${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  data.screenshot = screenshot;
  visited.set(url, data);

  // enqueue same-origin links
  for (const link of data.links) {
    try {
      const u = new URL(link.href);
      if (u.origin === 'https://www.kasa.live' && !seen.has(u.href) && !u.href.includes('#')) {
        seen.add(u.href);
        queue.push(u.href);
      }
    } catch {}
  }
  return data;
}

// pages to force-explore even if not linked from home
const forced = [
  'https://www.kasa.live/melhores-momentos',
  'https://www.kasa.live/termos-de-uso',
  'https://www.kasa.live/buscar',
  'https://www.kasa.live/favoritos',
  'https://www.kasa.live/login',
  'https://www.kasa.live/calendar',
  'https://www.kasa.live/calendario',
  'https://www.kasa.live/perfil',
];
for (const f of forced)
  if (!seen.has(f)) {
    seen.add(f);
    queue.push(f);
  }

while (queue.length && count < 15) {
  const url = queue.shift();
  const label = url.replace('https://www.kasa.live/', '').replace(/\//g, '_') || 'home';
  await snapshot(url, label);
  count++;
}

// network capture on home: re-visit and catch requests
const reqs = [];
page.on('request', (r) =>
  reqs.push({ method: r.method(), url: r.url(), resourceType: r.resourceType() }),
);
await page
  .goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 })
  .catch(() => {});

await writeFile(
  path.join(OUT_DIR, '__exploration-raw.json'),
  JSON.stringify({ visited: Object.fromEntries(visited), requests: reqs }, null, 2),
);

console.log(`\n=== Done. ${count} pages visited. Output in ${OUT_DIR}`);
await browser.close();
