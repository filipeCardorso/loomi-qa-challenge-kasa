# Loomi QA Challenge (Abril/26) — Design Document

**Autor:** Filipe Gabriel
**Data:** 2026-05-02
**Deadline:** 2026-05-04 15:00
**Site sob teste:** https://www.kasa.live/
**Target de avaliação:** Pleno S1 (com extras explícitos para "ir além")
**Status do design:** Aprovado pelo autor; pendente revisão automatizada

---

## 1. Sumário executivo

Entrega completa do desafio QA Loomi com escopo Pleno S1 estourado em todos os eixos (Casos BDD, Bugs, Melhorias, Automação) e MCP Server (Tarefa 4) implementado bem além do mínimo. Estratégia centrada em três trilhas paralelas (Functional QA, Automation Engineering, Platform/MCP) integradas por um monorepo TypeScript com Playwright como runner único cobrindo E2E, API, visual, a11y e performance.

| Eixo | Pleno S1 (PDF) | Entrega planejada | Delta |
|---|---|---|---|
| Casos BDD | 40 | 55 | +37% |
| Bugs | 12 | 18 | +50% |
| Melhorias | 8 | 10 | +25% |
| Automação | 30-32 | 45 | +40% |
| Tools MCP | 3 mandatórias | 8 (3 + 5 extras) | +166% |
| Resources MCP | 1 mínimo | 6 categorias | — |

Diferenciais de "ir além" cobrem 4 ângulos simultâneos:
- **Volume:** estourar todos os números do Pleno S1
- **Profundidade técnica:** API + Visual + A11y + Performance além do E2E pedido
- **Inovação (MCP):** servidor MCP com tools/resources extras + tutorial reproduzível
- **Engenharia de produção:** Docker, CI/CD, Allure publicado, vídeo demo, comunicação documentada

---

## 2. Arquitetura & estrutura do repositório

### 2.1 Princípios

- **Monorepo TypeScript** com 3 trilhas convivendo em pastas distintas (zero conflito de merge entre trabalhos paralelos).
- **Cada pasta de topo = um entregável do desafio** (avaliador encontra qualquer coisa em segundos).
- **Redundância proposital** entre repo (fonte da verdade) e Trello (sistema de gestão obrigatório no PDF).
- **Idioma:** documentação em PT-BR (público-alvo: avaliador brasileiro); código em EN (convenção do ecossistema TS/Playwright).

### 2.2 Estrutura completa

```
loomi-qa-challenge-kasa/
├── README.md                        # ponto de entrada navegável
├── CHANGELOG.md                     # narra a jornada (Keep a Changelog)
├── CONTRIBUTING.md                  # padrões mínimos
├── LICENSE                          # MIT
├── AGENTS.md                        # guia para subagentes paralelos
├── .nvmrc                           # node version pinned
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .env.example
├── package.json                     # workspace root
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── docs/
│   ├── progress-report.md           # entregável obrigatório
│   ├── architecture.md              # diagrama da suíte
│   ├── test-strategy.md             # estratégia + smoke list
│   ├── coverage-matrix.md           # matriz funcionalidade × tipo
│   ├── mcp-tutorial.md              # tutorial reproduzível MCP
│   ├── risks-and-mitigations.md
│   ├── exit-criteria.md
│   ├── evaluator-journey.md         # guia 5min p/ avaliador
│   ├── exploration-notes.md         # output da Onda 0
│   ├── test-account-setup.md
│   ├── trello-board-link.md
│   ├── demo-video.md                # link Loom/YouTube
│   ├── submission-checklist.md
│   ├── site-snapshots/              # backup de exploração
│   └── superpowers/specs/           # este documento + futuros
├── test-cases/
│   ├── README.md                    # índice dos 55 cenários
│   ├── core/
│   │   ├── favoritar-times.feature
│   │   ├── favoritar-partidas.feature
│   │   ├── buscar-partidas.feature
│   │   ├── melhores-momentos.feature
│   │   └── google-calendar.feature
│   └── extras/                      # 5 cenários não-core
├── automation/
│   ├── tests/
│   │   ├── e2e/                     # 27 testes
│   │   ├── api/                     # 5 testes
│   │   ├── visual/                  # 5 testes
│   │   ├── a11y/                    # 5 testes
│   │   └── performance/             # 3 testes
│   ├── pages/                       # POMs
│   ├── fixtures/                    # custom test fixtures
│   ├── support/                     # helpers
│   └── reports/                     # gitignored exceto config
├── mcp-server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/
│   │   ├── resources/
│   │   ├── runner/
│   │   └── types/
│   ├── tests/
│   ├── package.json
│   └── README.md
├── bug-reports/
│   ├── README.md
│   ├── bugs/                        # 18 .md (BUG-001..BUG-018)
│   ├── improvements/                # 10 .md (IMP-001..IMP-010)
│   ├── charters/                    # 7 charter reports
│   └── evidence/
│       ├── BUG-001/
│       │   ├── screenshot.png
│       │   ├── video.mp4
│       │   ├── network.har
│       │   └── console.log
│       └── ...
├── docker/
│   └── Dockerfile
├── scripts/
│   ├── package.sh                   # gera ZIP final
│   └── run-smoke.sh
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
        ├── ci.yml                   # gate de PR
        ├── nightly.yml              # full + Allure publish
        └── visual-update.yml        # regenera baselines
```

