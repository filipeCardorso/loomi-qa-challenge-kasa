/**
 * BUG-005 — Zero `data-testid` no site.
 *
 * QA/automação fica refém de seletores frágeis (Chakra hash classes,
 * texto, role). O site deveria expor `data-testid` em elementos
 * críticos (cards de partida, header, busca, modais).
 *
 * Threshold mínimo: pelo menos 5 elementos com data-testid na home,
 * cobrindo header, navegação, busca, card e CTA principal.
 *
 * Ver: bug-reports/bugs/BUG-005-zero-data-testid-no-site.md
 */

import { test, expect } from '@bugs/_fixtures';

const MIN_DATA_TESTIDS = 5;

test('@bug @bug-005 home expõe ao menos 5 elementos com data-testid', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const stats = await page.evaluate(() => {
    const testids = [...document.querySelectorAll('[data-testid]')];
    return {
      count: testids.length,
      sample: testids.slice(0, 10).map((el) => el.getAttribute('data-testid')),
      totalElements: document.querySelectorAll('*').length,
    };
  });

  bugFindings.set({
    bugId: 'BUG-005',
    testTitle: 'data-testid presente em elementos críticos',
    url: 'https://www.kasa.live/',
    expected: `count >= ${MIN_DATA_TESTIDS}`,
    actual: stats,
  });

  expect(
    stats.count,
    `home tem ${stats.count} data-testids (${stats.totalElements} elements no DOM); esperado >= ${MIN_DATA_TESTIDS}`,
  ).toBeGreaterThanOrEqual(MIN_DATA_TESTIDS);
});
