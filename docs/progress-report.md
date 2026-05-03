# Relatório de Progresso — Desafio QA Loomi

**Filipe Gabriel · 2026-05-02 (entrega) · revisado 2026-05-03**

---

## 1. Visão geral da entrega

Entrega completa do desafio QA Loomi (escopo Pleno S1) com todos os números do PDF estourados em todos os eixos e a Tarefa 4 (MCP Server) implementada bem além do mínimo. A estratégia foi conduzir três trilhas paralelas (Functional QA, Automation, Platform/MCP) num monorepo TypeScript com Playwright como runner único cobrindo E2E, API, Visual, A11y, Performance e Security, e Allure publicado em GitHub Pages como entregável navegável.

### Métricas finais

| Eixo      | Pleno S1 (PDF) | Entregue             | Delta     |
| --------- | -------------- | -------------------- | --------- |
| Casos BDD | 40             | **64**               | **+60%**  |
| Bugs      | 12             | **21**               | **+75%**  |
| Melhorias | 8              | **11**               | **+38%**  |
| Automação | 30-32          | **106**              | **+212%** |
| Tools MCP | 3 mandatórias  | **7 (3 + 5 extras)** | **+133%** |

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

| Trilha                 | Foco                                          | Pasta primária                                             | Output mensurável                                                                           |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **A — Functional QA**  | Exploração, charters, BDD, bugs, melhorias    | `test-cases/`, `bug-reports/`, `docs/exploration-notes.md` | 64 BDD + 21 bugs + 11 melhorias                                                             |
| **B — Automation**     | POMs, fixtures, suite Playwright em 7 camadas | `automation/`                                              | 106 testes (26 E2E + 11 API + 5 visual + 5 a11y + 3 perf + 29 security + 23 bug-regression) |
| **C — Platform / MCP** | MCP server, Resources, tutorial reproduzível  | `mcp-server/`, `docs/mcp-tutorial.md`                      | 7 tools + 31 testes Vitest + tutorial                                                       |

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
2. **Camadas de automação acima de quantidade** — preferi 27 E2E sólidos cobrindo 6 camadas (E2E + API + Visual + A11y + Perf + Security) a inflar o número com mais E2E redundantes.
3. **Bugs Critical/High primeiro** — `bug-reports/` priorizou os 8 bugs Critical/High (cookie auth sem Secure/HttpOnly BUG-022, a11y aria-allowed-attr BUG-013, a11y button-name BUG-014, API DEV em produção BUG-001, headers de segurança BUG-019, rate limiting ausente BUG-021, color-contrast BUG-015, link-name BUG-016) antes de Medium/Low.
4. **MCP funcional antes de extras** — tools mandatórias (`run_test_case`, `get_element_status`) verdes em Vitest **antes** de adicionar `list_test_cases`, `navigate_to`, `get_test_history`, `extract_dom_snapshot`, `analyze_failure`.
5. **Allure publicado > Allure local** — investi tempo de CI para que o avaliador clique e veja o report em URL pública, sem precisar instalar nada.

### Cortes deliberados (não-objetivos)

- **OAuth Google end-to-end:** custo > benefício em 48h. Cobri com 2 BDD manuais + 1 E2E que valida apenas a iniciação do flow (R3).
- **Testes de carga / stress:** fora de escopo (Pleno S1 não pede); apenas perf single-user via Lighthouse.
- **Mock server completo do kasa.live:** testamos o site real para reproduzibilidade.
- **Internacionalização:** site é PT-BR.

---

## 4. Cronograma executado (real, extraído do `git log`)

A entrega foi feita em **uma única sessão intensiva contínua** em 2026-05-02 (vs cronograma original de 2-3 dias). O primeiro commit foi às 11:52 e o último às 22:45 — wall-clock de ~10h53min, com pausas curtas, não 30h em 3 dias.