---

## 3. Stack & ferramentas

| Camada | Escolha | Justificativa |
|---|---|---|
| Linguagem | TypeScript (strict) | Tipagem em testes + MCP, contratos fortes |
| Runner E2E | Playwright | Trace, video, screenshot built-in; multi-browser; paralelismo nativo; API testing nativo; `toHaveScreenshot`; integra `axe-playwright` |
| BDD | Gherkin como **documentação**; automação usa `test.step('Given...')` | Atende Tarefa 1 sem custo do Cucumber runtime |
| API testing | Playwright `request` fixture | Mesma stack, mesmos reports |
| Visual regression | Playwright `toHaveScreenshot()` | Built-in, sem vendor lock |
| Acessibilidade | `@axe-core/playwright` | Padrão de mercado |
| Performance | `playwright-lighthouse` | Lighthouse dentro do runner |
| Reports | Allure Report (+ Playwright HTML fallback) | Histórico, severidade, anexos navegáveis |
| MCP Server | `@modelcontextprotocol/sdk` (Node/TS) | SDK oficial, mesma stack |
| Test data | factories próprias + `@faker-js/faker` | Sem hardcoded strings |
| Lint/format | ESLint + Prettier | Rigor mínimo |
| CI/CD | GitHub Actions | Free tier + integra Pages |
| Container | Docker (Playwright official image) | Reprodutibilidade |
| Gestão | Trello (board público) | Mandatório no PDF |
| Versionamento | Git + Conventional Commits | Histórico legível |

**Decisões deliberadas:**
- Gherkin como documentação (não runtime) evita anti-pattern de tradução cara entre `.feature` e código.
- Playwright cobre 5 camadas de teste numa stack só → maturidade visível, não fragmentação.
- Allure publicado em GitHub Pages → entregável tem URL pública navegável.
- MCP em stdio transport (não HTTP) → padrão Claude Desktop, sem porta/auth.

---

## 4. Componentes principais

### 4.1 `pages/` — Page Object Model
Classes encapsulam UI do kasa.live: `BasePage`, `HomePage`, `MatchSearchPage`, `FavoritesPage`, `HighlightsPage`, `CalendarPage` + components reutilizáveis (`MatchCard`, `FilterBar`, `VideoPlayer`).

**Contrato:** classes recebem `Page` no construtor, métodos retornam Promises tipadas, seletores em `private readonly selectors`.

### 4.2 `fixtures/` — Custom test fixtures
Estende `test` do Playwright com fixtures reutilizáveis: `homePage`, `matchSearchPage`, `authenticatedUser`, `testDataFactory`, `axeBuilder`, `pristineAccount` (snapshot/restore do estado da conta para testes mutáveis — ver 6.3). Zero boilerplate nos testes.

### 4.3 `support/` — Helpers
- `evidenceCollector.ts` — captura automática em falha
- `lighthouseRunner.ts` — wrapper sobre playwright-lighthouse
- `visualHelper.ts` — masking de áreas dinâmicas
- `apiClient.ts` — wrapper tipado sobre Playwright `request`
- `googleCalendarMock.ts` — interceptação Calendar API

### 4.4 `mcp-server/` — Tarefa 4 (deep dive na seção 8)
Tools, Resources, runner Playwright, browser persistente.

### 4.5 `bug-reports/` — Schema fixo

```markdown
# BUG-XXX — [Título curto e específico]

**Severidade:** Critical | High | Medium | Low
**Prioridade:** P0 | P1 | P2 | P3
**Status:** Open | In Review | Reproducible | Cannot Reproduce
**Reproduzibilidade:** Sempre | Intermitente | Raro
**Frequência observada:** N/M tentativas
**Regressão?:** Sim | Não | Desconhecido
**Trello card:** [link]

## Pré-condição
## Passos para reproduzir
## Resultado esperado
## Resultado obtido
## Ambiente
- URL, browser/versão, sistema, viewport, data/hora
## Evidência
- Screenshot, vídeo, HAR, console log (caminhos relativos)
## Workaround conhecido
## Sugestão de fix / hipótese de causa raiz
## Impacto no usuário
```

### 4.6 `.github/workflows/`
- `ci.yml` — PR gate, smoke ≤5min
- `nightly.yml` — full suite + Allure publish ≤30min
- `visual-update.yml` — manual, regenera baselines

### 4.7 `docs/`
Tudo em markdown navegável, indexado pelo `README.md` raiz.

---

## 5. Data flow

