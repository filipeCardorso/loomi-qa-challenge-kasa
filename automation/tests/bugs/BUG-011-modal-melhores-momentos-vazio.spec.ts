/**
 * BUG-011 — Modal de "Melhores momentos" sempre exibe estado vazio.
 *
 * Em partidas finalizadas, abrir o modal mostra sempre `"Nada por aqui — Ainda
 * não temos os melhores momentos da partida"`. Ou o endpoint não existe, ou o
 * componente está hardcoded para o estado vazio.
 *
 * Estratégia do spec: navega na home, tenta abrir 3 modais de partidas
 * finalizadas distintas e valida que ao menos 1 deles renderiza conteúdo
 * REAL (não a mensagem fixa de empty-state).
 *
 * Limitação: depende de partidas finalizadas estarem visíveis na home.
 * Quando não houver, o spec faz `test.skip` com mensagem clara.
 *
 * Ver: bug-reports/bugs/BUG-011-modal-partida-finalizada-sempre-vazio.md
 */

import { test, expect } from '@bugs/_fixtures';
import { SELECTORS } from '@support/selectors';

const EMPTY_STATE_HINT = /nada por aqui|ainda n[ãa]o temos os melhores momentos/i;

test('@bug @bug-011 ao menos um modal de partida finalizada exibe conteúdo', async ({
  page,
  bugFindings,
}) => {
  test.setTimeout(90_000);
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const finalizedCards = page.locator(SELECTORS.matchCard).filter({ hasText: /finalizad/i });
  const count = Math.min(await finalizedCards.count(), 3);

  if (count === 0) {
    test.skip(
      true,
      'Nenhum card "Finalizada" visível na home — não há o que testar (ver BUG-011 .md sobre dependência de dados reais)',
    );
    return;
  }

  const attempts: Array<{ index: number; bodySnippet: string; isEmpty: boolean }> = [];
  let foundContent = false;

  for (let i = 0; i < count; i++) {
    const card = finalizedCards.nth(i);
    await card.scrollIntoViewIfNeeded();
    await card.click({ trial: false }).catch(() => undefined);

    const modal = page.locator(SELECTORS.matchModal).first();
    const opened = await modal.waitFor({ state: 'visible', timeout: 8_000 }).then(
      () => true,
      () => false,
    );
    if (!opened) continue;

    const body = (await modal.innerText().catch(() => '')) || '';
    const isEmpty = EMPTY_STATE_HINT.test(body);
    attempts.push({ index: i, bodySnippet: body.slice(0, 200), isEmpty });
    if (!isEmpty) foundContent = true;

    // Fecha modal antes da próxima iteração
    await page.keyboard.press('Escape').catch(() => undefined);
    await modal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
  }

  bugFindings.set({
    bugId: 'BUG-011',
    testTitle: 'modal melhores momentos com conteúdo',
    url: 'https://www.kasa.live/',
    expected: 'pelo menos 1 modal com conteúdo (não empty-state)',
    actual: { attemptsCount: attempts.length, attempts, foundContent },
  });

  expect(
    foundContent,
    `${attempts.length} modais inspecionados, todos com empty-state — feature parece nunca renderizar conteúdo`,
  ).toBe(true);
});
