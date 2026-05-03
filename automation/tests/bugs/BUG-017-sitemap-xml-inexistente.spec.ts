/**
 * BUG-017 — `/sitemap.xml` retorna 404.
 *
 * Sites com conteúdo público (partidas, melhores momentos) devem expor
 * sitemap.xml + referência em robots.txt para SEO.
 *
 * Ver: bug-reports/bugs/BUG-017-sitemap-xml-inexistente.md
 */

import { test, expect } from '@bugs/_fixtures';
import { fetchUrl } from '@bugs/helpers/http';

test('@bug @bug-017 /sitemap.xml retorna 200 e é referenciado em robots.txt', async ({
  bugFindings,
}) => {
  const sitemap = await fetchUrl('https://www.kasa.live/sitemap.xml');
  const robots = await fetchUrl('https://www.kasa.live/robots.txt');

  const robotsLine = robots.body.match(/^Sitemap:\s*(\S+)/im)?.[1] ?? null;

  bugFindings.set({
    bugId: 'BUG-017',
    testTitle: 'sitemap.xml acessível',
    url: 'https://www.kasa.live/sitemap.xml',
    expected: 'status 200 + Sitemap: line em robots.txt',
    actual: {
      sitemapStatus: sitemap.status,
      robotsHasSitemap: !!robotsLine,
      sitemapLineInRobots: robotsLine,
    },
  });

  expect(sitemap.status, 'sitemap.xml deve retornar 200').toBe(200);
  expect(robotsLine, 'robots.txt deve referenciar Sitemap (linha "Sitemap: <url>")').toBeTruthy();
});
