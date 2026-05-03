/**
 * BUG-006 — Meta tag `og:url` vazio.
 *
 * Open Graph requer URL canônica preenchida pra preview de redes sociais.
 * O HTML do site emite `<meta property="og:url" content=""/>`.
 *
 * Ver: bug-reports/bugs/BUG-006-og-url-vazio.md
 */

import { test, expect } from '@bugs/_fixtures';
import { fetchUrl } from '@bugs/helpers/http';

test('@bug @bug-006 meta og:url tem content não-vazio', async ({ bugFindings }) => {
  const { body } = await fetchUrl('https://www.kasa.live/');
  const match = body.match(/<meta[^>]+property=["']og:url["'][^>]*>/i);
  const content = match ? (match[0].match(/content=["']([^"']*)["']/i)?.[1] ?? null) : null;

  bugFindings.set({
    bugId: 'BUG-006',
    testTitle: 'og:url não vazio',
    url: 'https://www.kasa.live/',
    expected: 'content com URL canônica',
    actual: { tagPresent: !!match, content },
  });

  expect(match, 'tag <meta property="og:url"> ausente do HTML').not.toBeNull();
  expect(content, 'og:url com content vazio (impacta preview de redes sociais)').toBeTruthy();
});
