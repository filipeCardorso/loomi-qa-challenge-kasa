// Recaptura focada do BUG-015 (color-contrast) em todas as 5 rotas afirmadas
// no relatório. Salva um JSON consolidado por rota + um overview com totais.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROUTES = [
  { slug: 'home', url: 'https://www.kasa.live/' },
  { slug: 'melhores-momentos', url: 'https://www.kasa.live/melhores-momentos' },
  { slug: 'calendario', url: 'https://www.kasa.live/calendario' },
  { slug: 'termos-de-uso', url: 'https://www.kasa.live/termos-de-uso' },
  { slug: 'politicas-de-privacidade', url: 'https://www.kasa.live/politicas-de-privacidade' },
];

const OUT_DIR = path.resolve('bug-reports/evidence/BUG-015');
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});

const overview = [];

for (const { slug, url } of ROUTES) {
  console.log(`\n=== ${slug} (${url}) ===`);
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500); // estabilizar lazy content
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const violation = results.violations.find((v) => v.id === 'color-contrast');
    const nodeCount = violation?.nodes?.length || 0;
    console.log(`[${slug}] color-contrast violations: ${nodeCount}`);
    overview.push({ slug, url, nodeCount });

    const payload = {
      capturedAt: new Date().toISOString(),
      url,
      route: slug,
      axeRule: 'color-contrast',
      impact: violation?.impact || null,
      help: violation?.help || null,
      helpUrl: violation?.helpUrl || null,
      nodeCount,
      nodes: (violation?.nodes || []).slice(0, 15).map((n) => ({
        target: n.target,
        html: n.html?.slice(0, 400),
        failureSummary: n.failureSummary,
        impact: n.impact,
      })),
    };
    await writeFile(
      path.join(OUT_DIR, `axe-color-contrast-${slug}.json`),
      JSON.stringify(payload, null, 2),
    );
  } catch (err) {
    console.error(`[${slug}] erro: ${err.message}`);
    overview.push({ slug, url, error: err.message });
  } finally {
    await page.close();
  }
}

await writeFile(
  path.join(OUT_DIR, 'color-contrast-overview.json'),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      summary: overview,
      totalNodes: overview.reduce((s, r) => s + (r.nodeCount || 0), 0),
      routesAffected: overview.filter((r) => (r.nodeCount || 0) > 0).length,
      routesTested: overview.length,
    },
    null,
    2,
  ),
);

await browser.close();
console.log('\n=== Overview ===');
console.table(overview);
