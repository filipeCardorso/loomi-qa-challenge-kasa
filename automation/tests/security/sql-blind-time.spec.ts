import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security Time-based blind SQL injection — endpoints públicos da API DEV
 *
 * SLEEP(N) na cláusula faria a query bloquear N segundos. Medimos latência
 * de N=10 amostras com payload benigno e comparamos cada payload malicioso
 * contra `p95(baseline) + 2*IQR(baseline) + sleep_seconds*1000` — margem
 * estatística que tolera jitter normal de rede e absorve cold start, mas
 * detecta deslocamento sistemático na ordem do SLEEP.
 *
 * Iterações = 10 garantem que p95 representa cauda real (não 1 outlier).
 * IQR (Q3-Q1) é robusto a outliers (mediana-based), melhor que stdev em
 * distribuições com cold-start.
 *
 * Fail-fast: erro de rede em QUALQUER amostra falha o teste. Sem `.catch`.
 */

const API_BASE = 'https://kasa-live.api.dev.loomi.com.br/api/1.0';
const SLEEP_SECONDS = 3;

const TIME_PAYLOADS = ["Flamengo' AND SLEEP(3)--", "1' OR SLEEP(3)--", "x'; SELECT pg_sleep(3)--"];

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

test.describe.configure({ timeout: 240_000 });

test('@security time-based SQLi: SLEEP(3) não atrasa resposta acima do p95+IQR baseline', async () => {
  const ctx = await playwrightRequest.newContext({ timeout: 60_000 });
  try {
    // warmup remove cold-start da amostragem
    await ctx.get(`${API_BASE}/team/`, { params: { name: 'warmup' } });

    const baselines: number[] = [];
    for (let i = 0; i < 10; i++) {
      const t0 = Date.now();
      const res = await ctx.get(`${API_BASE}/team/`, { params: { name: 'Flamengo' } });
      const ms = Date.now() - t0;
      expect(res.status(), `baseline #${i}: status=${res.status()}`).toBeLessThan(500);
      baselines.push(ms);
    }
    const sorted = [...baselines].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const p95 = quantile(sorted, 0.95);
    const iqr = q3 - q1;

    // Threshold: p95 + 2*IQR absorve jitter da cauda. SLEEP detecta-se quando
    // o atraso excede ainda o tempo de sleep esperado (em ms).
    const threshold = p95 + 2 * iqr + SLEEP_SECONDS * 1000;

    console.warn(
      `[security] time-SQLi baseline n=${baselines.length} ` +
        `min=${sorted[0]}ms p25=${q1.toFixed(0)}ms p75=${q3.toFixed(0)}ms ` +
        `p95=${p95.toFixed(0)}ms iqr=${iqr.toFixed(0)}ms ` +
        `threshold=${threshold.toFixed(0)}ms`,
    );

    const slow: { payload: string; ms: number; thresholdMs: number }[] = [];
    for (const payload of TIME_PAYLOADS) {
      const t0 = Date.now();
      const res = await ctx.get(`${API_BASE}/team/`, { params: { name: payload } });
      const ms = Date.now() - t0;
      expect(res.status(), `payload "${payload}": status=${res.status()}`).toBeLessThan(500);
      if (ms > threshold) slow.push({ payload, ms, thresholdMs: Math.round(threshold) });
    }

    expect(
      slow,
      `payloads time-based excederam threshold p95+2*IQR+${SLEEP_SECONDS}s: ` +
        `${JSON.stringify(slow)} — possível SQLi cega baseada em tempo`,
    ).toEqual([]);
  } finally {
    await ctx.dispose();
  }
});