### 5.1 Execução local
`npm run test:e2e` → Playwright lê config → carrega fixtures → spawn workers paralelos → POM ações + asserts → falha aciona evidenceCollector → resultados em `reports/` + Allure raw → `npm run report:allure` gera HTML.

### 5.2 CI — gate de PR
`git push` → ci.yml → docker pull Playwright image → npm ci → lint + typecheck → smoke → upload artifacts em falha → status check.

### 5.3 Nightly + publicação Allure
cron → nightly.yml → matrix [chromium, firefox, webkit] × [desktop, mobile] → suite full sharded → merge shards → Allure com history (lê branch `gh-pages`) → publica em `gh-pages` → URL pública → comenta no PR.

### 5.4 MCP respondendo IA

**Batch — `run_test_case`:**
LLM → call tool → MCP runner spawna `npx playwright test --grep` → resultParser → retorna `{ status, duration, errors, artifactPaths }` → SE FALHOU expõe Resources (`loomi://artifacts/{id}/...`) → LLM lê, analisa.

**Live — `get_element_status`:**
LLM → call tool → MCP usa browser persistente já em kasa.live → retorna `{ exists, visible, enabled, text, boundingBox, attrs, ariaRole }` → LLM decide próxima ação.

### 5.5 Bug → Trello
Bug encontrado → cria `bug-reports/bugs/BUG-XXX-titulo.md` (schema fixo) → coloca evidências em `bug-reports/evidence/BUG-XXX/` → cria card Trello (mesmo schema, link cruzado) → commit + push → board público mostra status.

---

## 6. Estratégia de QA

### 6.1 Onda 0 — Exploração (timebox 90min)
Antes de qualquer caso de teste. Output `docs/exploration-notes.md`: sitemap, inventário de funcionalidades, "cheiros" suspeitos, perguntas abertas, prints DevTools, identificação de `data-testid`.

### 6.2 Bug hunting via 7 charters (Session-Based Test Management)

| # | Charter | Foco |
|---|---|---|
| C1 | Busca com inputs adversariais | Filtros, edge cases |
| C2 | Favoritar em sessão sem login / expirada | Estado, persistência |
| C3 | Calendar OAuth flow + edge cases | Integração externa |
| C4 | Melhores momentos: vídeos, performance, controles | Player, lazy load |
| C5 | Responsividade mobile + viewports atípicos | UI/layout |
| C6 | A11y exploratória (teclado-only, screen reader) | A11y |
| C7 | **Recursos não-core** (login/cadastro, perfil, dark mode, notificações) | UX, persistência de configs |

Cada charter gera `bug-reports/charters/CXX-titulo.md` com setup, observações, achados, ideias de teste novo.

**Meta:** ≥18 bugs, ≥10 melhorias.

### 6.3 Estado mutável — 3 camadas

1. **Setup/teardown explícito** em cada teste que muta estado (idempotência por contrato)
2. **Worker isolation** — `fullyParallel: true` + worker-scoped fixtures
3. **Snapshot do estado inicial** via fixture `pristineAccount`

Fallback se conta múltipla impossível: testes mutáveis em série, read-only em paralelo (`test.describe.configure({ mode: 'serial' })`).

### 6.4 Test data
- Credenciais em `.env.local` (gitignored), CI usa GitHub Secrets, doc `.env.example`
- Dados dinâmicos via faker — nunca hardcoded
- 1 conta de teste dedicada criada hoje
- OAuth Google: NÃO automatizar end-to-end (custo > benefício); 2 BDD manuais documentados, 1 E2E que valida apenas iniciação do flow

### 6.5 Tipologia e evidências

| Tipo de bug | Evidência primária | Secundária |
|---|---|---|
| Visual estático | Screenshot anotado | DOM snapshot |
| Comportamento interativo | Vídeo (Cmd+Shift+5 ou Playwright trace) | Console log |
| Integração / network | HAR file | Screenshot da response |
| A11y | axe-core JSON + screenshot | Vídeo navegação por teclado |
| Performance | Lighthouse JSON + screenshot do score | Trace de rede |
| Intermitente | Vídeo de 2-3 tentativas | Console log + timestamps |

### 6.6 Bug vs Melhoria — distinção
- **Bug:** comportamento divergente do esperado, requisito violado, regressão
- **Melhoria:** funciona mas pode ser melhor (UX, perf, a11y, código)
- Ambíguo → classifica como melhoria (conservador)

---

## 7. Estratégia de testes & matriz de cobertura

### 7.1 Pirâmide adaptada (diamante)
Site externo, sem acesso ao backend → diamante.

```
        Visual / A11y / Perf  (13 testes)
       E2E funcional           (27 testes)
      API contract             (5 testes)
     Smoke (subset E2E)        (10 testes — não conta no total)
```

Total automatizado: **45 testes** (27 E2E + 5 API + 5 Visual + 5 A11y + 3 Perf). Smoke é subset do E2E, não soma. Vs 30-32 do Pleno → +40%.

