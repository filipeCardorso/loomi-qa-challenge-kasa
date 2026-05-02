import { test, expect } from '@playwright/test';
import { KasaApiClient, matchListResponseSchema } from '@support/apiClient';

/**
 * @api
 * Endpoint usado quando o usuário escolhe data futura na home.
 * Frontend envia `date_start=YYYY-MM-DD` (note o BUG documentado: ora `date_start`,
 * ora `date` — incosistência da API).
 *
 * Aceita resultado vazio (DEV pode não ter agenda futura).
 */
test.describe('API GET /match/?status=NOTSTARTED', () => {
  test('@api retorna 200 com envelope válido (mesmo com results vazios)', async ({ request }) => {
    const api = new KasaApiClient(request);
    const today = new Date().toISOString().slice(0, 10);
    const res = await api.getMatches({
      status: 'NOTSTARTED',
      date_start: today,
      with_channel: true,
    });

    expect(res.status(), `status code esperado 200, recebido ${res.status()}`).toBe(200);

    const body = (await res.json()) as unknown;
    const parsed = matchListResponseSchema.safeParse(body);
    expect(
      parsed.success,
      `schema inválido: ${parsed.success ? '' : JSON.stringify(parsed.error.format(), null, 2)}`,
    ).toBe(true);

    if (parsed.success) {
      expect(parsed.data.results, 'results deve ser array').toBeInstanceOf(Array);
    }
  });
});
