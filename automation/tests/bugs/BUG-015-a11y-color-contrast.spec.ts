/**
 * BUG-015 — A11y `color-contrast` (serious) em 5 rotas públicas.
 *
 * Pares de cores com razão < 4.5:1 (WCAG 1.4.3 AA). Recaptura
 * 2026-05-03: 14 violations em 5/5 rotas.
 *
 * Cada rota é um teste separado pra que a falha aponte direto pra
 * página problemática.
 *
 * Ver: bug-reports/bugs/BUG-015-a11y-color-contrast-serious.md
 */

import { test, expect } from '@bugs/_fixtures';
import { runAxeRule } from '@bugs/helpers/axe';

const ROUTES = [
  { path: '/', label: 'home' },
  { path: '/melhores-momentos', label: 'melhores-momentos' },
  { path: '/calendario', label: 'calendario' },
  { path: '/termos-de-uso', label: 'termos-de-uso' },
  { path: '/politicas-de-privacidade', label: 'politicas-de-privacidade' },
] as const;

for (const r of ROUTES) {
  test(`@bug @bug-015 ${r.label} sem violations de color-contrast`, async ({
    page,
    bugFindings,
  }) => {
    await page.goto(r.path, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

    const result = await runAxeRule(page, 'color-contrast');

    bugFindings.set({
      bugId: 'BUG-015',
      testTitle: `color-contrast em ${r.label}`,
      url: `https://www.kasa.live${r.path}`,
      expected: 'nodeCount === 0',
      actual: result,
    });

    expect(
      result.nodeCount,
      `${r.label}: ${result.nodeCount} elemento(s) com contraste insuficiente:\n${JSON.stringify(result.nodes, null, 2)}`,
    ).toBe(0);
  });
}