### 7.2 Matriz de cobertura

| Funcionalidade | BDD | E2E | API | Visual | A11y | Perf | Auto total |
|---|---|---|---|---|---|---|---|
| Favoritar times | 8 | 5 | 1 | 1 | 1 | – | 8 |
| Favoritar partidas | 8 | 5 | 1 | 1 | 1 | – | 8 |
| Buscar partidas | 10 | 6 | 2 | 1 | 1 | 1 | 11 |
| Melhores momentos | 7 | 4 | 1 | 1 | 1 | 1 | 8 |
| Google Calendar | 5 | 2* | – | – | – | – | 2 |
| Navegação / home | 4 | 2 | – | 1 | 1 | 1 | 5 |
| Responsividade | 3 | 1 | – | – | – | – | 1 |
| Erro/edge cases | 5 | – | – | – | – | – | 0 |
| Não-core (descobertos) | 5 | 2 | – | – | – | – | 2 |
| **TOTAL** | **55** | **27** | **5** | **5** | **5** | **3** | **45** |

\* OAuth real é manual.

### 7.3 Tipos de teste — escopo

**E2E (27):** chromium default; nightly multi-browser. Trace + video + screenshot habilitados. Distribuição por funcionalidade vide matriz 7.2.

**API (5):** endpoints internos descobertos via DevTools. Status, schema (Zod), tempo.

**Visual (5):** home, search, match detail, favorites, highlights. Masking dinâmico. `maxDiffPixelRatio: 0.02`.

**A11y (5):** WCAG 2.1 AA. Falha em violations `serious`/`critical`.

**Performance (3):** home, search, highlights. Thresholds: Performance ≥80, LCP ≤2500ms, CLS ≤0.1, TBT ≤300ms (warning, não bloqueia).

**Smoke (10) — lista nominal:**
1. Home carrega sem erro de console (HTTP 200, título correto)
2. Lista de times populares renderiza ≥10 itens
3. Busca por time conhecido retorna ≥1 resultado
4. Filtro de campeonato altera listagem
5. Favoritar time persiste após reload
6. Desfavoritar time remove da lista de favoritos
7. Página de partida abre detalhe completo
8. Aba Melhores Momentos lista vídeos
9. Player de vídeo inicia reprodução (sem erro)
10. Botão "Conectar Google Calendar" redireciona pro accounts.google.com

### 7.4 Padrões de qualidade dos testes (lint hard)

1. Zero `waitForTimeout()` — só `waitFor` baseado em estado
2. Zero `.first()` sem justificativa
3. Seletores: `getByRole` > `getByTestId` > `getByText` > CSS > ~~XPath~~ (proibido)
4. Testes independentes (`describe.serial` é exceção)
5. Asserts com mensagens
6. Sem lógica de teste em POMs
7. Falha gera evidência automática (config global)

### 7.5 Tags
`@smoke`, `@core`, `@visual`, `@a11y`, `@perf`, `@flaky` (quarantine).

### 7.6 Estrutura BDD (exemplo)
```gherkin
# language: pt
Funcionalidade: Favoritar times
  Como torcedor
  Quero favoritar meus times
  Para acompanhar suas partidas no calendário

  Cenário: Favoritar um time da lista de times populares
    Dado que estou logado como "torcedor padrão"
    E que estou na home
    Quando eu favorito o time "Flamengo" na lista de times populares
    Então o ícone de favorito do "Flamengo" deve ficar marcado
    E "Flamengo" deve aparecer na minha lista de times favoritos
    E as próximas partidas do "Flamengo" devem aparecer no meu calendário
```

---

## 8. MCP Server — Tarefa 4

### 8.1 Conformidade com o pedido

| Pedido PDF | Implementação |
|---|---|
| Tool `run_test_case(nome)` | Spawn Playwright filtrado, retorna result tipado |
| Resources com log/screenshot do erro | URIs `loomi://...` registrados dinamicamente |
| Tool `get_element_status` | Browser persistente, retorna estado completo |

### 8.2 Tools

**Mandatórias (3):**

```typescript
run_test_case(input: {
  name: string;          // tag (@smoke) ou nome
  browser?: 'chromium' | 'firefox' | 'webkit';
  headed?: boolean;
}) → {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  duration_ms: number;
  errors: Array<{ message, stack, location }>;
  artifacts: { screenshot?: URI, video?: URI, trace?: URI };
  testId: string;
}

get_element_status(input: {
  url?: string;          // default: página atual do browser persistente
  selector: string;
  timeoutMs?: number;
}) → {
  exists, visible, enabled,
  text, attributes, boundingBox, ariaRole,
  isInViewport, computedRole,
  screenshot: URI       // print apenas do elemento
}
```

