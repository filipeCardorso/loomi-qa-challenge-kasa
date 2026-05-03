import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security Cabeçalhos HTTP de segurança
 *
 * Verifica presença das principais defenses-in-depth:
 *  - Strict-Transport-Security (HSTS)
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options OU CSP frame-ancestors (anti-clickjacking)
 *  - Referrer-Policy
 *  - Content-Security-Policy (registrado como soft — CSP é estratégia, não mandatório)
 *
 * Cada finding ausente vira candidato a bug separado, mas reportamos tudo
 * num assert único pra ter o relatório completo numa única falha.
 */

interface HeaderCheck {
  url: string;
  label: string;
}

const TARGETS: HeaderCheck[] = [
  { url: 'https://www.kasa.live/', label: 'home (frontend)' },
  {
    url: 'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1',
    label: 'API DEV /match/',
  },
];

test.describe.configure({ timeout: 60_000 });

for (const t of TARGETS) {
  test(`@security headers de segurança presentes em ${t.label}`, async () => {
    const ctx = await playwrightRequest.newContext({ timeout: 45_000 });
    try {
      const res = await ctx.get(t.url);
      const headers = res.headers();

      const findings: string[] = [];

      if (!headers['strict-transport-security']) {
        findings.push('falta HSTS (Strict-Transport-Security)');
      }
      if (!headers['x-content-type-options']) {
        findings.push('falta X-Content-Type-Options: nosniff');
      }

      const csp = headers['content-security-policy'];
      const xfo = headers['x-frame-options'];
      const cspBlocksFrame = !!csp && /frame-ancestors/i.test(csp);
      if (!xfo && !cspBlocksFrame) {
        findings.push('vulnerável a clickjacking (sem X-Frame-Options nem CSP frame-ancestors)');
      }

      if (!headers['referrer-policy']) {
        findings.push('falta Referrer-Policy');
      }

      // CSP genérico como soft — site moderno deveria ter, mas é estratégia
      if (!csp) {
        expect
          .soft(csp, `${t.label}: falta Content-Security-Policy (defense-in-depth)`)
          .toBeTruthy();
      }

      expect(
        findings,
        `${t.label}: headers de segurança ausentes:\n  - ${findings.join('\n  - ')}`,
      ).toEqual([]);
    } finally {
      await ctx.dispose();
    }
  });
}
