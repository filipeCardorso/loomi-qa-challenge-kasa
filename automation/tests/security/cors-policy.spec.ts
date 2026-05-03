import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * @security CORS — política da API DEV
 *
 * A API kasa-live.api.dev.loomi.com.br é consumida pelo frontend www.kasa.live.
 * Esperamos que `Access-Control-Allow-Origin` seja restrito a esse domínio
 * (ou a uma allowlist explícita) — NUNCA `*` quando há cookies/credentials.
 *
 * Heurísticas:
 *   - Origin malicioso recebe ACAO=*: warning (permitido se sem credentials).
 *   - ACAO=* combinado com Allow-Credentials=true: BLOQUEANTE (impossível
 *     pelo spec, mas alguns proxies reescrevem).
 *   - ACAO espelhando o Origin enviado (refletivo): bug — qualquer site pode
 *     ler responses autenticadas se cookies forem cross-site.
 */

const API_URL = 'https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1';

test.describe.configure({ timeout: 60_000 });

test('@security CORS: API não reflete Origin arbitrário com credentials', async () => {
  const evilOrigin = 'https://evil.example.com';
  const ctx = await playwrightRequest.newContext({ timeout: 45_000 });
  try {
    const res = await ctx.get(API_URL, { headers: { Origin: evilOrigin } });

    const headers = res.headers();
    const acao = headers['access-control-allow-origin'];
    const acac = headers['access-control-allow-credentials'];

    expect.soft(res.status(), 'API respondeu sem erro').toBeLessThan(500);

    console.warn(
      `[security] CORS GET: ACAO=${acao ?? '(absent)'} ACAC=${acac ?? '(absent)'} status=${res.status()}`,
    );

    // Caso 1: ACAO espelhando origin malicioso → bug claro
    expect(
      acao,
      `Access-Control-Allow-Origin reflete Origin malicioso ("${evilOrigin}") — qualquer site pode ler respostas`,
    ).not.toBe(evilOrigin);

    // Caso 2: ACAO=* + Allow-Credentials=true é proibido pelo spec
    if (acao === '*' && acac === 'true') {
      expect(
        false,
        `combinação inválida: ACAO=* + Access-Control-Allow-Credentials=true (spec proíbe, navegador rejeita mas server está mal configurado)`,
      ).toBe(true);
    }
  } finally {
    await ctx.dispose();
  }
});

test('@security CORS preflight responde sem expor wildcard com credentials', async () => {
  const ctx = await playwrightRequest.newContext({ timeout: 45_000 });
  try {
    const res = await ctx.fetch(API_URL, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });
    const headers = res.headers();
    const acao = headers['access-control-allow-origin'];
    const acac = headers['access-control-allow-credentials'];

    console.warn(
      `[security] CORS preflight: status=${res.status()} ACAO=${acao ?? '(absent)'} ACAC=${acac ?? '(absent)'}`,
    );

    if (acao === '*' && acac === 'true') {
      expect(false, 'preflight com ACAO=* + Allow-Credentials=true').toBe(true);
    }

    // Não deve permitir Authorization de um origin arbitrário
    const allowedHeaders = (headers['access-control-allow-headers'] || '').toLowerCase();
    if (allowedHeaders.includes('authorization') && acao === 'https://evil.example.com') {
      expect(false, 'preflight permite Authorization vindo de origin malicioso').toBe(true);
    }
  } finally {
    await ctx.dispose();
  }
});
