// Captura evidências focadas pra IMP-008 (cookie banner LGPD) e IMP-009 (dark mode).
//
// Pro IMP-008: lista cookies setados na primeira visita (sem consentimento prévio).
// Pro IMP-009: lê localStorage[`chakra-ui-color-mode`] + screenshot da home no modo light.

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const page = await ctx.newPage();

await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30_000 });
await page.waitForTimeout(2_000);

// IMP-008 — cookies setados sem consentimento
const cookies = await ctx.cookies('https://www.kasa.live');
const localStorageEntries = await page.evaluate(() => {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) out[k] = localStorage.getItem(k);
  }
  return out;
});

const imp008 = {
  capturedAt: new Date().toISOString(),
  url: 'https://www.kasa.live/',
  context:
    'Visita anônima sem qualquer consentimento prévio. Cookies e localStorage capturados imediatamente após networkidle.',
  hasCookieBanner: false, // verificado abaixo
  cookies,
  localStorageKeys: Object.keys(localStorageEntries),
  localStorageSample: localStorageEntries,
  totalCookiesSet: cookies.length,
  totalLocalStorageKeys: Object.keys(localStorageEntries).length,
};

const bannerVisible = await page
  .locator('text=/cookie|consentimento|aceitar|consent/i')
  .first()
  .isVisible({ timeout: 1_500 })
  .catch(() => false);
imp008.hasCookieBanner = bannerVisible;

const imp008Dir = path.resolve('bug-reports/evidence/IMP-008');
await mkdir(imp008Dir, { recursive: true });
await writeFile(
  path.join(imp008Dir, 'cookies-localstorage-anonimo.json'),
  JSON.stringify(imp008, null, 2),
);
await page.screenshot({
  path: path.join(imp008Dir, 'screenshot-home-sem-banner.png'),
  fullPage: false,
});

console.log(
  `[IMP-008] cookies: ${cookies.length}, localStorage: ${Object.keys(localStorageEntries).length}, banner visivel: ${bannerVisible}`,
);

// IMP-009 — chakra-ui-color-mode + screenshot light
const colorMode = localStorageEntries['chakra-ui-color-mode'] ?? null;
const computedTheme = await page.evaluate(() => {
  const root = document.documentElement;
  const body = document.body;
  return {
    htmlDataTheme: root.getAttribute('data-theme'),
    htmlClass: root.className,
    bodyBgColor: getComputedStyle(body).backgroundColor,
    bodyColor: getComputedStyle(body).color,
    chakraColorMode: root.getAttribute('data-color-mode'),
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  };
});

const imp009 = {
  capturedAt: new Date().toISOString(),
  url: 'https://www.kasa.live/',
  context:
    'Inspeção do estado atual de tema. Chakra UI já está configurado (chave chakra-ui-color-mode em localStorage), mas não há toggle visível na UI.',
  localStorageColorMode: colorMode,
  computedTheme,
  toggleVisible: false, // verificado abaixo
};

const toggleVisible = await page
  .locator(
    'button[aria-label*="dark" i], button[aria-label*="tema" i], button[aria-label*="theme" i], [data-testid*="theme" i]',
  )
  .first()
  .isVisible({ timeout: 1_000 })
  .catch(() => false);
imp009.toggleVisible = toggleVisible;

const imp009Dir = path.resolve('bug-reports/evidence/IMP-009');
await mkdir(imp009Dir, { recursive: true });
await writeFile(
  path.join(imp009Dir, 'localstorage-color-mode.json'),
  JSON.stringify(imp009, null, 2),
);
await page.screenshot({
  path: path.join(imp009Dir, 'screenshot-home-light-mode.png'),
  fullPage: false,
});

console.log(`[IMP-009] color-mode em localStorage: ${colorMode}, toggle visivel: ${toggleVisible}`);

await browser.close();
console.log('\n✅ Evidências IMP-008 e IMP-009 capturadas.');
