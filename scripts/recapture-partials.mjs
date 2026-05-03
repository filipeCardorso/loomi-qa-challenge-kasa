// Recaptura focada para BUG-002, BUG-009, BUG-012 (PARTIALs).
//
// BUG-002: forçar render completo (scroll até o fim) + datepicker aberto;
//          contar aria-label="Go to previous month" e variantes pt-BR.
// BUG-009: capturar screenshot dedicado em /calendario com texto duplicado
//          visível; coletar evidência fora do contexto do BUG-002.
// BUG-012: separar labels do mini-calendário (sidebar) vs grade principal,
//          pra esclarecer "3 dias na grade" quando o JSON anterior pegava
//          labels globais.

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const page = await context.newPage();
const EV = (b, f) => path.resolve('bug-reports/evidence', b, f);

// ─── HOME ──────────────────────────────────────────────────────────────────
console.log('\n=== HOME (BUG-002) ===');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll até o fim pra forçar todos os cards/lazy components renderizarem
const innerHeight = await page.evaluate(() => window.innerHeight);
const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(`[BUG-002] altura doc: ${docHeight}px, viewport: ${innerHeight}px`);
for (let y = 0; y < docHeight; y += innerHeight) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
}
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

// Abrir o datepicker (trigger #2 = ícone de calendário)
let datepickerOpened = false;
try {
  const trigger = page.locator('div[aria-haspopup="dialog"]').nth(1);
  if (await trigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await trigger.click({ timeout: 5000, force: true });
    await page.waitForTimeout(1200);
    datepickerOpened = true;
  }
} catch (err) {
  console.log(`[BUG-002] não conseguiu abrir datepicker: ${err.message}`);
}

const bug002 = await page.evaluate(() => {
  const variants = [
    'Go to previous month',
    'Go to next month',
    'Ir para o mês anterior',
    'Ir para o próximo mês',
  ];
  const counts = {};
  for (const v of variants) {
    counts[v] = document.querySelectorAll(`[aria-label="${v}"]`).length;
  }
  return {
    capturedAt: new Date().toISOString(),
    url: window.location.href,
    docHeight: document.documentElement.scrollHeight,
    totalElements: document.querySelectorAll('*').length,
    ariaLabelCounts: counts,
    totalAriaLabelDuplicates: Object.entries(counts)
      .filter(([_, n]) => n > 1)
      .reduce((s, [_, n]) => s + n, 0),
  };
});

console.log(`[BUG-002] aria-label counts:`, bug002.ariaLabelCounts);
console.log(`[BUG-002] datepicker aberto: ${datepickerOpened}`);

await writeFile(
  EV('BUG-002', 'recapture-2026-05-03.json'),
  JSON.stringify({ ...bug002, datepickerOpened }, null, 2),
);
await page.screenshot({ path: EV('BUG-002', 'screenshot-home-completa.png'), fullPage: true });
console.log('[BUG-002] screenshot full-page salvo');

if (datepickerOpened) {
  // Fechar datepicker antes de seguir
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
}

// ─── /calendario (BUG-009 dedicado + BUG-012) ──────────────────────────────
console.log('\n=== /calendario (BUG-009 + BUG-012) ===');
await page.goto('https://www.kasa.live/calendario', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);

// BUG-009 — coletar textContent dos botões da grade do calendário (página dedicada)
const bug009 = await page.evaluate(() => {
  const all = [...document.querySelectorAll('[role="gridcell"] button, [role="gridcell"]')];
  const items = all.map((el) => ({
    tag: el.tagName,
    text: el.textContent?.trim() || '',
    ariaLabel: el.getAttribute('aria-label') || null,
  }));
  // Detectar duplicação: dia "11" aparecendo como "1111" ou "11" repetido
  const duplicates = items.filter((it) => /^\d+$/.test(it.text) && it.text.length > 2);
  const repetitions = items.filter((it) => {
    const m = it.text.match(/^(\d+)\1+$/);
    return m;
  });
  return {
    capturedAt: new Date().toISOString(),
    url: window.location.href,
    totalGridcells: all.length,
    sampleFirst10: items.slice(0, 10),
    duplicateLikely: [...duplicates, ...repetitions].slice(0, 20),
  };
});
console.log(`[BUG-009] gridcells encontrados: ${bug009.totalGridcells}`);
console.log(`[BUG-009] dia com duplicação: ${bug009.duplicateLikely.length}`);
await writeFile(
  EV('BUG-009', 'recapture-calendario-2026-05-03.json'),
  JSON.stringify(bug009, null, 2),
);
await page.screenshot({
  path: EV('BUG-009', 'screenshot-calendario-dedicado.png'),
  fullPage: false,
});
console.log('[BUG-009] screenshot dedicado salvo');

// BUG-012 — separar labels da grade principal vs sidebar (mini-calendário)
const bug012 = await page.evaluate(() => {
  const dayLabelKeywords = [
    'dom',
    'seg',
    'ter',
    'qua',
    'qui',
    'sex',
    'sáb',
    'sab',
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
  ];
  const allLabels = [
    ...document.querySelectorAll('div, span, th, td, button, abbr, [aria-label]'),
  ].filter((el) => {
    const t = (el.textContent || '').trim().toLowerCase();
    return t.length >= 3 && t.length <= 12 && dayLabelKeywords.some((k) => t.startsWith(k));
  });

  const isInSidebar = (el) => {
    let p = el;
    while (p && p !== document.body) {
      const cls = (p.className || '').toString().toLowerCase();
      const tag = p.tagName.toLowerCase();
      if (
        tag === 'aside' ||
        cls.includes('rdp') ||
        cls.includes('chakra-popover') ||
        cls.includes('sidebar') ||
        cls.includes('mini')
      )
        return true;
      p = p.parentElement;
    }
    return false;
  };

  const grid = [];
  const sidebar = [];
  for (const el of allLabels) {
    const text = (el.textContent || '').trim();
    const entry = {
      tag: el.tagName,
      text,
      classes: (el.className || '').toString().slice(0, 100),
    };
    if (isInSidebar(el)) sidebar.push(entry);
    else grid.push(entry);
  }

  // Dedup por textContent
  const dedup = (arr) => [...new Set(arr.map((x) => x.text.toLowerCase()))];

  return {
    capturedAt: new Date().toISOString(),
    url: window.location.href,
    gridLabels: dedup(grid),
    sidebarLabels: dedup(sidebar),
    gridLabelsCount: dedup(grid).length,
    sidebarLabelsCount: dedup(sidebar).length,
    rawGridSample: grid.slice(0, 8),
    rawSidebarSample: sidebar.slice(0, 8),
  };
});
console.log(`[BUG-012] grid labels: ${bug012.gridLabelsCount} (${bug012.gridLabels.join(', ')})`);
console.log(
  `[BUG-012] sidebar labels: ${bug012.sidebarLabelsCount} (${bug012.sidebarLabels.join(', ')})`,
);
await writeFile(
  EV('BUG-012', 'recapture-grid-vs-sidebar-2026-05-03.json'),
  JSON.stringify(bug012, null, 2),
);

await browser.close();
console.log('\n✅ Recaptura concluída.');
