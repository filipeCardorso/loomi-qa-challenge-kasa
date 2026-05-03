/**
 * BUG-007 — Meta tag `<meta name="description">` duplicada.
 *
 * O HTML da home emite a mesma meta description duas vezes. Crawlers
 * podem ignorar uma das duas ou penalizar SEO.
 *
 * Ver: bug-reports/bugs/BUG-007-meta-description-duplicada.md
 */

import { test, expect } from '@bugs/_fixtures';
import { fetchUrl } from '@bugs/helpers/http';

test('@bug @bug-007 home tem exatamente uma meta description', async ({ bugFindings }) => {
  const { body } = await fetchUrl('https://www.kasa.live/');
  const matches = body.match(/<meta[^>]+name=["']description["'][^>]*>/gi) ?? [];

  bugFindings.set({
    bugId: 'BUG-007',
    testTitle: 'meta description única',
    url: 'https://www.kasa.live/',
    expected: 'count === 1',
    actual: { count: matches.length, tags: matches },
  });

  expect(
    matches.length,
    `home retornou ${matches.length} meta description tags (esperado 1):\n  - ${matches.join('\n  - ')}`,
  ).toBe(1);
});
