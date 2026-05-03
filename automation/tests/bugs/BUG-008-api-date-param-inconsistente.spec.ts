/**
 * BUG-008 — API usa `date=` e `date_start=` para a mesma semântica.
 *
 * Reclassificado como design debt (Low/P3): ambos os params funcionam e
 * retornam estrutura idêntica. O contrato deveria ser único.
 *
 * Comportamento esperado: a home deve enviar APENAS UMA convenção
 * (todos requests com `date_start=` OU todos com `date=`).
 *
 * Ver: bug-reports/bugs/BUG-008-api-inconsistencia-date-vs-date-start.md
 */

import { test, expect } from '@bugs/_fixtures';

test('@bug @bug-008 home usa um único nome de query param para data', async ({
  page,
  bugFindings,
}) => {
  const dateParamsSeen = new Set<string>();
  const requestsWithDate: string[] = [];

  page.on('request', (req) => {
    const url = req.url();
    const u = new URL(url);
    if (!u.host.includes('kasa-live.api')) return;
    for (const key of u.searchParams.keys()) {
      if (/^date(_start|_end)?$/i.test(key)) {
        dateParamsSeen.add(key);
        requestsWithDate.push(`${u.pathname}?${u.search.slice(1)}`);
      }
    }
  });

  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30_000 });

  const usesBothAliases = dateParamsSeen.has('date') && dateParamsSeen.has('date_start');

  bugFindings.set({
    bugId: 'BUG-008',
    testTitle: 'consistência de query param de data',
    url: 'https://www.kasa.live/',
    expected: 'apenas um dos aliases (date OU date_start) presente',
    actual: { paramsSeen: [...dateParamsSeen], requestsCount: requestsWithDate.length },
  });

  expect(
    usesBothAliases,
    `home usa AMBOS aliases (date + date_start) no mesmo carregamento: ${[...dateParamsSeen].join(', ')}`,
  ).toBe(false);
});
