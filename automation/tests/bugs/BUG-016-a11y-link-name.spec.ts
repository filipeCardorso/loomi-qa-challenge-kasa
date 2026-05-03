/**
 * BUG-016 — A11y `link-name` (serious) na home.
 *
 * Links de redes sociais (TikTok, Instagram) sem aria-label nem texto.
 * WCAG 2.4.4 (Link Purpose).
 *
 * Ver: bug-reports/bugs/BUG-016-a11y-link-name-serious.md
 */

import { test, expect } from '@bugs/_fixtures';
import { runAxeRule } from '@bugs/helpers/axe';

test('@bug @bug-016 home não tem links sem accessible name', async ({ page, bugFindings }) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const result = await runAxeRule(page, 'link-name');

  bugFindings.set({
    bugId: 'BUG-016',
    testTitle: 'axe link-name',
    url: 'https://www.kasa.live/',
    expected: 'nodeCount === 0',
    actual: result,
  });

  expect(
    result.nodeCount,
    `link-name: ${result.nodeCount} link(s) sem accessible name:\n${JSON.stringify(result.nodes, null, 2)}`,
  ).toBe(0);
});
