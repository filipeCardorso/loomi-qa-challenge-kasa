# BUG-008 — Inconsistência de contrato na API: `date_start=` vs `date=` em chamadas similares (design debt)

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Categoria:** Design debt / DX (não bug funcional — ver `Resultado obtido`)
**Reproduzibilidade:** Sempre
**Frequência observada:** Múltiplos endpoints capturados — alguns usam `?date_start=YYYY-MM-DD`, outros usam `?date=YYYY-MM-DD` para a mesma semântica
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/zKVntVFT

## Pré-condição

- Acesso público a https://www.kasa.live/.
- DevTools / Playwright capturando Network.

## Passos para reproduzir

1. Abrir https://www.kasa.live/ com DevTools → Network → filtrar `Fetch/XHR`.
2. Recarregar a home e observar as chamadas para `https://kasa-live.api.dev.loomi.com.br/api/1.0/...`.
3. Filtrar requests cujo path contém data (busca, calendário, partidas, melhores momentos).
4. Comparar os nomes dos query params usados — observar que pelo menos uma chamada usa `date_start=` e outra usa `date=` para representar essencialmente "data inicial de filtro".
5. Conferir o JSON salvo em `docs/site-snapshots/exploration/__exploration-raw.json` (campo `requests[*].url`).

## Resultado esperado

- A API expõe um único nome de parâmetro consistente para "data" / "data inicial" em todos os endpoints (ex.: `date_start` em todos, ou `date` em todos).
- Documentação OpenAPI/Swagger em sync com o que o frontend envia.
- Contratos validados em testes de API (contract tests).

## Resultado obtido

- O frontend envia ora `?date_start=YYYY-MM-DD`, ora `?date=YYYY-MM-DD` para chamadas que aparentam ter a mesma semântica.
- **Validação adicional (2026-05-03):** ambos os parâmetros foram testados via `curl` no mesmo endpoint `/api/1.0/match/?status=ENDED` e retornam `HTTP 200` com **estrutura de resposta idêntica** (`count`, `next`, `previous`, `results`), confirmando que **não é bug funcional** — é inconsistência de contrato (design debt). Ver `evidence/BUG-008/curl-date-start.json`, `curl-date.json` e `diff.txt`.
- Por isso a severidade foi rebaixada para **Low/P3**: o impacto é em DX/manutenção (não em comportamento percebido pelo usuário).
- Risco: ao adicionar um novo endpoint, dev novo escolhe "qual dos dois" arbitrariamente; eventual divergência futura entre os aliases pode introduzir bugs silenciosos de filtro.

## Ambiente

- API base: https://kasa-live.api.dev.loomi.com.br/api/1.0/
- URL frontend: https://www.kasa.live/
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §3 (Endpoints API descobertos via Network) e §9 (cheiro S8)
- `docs/site-snapshots/exploration/__exploration-raw.json` (lista de URLs de request — buscar por `date_start=` e `date=`)
- Screenshot: bug-reports/evidence/BUG-008/

## Workaround conhecido

- Nenhum no lado do usuário. Para QA: tratar os dois nomes ao escrever testes de contrato.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: API foi evoluída por times/sprints diferentes; um endpoint herdou `date=` legado e o novo adotou `date_start=` sem deprecation/migration plan.
- Fix sugerido:
  1. Auditar todos os endpoints e padronizar para um único nome (`date_start` é mais explícito).
  2. Manter o nome antigo como **alias depreciado** por 1-2 sprints, retornando warning header (`Deprecation: true`).
  3. Atualizar OpenAPI/Swagger e o cliente do frontend.
  4. Adicionar teste de contrato (ex.: Pact) bloqueando regressão.

## Impacto no usuário

- **Direto: nenhum hoje** (ambos params funcionam — confirmado em 2026-05-03).
- Indireto: inconsistência aumenta probabilidade de bugs futuros em filtros de data se um dos aliases for descontinuado sem migração.
- DX/QA: complica documentação, contract testing e onboarding de devs.
- Performance: potencial de cache HTTP/CDN ineficiente quando query params variam por endpoint.