| Janela        | Atividade                                                                                                                                                                                                                                                                                        | Trilha |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 11:52 – 12:20 | Spec design + revisão (4 commits docs)                                                                                                                                                                                                                                                           | ✱      |
| 12:25 – 13:22 | Foundation (deps, ts, lint, prettier, CI workflows, README inicial, fixes Fase 0)                                                                                                                                                                                                                | ✱      |
| 13:56 – 14:25 | Trello board + lockfile MCP workspace + skeleton MCP `run_test_case` + pre-commit hook                                                                                                                                                                                                           | C + ✱  |
| 15:01 – 15:22 | Security fix `.env.example` + MCP `get_element_status`/`navigate_to`/Resources + 4 tools extras + Vitest tutorial                                                                                                                                                                                | C      |
| 15:29 – 16:07 | Exploração kasa.live (3 commits exploration-notes, mapeamento home/login/calendario)                                                                                                                                                                                                             | A      |
| 16:20 – 16:34 | Config `.env.local` + POMs (Home, Highlights, Calendar) + 5 componentes + fixtures + 8 E2E smoke + fixes login                                                                                                                                                                                   | B      |
| 16:59 – 17:00 | apiClient + 5 contract tests + E2E batch 2 (12 testes) + bump timeout login                                                                                                                                                                                                                      | B      |
| 17:20         | Visual regression (5) + a11y axe-core (5) + perf Lighthouse (3)                                                                                                                                                                                                                                  | B      |
| 17:28 – 17:35 | 56 cenários BDD em batch (favoritar/busca/momentos/calendar/nav/responsividade/extras) — expandidos a 64 em pré-submissão (+8 cenários: Google Calendar pré-conexão e revogação, responsividade comportamental, busca case-insensitive + caracteres especiais + 4-way combo, validação cadastro) | A      |
| 17:40 – 17:51 | 18 bugs documentados (BUG-001..018) + 10 melhorias + README índice geral                                                                                                                                                                                                                         | A      |
| 18:01 – 18:41 | E2E batch 3 (6 testes) + fix CI Allure CLI + link Allure publicado + docs finais (progress-report, coverage-matrix, etc)                                                                                                                                                                         | B + ✱  |
| 19:06 – 19:58 | Sync Trello via API + script `package.sh` + tutorial MCP polido + demo end-to-end (asciinema + GIFs Playwright contra kasa.live)                                                                                                                                                                 | C + ✱  |
| 20:02 – 20:20 | Cleanup (46 artefatos exploratórios + 6 scripts duplicados, Dockerfile real) + correções pós-review BDD/automação                                                                                                                                                                                | ✱      |
| 21:14 – 21:56 | **Security suite** (23 testes XSS/headers/cookies/CORS/rate-limit) + 4 bugs novos (BUG-019..022) + 5 ADRs + refatorações finais                                                                                                                                                                  | A + B  |
| 22:04 – 22:45 | Fixes BDD (vocabulário alinhado), MatchCard parsing, `.dockerignore`, link quebrado risks-and-mitigations, sync de contagens                                                                                                                                                                     | ✱      |

### Diferença vs spec original

A spec previa **~30h produtivas em 2 dias** com checkpoints diários. Entreguei em **~10h53min wall-clock num único dia**, decisão tomada pela disponibilidade naquela janela específica.

**Por que tudo num dia só:**

- Disponibilidade pessoal concentrada naquela janela, em vez de espalhar pelos 2 dias.
- Manter contexto fresco — sem custo de re-onboarding diário.
- Momentum: cada commit alimenta o próximo (POM → fixture → E2E → bug catalog → automação que prova o bug).

**Riscos assumidos:**

- Fadiga acumulada — mitigada com pausas curtas e mensagens de commit pequenas para forçar pausa de revisão.
- Janela única significa que se algo crítico falhasse no fim do dia (ex.: GH Pages quebrar) não havia "amanhã" de buffer. Felizmente o risco não materializou; CI ficou verde no último commit.

**Uso honesto de IA:** este projeto foi construído com auxílio intensivo de Claude Code (subagentes paralelos para batch de bugs/BDD, agente revisor para pre-submission). Eu coordeno escopo/prioridades e revisão crítica; os agentes executam as tasks que delego. A qualidade final passa pela minha revisão humana — bug reports questionáveis, evidências fracas, contagens divergentes foram caçados nas iterações de revisão (ex.: BUG-003 reclassificado para IMP-011, BUG-009 reescrito após reinvestigação visual em 2026-05-03).

