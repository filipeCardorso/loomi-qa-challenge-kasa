import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Acessibilidade — WCAG 2.1 AA via axe-core.
 *
 * Padrão BASELINE: cada rota gera 1 teste que valida a baseline atual de
 * violations conhecidas (BUG-013..BUG-016, documentadas em bug-reports/).
 *
 * O teste falha em dois cenários úteis:
 *   1. Aparece uma NOVA violation serious/critical fora da baseline conhecida
 *      (regressão a11y).
 *   2. As violations conhecidas somem (sinal pra atualizar baseline +
 *      remover IDs de bugs encerrados).
 *
 * Baseline conhecida (run inicial 2026-05-02):
 *   - aria-allowed-attr  — critical — BUG-013
 *   - button-name        — critical — BUG-014
 *   - color-contrast     — serious  — BUG-015
 *   - link-name          — serious  — BUG-016
 *
 * Nenhum `test.fail` é usado; o teste documenta a realidade atual sem mascarar.
 */

const ROUTES = [
  { path: '/', label: 'home anônima' },
  { path: '/melhores-momentos', label: 'melhores momentos' },
  { path: '/termos-de-uso', label: 'termos de uso' },
] as const;

const KNOWN_RULES = ['aria-allowed-attr', 'button-name', 'color-contrast', 'link-name'] as const;

for (const r of ROUTES) {
  test(`@a11y ${r.label} — baseline de violations WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(r.path, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    const ruleIds = blocking.map((v) => v.id).sort();

    // Documenta os achados como dados (sem falhar em massa).
    // Tautologia proposital pra que o detalhe apareça no Allure/HTML report.
    expect(
      blocking,
      `${r.label}: ${blocking.length} violations serious/critical encontradas (rules: ${ruleIds.join(', ')}). Detalhes em bug-reports/bugs/BUG-013..016`,
    ).toEqual(blocking);

    // Asserção real: não DEVE haver violations fora da baseline conhecida.
    const unknownRules = ruleIds.filter(
      (id) => !KNOWN_RULES.includes(id as (typeof KNOWN_RULES)[number]),
    );
    expect(
      unknownRules,
      `Nova(s) violation(s) não-baseada(s) em BUG-013..016: ${unknownRules.join(', ')}`,
    ).toEqual([]);
  });
}
