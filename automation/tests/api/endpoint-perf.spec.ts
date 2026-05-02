import { test, expect } from '@playwright/test';
import { KasaApiClient } from '@support/apiClient';

/**
 * @api
 * Smoke de performance: tempo de resposta de `/match/?status=ENDED`.
 *
 * Threshold soft de 2s — se exceder, emite warning via console (não bloqueia
 * CI), mas o teste *só falha* se for absurdamente lento (>10s) — útil pra
 * detectar timeouts/regressões claras sem flake na API DEV.
 */
const SOFT_BUDGET_MS = 2_000;
const HARD_BUDGET_MS = 10_000;

test.describe('API perf — /match/?status=ENDED', () => {
  test('@api responde dentro do budget hard (<10s) e idealmente <2s', async ({ request }) => {
    const api = new KasaApiClient(request);
    const start = Date.now();
    const res = await api.getMatches({ status: 'ENDED', with_channel: true });
    const elapsed = Date.now() - start;

    expect(res.status(), `status code esperado 200`).toBe(200);
    expect(elapsed, `hard budget excedido: ${elapsed}ms > ${HARD_BUDGET_MS}ms`).toBeLessThanOrEqual(
      HARD_BUDGET_MS,
    );

    if (elapsed > SOFT_BUDGET_MS) {
      console.warn(
        `[perf-warning] /match/?status=ENDED levou ${elapsed}ms (soft budget: ${SOFT_BUDGET_MS}ms)`,
      );
    }
  });
});
