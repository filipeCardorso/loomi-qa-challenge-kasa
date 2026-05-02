import { test, expect } from '@fixtures/index';
import AxeBuilder from '@axe-core/playwright';

/**
 * Acessibilidade — WCAG 2.1 AA via axe-core.
 *
 * Falha apenas em violations `serious` ou `critical`. Violations de menor
 * impacto são logadas mas não bloqueiam.
 *
 * AxeBuilder é instanciado fresh por teste (não usa o fixture) porque cada
 * caso pode rodar em uma `Page` diferente (anônima vs logada).
 *
 * ACHADOS REAIS (kasa.live, run inicial 2026-05-02):
 * Todas as 5 rotas exibem violations bloqueantes — são BUG candidatos:
 *   - aria-allowed-attr (critical) em TODAS as rotas
 *   - button-name (critical) em home anônima + home logada
 *   - color-contrast (serious) em TODAS as rotas
 *   - link-name (serious) em TODAS as rotas
 *
 * Por isso os 5 testes estão marcados como `test.fail()` — Playwright passa
 * quando o expect falha (achado documentado), e falharia se o site fosse
 * corrigido (sinaliza pra remover o `test.fail()`).
 *
 * Quando bug-reports forem escritos referenciando estes achados, atualizar
 * docstring com IDs (BUG-A11Y-001..N).
 */

const ROUTES_AND_LABELS = [
  { path: '/', label: 'home anônima', requiresAuth: false },
  { path: '/melhores-momentos', label: 'melhores momentos anônima', requiresAuth: false },
  { path: '/termos-de-uso', label: 'termos de uso', requiresAuth: false },
  { path: '/calendario', label: 'calendario logado', requiresAuth: true },
  { path: '/', label: 'home logada', requiresAuth: true },
] as const;

for (const r of ROUTES_AND_LABELS) {
  test(`@a11y ${r.label} sem violations serious/critical`, async ({ page, loggedInPage }) => {
    // Site atualmente apresenta violations conhecidas (BUG candidatos) —
    // teste passa se a expect falhar, fica vermelho quando o bug for fixado.
    test.fail(true, `kasa.live tem violations serious/critical em ${r.label} (BUG candidato)`);

    const target = r.requiresAuth ? loggedInPage : page;
    await target.goto(r.path, { waitUntil: 'domcontentloaded' });
    await target.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    const results = await new AxeBuilder({ page: target })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    const summary = blocking.map((b) => ({
      id: b.id,
      impact: b.impact,
      help: b.help,
      nodes: b.nodes.length,
    }));

    expect(blocking, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
