import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security JWT tampering — alg=none e assinatura inválida
 *
 * Se a API aceitar JWT com `alg: "none"` ou assinatura adulterada, atacante
 * pode forjar identidades. Atacamos endpoints autenticados com 3 tokens
 * forjados e validamos que o backend rejeita (4xx — tipicamente 401/403)
 * sem retornar payload de usuário.
 *
 * Polaridade dura: erro de rede falha o teste (sem `.catch` swallow).
 * Vacuidade: se NENHUM dos paths existe (todos 404 sem token), abortamos
 * com `test.fail` explícito — não mascarar como verde.
 */

const API_BASE = 'https://kasa-live.api.dev.loomi.com.br/api/1.0';

function b64url(json: object) {
  return Buffer.from(JSON.stringify(json))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const FORGED_TOKENS = {
  'alg=none': `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: 'attacker', email: 'evil@example.com', exp: 9999999999 })}.`,
  'alg=HS256 sig vazia': `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: 'attacker', exp: 9999999999 })}.`,
  'sig adulterada': `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: 'attacker', exp: 9999999999 })}.aGFja2VkLXNpZ25hdHVyZQ`,
};

const PROTECTED_PATHS = ['/user/me/', '/favorite/', '/calendar/'];

test.describe.configure({ timeout: 120_000 });

test.describe('JWT tampering', () => {
  test.beforeAll(async () => {
    // Discovery: pelo menos UM dos PROTECTED_PATHS precisa retornar 401/403
    // sem token. Se todos derem 404, o teste seria vacuoso (qualquer token
    // forjado "passa" porque não há gate). Falhamos cedo com mensagem clara.
    const ctx = await playwrightRequest.newContext({ timeout: 30_000 });
    try {
      const probes = await Promise.all(
        PROTECTED_PATHS.map(async (path) => {
          const res = await ctx.get(`${API_BASE}${path}`);
          return { path, status: res.status() };
        }),
      );
      const gated = probes.filter((p) => p.status === 401 || p.status === 403);
      expect(
        gated.length,
        `nenhum dos endpoints "protegidos" exige Authorization (todos retornaram outros status). ` +
          `probes=${JSON.stringify(probes)} — teste seria vacuoso, falha cedo.`,
      ).toBeGreaterThan(0);
    } finally {
      await ctx.dispose();
    }
  });

  for (const [label, token] of Object.entries(FORGED_TOKENS)) {
    test(`@security JWT forjado (${label}) é rejeitado em endpoints autenticados`, async () => {
      const ctx = await playwrightRequest.newContext({ timeout: 30_000 });
      try {
        const accepted: { path: string; status: number; body: string }[] = [];
        for (const path of PROTECTED_PATHS) {
          // Sem `.catch` — erro de rede DEVE falhar o teste
          const res = await ctx.get(`${API_BASE}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const status = res.status();
          const body = (await res.text()).slice(0, 500);

          const looksAuthed = status >= 200 && status < 300;
          if (looksAuthed) accepted.push({ path, status, body: body.slice(0, 200) });
        }

        expect(
          accepted,
          `JWT forjado (${label}) recebeu 2xx em: ${JSON.stringify(accepted)} — ` +
            `backend não valida assinatura/alg corretamente`,
        ).toEqual([]);
      } finally {
        await ctx.dispose();
      }
    });
  }
});
