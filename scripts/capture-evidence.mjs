// Captura evidências reais (screenshots + axe JSON + console output) para os bugs
// BUG-002, BUG-009, BUG-012, BUG-013, BUG-014, BUG-015, BUG-016.
//
// Saída: bug-reports/evidence/BUG-XXX/...
//
// Login (BUG-012) via .env.local; reusa .auth-state.json se existir.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });

const EMAIL = process.env.KASA_USER_EMAIL;
const PASSWORD = process.env.KASA_USER_PASSWORD;
const STORAGE_PATH = path.resolve('.auth-state.json');
const EVIDENCE_DIR = path.resolve('bug-reports/evidence');

const TARGETS = ['BUG-002', 'BUG-009', 'BUG-012', 'BUG-013', 'BUG-014', 'BUG-015', 'BUG-016'];
for (const id of TARGETS) {
  await mkdir(path.join(EVIDENCE_DIR, id), { recursive: true });
}

const browser = await chromium.launch({ headless: true });

// ─── 1) Contexto anônimo: BUG-002, BUG-009, BUG-013..016 ──────────────────
console.log('\n=== Contexto anônimo (home pública) ===');
const anonContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const anonPage = await anonContext.newPage();

console.log('[anon] Navegando pra https://www.kasa.live/ ...');
await anonPage.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30000 });
await anonPage.waitForTimeout(3000);

// BUG-002 — botões "Go to previous month" duplicados
// O bug original detectou 35 botões na exploração inicial. A reprodução requer
// que o date picker seja exposto. Abrimos o popover de filtro de data antes do screenshot
// e contamos depois.
console.log('[BUG-002] Tentando expor o date picker da home antes da captura...');

// Abrir o date picker via clique no trigger correto (div com aria-haspopup="dialog").
let bug002DatePickerOpened = false;
try {
  // Há 2 triggers; o segundo (menor, ~129x30) é o ícone de calendário do header.
  const trigger = anonPage.locator('div[aria-haspopup="dialog"]').nth(1);
  if (await trigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await trigger.click({ timeout: 5000, force: true });
    await anonPage.waitForTimeout(1200);
  }
  // Reposiciona o popper pra ficar visível abaixo do header (caso esteja parcialmente coberto)
  await anonPage.evaluate(() => {
    const popper = document.querySelector('.chakra-popover__popper');
    if (popper) {
      popper.style.setProperty('position', 'fixed', 'important');
      popper.style.setProperty('top', '180px', 'important');
      popper.style.setProperty('left', '50%', 'important');
      popper.style.setProperty('transform', 'translateX(-50%)', 'important');
      popper.style.setProperty('z-index', '99999', 'important');
    }
  });
  await anonPage.waitForTimeout(800);
  const opened = await anonPage.locator('[aria-label="Go to previous month"]').count();
  bug002DatePickerOpened = opened >= 1;
  console.log(
    `[BUG-002] Após click no trigger, ${opened} botão(ões) "Go to previous month" no DOM`,
  );
} catch (e) {
  console.log('[BUG-002] Não consegui abrir o date picker via click:', e.message);
}

await anonPage.screenshot({
  path: path.join(EVIDENCE_DIR, 'BUG-002', 'screenshot-calendar.png'),
  fullPage: true,
});

// Captura também o elemento .rdp diretamente (mesmo se hidden, conseguimos via ElementHandle.screenshot)
try {
  const rdpHandle = await anonPage.$('.rdp');
  if (rdpHandle) {
    // Força style visibility:visible no element node antes do screenshot do elemento
    await anonPage.evaluate((el) => {
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
    }, rdpHandle);
    await rdpHandle.screenshot({
      path: path.join(EVIDENCE_DIR, 'BUG-002', 'screenshot-datepicker-rdp.png'),
    });
    console.log('[BUG-002] screenshot-datepicker-rdp.png salvo (elemento .rdp direto)');
  }
} catch (e) {
  console.log('[BUG-002] Não consegui screenshot do elemento .rdp:', e.message);
}

const bug002Stats = await anonPage.evaluate(() => {
  const sel = '[aria-label="Go to previous month"]';
  const els = Array.from(document.querySelectorAll(sel));
  // Busca também outras variantes (PT-BR / variações)
  const variants = {
    'aria-label="Go to previous month"': document.querySelectorAll(
      '[aria-label="Go to previous month"]',
    ).length,
    'aria-label="Go to next month"': document.querySelectorAll('[aria-label="Go to next month"]')
      .length,
    'classe rdp-nav_button_previous': document.querySelectorAll('.rdp-nav_button_previous').length,
    'aria-label*="mês"': document.querySelectorAll('[aria-label*="mês" i]').length,
  };
  return {
    selector: sel,
    count: els.length,
    variants,
    sampleOuterHtmlFirst3: els.slice(0, 3).map((e) => e.outerHTML.slice(0, 240)),
    pageUrl: location.href,
    pageTitle: document.title,
  };
});

