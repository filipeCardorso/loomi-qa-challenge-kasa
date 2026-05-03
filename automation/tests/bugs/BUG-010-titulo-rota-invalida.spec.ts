/**
 * BUG-010 — `/favoritos` mantém title genérico da home no fallback silencioso.
 *
 * Quando o usuário anônimo acessa `/favoritos`, o site redireciona pra home
 * mas o `<title>` continua "Kasa.Live - Encontre o Jogo" — mesmo título da
 * home. Não há sinal pro usuário (e pra crawlers/SEO) de que a navegação
 * resultou num fallback ou na home.
 *
 * Esperado: title específico do contexto pretendido (`Favoritos`,
 * `Página não encontrada`, ou similar) — qualquer coisa diferente do
 * title da home.
 *
 * Ver: bug-reports/bugs/BUG-010-titulo-rota-invalida.md
 */

import { test, expect } from '@bugs/_fixtures';

const HOME_TITLE = 'Kasa.Live - Encontre o Jogo';

test('@bug @bug-010 /favoritos anônimo não mantém title da home', async ({ page, bugFindings }) => {
  await page.goto('https://www.kasa.live/favoritos', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);

  const title = await page.title();
  const finalUrl = page.url();
  const matchesHomeTitle = title.trim() === HOME_TITLE;

  bugFindings.set({
    bugId: 'BUG-010',
    testTitle: 'title distinto da home em /favoritos',
    url: 'https://www.kasa.live/favoritos',
    expected: `title diferente de "${HOME_TITLE}"`,
    actual: { finalUrl, title, matchesHomeTitle },
  });

  expect(
    matchesHomeTitle,
    `/favoritos terminou em ${finalUrl} com title genérico "${title}" — sem indicação de fallback ou contexto`,
  ).toBe(false);
});
