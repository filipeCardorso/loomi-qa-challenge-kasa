import { test, expect } from '@playwright/test';
import { KasaApiClient, matchListResponseSchema } from '@support/apiClient';

/**
 * @api
 * Endpoint INPLAY — partidas ao vivo. Pode (e tipicamente vai) retornar lista
 * vazia em ambiente DEV. Validamos apenas o contrato.
 */
test.describe('API GET /match/?status=INPLAY', () => {
  test('@api retorna 200 e envelope válido (results pode ser vazio)', async ({ request }) => {
    const api = new KasaApiClient(request);
    const today = new Date().toISOString().slice(0, 10);
    const res = await api.getMatches({
      status: 'INPLAY',
      with_channel: true,
      date_start: today,
    });

    expect(res.status(), `status code esperado 200, recebido ${res.status()}`).toBe(200);

    const body = (await res.json()) as unknown;
    const parsed = matchListResponseSchema.safeParse(body);
    expect(
      parsed.success,
      `schema inválido: ${parsed.success ? '' : JSON.stringify(parsed.error.format(), null, 2)}`,
    ).toBe(true);

    if (parsed.success) {
      expect(typeof parsed.data.count, 'count deve ser numérico').toBe('number');
    }
  });
});
