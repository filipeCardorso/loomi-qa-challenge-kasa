/**
 * BUG-013 — A11y `aria-allowed-attr` (critical) na home.
 *
 * Elementos `<div>` com `aria-expanded` sem role apropriado disparam essa
 * regra (popovers do Chakra). Crítico em WCAG 4.1.2.
 *
 * Ver: bug-reports/bugs/BUG-013-a11y-aria-allowed-attr-critical.md
 */

import { test, expect } from '@bugs/_fixtures';
import { runAxeRule } from '@bugs/helpers/axe';

test('@bug @bug-013 home não tem violations de aria-allowed-attr', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const result = await runAxeRule(page, 'aria-allowed-attr');

  bugFindings.set({
    bugId: 'BUG-013',
    testTitle: 'axe aria-allowed-attr',
    url: 'https://www.kasa.live/',
    expected: 'nodeCount === 0',
    actual: result,
  });

  expect(
    result.nodeCount,
    `aria-allowed-attr: ${result.nodeCount} violation(s):\n${JSON.stringify(result.nodes, null, 2)}`,
  ).toBe(0);
});