**Extras (5) — diferencial:**
- `list_test_cases()` — descoberta dinâmica
- `get_test_history({ name, limit })` — histórico de runs
- `navigate_to({ url })` — controla browser persistente
- `extract_dom_snapshot({ selector?, format: 'html' | 'aria-tree' })` — IA raciocina sobre layout
- `analyze_failure({ testId })` — heurística sobre stack + busca histórico

### 8.3 Resources

URI pattern: `loomi://artifacts/{testId}/{type}`

| Resource | URI | Mime |
|---|---|---|
| Error log | `.../error.log` | text/plain |
| Screenshot | `.../screenshot.png` | image/png |
| Trace | `.../trace.zip` | application/zip |
| DOM snapshot | `.../dom.html` | text/html |
| Network log | `.../network.har` | application/json |
| Console log | `.../console.log` | text/plain |

Notificação `notifications/resources/list_changed` após cada falha.

### 8.4 Arquitetura de processos
- **MCPServer** (long-lived, stdio): SDK + ToolDispatcher + ResourceRegistry + LiveBrowser persistente + TestRunner (single-flight)
- **LiveBrowser** (independente): chromium persistente para `get_element_status`/`navigate_to`
- **TestRunner** (efêmero, single-flight): processo Playwright spawn por `run_test_case`. **Sem pool/concorrência** — uma execução por vez para manter logs/artefatos rastreáveis 1:1 com tool calls. Chamadas concorrentes serializam-se por mutex interno (FIFO). Decisão deliberada: solo demo, simplicidade > paralelismo.

LiveBrowser e TestRunner são separados — testes precisam de contexto limpo, exploração precisa de contexto persistente.

### 8.5 Tutorial reproduzível (`docs/mcp-tutorial.md`)
1. Setup: `npm install` + `npm run mcp:build`
2. Snippet pronto pro `claude_desktop_config.json`
3. 3 prompts de exemplo (listar testes, rodar+analisar, get_element_status)
4. Screenshots/GIFs da interação
5. Troubleshooting

### 8.6 Testes do próprio MCP
Vitest, target ≥80% coverage:
```
mcp-server/tests/
├── tools/runTestCase.test.ts
├── tools/getElementStatus.test.ts
├── resources/registry.test.ts
└── integration/                 # smoke real contra Playwright
```

### 8.7 Logging
`mcp-server/logs/mcp-{date}.jsonl`: timestamp, tool/resource, input, output (resumido), latência, erros com stack.

---

## 9. CI/CD + Reporting + Trello + Git

### 9.1 GitHub Actions
**ci.yml** (PR gate, ≤5min): lint + typecheck + unit MCP + smoke + upload artifacts em falha.
**nightly.yml** (≤30min): trigger via `schedule` (cron 03:00 UTC) **e** `workflow_dispatch` (acionável on-demand para publicar Allure em qualquer momento). Matrix multi-browser + multi-viewport + Allure publish em `gh-pages`.
**visual-update.yml** (manual): regenera baselines, abre PR.

### 9.2 Allure
Por que Allure: histórico (trends), severidade, categorias (epic/feature/story), anexos navegáveis. Labels aplicadas: `epic('Kasa Live')`, `feature(funcionalidade)`, `story(cenário)`, `severity(...)`, `tag(@smoke)`, `owner('Filipe')`, `link(trelloUrl)`.

URL final: `https://<user>.github.io/loomi-qa-challenge-kasa/`

### 9.3 Reports complementares
- `reports/coverage-summary.md` — human-readable
- `reports/a11y-summary.json` — violations por página agrupadas por WCAG rule
- `reports/perf-summary.json` — métricas Lighthouse vs threshold
- `reports/visual-diff/` — baseline + actual + diff lado a lado

### 9.4 Docker
Dockerfile baseado em `mcr.microsoft.com/playwright:v1.50.0-jammy`. Avaliador roda sem instalar Node/browsers: `docker run --rm -v $(pwd)/reports:/app/reports loomi-qa`.

### 9.5 Trello board (público read-only)

**Listas:** Backlog · Sprint atual (48h) · Em andamento (WIP=3) · Em revisão · Concluído · Bugs reportados · Melhorias sugeridas · Bloqueios/Riscos

**Labels:** Critical/High/Medium/Low + por trilha (A/B/C) + por tarefa (1/2/3/4) + relatório

**Template de card de bug:** idêntico ao schema `.md` do bug report (copy-paste 1:1).

**Sincronização:** manual mas disciplinada (1. cria `.md` no repo, 2. cria card Trello copiando, 3. links cruzados). Não automatizado (custo > benefício pra 48h).

**Convenção do campo `Trello card` no schema do bug:** pode aparecer como `TBD` em commits intermediários (quando o `.md` foi criado mas o card Trello ainda não). Deve estar preenchido com URL real até o checkpoint diário (fim do dia 1, fim do dia 2, manhã do dia 3). CI **não** lint este campo — é processo, não código.

### 9.6 Estrutura do `progress-report.md`

