# Relatório de Progresso — Desafio QA Loomi

**Filipe Gabriel · 2026-05-04**

---

## 1. Visão geral da entrega

Entrega completa do desafio QA Loomi (escopo Pleno S1) com todos os números do PDF estourados em todos os eixos e a Tarefa 4 (MCP Server) implementada bem além do mínimo. A estratégia foi conduzir três trilhas paralelas (Functional QA, Automation, Platform/MCP) num monorepo TypeScript com Playwright como runner único cobrindo E2E, API, Visual, A11y e Performance, e Allure publicado em GitHub Pages como entregável navegável.

### Métricas finais

| Eixo      | Pleno S1 (PDF) | Entregue             | Delta     |
| --------- | -------------- | -------------------- | --------- |
| Casos BDD | 40             | **56**               | **+40%**  |
| Bugs      | 12             | **18**               | **+50%**  |
| Melhorias | 8              | **10**               | **+25%**  |
| Automação | 30-32          | **45**               | **+40%**  |
| Tools MCP | 3 mandatórias  | **7 (3 + 4 extras)** | **+133%** |

### Links principais

- **Repositório:** https://github.com/filipeCardorso/loomi-qa-challenge-kasa
- **Trello (board público):** https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
- **Allure Report (GitHub Pages):** https://filipecardorso.github.io/loomi-qa-challenge-kasa/
- **Documentos:** [docs/](.) (architecture · coverage-matrix · evaluator-journey · exit-criteria · submission-checklist · mcp-tutorial · exploration-notes)

---

## 2. Como organizei demandas e atividades

### Trello board público

Listas: Backlog · Sprint atual (48h) · Em andamento (WIP=3) · Em revisão · Concluído · Bugs reportados · Melhorias sugeridas · Bloqueios/Riscos. Labels por severidade (Critical/High/Medium/Low), por trilha (A/B/C) e por tarefa (1/2/3/4). Cards de bug usam o mesmo schema do `.md` no repo para copy-paste 1:1 (ver `bug-reports/bugs/`).

### Três trilhas paralelas

| Trilha                 | Foco                                          | Pasta primária                                             | Output mensurável                                       |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| **A — Functional QA**  | Exploração, charters, BDD, bugs, melhorias    | `test-cases/`, `bug-reports/`, `docs/exploration-notes.md` | 56 BDD + 18 bugs + 10 melhorias                         |
| **B — Automation**     | POMs, fixtures, suite Playwright em 5 camadas | `automation/`                                              | 45 testes (27 E2E + 5 API + 5 visual + 5 a11y + 3 perf) |
| **C — Platform / MCP** | MCP server, Resources, tutorial reproduzível  | `mcp-server/`, `docs/mcp-tutorial.md`                      | 7 tools + 31 testes Vitest + tutorial                   |

### Cadência

- **Push a cada hora** ou ao terminar bloco lógico (48 commits ao todo).
- **Conventional Commits** mandatório (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `ci:`, `perf:`).
- **Self-PRs** auditáveis com `.github/PULL_REQUEST_TEMPLATE.md` para marcar checkpoints.
- **Subagentes paralelos** dispatchados em janelas específicas (ver Seção 4) — eu coordeno e reviso, agentes não decidem escopo.

---

## 3. Como priorizei as entregas

Critério-mestre: **cobertura × impacto × tempo**. Em cada decisão de escopo, comparei o ganho marginal (cobertura nova ou risco mitigado) contra o custo em horas e o que isso impedia de entregar em outra trilha.

### Decisões de priorização aplicadas

1. **Funcionalidades core acima de extras** — favoritar times, favoritar partidas, buscar partidas, melhores momentos receberam ≥7 cenários BDD cada antes de qualquer extra.
2. **Camadas de automação acima de quantidade** — preferi 27 E2E sólidos cobrindo 5 camadas (E2E + API + Visual + A11y + Perf) a inflar o número com mais E2E redundantes.
3. **Bugs Critical/High primeiro** — `bug-reports/` priorizou os 5 bugs Critical/High (API DEV em produção, modal de partida finalizada vazio, a11y aria-allowed-attr, a11y button-name, Lighthouse Perf = 41) antes de Medium/Low.
4. **MCP funcional antes de extras** — tools mandatórias (`run_test_case`, `get_element_status`) verdes em Vitest **antes** de adicionar `list_test_cases`, `navigate_to`, `extract_dom_snapshot`, `analyze_failure`.
5. **Allure publicado > Allure local** — investi tempo de CI para que o avaliador clique e veja o report em URL pública, sem precisar instalar nada.

