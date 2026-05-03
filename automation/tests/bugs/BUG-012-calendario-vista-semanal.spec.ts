/**
 * BUG-012 — `/calendario` exibe apenas 3 dias na vista semanal (Sex/Sáb/Dom).
 *
 * Status: `Needs revalidation`. Recaptura 2026-05-03 mostrou que `/calendario`
 * hoje é listagem de partidas finalizadas em cards 3-colunas — não há grade
 * calendário-semanal de 7 colunas. A alegação central do bug provavelmente
 * é falso positivo ou refere-se a uma feature/visualização que não está
 * mais ativa.
 *
 * O spec fica como `fixme` até que se confirme se há toggle de vista
 * semanal escondido (ex.: estado autenticado com filtro específico).
 *
 * Ver: bug-reports/bugs/BUG-012-calendario-vista-semanal-3-dias.md
 */

import { test, expect } from '@bugs/_fixtures';

test.fixme('@bug @bug-012 vista semanal de /calendario renderiza 7 dias', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/calendario');
  const dayColumns = await page.locator('[data-testid="day-column"]').count();
  bugFindings.set({
    bugId: 'BUG-012',
    testTitle: 'vista semanal 7 dias',
    url: 'https://www.kasa.live/calendario',
    expected: 'dayColumns === 7',
    actual: { dayColumns },
  });
  expect(dayColumns).toBe(7);
});