1. Visão geral da entrega (sumário + links)
2. Como organizei demandas e atividades (Trello, trilhas, kanban, WIP)
3. Como priorizei (critério: cobertura × impacto × tempo + decisões de escopo)
4. Cronograma executado (tabela hora-a-hora real vs planejado)
5. Principais dificuldades e como lidei (top 5 honesto)
6. Decisões técnicas (Stack, BDD-as-doc, MCP arch — o "por quê")
7. O que faria diferente com mais tempo
8. Métricas finais (planejado vs entregue por entregável)

### 9.7 Estratégia de Git

- **Branching:** `main` protegida + 3 feature branches por trilha (`feat/trilha-a-bdd`, `feat/trilha-b-auto`, `feat/trilha-c-mcp`) + branches efêmeras
- **Conventional Commits** mandatório: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `ci:`, `perf:`. Subject ≤72 chars.
- **Self-PRs auditáveis** com `.github/PULL_REQUEST_TEMPLATE.md`
- **Cadência de push:** a cada hora ou ao terminar bloco
- **Tags:** `v0.1.0-bdd-done`, `v0.2.0-auto-done`, `v0.3.0-mcp-done`, `v1.0.0-submission`
- **CHANGELOG.md** atualizado em cada PR (Keep a Changelog)

### 9.8 README raiz e idioma

**Idioma:** docs em PT-BR; código em EN. Decisão registrada no `progress-report.md`.

**Estrutura `README.md`:** TL;DR (3 linhas) → Quick Start (≤5min) → Links principais (Trello, Allure, vídeo, relatório) → Inventário de entregáveis → Arquitetura resumida → Como rodar cada peça → Critérios atendidos vs Pleno S1 → Estrutura do repo → Autor.

---

## 10. Riscos, exit criteria, empacotamento

### 10.1 Registro de riscos

| # | Risco | P (1-5) | I (1-5) | Mitigação | Plano B |
|---|---|---|---|---|---|
| R1 | kasa.live cair | 3 | 5 | Snapshots HTML/PNG salvos na exploração | Documentar com print no relatório |
| R2 | Site mudar layout em 48h | 2 | 4 | Seletores `getByRole`/`getByText`/testid; lista central em `pages/selectors.ts` | Atualização rápida via 1 arquivo |
| R3 | OAuth Google exigir 2FA / verification | 5 | 3 | Não automatizar end-to-end; cobrir com 2 BDD manuais + 1 E2E parcial | Vídeo demo manual completo |
| R4 | Visual baselines flakey | 4 | 3 | Baseline gerada/commitada em CI Linux; threshold 2%; masking dinâmico | `--update-snapshots` documentado |
| R5 | Tempo estourar | 4 | 4 | Cronograma com checkpoints 6h; cortes pré-definidos | Lista ordenada de cortes (10.2) |
| R6 | MCP quebrar com Claude Desktop | 3 | 3 | Testes Vitest do próprio MCP; tutorial reproduzível; logs JSONL | Vídeo demo do MCP funcionando |
| R7 | Rede flakey nos perf tests | 4 | 2 | Soft fail (warning), não bloqueia | Excluir perf da suite final |
| R8 | Conta de teste banida/limitada | 2 | 4 | Sleep entre runs; mesma conta nas 48h | 2ª conta de backup |
| R9 | MCP canibaliza Tarefas 1-3 | 3 | 5 | Trilha C com timebox rígido (8h) | Entregar MCP mínimo (3 tools) |
| R10 | Ambiente local diferente | 3 | 2 | Dockerfile + lock + `.nvmrc` | Tutorial no README |
| R11 | Internet/PC/GitHub fora no dia 4 | 2 | 5 | ZIP "candidato" às 12:00 dia 4; backup p/ próprio e-mail; tethering 4G; mirror GitLab | Submeter o "candidato" |

### 10.2 Lista ordenada de cortes (se tempo apertar)

1. Cortar 3 tools extras do MCP (`get_test_history`, `analyze_failure`, `extract_dom_snapshot`) — **reduzir para 5 tools (3 mandatórias + 2 extras: `list_test_cases` e `navigate_to`)**
2. Perf tests (3) — manter Lighthouse manual
3. Multi-browser nightly — só chromium
4. visual-update workflow — baseline manual
5. A11y reduzido a 3 testes
6. API tests reduzidos a 2
7. **NUNCA cortar:** Tarefas 1-4 mínimas, Trello, progress-report, Allure local, vídeo demo de 2min

### 10.3 Exit criteria por entregável

**Tarefa 1 (BDD):**
- [ ] ≥40 cenários (alvo 55)
- [ ] As 4 funcionalidades core (favoritar times, favoritar partidas, buscar partidas, melhores momentos) cobertas em profundidade: ≥7 cenários cada
- [ ] Google Calendar tratado separadamente (5 cenários, OAuth real é manual conforme R3) — não conta como core para o critério ≥7
- [ ] Linguagem comportamental (passa em lint Gherkin)
- [ ] README do `test-cases/` indexa todos

