# BUG-020 — Segurança: API DEV sem HSTS (Strict-Transport-Security) nem CSP

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** N/N (toda resposta de https://kasa-live.api.dev.loomi.com.br/ observada)
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/5Ff1yKKB

## Pré-condição

- A API kasa-live.api.dev.loomi.com.br é consumida diretamente pelo frontend de produção (BUG-001 ainda em aberto).
- `curl` ou DevTools disponível.

## Passos para reproduzir

1. Executar `curl -sI "https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1"`.
2. Observar headers retornados.
3. Conferir ausência de `strict-transport-security` e `content-security-policy`.
4. Reprodução automatizada: `npm run test:security` → `security-headers.spec.ts` (target "API DEV /match/").

## Resultado esperado

Mesmo sendo API JSON (consumo majoritariamente XHR), pelo menos:

- `Strict-Transport-Security: max-age=...` (impede downgrade para HTTP em primeiro hit).
- Cabeçalhos já presentes mantêm-se: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, `Cross-Origin-Opener-Policy: same-origin` ✅.

## Resultado obtido

Headers presentes na API DEV (positivos):

```
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: same-origin
cross-origin-opener-policy: same-origin
```

Headers ausentes:

- `strict-transport-security` — **ausente**. Cliente que digite `http://kasa-live.api.dev.loomi.com.br` no primeiro acesso é vulnerável a SSL stripping.
- `content-security-policy` — **ausente** (defense-in-depth para qualquer endpoint que sirva HTML, ex.: páginas de erro).

Output do spec:

```
API DEV /match/: headers de segurança ausentes:
  - falta HSTS (Strict-Transport-Security)
```

## Ambiente

- URL: https://kasa-live.api.dev.loomi.com.br/api/1.0/
- Servidor: gunicorn (Python/Django)
- Browser/versão: Chromium 130 (Playwright headless) + curl 8.x
- Sistema: macOS 26.3.1
- Data/hora do achado: 2026-05-02

## Evidência

- `automation/tests/security/security-headers.spec.ts` — falha reproduzível.
- `bug-reports/evidence/BUG-020/` (curl output).

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- **Causa raiz:** Django settings sem `SECURE_HSTS_SECONDS` configurado (ou load balancer / proxy reverso à frente do gunicorn que não injeta headers).
- **Fix sugerido (Django/DRF):**

  ```python
  # settings.py
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  SECURE_HSTS_SECONDS = 63072000  # 2 anos
  SECURE_HSTS_INCLUDE_SUBDOMAINS = True
  SECURE_HSTS_PRELOAD = True
  SECURE_SSL_REDIRECT = True
  CSP_DEFAULT_SRC = ("'none'",)  # endpoints JSON
  CSP_FRAME_ANCESTORS = ("'none'",)
  ```

  - `django-csp` middleware.

- Após corrigir BUG-001 (API DEV sendo consumida em PROD), submeter o domínio de prod ao [HSTS preload list](https://hstspreload.org/).

## Impacto no usuário

- **SSL stripping:** atacante MITM (rede pública, café) pode interceptar primeira request HTTP e proxiar como HTTPS roubando dados.
- **Acoplamento com BUG-001:** enquanto a API DEV for consumida pelo frontend de produção, esta vulnerabilidade afeta usuários reais.
- **Compliance:** auditoria de segurança (OWASP ASVS L1) reprova ausência de HSTS em qualquer host TLS público.
