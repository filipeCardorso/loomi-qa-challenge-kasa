/**
 * BUG-019 — Cabeçalhos de segurança ausentes na home (frontend).
 *
 * A home precisa servir defenses-in-depth básicas:
 *   - Strict-Transport-Security (HSTS)
 *   - X-Content-Type-Options: nosniff
 *   - X-Frame-Options OU CSP frame-ancestors (clickjacking)
 *   - Referrer-Policy
 *   - Content-Security-Policy
 *
 * Ver: bug-reports/bugs/BUG-019-security-headers-ausentes-na-home.md
 */

import { test, expect } from '@bugs/_fixtures';
import { fetchUrl } from '@bugs/helpers/http';

test.describe.configure({ timeout: 60_000 });

test('@bug @bug-019 home expõe headers de segurança obrigatórios', async ({ bugFindings }) => {
  const { headers } = await fetchUrl('https://www.kasa.live/');
  const findings: string[] = [];

  if (!headers['strict-transport-security']) findings.push('HSTS ausente');
  if (!headers['x-content-type-options']) findings.push('X-Content-Type-Options ausente');

  const csp = headers['content-security-policy'];
  const xfo = headers['x-frame-options'];
  const cspBlocksFrame = !!csp && /frame-ancestors/i.test(csp);
  if (!xfo && !cspBlocksFrame)
    findings.push('clickjacking: sem X-Frame-Options nem CSP frame-ancestors');

  if (!headers['referrer-policy']) findings.push('Referrer-Policy ausente');
  if (!csp) findings.push('Content-Security-Policy ausente');

  bugFindings.set({
    bugId: 'BUG-019',
    testTitle: 'security headers home',
    url: 'https://www.kasa.live/',
    expected: 'todos os headers de defense-in-depth presentes',
    actual: {
      findings,
      headersSeen: Object.keys(headers).filter(
        (h) =>
          h.startsWith('strict-') ||
          h.startsWith('x-') ||
          h.startsWith('content-security') ||
          h.startsWith('referrer') ||
          h.startsWith('permissions'),
      ),
    },
  });

  expect(
    findings,
    `home com headers de segurança ausentes:\n  - ${findings.join('\n  - ')}`,
  ).toEqual([]);
});