### Cortes deliberados (não-objetivos)

- **OAuth Google end-to-end:** custo > benefício em 48h. Cobri com 2 BDD manuais + 1 E2E que valida apenas a iniciação do flow (R3).
- **Testes de carga / stress:** fora de escopo (Pleno S1 não pede); apenas perf single-user via Lighthouse.
- **Mock server completo do kasa.live:** testamos o site real para reproduzibilidade.
- **Internacionalização:** site é PT-BR.

---

## 4. Cronograma executado

### Real (extraído do `git log`)

| Janela            | Atividade                                                                                                                                | Commits           | Trilha |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| 02/05 11:50–12:30 | Spec design + foundation (deps, ts, lint, prettier)                                                                                      | a80ef6f → 922c06a | ✱      |
| 02/05 12:30–14:00 | CI workflows + plano 16 fases + Trello + lockfile                                                                                        | 4264e5d → 3435795 | ✱      |
| 02/05 14:00–15:30 | MCP skeleton + `run_test_case` mínimo + pre-commit hook                                                                                  | 5c24e2d → 6e0ec57 | C      |
| 02/05 15:00–15:45 | MCP `get_element_status` + `navigate_to` + Resources + 4 tools extras + Vitest 80%+ + tutorial                                           | f67741e → 1b5ad80 | C      |
| 02/05 15:30–16:10 | Onda 0 — Exploração kasa.live (90min, automated via Playwright)                                                                          | efccf5c → 0c35761 | A      |
| 02/05 16:20–16:35 | POMs base + 5 componentes + fixtures + 8 E2E `@smoke @core`                                                                              | 384b9e6 → 1e7b0f1 | B      |
| 02/05 16:24–17:00 | Fixes (storageState, isLoggedIn, smoke chromium, login-flow timeout) + E2E batch 2 (12 testes) + API tests (5)                           | b4f829e → 7825b84 | B      |
| 02/05 17:20       | Visual regression (5) + A11y axe-core (5) + Perf Lighthouse (3)                                                                          | 026ac21 → 2302f51 | B      |
| 02/05 17:28–17:35 | BDD 56 cenários (favoritar / busca / momentos / calendar / nav / responsividade / extras)                                                | 9da43d3 → f1ba9f5 | A      |
| 02/05 17:40–17:51 | 18 bugs documentados (BUG-001 a BUG-018) + 10 melhorias + README índice geral                                                            | fd66d7a → a3213fb | A      |
| 02/05 18:00–18:30 | E2E batch 3 (calendário, profile popover, notifications, modal close) + fix CI Allure CLI + link no README                               | 56b6a43 → 9d94b6d | B + ✱  |
| 02/05 18:30+      | **Docs finais (este relatório, coverage-matrix, architecture, evaluator-journey, exit-criteria, submission-checklist, CHANGELOG 1.0.0)** | (em curso)        | ✱      |

### Planejado vs real

O cronograma original previa 49h wall-clock distribuídas em 3 dias (~30h produtivas). Na prática a sessão concentrou-se em uma janela compacta com agentes paralelos cobrindo bug reports e BDDs em batch, o que acelerou as fases de documentação. Os checkpoints da spec (final dia 1: ≥6 bugs + 8 E2E + MCP esqueleto) foram atingidos dentro da janela; checkpoint final (56 BDD + 45 auto + 18 bugs + 10 melhorias + MCP funcional + Allure publicado) também.

---

## 5. Principais dificuldades e como lidei

Top 5 honesto, sem polimento:

