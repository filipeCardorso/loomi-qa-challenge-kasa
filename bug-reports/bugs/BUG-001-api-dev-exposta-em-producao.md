# BUG-001 — API DEV exposta em produção (kasa-live.api.dev.loomi.com.br)

**Severidade:** High
**Prioridade:** P1
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** N/N (todas as requisições XHR observadas em https://www.kasa.live/ apontam para o host DEV)
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/ (sem login).
- DevTools / Network capture disponível (ou snapshot de exploração já gerado em `docs/site-snapshots/exploration/__exploration-raw.json`).

## Passos para reproduzir

1. Abrir https://www.kasa.live/ em navegador limpo (sem cache/cookies).
2. Abrir DevTools → Network → filtrar por `XHR` / `Fetch`.
3. Recarregar a página e observar o host das chamadas de API (ex.: listagem de partidas, melhores momentos, calendário).
4. Conferir também o JSON salvo em `docs/site-snapshots/exploration/__exploration-raw.json` (campo `requests[*].url`).

## Resultado esperado

- O frontend de produção (`www.kasa.live`) consome um host de API igualmente de produção (ex.: `kasa-live.api.loomi.com.br` ou `api.kasa.live`).
- Nenhuma chamada do build de produção sai para hosts contendo `.dev.` no domínio.

## Resultado obtido

- 100% das chamadas XHR observadas saem para `https://kasa-live.api.dev.loomi.com.br/api/1.0/...`, ou seja, a build de produção está apontando para o ambiente de DEV.
- Risco real de: dados de teste vazando para usuários finais, dados de usuários reais sendo gravados no banco DEV, instabilidade do DEV derrubando a produção, e exposição pública de endpoints/recursos não-hardened.

## Ambiente

- URL: https://www.kasa.live/
- API observada: https://kasa-live.api.dev.loomi.com.br/api/1.0/
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/site-snapshots/exploration/__exploration-raw.json` (lista de requests com URL contendo `.api.dev.loomi.com.br`)
- `docs/exploration-notes.md` §3 (Endpoints API descobertos via Network) e §9 (cheiro S1)
- Screenshot: bug-reports/evidence/BUG-001/

## Workaround conhecido

- Nenhum no lado do usuário. Mitigação só é possível no lado do time: apontar o build de produção para o host de produção correto.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: variável de ambiente `NEXT_PUBLIC_API_URL` (ou equivalente) foi promovida para o build de produção apontando para o host DEV — provavelmente um deploy feito a partir de um `.env.production` mal preenchido ou de uma branch que não trocou a base URL.
- Fix sugerido:
  1. Auditar o pipeline de build/deploy do frontend e separar variáveis por ambiente (dev / staging / prod) com validação obrigatória no CI.
  2. Adicionar guard runtime: se `process.env.NODE_ENV === 'production'` e a base URL contiver `.dev.`, falhar o build.
  3. Após corrigir, invalidar caches de CDN e revisar o que foi gravado no banco DEV vindo de tráfego "real".

## Impacto no usuário

- Dados pessoais e ações de usuários reais (favoritos, integrações com Google Calendar, etc.) podem estar sendo persistidos em banco de desenvolvimento, sujeito a wipe, restore e acesso menos restrito.
- Indisponibilidade ou rate limit do ambiente DEV impacta diretamente todos os usuários de produção.
- Risco de compliance (LGPD): dados de produção em ambiente não-produtivo.
