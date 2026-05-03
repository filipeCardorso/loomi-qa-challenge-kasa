# Arquitetura da Suíte — Desafio QA Loomi

**Filipe Gabriel · 2026-05-02 (entrega) · revisado 2026-05-03**

Diagrama da suite + componentes principais. Para o detalhamento completo (decisões, riscos, racional), ver `docs/superpowers/specs/2026-05-02-loomi-qa-challenge-design.md`.

---

## 1. Visão de alto nível — três trilhas paralelas

```
                     ┌────────────────────────────────────┐
                     │       loomi-qa-challenge-kasa      │
                     │       (monorepo TypeScript)        │
                     └────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
   ┌────▼──────────┐         ┌─────────▼──────────┐         ┌─────────▼─────────┐
   │ Trilha A      │         │ Trilha B           │         │ Trilha C          │
   │ Functional QA │         │ Automation         │         │ Platform / MCP    │
   ├───────────────┤         ├────────────────────┤         ├───────────────────┤
   │ exploration   │         │ Playwright runner  │         │ MCP Server        │
   │ 2 charters    │         │ 7 camadas          │         │ stdio transport   │
   │ 61 BDD        │         │ 77 testes (55+22)  │         │ 7 tools           │
   │ 21 bugs       │         │ POMs + fixtures    │         │ Resources         │
   │ 11 melhorias  │         │ Allure publicado   │         │ 31 testes Vitest  │
   └───────────────┘         └────────────────────┘         └───────────────────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
                              ┌────────▼─────────┐
                              │   Trilha ✱       │
                              │   Transversal    │
                              │  CI · Trello ·   │
                              │  Allure · Docs · │
                              │  Docker · Vídeo  │
                              └──────────────────┘
```

---

## 2. Estrutura de pastas (entregue)

```
loomi-qa-challenge-kasa/
├── README.md                        # ponto de entrada navegável
├── CHANGELOG.md                     # narra a jornada (Keep a Changelog)
├── CONTRIBUTING.md
├── LICENSE                          # MIT
├── AGENTS.md                        # guia para subagentes paralelos
├── .nvmrc · .editorconfig · .gitattributes · .gitignore
├── .env.example
├── package.json · package-lock.json
├── playwright.config.ts · tsconfig.json
├── eslint.config.mjs · .prettierrc
│
├── docs/
│   ├── progress-report.md           # ENTREGÁVEL OBRIGATÓRIO (8 seções)
│   ├── architecture.md              # este arquivo
│   ├── coverage-matrix.md           # funcionalidade × tipo
│   ├── evaluator-journey.md         # roteiro de 20-25min review
│   ├── exit-criteria.md             # checklist de exit
│   ├── submission-checklist.md      # checklist final pré-envio
│   ├── mcp-tutorial.md              # tutorial reproduzível MCP
│   ├── exploration-notes.md         # output da Onda 0 (90min)
│   ├── trello-board-link.md
│   ├── site-snapshots/              # backup de exploração
│   └── superpowers/specs/           # design document fonte
│
├── test-cases/                      # TAREFA 1 — 61 cenários BDD em PT-BR
│   ├── README.md                    # índice
│   ├── core/                        # 5 .feature (favoritar/buscar/highlights/calendar)
│   │   ├── favoritar-times.feature
│   │   ├── favoritar-partidas.feature
│   │   ├── buscar-partidas.feature
│   │   ├── melhores-momentos.feature
│   │   └── google-calendar.feature
│   └── extras/                      # 4 .feature (nav/responsividade/edge/não-core)
│       ├── navegacao.feature
│       ├── responsividade.feature
│       ├── erro-edge-cases.feature
│       └── recursos-nao-core.feature
│
├── automation/                      # TAREFA 2 — 77 testes Playwright (55 contract + 22 bug-regression)
│   ├── tests/
│   │   ├── e2e/                     # 27 testes (smoke subset = 10)
│   │   ├── api/                     # 5 testes contract (Zod)
│   │   ├── visual/                  # 5 testes regression
│   │   ├── a11y/                    # 5 testes WCAG 2.1 AA
│   │   ├── performance/             # 3 testes Lighthouse
│   │   ├── security/                # 23 testes (XSS/headers/cookies/CORS/rate-limit)
│   │   └── bugs/                    # 21 specs 1:1 com bug-reports/bugs/ (NOVA CAMADA)
│   │       ├── BUG-XXX-*.spec.ts    # asserta comportamento esperado, falha enquanto bug existir
│   │       ├── _fixtures.ts         # extends de @fixtures/index com slot bugFindings
│   │       ├── _reporter.ts         # BugEvidenceReporter (auto-dump em bug-reports/evidence/.../auto-runs/)
│   │       ├── helpers/             # evidence.ts, axe.ts, http.ts
│   │       └── README.md            # lifecycle, polaridade, padrão de spec
│   ├── pages/                       # POMs (Home, Highlights, Calendar)
│   ├── fixtures/                    # custom fixtures (loggedInPage, etc)
│   ├── support/                     # apiClient, evidenceCollector, helpers
│   └── reports/                     # gitignored
│
├── bug-reports/                     # TAREFA 3 — 21 bugs + 11 melhorias
│   ├── README.md                    # índice geral
│   ├── bugs/                        # BUG-001..BUG-022 (.md schema fixo)
│   ├── improvements/                # IMP-001..IMP-010 (.md)
│   ├── charters/                    # 2 executados (C1, C5) + 5 da spec não executados por timebox
│   └── evidence/                    # screenshots/HAR/console por bug
│
├── mcp-server/                      # TAREFA 4 — MCP Server
│   ├── src/
│   │   ├── index.ts                 # bootstrap stdio
│   │   ├── tools/                   # 7 tools (3 mandatórias + 5 extras: list_test_cases, navigate_to, get_test_history, extract_dom_snapshot, analyze_failure)
│   │   ├── resources/               # registry + URIs loomi://...
│   │   ├── runner/                  # Playwright spawn (single-flight)
│   │   └── types/                   # contracts tipados
│   ├── tests/                       # 31 testes Vitest (≥80% coverage)
│   ├── data/                        # snapshots, histórico
│   ├── logs/                        # mcp-{date}.jsonl
│   ├── package.json · tsconfig.json · vitest.config.ts
│
├── docker/Dockerfile                # mcr.microsoft.com/playwright base
├── scripts/                         # package.sh, run-smoke.sh
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
        ├── ci.yml                   # PR gate (smoke ≤5min)
        ├── nightly.yml              # full + Allure publish
        └── visual-update.yml        # manual, regenera baselines
```