1. **Conta de teste — site usa email/senha local + Google OAuth.** Optei por login local (email/senha) em todos os fluxos automatizados; OAuth ficou coberto por 2 BDD manuais + 1 E2E que valida apenas iniciação do flow. Decisão registrada em R3 da spec. Documentado em `docs/exploration-notes.md` seções 13-15.
2. **API DEV exposta em produção** (`api-dev.kasa.live` retornando dados reais de produção). Virou bug Critical (BUG-001), e ainda forçou ampliar timeouts dos testes que dependiam dessa API (commits `393efff`, `7825b84`). Aprendizado: bug do site impactou o desenho da automação.
3. **35 aria-label duplicados ("Go to previous month")** detectados via axe-core + inspeção DOM. Virou BUG-002 + BUG-013 (a11y aria-allowed-attr Critical) + BUG-014 (button-name Critical). Forçou também o reforço da regra interna de seletores: `getByRole` com `name` específico, evitar `.first()` sem justificativa.
4. **Storage state com session cookie expirando** entre rodadas. Resolvi com fixture `loggedInPage` que faz re-login automático quando detecta `isLoggedIn === false`, em vez de assumir o storage state válido (commit `b4f829e`). Padrão replicável.
5. **Modal de partida finalizada sempre vazio** independente do match selecionado (BUG-011, High). Descoberto durante E2E batch 2; a princípio parecia bug do teste, depois da terceira reprodução com `route.intercept` confirmei que era o site. Esse caso reforçou a regra "antes de marcar @flaky, prove que é o site".

---

## 6. Decisões técnicas relevantes

- **Playwright como runner único** (E2E + API + Visual + A11y + Perf) — uma stack, um report (Allure), uma curva. Evita fragmentação típica de "Cypress pra E2E + Postman pra API + Percy pra visual + Pa11y pra a11y".
- **BDD como documentação, não como runtime** — Gherkin em `.feature` arquivos para os 56 cenários (atende Tarefa 1 do PDF), automação usa `test.step('Given...')`. Sem o overhead de tradução cara entre `.feature` e código que o Cucumber impõe.
- **MCP server em Node/TS** — mesma stack do resto do projeto; SDK oficial `@modelcontextprotocol/sdk`; transport stdio (padrão Claude Desktop, sem porta/auth).
- **Login email/senha local em vez de Google OAuth** — viabilidade em 48h. OAuth é coberto manualmente.
- **Allure publicado em GH Pages** (não só local) — entregável tem URL pública navegável. Resolvi quebra do action `simple-elf/allure-report-action` substituindo pela CLI Allure direta (commit `6ef3392`).
- **Docker disponível mas opcional** — `Dockerfile` baseado em `mcr.microsoft.com/playwright`; quick start oficial é via `nvm use && npm install` para minimizar fricção do avaliador.
- **Snapshot do site na exploração** (`docs/site-snapshots/`) — backup HTML/PNG caso kasa.live caia (mitigação R1).

---

## 7. O que faria diferente com mais tempo

- **Sincronização automática Trello via API** (hoje é manual mas disciplinada — 1. cria `.md`, 2. cria card, 3. links cruzados). Em 48h o custo > benefício.
- **Cobertura mobile mais profunda** via real devices (BrowserStack ou similar) — hoje uso emulação Chromium com viewports.
- **Mutation testing** (Stryker) nos testes para validar a qualidade dos asserts, não só a execução.
- **Testes contra ambiente PROD distinto de DEV** assim que o time disponibilizar (BUG-001 expõe o problema de DEV em PROD).
- **Vídeo demo melhor produzido** (com cortes, narração, GIF do MCP em ação) — o atual é Loom direto.

---

## 8. Métricas finais

| Eixo      | Pleno S1 (PDF) | Entregue | Delta     |
| --------- | -------------- | -------- | --------- |
| Casos BDD | 40             | **56**   | **+40%**  |
| Bugs      | 12             | **18**   | **+50%**  |
| Melhorias | 8              | **10**   | **+25%**  |
| Automação | 30-32          | **45**   | **+40%**  |
| Tools MCP | 3              | **7**    | **+133%** |

### Diferenciais não-mensuráveis pelo PDF

- Multi-browser ready (chromium default; firefox/webkit no `nightly.yml`)
- Multi-viewport (desktop + mobile via responsividade)
- Visual regression com baseline + masking
- A11y WCAG 2.1 AA via axe-core (5 testes + 4 bugs a11y)
- Performance via Lighthouse com thresholds documentados
- Allure publicado em URL pública (https://filipecardorso.github.io/loomi-qa-challenge-kasa/)
- CI verde com smoke ≤5min + nightly full
- Docker disponível (Playwright official image)
- 31 testes Vitest do próprio MCP (≥80% coverage target)
- Documentação reproduzível ponta-a-ponta (este relatório + tutorial MCP + evaluator journey + exit-criteria + submission-checklist)
