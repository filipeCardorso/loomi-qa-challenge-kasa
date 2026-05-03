/**
 * BUG-020 — API DEV sem HSTS nem CSP.
 *
 * O endpoint `https://kasa-live.api.dev.loomi.com.br/api/1.0/match/` setou
 * X-Frame-Options, X-Content-Type-Options e Referrer-Policy, mas falta
 * HSTS (defesa contra downgrade) e CSP (defense-in-depth).
 *
 * Ver: bug-reports/bugs/BUG-020-api-dev-sem-hsts-nem-csp.md
 */

import { test, expect } from '@bugs/_fixtures';
import { fetchUrl } from '@bugs/helpers/http';

test.describe.configure({ timeout: 60_000 });

test('@bug @bug-020 API DEV expõe HSTS + CSP', async ({ bugFindings }) => {
  const { headers } = await fetchUrl(
    'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1',
  );
  const findings: string[] = [];

  if (!headers['strict-transport-security']) findings.push('HSTS ausente');
  if (!headers['content-security-policy']) findings.push('CSP ausente');

  bugFindings.set({
    bugId: 'BUG-020',
    testTitle: 'API DEV HSTS + CSP',
    url: 'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/',
    expected: 'HSTS e CSP presentes',
    actual: { findings },
  });

  expect(findings, `API DEV com headers ausentes:\n  - ${findings.join('\n  - ')}`).toEqual([]);
});
