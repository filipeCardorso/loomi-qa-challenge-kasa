/**
 * BUG-021 — API DEV sem rate limiting visível.
 *
 * Severidade rebaixada de High → Medium em 2026-05-03 porque burst de 50
 * reqs não prova ausência de rate limit (buffers absorvem essa janela).
 * Para evidência conclusiva, este spec dispara um burst maior.
 *
 * Comportamento esperado (após fix DRF/WAF):
 *   - threshold típico: 60/min anônimo.
 *   - 300 reqs em paralelo → ao menos 1 resposta 429 esperada.
 *
 * Esse spec é mais lento (~30-90s). Marcado em workers=1 pra não amplificar
 * acidentalmente o burst em concorrência.
 *
 * Ver: bug-reports/bugs/BUG-021-api-sem-rate-limiting.md
 *      automation/tests/security/rate-limiting.spec.ts (burst de 50)
 */

import { test, expect } from '@bugs/_fixtures';
import { request as playwrightRequest } from '@playwright/test';

const TARGET_URL = 'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1';
const BURST_SIZE = 300;

test.describe.configure({ mode: 'serial', timeout: 120_000 });

test('@bug @bug-021 burst de 300 requests retorna pelo menos um HTTP 429', async ({
  bugFindings,
}) => {
  const ctx = await playwrightRequest.newContext({ timeout: 30_000 });
  try {
    const responses = await Promise.all(
      Array.from({ length: BURST_SIZE }, () =>
        ctx
          .get(TARGET_URL, { failOnStatusCode: false })
          .then((r) => r.status())
          .catch(() => -1),
      ),
    );

    const counts: Record<string, number> = {};
    for (const s of responses) counts[String(s)] = (counts[String(s)] ?? 0) + 1;
    const got429 = (counts['429'] ?? 0) > 0;

    bugFindings.set({
      bugId: 'BUG-021',
      testTitle: 'rate limit em burst grande',
      url: TARGET_URL,
      expected: 'pelo menos 1 resposta 429',
      actual: { burstSize: BURST_SIZE, statusCounts: counts, got429 },
    });

    expect(
      got429,
      `${BURST_SIZE} reqs em paralelo, status counts = ${JSON.stringify(counts)} — sem 429 detectado`,
    ).toBe(true);
  } finally {
    await ctx.dispose();
  }
});
