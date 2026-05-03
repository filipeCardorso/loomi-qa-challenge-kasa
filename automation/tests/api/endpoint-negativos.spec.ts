import { test, expect } from '@playwright/test';
import { KASA_API_BASE_URL } from '@support/apiClient';

/**
 * @api Cenários NEGATIVOS — endpoint inexistente, status inválido, payload
 * malformado, headers de contrato e endpoints protegidos sem auth.
 *
 * Suite contract original cobre apenas happy path (200 + schema). Aqui
 * validamos: o que a API retorna quando algo dá errado? Headers permanecem
 * JSON+charset? Aliases de query (date= vs date_start=) realmente retornam
 * dados equivalentes (BUG-008)?
 *
 * Polaridade DURA: assert sem `.soft` — violação de contrato falha o teste.
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

test('@api endpoint protegido sem Authorization retorna 401/403', async ({ request }) => {
  // Schema-first em vez de regex no body: assert pelo STATUS CODE.
  // Se algum 200 ainda escapa, validamos no segundo gate que body NÃO é
  // JSON com chaves de usuário (id, email, sub). regex em body cru é frágil
  // (FP em "id":1 do listing público; FN em campos custom).
  const protectedPaths = ['/user/me/', '/favorite/'];
  const violations: { path: string; status: number; reason: string }[] = [];

  for (const path of protectedPaths) {
    const res = await request.get(`${KASA_API_BASE_URL}${path}`, { failOnStatusCode: false });
    const status = res.status();

    if (status === 401 || status === 403) continue;
    if (status === 404) {
      violations.push({ path, status, reason: 'endpoint não existe — gate ausente' });
      continue;
    }

    if (status === 200) {
      let parsed: unknown = null;
      try {
        parsed = await res.json();
      } catch {
        // body não-JSON em 200 num endpoint protegido já é violação
        violations.push({ path, status, reason: '200 com body não-JSON' });
        continue;
      }
      if (parsed && typeof parsed === 'object') {
        const keys = Object.keys(parsed as Record<string, unknown>);
        const userKeys = ['id', 'email', 'sub', 'user', 'profile'];
        if (keys.some((k) => userKeys.includes(k))) {
          violations.push({
            path,
            status,
            reason: `200 com chaves de usuário: ${keys.join(',')}`,
          });
        }
      }
      continue;
    }

    violations.push({ path, status, reason: `status inesperado` });
  }

  expect(
    violations,
    `endpoints sem Authorization tiveram comportamento inseguro: ${JSON.stringify(violations)}`,
  ).toEqual([]);
});

test('@api BUG-008: aliases date= e date_start= retornam dados equivalentes (não vacuoso)', async ({
  request,
}) => {
  // Janela ampla com alta probabilidade de retornar resultados não-vazios em
  // /match/?status=ENDED — partidas finalizadas no último mês.
  const fixedDate = '2026-04-01';

  const [resStart, resPlain] = await Promise.all([
    request.get(`${KASA_API_BASE_URL}/match/`, {
      params: { status: 'ENDED', date_start: fixedDate, page: 1 },
      failOnStatusCode: false,
    }),
    request.get(`${KASA_API_BASE_URL}/match/`, {
      params: { status: 'ENDED', date: fixedDate, page: 1 },
      failOnStatusCode: false,
    }),
  ]);

  expect(resStart.status(), 'date_start= deveria responder 200').toBe(200);
  expect(resPlain.status(), 'date= deveria responder 200').toBe(200);

  const a = (await resStart.json()) as { count?: number; results?: unknown[] };
  const b = (await resPlain.json()) as { count?: number; results?: unknown[] };

  // Estrutura: mesmas chaves de paginação
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  expect(
    keysA,
    `aliases retornam estruturas diferentes. ` +
      `keys(date_start)=${JSON.stringify(keysA)} keys(date)=${JSON.stringify(keysB)}`,
  ).toEqual(keysB);

  // Não-vacuidade: pelo menos UM dos aliases retorna registros — protege
  // contra falso positivo de "ambos vazios com mesmas keys".
  const totalA = Array.isArray(a.results) ? a.results.length : 0;
  const totalB = Array.isArray(b.results) ? b.results.length : 0;
  expect(
    totalA + totalB,
    `ambos aliases retornaram results vazio (count_total=${totalA + totalB}) — ` +
      `teste seria vacuoso. Aumente janela ou troque endpoint.`,
  ).toBeGreaterThan(0);

  // Equivalência de count (paginação total) — se um alias filtra e o outro
  // ignora, count divergiria.
  expect(a.count, `count divergente entre aliases: date_start=${a.count} date=${b.count}`).toBe(
    b.count,
  );
});

test('@api headers incluem Content-Type charset e ACAO não é literal "null"', async ({
  request,
}) => {
  const res = await request.get(`${KASA_API_BASE_URL}/match/`, {
    params: { status: 'ENDED', page: 1 },
  });

  const headers = res.headers();
  const contentType = (headers['content-type'] ?? '').toLowerCase();
  const acao = headers['access-control-allow-origin'];

  // Hard expect — violação de contrato falha o teste, sem `.soft`
  expect(contentType, `Content-Type ausente ou não-JSON: "${contentType}"`).toContain(
    'application/json',
  );
  expect(contentType, `Content-Type sem charset definido: "${contentType}"`).toMatch(/charset=/i);

  if (acao !== undefined) {
    expect(acao, `Access-Control-Allow-Origin="null" — bug clássico de CORS misconfig`).not.toBe(
      'null',
    );
  }
});