**Tarefa 2 (Automação):**
- [ ] ≥30 testes (alvo 45)
- [ ] Mesmo sob cortes da Seção 10.2, manter ao menos 25 E2E + cobertura de 4 das 5 camadas (E2E/API/Visual/A11y/Perf) — não comprometer a "forma de diamante" da pirâmide para atingir o número
- [ ] Suite full passa verde 2x consecutivas localmente
- [ ] CI verde em 2 PRs consecutivos
- [ ] Allure local sem erro
- [ ] Zero `waitForTimeout`

**Tarefa 3 (Bugs/Melhorias):**
- [ ] ≥12 bugs (alvo 18) com evidência commitada
- [ ] ≥8 melhorias (alvo 10) com evidência
- [ ] Todos no Trello + `.md` no repo
- [ ] Severidade preenchida

**Tarefa 4 (MCP):**
- [ ] 3 tools mandatórias funcionando contra Claude Desktop
- [ ] Resources de erro acessíveis após falha
- [ ] Tutorial reproduzível (avaliador roda em ≤5min)
- [ ] Vídeo demo de 1min do MCP em ação

**Transversais:**
- [ ] Trello público com URL no README
- [ ] Allure publicado em GitHub Pages
- [ ] `progress-report.md` com 8 seções completas
- [ ] Vídeo demo geral de 3-5min
- [ ] README raiz com setup ≤5min
- [ ] ZIP gerado por script, sem `node_modules`, ≤50MB

### 10.4 Script `package.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
OUTPUT="loomi-qa-challenge-filipe-gabriel.zip"

rm -rf node_modules mcp-server/node_modules
rm -rf reports/ allure-results/ allure-report/
rm -rf playwright-report/ test-results/
rm -rf */dist */build

[ -f .env ] && { echo "❌ .env existe. Abortando."; exit 1; }
[ -f .env.local ] && { echo "❌ .env.local existe. Abortando."; exit 1; }

find . -size +5M -not -path "./node_modules/*" -not -path "./.git/*"

zip -r "$OUTPUT" . \
  -x ".git/*" -x "node_modules/*" -x "*/node_modules/*" \
  -x "reports/*" -x "allure-results/*" -x "test-results/*" \
  -x ".env*" -x "*.log"