---

## 3. Componentes principais

### 3.1 `automation/pages/` — Page Object Model

Classes encapsulam UI do kasa.live: `BasePage`, `HomePage`, `HighlightsPage`, `CalendarPage` + componentes (`MatchCard`, `MatchModal`, `LoginModal`, `ProfilePopover`, `NotificationsPanel`).

**Contrato:** classes recebem `Page` no construtor, métodos retornam `Promise<T>` tipadas, seletores em `private readonly`.

### 3.2 `automation/fixtures/` — Custom test fixtures

Estende `test` do Playwright: `homePage`, `loggedInPage` (com re-login automático em storageState expirado), `apiClient`, `axeBuilder`. Zero boilerplate nos testes.

### 3.3 `automation/support/` — Helpers

- `apiClient.ts` — wrapper tipado (Zod schemas) sobre Playwright `request`
- `evidenceCollector.ts` — captura automática em falha (screenshot, video, trace)
- `lighthouseRunner.ts` — wrapper sobre `playwright-lighthouse`
- `visualHelper.ts` — masking de áreas dinâmicas

### 3.3.1 `automation/tests/bugs/` — Bug-regression suite (camada de memória)

Cada bug encontrado vira spec dedicado que **falha enquanto o defeito existir, fica verde quando o dev fixar**. Mapping 1:1 com `bug-reports/bugs/BUG-XXX-*.md` (e cards Trello correspondentes).

**Componentes:**

- **`_fixtures.ts`** — extends de `@fixtures/index` adicionando slot `bugFindings` (cada spec preenche expected/actual antes do assert)
- **`_reporter.ts`** — Playwright Reporter custom (registrado em `playwright.config.ts`). Em cada falha, copia `trace.zip` + `screenshot.png` + `video.webm` + `findings.json` + `summary.json` pra `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/`. Roda em `onTestEnd` (post-teardown garantido — fixtures nativas do Playwright populam attachments DEPOIS dos teardowns customizados).
- **`helpers/evidence.ts`** — utilitários compartilhados entre fixture e reporter (extractBugId, safeTimestamp, BugFindings type)
- **`helpers/axe.ts`** — `runAxeRule(page, ruleId)` reusado pelos specs de a11y (BUG-013/014/015/016)
- **`helpers/http.ts`** — `fetchUrl()` pra specs que asseguram comportamento de headers/HTML brutos sem instanciar Page

**Polaridade:** specs assertam comportamento ESPERADO (não defeito). Sem inversão de lógica.

**Lifecycle:** Open (fail) → In dev (PR fix) → Fixed (verde, .md status Closed, card Trello pra "Concluído") → Archived (após 6 meses verde).

**Auto-evidence em pasta dedicada vs test-results/:** `auto-runs/` cresce só em falha; `test-results/` é descartável a cada run. Pasta `auto-runs/` está gitignored.

Detalhes em `automation/tests/bugs/README.md`.

### 3.4 `mcp-server/` — Tarefa 4

**Processos:**

- **MCPServer** (long-lived, stdio): SDK + ToolDispatcher + ResourceRegistry
- **LiveBrowser** (chromium persistente): atende `get_element_status` / `navigate_to`
- **TestRunner** (efêmero, single-flight): spawn Playwright por `run_test_case`. Sem pool — uma execução por vez para manter logs/artefatos rastreáveis 1:1 com tool calls.