Os checkpoints da spec original (final dia 1: ≥6 bugs + 8 E2E + MCP esqueleto) foram atingidos por volta de 17:51 do dia 02. Checkpoint final (64 BDD + 106 auto + 21 bugs + 11 melhorias + MCP funcional + Allure publicado) atingido por volta de 22:45 do dia 02 e endurecido em 2026-05-03 (Background DRY, security hardening, doc sync).

---

## 5. Principais dificuldades e como lidei

Top 5 honesto, sem polimento:

1. **Conta de teste — site usa email/senha local + Google OAuth.** Optei por login local (email/senha) em todos os fluxos automatizados; OAuth ficou coberto por 2 BDD manuais + 1 E2E que valida apenas iniciação do flow. Decisão registrada em R3 da spec. Documentado em `docs/exploration-notes.md` seções 13-15.
2. **API DEV exposta em produção** (`api-dev.kasa.live` retornando dados reais de produção). Virou bug Critical (BUG-001), e ainda forçou ampliar timeouts dos testes que dependiam dessa API (commits `393efff`, `7825b84`). Aprendizado: bug do site impactou o desenho da automação.
3. **35 aria-label duplicados ("Go to previous month")** detectados via axe-core + inspeção DOM. Virou BUG-002 + BUG-013 (a11y aria-allowed-attr Critical) + BUG-014 (button-name Critical). Forçou também o reforço da regra interna de seletores: `getByRole` com `name` específico, evitar `.first()` sem justificativa.
4. **Storage state com session cookie expirando** entre rodadas. Resolvi com fixture `loggedInPage` que faz re-login automático quando detecta `isLoggedIn === false`, em vez de assumir o storage state válido (commit `b4f829e`). Padrão replicável.
5. **Modal de partida finalizada sempre vazio** independente do match selecionado (BUG-011, Medium). Descoberto durante E2E batch 2; a princípio parecia bug do teste, depois da terceira reprodução com `route.intercept` confirmei que era o site. Esse caso reforçou a regra "antes de marcar @flaky, prove que é o site".
6. **Camada de Security descoberta tarde (BUG-019..022).** Auditoria de cabeçalhos e cookies revelou que a home não envia `X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy`/`CSP` (BUG-019), a API DEV não tem HSTS nem CSP (BUG-020), aceita 200 requisições/burst sem rate limiting (BUG-021), e o cookie `next-leap_access` (auth) é emitido sem `Secure` nem `HttpOnly` — Critical (BUG-022). 23 testes Playwright em `automation/tests/security/` cobrem XSS reflected/stored/DOM, headers, cookies, CORS e rate-limit, fechando a sexta camada da pirâmide.

---

## 6. Decisões técnicas relevantes

- **Playwright como runner único** (E2E + API + Visual + A11y + Perf) — uma stack, um report (Allure), uma curva. Evita fragmentação típica de "Cypress pra E2E + Postman pra API + Percy pra visual + Pa11y pra a11y".
- **BDD como documentação, não como runtime** — Gherkin em `.feature` arquivos para os 64 cenários (atende Tarefa 1 do PDF), automação usa `test.step('Given...')`. Sem o overhead de tradução cara entre `.feature` e código que o Cucumber impõe.
- **MCP server em Node/TS** — mesma stack do resto do projeto; SDK oficial `@modelcontextprotocol/sdk`; transport stdio (padrão Claude Desktop, sem porta/auth).
- **Login email/senha local em vez de Google OAuth** — viabilidade em 48h. OAuth é coberto manualmente.
- **Allure publicado em GH Pages** (não só local) — entregável tem URL pública navegável. Resolvi quebra do action `simple-elf/allure-report-action` substituindo pela CLI Allure direta (commit `6ef3392`).
- **Docker disponível mas opcional** — `Dockerfile` baseado em `mcr.microsoft.com/playwright`; quick start oficial é via `nvm use && npm install` para minimizar fricção do avaliador.
- **Snapshot do site na exploração** (`docs/site-snapshots/`) — backup HTML/PNG caso kasa.live caia (mitigação R1).

---

## 7. O que faria diferente com mais tempo

### Tradeoff que assumi conscientemente — velocidade vs validação manual

A entrega em uma sessão única (~11h wall-clock) priorizou **escopo amplo** e **rastreabilidade documental** sobre **validação manual exaustiva** de cada UX. Os efeitos visíveis disso:

