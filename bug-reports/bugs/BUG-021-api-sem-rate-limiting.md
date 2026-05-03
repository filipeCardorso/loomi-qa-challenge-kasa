# BUG-021 — Segurança: API DEV sem rate limiting visível (50/50 requests paralelas → 200)

**Severidade:** High
**Prioridade:** P1
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 50/50 requests paralelas a `/api/1.0/match/?status=ENDED&page=1` retornaram 200 OK
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Endpoints públicos da API DEV expostos em produção (BUG-001).
- Acesso à internet a partir de um único IP (sem distribuição botnet).

## Passos para reproduzir

1. Disparar 50 requests `GET` paralelas para `https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1`.
2. Observar status codes retornados.
3. Reprodução automatizada: `npm run test:security` → `rate-limiting.spec.ts`.
4. Reprodução manual: `seq 50 | xargs -P 50 -I{} curl -s -o /dev/null -w "%{http_code}\n" "https://kasa-live.api.dev.loomi.com.br/api/1.0/match/?status=ENDED&page=1" | sort | uniq -c`.

## Resultado esperado

- Após N requests dentro de uma janela curta vinda do mesmo IP, a API deveria retornar `HTTP 429 Too Many Requests` para os requests excedentes.
- Para endpoints anônimos públicos: limite recomendado 60-120 req/min/IP (configurável).

## Resultado obtido

- **50/50 requests paralelas retornaram 200 OK.** Nenhum 429 observado.
- Output do spec:

  ```
  [security] rate-limit burst counts: {"200":50} (failed=0)
  Error: 0/50 requests retornaram 429. API parece NÃO ter rate limiting visível
         (status counts: {"200":50})
  ```

- Sem rate limiting → endpoint sujeito a:
  1. **Scraping massivo** (clonar todo o catálogo de partidas/times/campeonatos).
  2. **Negação de serviço** de baixo custo (1 atacante consegue saturar workers gunicorn).
  3. **Brute force** em endpoints de autenticação (caso o mesmo middleware seja aplicado a `/auth/`).

## Ambiente

- URL: https://kasa-live.api.dev.loomi.com.br/api/1.0/match/
- Burst: 50 requests paralelas via Playwright `apiRequestContext` de um único IP residencial.
- Browser/versão: Playwright 1.50 (Node 20)
- Sistema: macOS 26.3.1
- Data/hora do achado: 2026-05-02

## Evidência

- `automation/tests/security/rate-limiting.spec.ts` — falha reproduzível.
- `bug-reports/evidence/BUG-021/` (output do spec mostrando counts).

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- **Causa raiz:** Django/DRF sem `DEFAULT_THROTTLE_CLASSES` configurado, sem WAF (Cloudflare/Vercel Edge Middleware/AWS API Gateway) à frente.
- **Fix sugerido (curto prazo, DRF):**

  ```python
  # settings.py
  REST_FRAMEWORK = {
      'DEFAULT_THROTTLE_CLASSES': [
          'rest_framework.throttling.AnonRateThrottle',
          'rest_framework.throttling.UserRateThrottle',
      ],
      'DEFAULT_THROTTLE_RATES': {
          'anon': '60/min',
          'user': '300/min',
      },
  }
  ```

- **Fix sugerido (médio prazo):** colocar Cloudflare ou AWS WAF na frente da API com regras de rate limit por IP + bot challenge.
- Após implementação: re-rodar `npm run test:security` para validar 429 em burst.

## Impacto no usuário

- **Risco de scraping:** competidores podem clonar todo o catálogo (times, escudos, campeonatos, partidas históricas) em minutos.
- **Risco de DoS:** 1 atacante consegue derrubar o serviço de busca de partidas — afetando todos os usuários.
- **Custo de infra:** sem rate limit, custo de tráfego pode escalar via abuse não-mitigado.
- **Compliance:** OWASP API Top 10 2023 lista "API4: Unrestricted Resource Consumption" como vulnerabilidade crítica.