unzip -l "$OUTPUT" | grep -E "\.env|node_modules" && exit 1
echo "✅ ZIP pronto: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
```

### 10.5 Submission checklist (`docs/submission-checklist.md`)
- [ ] `package.sh` rodou sem erro
- [ ] ZIP descompacta + `npm install` + `npm run test:smoke` passa em pasta nova
- [ ] Trello público acessível em janela anônima
- [ ] Allure URL acessível em janela anônima
- [ ] Vídeo demo (Loom/YouTube unlisted) com link no relatório
- [ ] Progress report com 8 seções
- [ ] E-mail rascunhado para `processoseletivo@loomi.com.br`
  - Assunto: "Desafio QA Abril 26 — Filipe Gabriel"
  - Corpo: 2 parágrafos curtos + links principais
  - Anexo: ZIP

---

## 11. Cronograma horário & alocação

**Janela:** 02/05 ~14:00 → 04/05 15:00 = 49h wall-clock, ~30h produtivas.
**Trilhas:** [A] Functional QA · [B] Automation · [C] Platform/MCP · [✱] Transversal

### 11.1 Dia 1 — 02/05

| Hora | Bloco | Trilha | # testes adicionados |
|---|---|---|---|
| 14:00–15:30 | Setup repo, deps, CI skeleton, Trello board | ✱ | — |
| 15:30–17:00 | Onda 0 — Exploração (timebox 90min) | A | — |
| 17:00–19:00 | Charters C1+C2 → primeiros bugs | A | — |
| 19:00–20:00 | Pausa jantar | — | — |
| 20:00–22:00 | Playwright scaffold + POMs + E2E core | B | +8 E2E (total 8) |
| 22:00–23:30 | MCP skeleton + `run_test_case` mínimo | C | — |

**Checkpoint dia 1:** repo + Trello + ≥6 bugs + 8 E2E verdes + MCP esqueleto.

### 11.2 Dia 2 — 03/05

| Hora | Bloco | Trilha | # testes adicionados |
|---|---|---|---|
| 08:30–10:30 | Charters C3+C4 (Calendar, highlights) | A | — |
| 10:30–12:30 | E2E batch 2 (busca + filtros + favoritar partidas) | B | +12 E2E (total 20) |
| 13:30–15:00 | API tests + integração Allure | B | +5 API (total 25) |
| 15:00–17:00 | MCP: `get_element_status`, browser persistente, Resources | C | — |
| 17:00–19:00 | Charters C5+C6 (mobile, a11y) + C7 (não-core) | A | — |
| 20:00–22:00 | Visual + A11y + baselines | B | +5 Visual +5 A11y (total 35) |
| 22:00–23:30 | BDD escrita: completar até 55 cenários | A | — |

**Checkpoint dia 2:** 55 BDD + 35 auto + 18 bugs + 10 melhorias + MCP funcional. Restam 10 auto (E2E batch 3 + Perf) para dia 3.

### 11.3 Dia 3 — 04/05

| Hora | Bloco | Trilha | # testes adicionados |
|---|---|---|---|
| 06:30–08:00 | E2E batch 3 (7 testes restantes) + Perf (3) | B | +7 E2E +3 Perf (total 45) |
| 08:00–10:00 | MCP: tutorial reproduzível + extras + Vitest | C | — |
| 10:00–11:00 | Trigger manual `nightly.yml` (workflow_dispatch) → Allure no Pages | C | — |
| 11:00–12:30 | Vídeo demo 3-5min (Loom, sem edição) | ✱ | — |
| 12:30–13:30 | Almoço + buffer + ZIP "candidato" backup | ✱ | — |
| 13:30–14:30 | progress-report.md + READMEs + checklist | ✱ | — |
| 14:30–14:50 | `package.sh` + smoke contra ZIP em pasta nova | ✱ | — |
| 14:50–15:00 | Enviar e-mail | ✱ | — |

### 11.4 Subagentes paralelos

| Janela | Agentes | Tarefa |
|---|---|---|
| 16:00 dia 1 | 3 | Cada um escreve 1 `.feature` (favoritar/buscar/highlights) baseado nas notas de exploração |
| Após cada charter | 1 | Transforma notas em bug reports estruturados |
| Após Allure | 1 | Gera draft do `coverage-matrix.md` |
| 11:00 dia 3 | 1 | Roteiro do vídeo de 3min baseado no progress-report |

Eu coordeno e reviso — agentes não decidem escopo, só executam scaffolding/draft. Convenções e templates ficam em `AGENTS.md` (lido antes de cada dispatch).

### 11.5 Pontos de não-retorno

| Hora | Decisão | Default se NÃO |
|---|---|---|
| 23:30 dia 1 | MCP skeleton funcionando? | Plano B: MCP mínimo, foco trilhas A/B |
| 12:30 dia 2 | ≥15 E2E verdes? | Cortar A11y/Visual extras |
| 19:00 dia 2 | ≥12 bugs documentados? | +1h extra de hunt |
| 10:00 dia 3 | CI publica Allure? | Allure local + screenshot no relatório |
| 11:00 dia 3 | Tudo verde? | Vídeo de 5min vira 2min |

### 11.6 Métricas de saúde monitoradas
% conclusão por entregável, # bugs descobertos, # testes verdes, tempo gasto vs planejado por trilha. Anotações vão direto pro `progress-report.md` seção 4 (duplo uso).

---

## 12. Glossário rápido

- **Onda 0:** sessão de exploração inicial (90min) antes de qualquer caso de teste
- **Charter:** sessão dirigida de exploratory testing com objetivo específico (30-45min)
- **Trilha:** linha de trabalho paralela (A=Functional QA, B=Automation, C=Platform/MCP)
- **Smoke:** subset de 10 testes críticos que rodam em todo PR
- **Diamante (não pirâmide):** estrutura de testes adaptada para SUT externo sem acesso ao backend
- **Live browser:** instância de chromium persistente dentro do MCP server (não confundir com test runner)
- **Self-PR:** Pull Request criado contra mim mesmo para auditoria visível do trabalho

---

## Apêndice A — Não-objetivos (escopo fora)

Para deixar explícito o que NÃO faz parte da entrega:

- Testes de carga / stress (apenas perf single-user)
- Testes de segurança aprofundados (apenas higiene básica em inputs)
- Automação completa do OAuth Google (apenas iniciação do flow)
- CI matrix com browsers obscuros (Edge, Brave) — chromium/firefox/webkit já cobre
- Dashboards externos (Grafana, Datadog) — Allure cobre observabilidade da suíte
- Internacionalização — site é PT-BR
- Mock server completo do kasa.live — testamos o site real

## Apêndice B — Critérios atendidos vs Pleno S1

Tabela final que vai pro `README.md` raiz:

| Critério | Pleno S1 | Entregue | Delta |
|---|---|---|---|
| Casos de teste | 40 | 55 | +37% |
| Bugs encontrados | 12 | 18 | +50% |
| Melhorias sugeridas | 8 | 10 | +25% |
| Automação | 30-32 | 45 | +40% |
| Tools MCP | 3 | 8 | +166% |

Diferenciais não-mensuráveis pelo PDF mas que somam:
- Multi-browser execution (chromium/firefox/webkit)
- Multi-viewport (desktop/mobile)
- Visual regression
- Acessibilidade WCAG AA
- Performance Lighthouse
- Allure publicado em URL pública
- Docker para reprodutibilidade
- Vídeo demo de 3-5min
- Documentação reproduzível ponta-a-ponta
