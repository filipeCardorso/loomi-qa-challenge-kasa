/**
 * BUG-018 — Performance Lighthouse home abaixo do mínimo.
 *
 * Score capturado: 41 (2026-05-02) e 63 (2026-05-03), ambos < 80.
 * CLS = 0.705 (vermelho — limite é 0.1) é a métrica dominante.
 *
 * Esse spec depende do project `perf` (porta CDP 9222) e do
 * `playwright-lighthouse`. Para evitar duplicar a infra existente em
 * `automation/tests/performance/lighthouse.spec.ts`, marcamos como
 * fixme com cross-reference. O sinal verde virá da própria suite
 * `test:perf` quando o threshold de performance for elevado a 80.
 *
 * Ver: bug-reports/bugs/BUG-018-perf-home-lighthouse-41.md
 *      automation/tests/performance/lighthouse.spec.ts
 */

import { test, expect } from '@bugs/_fixtures';

test.fixme('@bug @bug-018 Lighthouse Performance da home >= 80 (cobertura via project=perf)', async ({
  bugFindings,
}) => {
  bugFindings.set({
    bugId: 'BUG-018',
    testTitle: 'Lighthouse perf >= 80',
    url: 'https://www.kasa.live/',
    expected: 'performance >= 80, CLS <= 0.1',
    actual: 'fixme — ver automation/tests/performance/lighthouse.spec.ts (project=perf)',
    notes: [
      'Reativar quando dev elevar SOFT_THRESHOLDS.performance de 30 → 80 em performance/lighthouse.spec.ts',
      'CLS é o ofensor principal: imagens sem dimensões fixas + cards lazy.',
    ],
  });
  expect(true).toBe(true);
});
