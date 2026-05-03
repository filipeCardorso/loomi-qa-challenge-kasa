/**
 * BUG-001 — API DEV exposta em produção.
 *
 * O frontend de produção (`https://www.kasa.live/`) faz chamadas pra
 * `kasa-live.api.dev.loomi.com.br` (ambiente de desenvolvimento). Isso
 * mistura dados de prod com infra de DEV — risco LGPD + instabilidade.
 *
 * Comportamento esperado (após fix): NENHUMA request da home produção
 * deve ter `dev.loomi.com.br` (ou qualquer subdomínio `.dev.`) no host.
 *
 * Ver: bug-reports/bugs/BUG-001-api-dev-exposta-em-producao.md
 */

import { test, expect } from '@bugs/_fixtures';

const FORBIDDEN_HOST_PATTERNS = [/\.dev\.loomi\.com\.br$/i, /\.staging\./i];

test('@bug @bug-001 home produção não chama hosts de DEV/staging', async ({
  page,
  bugFindings,
}) => {
  const offending: string[] = [];

  page.on('request', (req) => {
    const url = req.url();
    const host = new URL(url).host;
    if (FORBIDDEN_HOST_PATTERNS.some((re) => re.test(host))) {
      offending.push(url);
    }
  });

  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30_000 });

  bugFindings.set({
    bugId: 'BUG-001',
    testTitle: 'home não chama hosts de DEV',
    url: 'https://www.kasa.live/',
    expected: 'nenhuma request pra *.dev.loomi.com.br',
    actual: offending,
  });

  expect(
    offending,
    `home produção fez ${offending.length} requests pra DEV/staging:\n  - ${offending.join('\n  - ')}`,
  ).toEqual([]);
});
