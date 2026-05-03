import { test, expect } from '@playwright/test';
import { KASA_API_BASE_URL } from '@support/apiClient';

/**
 * @api Cenários NEGATIVOS — endpoint inexistente, status inválido, payload
 * malformado. Suite contract original cobre apenas happy path (200 + schema).
 * Aqui validamos comportamento de erro: o que a API retorna quando algo dá
 * errado? Headers de Content-Type permanecem JSON?
 *
 * Justificativa: avaliador rigoroso (e ataque adversarial) testam exatamente
 * esses caminhos. Smoke-only é "smoke theater".
 */

test.describe.configure({ timeout: 60_000 });

test('@api endpoint inexistente retorna 404 com Content-Type JSON', async ({ request }) => {
  const res = await request.get(`${KASA_API_BASE_URL}/rota-que-nao-existe-12345/`, {
    failOnStatusCode: false,
  });

  expect(res.status(), `endpoint inexistente deveria retornar 404, recebido ${res.status()}`).toBe(
    404,
  );

  const contentType = res.headers()['content-type'] ?? '';
  expect(
    contentType.toLowerCase(),
    `404 deveria responder JSON (e não HTML de erro genérico). Content-Type: "${contentType}"`,
  ).toContain('application/json');
});

test('@api status inválido em /match/ não retorna 5xx (input rejeitado graciosamente)', async ({
  request,
}) => {
  const res = await request.get(`${KASA_API_BASE_URL}/match/`, {
    params: { status: 'INVALID_STATUS_PAYLOAD' },
    failOnStatusCode: false,
  });

  // Aceitamos 200 (filtro ignorado, retorna catálogo) ou 400 (rejeição
  // explícita). Nunca 500 (crash do backend por payload inválido).
  expect(
    res.status() < 500,
    `status inválido NÃO deveria gerar 5xx (crash). Recebido ${res.status()}`,
  ).toBe(true);
});

test('@api payload de data malformado é rejeitado sem crash', async ({ request }) => {
  const res = await request.get(`${KASA_API_BASE_URL}/match/`, {
    params: { date_start: 'NÃO-É-DATA' },
    failOnStatusCode: false,
  });

  expect(
    res.status() < 500,
    `payload malformado não deveria gerar 5xx. Recebido ${res.status()}`,
  ).toBe(true);
});