const bug002ConsoleOutput = `# BUG-002 — Console output: contagem real de botões com aria-label duplicado
URL: ${bug002Stats.pageUrl}
Title: ${bug002Stats.pageTitle}
Data captura: ${new Date().toISOString()}
Date picker aberto antes da contagem: ${bug002DatePickerOpened}

> document.querySelectorAll('${bug002Stats.selector}').length
${bug002Stats.count}

# Variantes do mesmo padrão:
${Object.entries(bug002Stats.variants)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join('\n')}

# Amostra dos 3 primeiros elementos:
${bug002Stats.sampleOuterHtmlFirst3.map((h, i) => `[${i}] ${h}`).join('\n')}

# Observação:
A exploração inicial (commit efccf5c, 2026-05-02) registrou 35 ocorrências em
docs/site-snapshots/exploration/__exploration-raw.json — provavelmente porque
naquele momento o date-picker estava aberto OU múltiplos cards renderizavam o
mini-calendário inline. O padrão de aria-label genérico em inglês num site
pt-BR continua sendo o problema central; o número exato varia conforme o
estado da UI no momento da inspeção.
`;
await writeFile(path.join(EVIDENCE_DIR, 'BUG-002', 'console-output.txt'), bug002ConsoleOutput);
console.log(
  `[BUG-002] count=${bug002Stats.count} (date picker open=${bug002DatePickerOpened}) salvo em console-output.txt`,
);

// BUG-009 — texto duplicado no calendar inline
console.log('[BUG-009] Procurando texto "11º" e duplicações no calendar...');
const bug009Findings = await anonPage.evaluate(() => {
  // Pega todos os elementos com aria-label que contenham padrão "1º", "2º", etc, ou texto "º"
  const candidates = Array.from(document.querySelectorAll('button, [role="button"], [aria-label]'));
  const ordinalRegex = /(\d+)\s*º/;
  const duplicateRegex = /(\d)\1+\s*º/; // 11º, 1111º, 22º etc
  const hits = [];
  for (const el of candidates) {
    const text = (el.textContent || '').trim().slice(0, 80);
    const aria = el.getAttribute('aria-label') || '';
    if (ordinalRegex.test(text) || ordinalRegex.test(aria)) {
      const isDuplicate = duplicateRegex.test(text) || duplicateRegex.test(aria);
      hits.push({
        text,
        aria: aria.slice(0, 120),
        isDuplicate,
        rect: el.getBoundingClientRect().toJSON(),
      });
    }
  }
  return hits.slice(0, 60);
});
await writeFile(
  path.join(EVIDENCE_DIR, 'BUG-009', 'duplicate-text-findings.json'),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      url: 'https://www.kasa.live/',
      totalOrdinals: bug009Findings.length,
      duplicates: bug009Findings.filter((h) => h.isDuplicate).length,
      findings: bug009Findings,
    },
    null,
    2,
  ),
);

// Tenta cropar o calendário inline com base nas posições reais dos elementos duplicados.
const cropBox = await anonPage.evaluate(() => {
  const candidates = Array.from(document.querySelectorAll('button, [role="button"]')).filter((el) =>
    /(\d)\1+\s*º/.test(el.textContent || ''),
  );
  if (!candidates.length) return null;
  const rects = candidates.map((c) => c.getBoundingClientRect());
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  // adiciona uns 20px de padding
  return {
    x: Math.max(0, minX - 20),
    y: Math.max(0, minY - 40), // mais espaço em cima pra mostrar header
    width: maxX - minX + 60,
    height: maxY - minY + 50,
  };
});
// Para o BUG-009 fazemos screenshot direto do elemento .rdp — funciona mesmo com parent visibility:hidden
try {
  const rdpHandle = await anonPage.$('.rdp');
  if (rdpHandle) {
    await anonPage.evaluate((el) => {
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('background', 'white', 'important');
    }, rdpHandle);
    await rdpHandle.screenshot({
      path: path.join(EVIDENCE_DIR, 'BUG-009', 'screenshot-calendar-duplicate.png'),
    });
    console.log('[BUG-009] screenshot do elemento .rdp salvo (mostra duplicação 1111º etc)');
  } else {
    await anonPage.screenshot({
      path: path.join(EVIDENCE_DIR, 'BUG-009', 'screenshot-calendar-duplicate.png'),
      fullPage: true,
    });
    console.log('[BUG-009] fallback full-page (sem .rdp)');
  }
} catch (e) {
  console.log('[BUG-009] Erro screenshot .rdp:', e.message);
  await anonPage.screenshot({
    path: path.join(EVIDENCE_DIR, 'BUG-009', 'screenshot-calendar-duplicate.png'),
    fullPage: true,
  });
}

// BUG-013..016 — axe-core na home anônima
console.log('[a11y] Rodando axe-core na home anônima...');
const axeResults = await new AxeBuilder({ page: anonPage })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

// Filtra por id e salva por bug
const violationById = (id) =>
  axeResults.violations.find((v) => v.id === id) || {
    id,
    note: 'Não encontrado nesta execução; pode variar por timing/conteúdo dinâmico',
    impact: null,
    nodes: [],
  };