- **3 features com tag `@manual-validation`** (Favoritar times, Favoritar partidas, Melhores momentos — player) onde os cenários BDD descrevem o fluxo esperado mas não foram validados visualmente em sessão logada com clicks reais. Documentei explicitamente em vez de inflar a contagem com cenários "como se" — preferência por honestidade sobre métrica.
- **Modais de partidas FUTURAS** não capturados na exploração (só finalizadas, que vêm vazias — BUG-011). Asserts dependem de inspeção humana dos selectors antes de virar specs robustos em `automation/tests/e2e/`.
- **`/perfil` autenticado e fluxo de exclusão de conta** (IMP-004) não validados ao vivo — proposta baseada em padrões de mercado e LGPD.

**Próxima vez:** dedicaria 1h fixo de "validação manual logada" antes de escrever qualquer cenário sobre features post-login. Isso elimina tags `@manual-validation` e fortalece automação sem custo de retrabalho.

### Itens não-críticos que ficaram fora

- **Sincronização automática Trello via API** (hoje é manual mas disciplinada — 1. cria `.md`, 2. cria card, 3. links cruzados). Em 48h o custo > benefício.
- **Cobertura mobile mais profunda** via real devices (BrowserStack ou similar) — hoje uso emulação Chromium com viewports.
- **Mutation testing** (Stryker) nos testes para validar a qualidade dos asserts, não só a execução.
- **Testes contra ambiente PROD distinto de DEV** assim que o time disponibilizar (BUG-001 expõe o problema de DEV em PROD).
- **Vídeo demo melhor produzido** (com cortes, narração, GIF do MCP em ação) — o atual é Loom direto.
- **Auditoria pré-entrega de 1h** com checklist (contagens batem em todos os docs, datas corretas, cross-references íntegros) — em pré-submissão 2026-05-03 detectei e corrigi 91→77→106 testes (após hardening T1+T2), data postdatada no relatório, 4 IMPs sem evidência (BUG-005 cruzado), e BUG-011 com 3 PNGs idênticos (recapturei 3 modais distintos). Auditoria final 2026-05-03 (top-tier review): refatorei 5 specs com smells (sql-blind p95, jwt swallow, BUG-008 vacuous, calendar selectors centralizados, CORS includes parser). Isso virou rotina obrigatória.

---

## 8. Métricas finais

| Eixo      | Pleno S1 (PDF) | Entregue | Delta     |
| --------- | -------------- | -------- | --------- |
| Casos BDD | 40             | **64**   | **+60%**  |
| Bugs      | 12             | **21**   | **+75%**  |
| Melhorias | 8              | **11**   | **+38%**  |
| Automação | 30-32          | **106**  | **+212%** |
| Tools MCP | 3              | **7**    | **+133%** |

**Distribuição de bugs por severidade (recalibrada 2026-05-03):** 2 Critical · 5 High · 7 Medium · 7 Low (= 21). Recalibragens: BUG-008/009/012 Medium→Low (design debt / só DOM / Needs revalidation), BUG-021 High→Medium (burst de 50 reqs não conclusivo), BUG-014 Critical→High (axe-core retornou 0 nodes em 2026-05-03; status `Likely Fixed`).

### Diferenciais não-mensuráveis pelo PDF

- Multi-browser ready (chromium default; firefox/webkit no `nightly.yml`)
- Multi-viewport (desktop + mobile via responsividade)
- Visual regression com baseline + masking
- A11y WCAG 2.1 AA via axe-core (5 testes + 4 bugs a11y)
- Performance via Lighthouse com thresholds documentados
- Security testing (29 testes: XSS reflected/stored/DOM, headers, cookies, CORS multi-method, rate-limit, time-blind SQLi com p95+IQR, JWT tampering alg=none, session fixation) com 4 bugs novos (BUG-019..022)
- Allure publicado em URL pública (https://filipecardorso.github.io/loomi-qa-challenge-kasa/)
- CI verde com smoke ≤5min + nightly full
- Docker disponível (Playwright official image)
- 31 testes Vitest do próprio MCP (≥80% coverage target)
- Documentação reproduzível ponta-a-ponta (este relatório + tutorial MCP + evaluator journey + exit-criteria + submission-checklist)
