# BUG-019 — Segurança: cabeçalhos HTTP de proteção ausentes na home (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP)

**Severidade:** High
**Prioridade:** P1
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** N/N (toda resposta de https://www.kasa.live/ observada)
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- `curl` ou DevTools → Network disponível.

## Passos para reproduzir

1. Executar `curl -sI https://www.kasa.live/`.
2. Observar headers presentes/ausentes na resposta.
3. Cruzar com a lista de headers de segurança recomendados (OWASP Secure Headers Project).
4. Repetir via `npm run test:security` → o spec `automation/tests/security/security-headers.spec.ts` falha listando todos os ausentes.

## Resultado esperado

Resposta da home deveria incluir, no mínimo:

- `Strict-Transport-Security: max-age=...; includeSubDomains; preload` ✅ (presente)
- `X-Content-Type-Options: nosniff` ❌
- `X-Frame-Options: DENY` ou `SAMEORIGIN` (ou CSP `frame-ancestors`) ❌
- `Referrer-Policy: strict-origin-when-cross-origin` (ou similar) ❌
- `Content-Security-Policy` mínima limitando script/style sources ❌

## Resultado obtido

- `strict-transport-security: max-age=63072000` — presente (ok).
- `x-content-type-options` — **ausente** (permite MIME sniffing → XSS via tipo errado).
- `x-frame-options` — **ausente**.
- `content-security-policy` — **ausente** (sem `frame-ancestors`).
  - Combinação acima ⇒ site é vulnerável a **clickjacking** (qualquer site pode embedar https://www.kasa.live em `<iframe>`).
- `referrer-policy` — **ausente** (browser usa default e pode vazar URL completa em links cross-origin).

Saída do spec:

```
home (frontend): headers de segurança ausentes:
  - falta X-Content-Type-Options: nosniff
  - vulnerável a clickjacking (sem X-Frame-Options nem CSP frame-ancestors)
  - falta Referrer-Policy
```

## Ambiente

- URL: https://www.kasa.live/
- Browser/versão: Chromium 130 (Playwright headless) + curl 8.x
- Sistema: macOS 26.3.1
- Servidor: Vercel (`server: Vercel` no header)
- Data/hora do achado: 2026-05-02

## Evidência

- `automation/tests/security/security-headers.spec.ts` — falha reproduzível em CI.
- `bug-reports/evidence/BUG-019/` (curl output + spec failure log).

## Workaround conhecido

- Nenhum no lado do usuário. Proteção contra clickjacking pode ser parcialmente mitigada por extensões de browser (NoScript), mas não é solução para o público em geral.

## Sugestão de fix / hipótese de causa raiz

- **Causa raiz:** `next.config.js` (ou Vercel project settings) sem bloco `headers()` configurado. Vercel não emite headers de segurança por padrão.
- **Fix sugerido (Next.js 14+):**

  ```js
  // next.config.js
  module.exports = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            {
              key: 'Content-Security-Policy',
              value:
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://kasa-live.api.dev.loomi.com.br; frame-ancestors 'self'",
            },
          ],
        },
      ];
    },
  };
  ```

- Adicionar teste de regressão no CI (já existe: `npm run test:security`).
- Auditar via [securityheaders.com](https://securityheaders.com/?q=https%3A%2F%2Fwww.kasa.live%2F).

## Impacto no usuário

- **Clickjacking:** atacante pode embedar https://www.kasa.live num iframe transparente sob site malicioso e roubar cliques (ex.: "favoritar time", "excluir conta") sem que o usuário perceba.
- **MIME sniffing:** browser pode interpretar arquivo upload-able (avatar, etc.) como HTML/JS e executá-lo no contexto do domínio.
- **Vazamento de Referer:** URLs internas (com query params sensíveis) vazam para sites externos quando usuário clica num link.
- **Defense-in-depth:** ausência de CSP significa que UMA falha XSS comprometes tudo — não há segunda barreira.