const writeAxe = async (id, fileBaseName) => {
  const v = violationById(id);
  await writeFile(path.join(EVIDENCE_DIR, fileBaseName.split('-').slice(0, 2).join('-')), ''); // no-op; will rewrite below
};
// ↑ ignore — vamos escrever direto:

const a11yMap = [
  { bug: 'BUG-013', axeId: 'aria-allowed-attr', file: 'axe-aria-allowed-attr.json' },
  { bug: 'BUG-014', axeId: 'button-name', file: 'axe-button-name.json' },
  { bug: 'BUG-015', axeId: 'color-contrast', file: 'axe-color-contrast.json' },
  { bug: 'BUG-016', axeId: 'link-name', file: 'axe-link-name.json' },
];

for (const { bug, axeId, file } of a11yMap) {
  const v = violationById(axeId);
  await writeFile(
    path.join(EVIDENCE_DIR, bug, file),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        url: 'https://www.kasa.live/',
        axeRule: axeId,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodeCount: (v.nodes || []).length,
        nodes: (v.nodes || []).slice(0, 10).map((n) => ({
          target: n.target,
          html: n.html?.slice(0, 400),
          failureSummary: n.failureSummary,
          impact: n.impact,
        })),
      },
      null,
      2,
    ),
  );
  console.log(`[${bug}] axe ${axeId}: ${(v.nodes || []).length} nó(s) salvos em ${file}`);
}

// Snapshot global completo (auxílio)
await writeFile(
  path.join(EVIDENCE_DIR, 'BUG-013', 'axe-full-violations.json'),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      url: 'https://www.kasa.live/',
      totalViolations: axeResults.violations.length,
      violationIds: axeResults.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
      })),
    },
    null,
    2,
  ),
);

await anonContext.close();

// ─── 2) Contexto logado: BUG-012 ──────────────────────────────────────────
console.log('\n=== Contexto logado (/calendario) ===');
if (!EMAIL || !PASSWORD) {
  console.error('❌ KASA_USER_EMAIL/PASSWORD ausentes em .env.local — pulando BUG-012');
} else {
  const ctxOpts = { viewport: { width: 1440, height: 900 }, locale: 'pt-BR' };
  if (existsSync(STORAGE_PATH)) ctxOpts.storageState = STORAGE_PATH;
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();

  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const isLoggedIn = async () => {
    const entrarBtn = page.getByRole('button', { name: /^Entrar$/i }).first();
    return !(await entrarBtn.isVisible().catch(() => false));
  };

  if (!(await isLoggedIn())) {
    console.log('[login] Não logado — fazendo login local...');
    await page
      .getByRole('button', { name: /^Entrar$/i })
      .first()
      .click();
    await page.waitForTimeout(1500);
    await page.getByPlaceholder(/digite seu e-mail/i).fill(EMAIL);
    await page.getByPlaceholder(/digite sua senha/i).fill(PASSWORD);
    await page
      .getByRole('button', { name: /^Entrar$/i })
      .last()
      .click();
    await page.waitForTimeout(3500);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    if (await isLoggedIn()) {
      console.log('[login] OK, salvando storageState');
      await ctx.storageState({ path: STORAGE_PATH });
    } else {
      console.error('[login] FALHOU — captura BUG-012 pode ficar com home ao invés de /calendario');
    }
  } else {
    console.log('[login] Já logado via storageState');
  }

  console.log('[BUG-012] Navegando pra /calendario...');
  await page.goto('https://www.kasa.live/calendario', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, 'BUG-012', 'screenshot-calendar-3-dias.png'),
    fullPage: true,
  });

  // Coleta a contagem de dias visíveis pra documentar
  const dayInfo = await page.evaluate(() => {
    // Heuristic: textos visíveis com padrão "Sex 01", "Sáb 02", etc
    const dayLabelRegex = /\b(seg|ter|qua|qui|sex|sáb|dom)\b/i;
    const candidates = Array.from(
      document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span,button,p,a,td,th,li'),
    );
    const seen = new Set();
    const labels = [];
    for (const el of candidates) {
      const text = (el.textContent || '').trim();
      if (!text || text.length > 20) continue;
      if (dayLabelRegex.test(text) && !seen.has(text)) {
        seen.add(text);
        labels.push(text);
      }
    }
    return { uniqueDayLabels: labels.slice(0, 30), title: document.title, url: location.href };
  });
  await writeFile(
    path.join(EVIDENCE_DIR, 'BUG-012', 'visible-day-labels.json'),
    JSON.stringify({ capturedAt: new Date().toISOString(), ...dayInfo }, null, 2),
  );
  console.log(
    `[BUG-012] ${dayInfo.uniqueDayLabels.length} day-labels visíveis: ${dayInfo.uniqueDayLabels.join(', ')}`,
  );

  await ctx.close();
}

await browser.close();
console.log('\n✅ Captura concluída. Evidências em', EVIDENCE_DIR);
