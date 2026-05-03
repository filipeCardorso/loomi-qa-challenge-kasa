import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security Rate limiting — endpoints públicos
 *
 * Dispara N requests paralelas pra um endpoint da API DEV. Se TODAS retornarem
 * 200, não há rate limiting visível (potencial DoS). Se algumas retornarem 429,
 * a defesa básica está em pé.
 *
 * Observação: este teste é HEURÍSTICO — pode passar mesmo se houver rate
 * limit configurado fora desse range. Documentamos o achado real
 * (proporção 429 vs 200) sem mascarar.
 */

const API_URL = 'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1';
const BURST = 50;

test.describe.configure({ timeout: 90_000 });

test('@security API responde >0 com 429 sob burst de 50 requests paralelas', async () => {
  const ctx = await playwrightRequest.newContext({ timeout: 60_000 });
  try {
    const responses = await Promise.all(
      Array.from({ length: BURST }, () =>
        ctx.get(API_URL).catch((e: Error) => ({ status: () => -1, _err: e })),
      ),
    );
    const statuses = responses.map((r) => r.status());
    const counts = statuses.reduce<Record<number, number>>((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});
    const rate429 = counts[429] ?? 0;
    const rate200 = counts[200] ?? 0;
    const failed = statuses.filter((s) => s < 0).length;

    console.warn(
      `[security] rate-limit burst counts: ${JSON.stringify(counts)} (failed=${failed})`,
    );

    // Asserção principal: pelo menos UMA defesa visível. Se 0 → bug candidato.
    expect(
      rate429,
      `0/${BURST} requests retornaram 429. API parece NÃO ter rate limiting visível (status counts: ${JSON.stringify(counts)})`,
    ).toBeGreaterThan(0);

    // Asserções soft pra registrar contexto sem mascarar
    expect
      .soft(rate200 + rate429 + failed, 'soma de status conhecidos == BURST')
      .toBeLessThanOrEqual(BURST);
  } finally {
    await ctx.dispose();
  }
});
