/**
 * BUG-002 — aria-label "Go to previous month" em inglês num site pt-BR.
 *
 * O datepicker da home usa aria-labels do `react-day-picker` em inglês
 * sem localização. Para um site pt-BR, isso quebra o anúncio do leitor
 * de tela e (na exploração inicial) gerou 35 botões com mesmo aria-label.
 *
 * Comportamento esperado: nenhum aria-label "Go to previous month" /
 * "Go to next month" presente — devem estar em pt-BR ou parametrizados.
 *
 * Ver: bug-reports/bugs/BUG-002-aria-label-duplicado-go-to-previous-month.md
 */

import { test, expect } from '@bugs/_fixtures';

const ENGLISH_ARIA_LABELS = ['Go to previous month', 'Go to next month'];

test('@bug @bug-002 nenhum aria-label em inglês no datepicker da home', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  // Tenta abrir o datepicker (segundo trigger, ícone de calendário do header)
  const trigger = page.locator('div[aria-haspopup="dialog"]').nth(1);
  if (await trigger.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await trigger.click({ force: true });
    await page
      .locator('.rdp, [role="dialog"]')
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
  }

  const counts = await page.evaluate((labels) => {
    return Object.fromEntries(
      labels.map((l) => [l, document.querySelectorAll(`[aria-label="${l}"]`).length]),
    );
  }, ENGLISH_ARIA_LABELS);

  const total = Object.values(counts).reduce((s, n) => s + (n as number), 0);

  bugFindings.set({
    bugId: 'BUG-002',
    testTitle: 'aria-labels em pt-BR',
    url: 'https://www.kasa.live/',
    expected: 'todas ocorrências em pt-BR (zero em inglês)',
    actual: counts,
  });

  expect(
    total,
    `${total} aria-label(s) em inglês detectado(s):\n${JSON.stringify(counts, null, 2)}`,
  ).toBe(0);
});
