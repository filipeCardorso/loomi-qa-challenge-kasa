import { test, expect } from '@playwright/test';
import { KasaApiClient, teamListResponseSchema } from '@support/apiClient';

/**
 * @api
 * Typeahead de times — usado pelo input "Qual time?" da home.
 * Esperamos pelo menos 1 resultado contendo "Flamengo" ao buscar por esse termo.
 */
test.describe('API GET /team/?name=Flamengo', () => {
  test('@api retorna 200 e ao menos 1 resultado contendo o termo', async ({ request }) => {
    const api = new KasaApiClient(request);
    const res = await api.getTeams('Flamengo');

    expect(res.status(), `status code esperado 200, recebido ${res.status()}`).toBe(200);

    const body = (await res.json()) as unknown;
    const parsed = teamListResponseSchema.safeParse(body);
    expect(
      parsed.success,
      `schema inválido: ${parsed.success ? '' : JSON.stringify(parsed.error.format(), null, 2)}`,
    ).toBe(true);

    if (parsed.success) {
      expect(parsed.data.results.length, 'esperado >=1 time matching "Flamengo"').toBeGreaterThan(
        0,
      );
      const allMatch = parsed.data.results.every((t) => /flameng/i.test(t.name));
      expect(allMatch, `todos os resultados devem conter "Flameng" no nome`).toBe(true);
    }
  });
});
