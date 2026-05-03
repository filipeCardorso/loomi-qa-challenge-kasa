/**
 * BUG-014 — A11y `button-name` (critical) na home.
 *
 * Botões sem accessible name (sem texto, sem aria-label, sem aria-labelledby)
 * tornam a interface inutilizável via leitor de tela. Capturadas 30+
 * ocorrências na home (carrossel de times).
 *
 * Ver: bug-reports/bugs/BUG-014-a11y-button-name-critical.md
 */

import { test, expect } from '@bugs/_fixtures';
import { runAxeRule } from '@bugs/helpers/axe';

test('@bug @bug-014 home não tem botões sem accessible name', async ({ page, bugFindings }) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  // Carrossel de times (principal vetor das violations) precisa de tempo extra
  // pra montar — sem isso, axe pode rodar contra um DOM parcial. Esperamos
  // até que o número de botões na home estabilize acima de um threshold de
  // referência da exploração inicial (>= 30, conforme axe capturou em 2026-05-02).
  await page
    .waitForFunction(() => document.querySelectorAll('button').length >= 30, undefined, {
      timeout: 10_000,
    })
    .catch(() => undefined);

  const result = await runAxeRule(page, 'button-name');

  bugFindings.set({
    bugId: 'BUG-014',
    testTitle: 'axe button-name',
    url: 'https://www.kasa.live/',
    expected: 'nodeCount === 0',
    actual: result,
  });

  expect(
    result.nodeCount,
    `button-name: ${result.nodeCount} botão(ões) sem accessible name:\n${JSON.stringify(result.nodes, null, 2)}`,
  ).toBe(0);
});