LiveBrowser e TestRunner são separados — testes precisam de contexto limpo, exploração precisa de contexto persistente.

**Tools (7):**

- Mandatórias (3): `run_test_case`, `get_element_status`, (Resources de erro implícito)
- Extras (5): `list_test_cases`, `navigate_to`, `get_test_history`, `extract_dom_snapshot`, `analyze_failure`

**Resources URI pattern:** `loomi://artifacts/{testId}/{type}` (error.log, screenshot.png, trace.zip, dom.html, network.har, console.log)

### 3.5 `bug-reports/` — Schema fixo

Cada bug em `.md` com schema: Severidade · Prioridade · Status · Reproduzibilidade · Frequência · Regressão? · Trello card · Pré-condição · Passos · Esperado · Obtido · Ambiente · Evidência · Workaround · Sugestão de fix · Impacto. Mesmo schema dos cards Trello (copy-paste 1:1).

---

## 4. Data flow

### 4.1 Execução local

```
npm run test:e2e
  → Playwright lê config
  → carrega fixtures (loggedInPage faz re-login se necessário)
  → spawn workers paralelos (fullyParallel: true)
  → POM ações + asserts
  → falha aciona evidenceCollector
  → resultados em allure-results/
  → npm run report:allure → HTML navegável
```

### 4.2 CI — gate de PR (`ci.yml`)

```
git push
  → ci.yml triggered
  → checkout + nvm use 20
  → npm ci
  → lint + typecheck
  → npm run test:smoke (chromium only, ≤5min)
  → upload artifacts em falha
  → status check
```

### 4.3 Nightly + publicação Allure (`nightly.yml`)

```
cron 03:00 UTC OU workflow_dispatch
  → matrix [chromium, firefox, webkit] × [desktop, mobile]
  → suite full sharded
  → merge shards
  → allure CLI gera HTML com history (lê branch gh-pages)
  → publica em gh-pages
  → URL pública: https://filipecardorso.github.io/loomi-qa-challenge-kasa/
```

### 4.4 MCP respondendo a IA (Claude Desktop)

**Batch — `run_test_case`:**

```
LLM → call tool → MCP runner spawna `npx playwright test --grep`
  → resultParser → retorna { status, duration, errors, artifactPaths }
  → SE FALHOU: expõe Resources (loomi://artifacts/{id}/...)
  → LLM lê os Resources, analisa
```

**Live — `get_element_status`:**

```
LLM → call tool → MCP usa LiveBrowser persistente já em kasa.live
  → retorna { exists, visible, enabled, text, boundingBox, attrs, ariaRole, screenshot }
  → LLM decide próxima ação
```

### 4.5 Bug → Trello + spec de regressão

```
Bug encontrado durante charter
  → cria bug-reports/bugs/BUG-XXX-titulo.md (schema fixo)
  → coloca evidências manuais em bug-reports/evidence/BUG-XXX/
  → cria spec automation/tests/bugs/BUG-XXX-*.spec.ts (asserta esperado, hoje vermelho)
  → cria card Trello (mesmo schema, link cruzado)
  → commit + push
  → board público mostra status, CI roda spec, evidência viva é gerada em cada falha
```

### 4.6 Validação de fix de bug

```
Dev abre PR de fix → CI roda npm run test:bugs
  → spec do BUG-XXX vira verde
  → BugEvidenceReporter NÃO cria pasta (sem falha)
  → QA atualiza .md Status: Closed + move card Trello pra "Concluído"
  → spec fica como guarda contra regressão
```

---

## 5. Stack consolidada

| Camada                                   | Escolha                                          |
| ---------------------------------------- | ------------------------------------------------ |
| Linguagem                                | TypeScript 5.4 (strict)                          |
| Runtime                                  | Node 20 LTS (`.nvmrc`)                           |
| Runner E2E/API/Visual/A11y/Perf/Security | Playwright 1.50                                  |
| BDD                                      | Gherkin como documentação (sem Cucumber runtime) |
| API testing                              | Playwright `request` + Zod                       |
| Visual                                   | Playwright `toHaveScreenshot()`                  |
| A11y                                     | `@axe-core/playwright`                           |
| Performance                              | `playwright-lighthouse`                          |
| Reports                                  | Allure 2 (+ Playwright HTML fallback)            |
| MCP                                      | `@modelcontextprotocol/sdk`                      |
| Test data                                | factories próprias + `@faker-js/faker`           |
| Lint/format                              | ESLint + Prettier + simple-git-hooks             |
| CI/CD                                    | GitHub Actions                                   |
| Container                                | Docker (Playwright official image)               |
| Gestão                                   | Trello (board público)                           |
| Versionamento                            | Git + Conventional Commits                       |
| MCP testing                              | Vitest                                           |
