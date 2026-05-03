/**
 * Wrapper compartilhado de axe-core pra specs da pasta `bugs/`.
 *
 * O baseline a11y em `automation/tests/a11y/pages.spec.ts` valida que NENHUMA
 * regra fora da baseline conhecida apareça. Aqui a lógica é o oposto: cada
 * spec assert que UMA regra específica (do bug) deixou de existir após o fix.
 *
 * Convenção das tags WCAG segue o padrão do baseline (`wcag2a/aa/21a/21aa`).
 */

import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export interface AxeRuleResult {
  rule: string;
  impact: string | null | undefined;
  nodeCount: number;
  nodes: Array<{
    target: string[] | string;
    html?: string;
    failureSummary?: string;
  }>;
}

/**
 * Roda axe na página e retorna o resultado da regra solicitada.
 *
 * `nodeCount === 0` → bug fixado (regra não viola mais).
 * `nodeCount > 0`  → bug presente (especificar nós).
 */
export async function runAxeRule(page: Page, ruleId: string): Promise<AxeRuleResult> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const violation = results.violations.find((v) => v.id === ruleId);
  return {
    rule: ruleId,
    impact: violation?.impact ?? null,
    nodeCount: violation?.nodes.length ?? 0,
    nodes: (violation?.nodes ?? []).slice(0, 10).map((n) => ({
      target: n.target as string[] | string,
      html: n.html?.slice(0, 400),
      failureSummary: n.failureSummary,
    })),
  };
}
