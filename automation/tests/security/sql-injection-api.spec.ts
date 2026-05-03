import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security SQL-injection-like — endpoints públicos da API DEV
 *
 * Sondamos os endpoints `/team/?name=` e `/match/?status=` com payloads
 * clássicos. Não esperamos derrubar o backend — esperamos que:
 *   1. A API responda < 500 (entendeu o input ou rejeitou com 4xx).
 *   2. O body de resposta NÃO contenha sinais de stack/SQL leak (Django
 *      Traceback, "SQLSTATE", "psycopg2", "OperationalError", etc).
 *
 * A DEV API é lenta no primeiro hit (~10s) — usamos test.setTimeout(60_000)
 * e um requestContext próprio sem o `actionTimeout: 10_000` herdado do config.
 */

const API_BASE = 'https://kasa-live.api.dev.loomi.com.br/api/1.0';

const SQL_PAYLOADS = [
  "' OR '1'='1",
  '1; DROP TABLE matches;--',
  "' UNION SELECT NULL--",
  '"><script>alert(1)</script>',
];

const LEAK_MARKERS = [
  'sqlstate',
  'traceback',
  'psycopg2',
  'operationalerror',
  'programmingerror',
  'django.db',
  'syntax error at or near',
  'integrityerror',
];

test.describe.configure({ timeout: 90_000 });

for (const payload of SQL_PAYLOADS) {
  test(`@security payload "${payload.slice(0, 24)}" em /team/?name= não causa 5xx ou leak`, async () => {
    const ctx = await playwrightRequest.newContext({ timeout: 60_000 });
    try {
      const res = await ctx.get(`${API_BASE}/team/`, { params: { name: payload } });
      expect
        .soft(res.status(), `payload "${payload}" causou ${res.status()} (>= 500)`)
        .toBeLessThan(500);

      const body = (await res.text()).toLowerCase();
      const found = LEAK_MARKERS.filter((m) => body.includes(m));
      expect(
        found,
        `response leak markers presentes (${found.join(', ')}) — vazamento de stack/SQL`,
      ).toEqual([]);
    } finally {
      await ctx.dispose();
    }
  });
}

test('@security payload em /match/?status= não causa 5xx', async () => {
  const ctx = await playwrightRequest.newContext({ timeout: 60_000 });
  try {
    const res = await ctx.get(`${API_BASE}/match/`, {
      params: { status: "ENDED' OR '1'='1" },
    });
    expect.soft(res.status(), `payload SQL no status causou ${res.status()}`).toBeLessThan(500);
    const body = (await res.text()).toLowerCase();
    const found = LEAK_MARKERS.filter((m) => body.includes(m));
    expect(found, `leak markers em /match/: ${found.join(', ')}`).toEqual([]);
  } finally {
    await ctx.dispose();
  }
});
