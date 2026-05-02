import { test, expect } from '@playwright/test';
import { KasaApiClient, matchListResponseSchema } from '@support/apiClient';

/**
 * @api
 * Contract test do endpoint principal usado pela home: lista de partidas
 * finalizadas paginada. Validamos:
 *  - HTTP 200
 *  - envelope DRF (count/next/previous/results)
 *  - cada item bate com `matchSchema` (passthrough — campos extras OK)
 */
test.describe('API GET /match/?status=ENDED', () => {
  test('@api retorna 200 e envelope paginado válido', async ({ request }) => {
    const api = new KasaApiClient(request);
    const res = await api.getMatches({ status: 'ENDED', with_channel: true });

    expect(res.status(), `status code esperado 200, recebido ${res.status()}`).toBe(200);

    const body = (await res.json()) as unknown;
    const parsed = matchListResponseSchema.safeParse(body);
    expect(
      parsed.success,
      `schema inválido: ${parsed.success ? '' : JSON.stringify(parsed.error.format(), null, 2)}`,
    ).toBe(true);

    if (parsed.success) {
      expect(parsed.data.count, 'count deve ser > 0 (existem partidas históricas)').toBeGreaterThan(
        0,
      );
      expect(
        parsed.data.results.length,
        'page 1 deve trazer ao menos 1 resultado',
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
