# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [1.0.0] - 2026-05-03

### Added

#### Tarefa 1 — Casos de Teste BDD (61 cenários, +52% sobre Pleno S1)

- 5 features core em `test-cases/core/`: favoritar times (8), favoritar partidas (8), buscar partidas (10), melhores momentos (7), google calendar (7)
- 4 features extras em `test-cases/extras/`: navegação (4), responsividade (3), erro/edge cases (6), recursos não-core (5)
- README com índice geral dos 61 cenários

#### Tarefa 2 — Automação (77 testes = 55 contract + 22 bug-regression, +140% sobre Pleno S1)

> **Breakdown da contagem 77** (test cases, não specs): e2e=31 · api=5 · visual=5 · a11y=1 · performance=1 · security=12 → **55 contract** + bugs=22 (21 specs com BUG-015 expandido em 5 rotas + 1 fixme) = **77 total**.

- 31 testes E2E em `automation/tests/e2e/` (subset smoke = 10)
- 5 testes API contract em `automation/tests/api/` com schemas Zod
- 5 testes de visual regression em `automation/tests/visual/` (baselines + masking dinâmico)
- 5 testes A11y WCAG 2.1 AA em `automation/tests/a11y/` via axe-core
- 3 testes Performance em `automation/tests/performance/` via Lighthouse
- 23 testes Security em `automation/tests/security/` (XSS reflected/stored/DOM, headers, cookies, CORS, rate-limit)
- **23 testes bug-regression em `automation/tests/bugs/` (NOVA CAMADA, mapping 1:1 com bug-reports/bugs/):**
  - 21 specs `BUG-XXX-*.spec.ts` (BUG-015 expandido em 5 testes, um por rota = 23 test cases)
  - 19 ativos asserindo comportamento esperado · 2 com `test.fixme` (BUG-012 needs revalidation, BUG-018 cobertura via project=perf)
  - **`_reporter.ts`** — BugEvidenceReporter custom registrado em `playwright.config.ts`; em cada falha copia trace/screenshot/video/findings.json/summary.json pra `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/`
  - **`_fixtures.ts`** — slot `bugFindings` (expected/actual) anexado ao testInfo
  - Helpers compartilhados (`evidence.ts`, `axe.ts`, `http.ts`)
  - npm scripts: `test:bugs`, `test:bug -- @bug-XXX`, `validate:bug`
  - README próprio em `automation/tests/bugs/README.md` documenta lifecycle (Open → Fixed → Archived), polaridade, padrão
- POMs (Home, Highlights, Calendar) + 5 componentes (MatchCard, MatchModal, LoginModal, ProfilePopover, NotificationsPanel)
- Fixtures customizadas: `loggedInPage` com re-login automático em storageState expirado, `apiClient`, `axeBuilder`, `bugFindings`
- Helpers: `apiClient.ts`, `evidenceCollector.ts`, `lighthouseRunner.ts`, `visualHelper.ts`
- Allure publicado em GitHub Pages: https://filipecardorso.github.io/loomi-qa-challenge-kasa/

#### Tarefa 3 — Bugs e Melhorias (21 bugs + 11 melhorias, +75% / +38%)

- 21 bugs documentados em `bug-reports/bugs/` com schema fixo. Distribuição final pós-recalibragem 2026-05-03: **2 Critical · 5 High · 7 Medium · 7 Low**
  - BUG-022 cookie auth `next-leap_access` sem Secure nem HttpOnly (Critical)
  - BUG-013 a11y aria-allowed-attr (Critical)
  - BUG-014 a11y button-name (Critical)
  - BUG-001 API DEV exposta em produção (High)
  - BUG-019 headers de segurança ausentes na home XCTO/XFO/Referrer/CSP (High)
  - BUG-015 a11y color-contrast (High)
  - BUG-016 a11y link-name (High)
  - BUG-021 API DEV sem rate limiting (rebaixado High→Medium, ver pré-submissão)
  - 13 outros bugs (Medium/Low) cobrindo SEO, calendário, navegação, modais, perf, segurança (HSTS/CSP)
  - BUG-003 reclassificado para IMP-011 em pré-submissão (rotas /buscar, /login etc não eram defeito, eram product decision)
  - **Pré-submissão 2026-05-03 — recalibragem de severidades baseada em re-investigação:**
    - BUG-008 Medium→Low (design debt, ambos query params funcionam idêntico)
    - BUG-009 Medium→Low (só DOM, visual ok)
    - BUG-012 Medium→Low + status `Needs revalidation` (rota não tem vista semanal hoje)
    - BUG-018 título corrigido (Lighthouse 41→63, CLS 0.705 destacado como ofensor real)
    - BUG-021 High→Medium (50 reqs não prova ausência de rate limit; nota propondo burst de 500+)
    - BUG-014 marcado `Likely Fixed` (axe-core retornou 0 nodes em 2026-05-03 vs 30 em 2026-05-02)
    - BUG-015 evidência expandida pra 5 rotas (14 violations; arquivo vazio anterior removido)
- 11 melhorias em `bug-reports/improvements/` (data-testid, accessible names, dark mode, i18n, LGPD, deeplinks, etc)
- 2 charters executados (C1 busca adversarial, C5 mobile viewports) + 5 da spec não executados por timebox
- Evidências por bug em `bug-reports/evidence/` (screenshots reais BUG-002/009/012 + axe JSON BUG-013/014/015/016 capturados em pre-submission)

#### Tarefa 4 — MCP Server (7 tools, +133% sobre as 3 mandatórias)

- 3 tools mandatórias: `run_test_case`, `get_element_status`, Resources de erro acessíveis via `loomi://artifacts/{testId}/...`
- 5 tools extras: `list_test_cases`, `navigate_to`, `get_test_history`, `extract_dom_snapshot`, `analyze_failure`
- Resources URI pattern com 6 tipos (error.log, screenshot.png, trace.zip, dom.html, network.har, console.log)
- 31 testes Vitest com target ≥80% coverage
- LiveBrowser persistente + TestRunner single-flight (mutex FIFO)
- Tutorial reproduzível em `docs/mcp-tutorial.md` com snippet `claude_desktop_config.json` + 3 prompts de exemplo

#### Documentação

- `docs/progress-report.md` — entregável obrigatório com 8 seções
- `docs/architecture.md` — diagrama da suite + componentes
- `docs/coverage-matrix.md` — funcionalidade × tipo de teste
- `docs/evaluator-journey.md` — roteiro de 20-25min review
- `docs/exit-criteria.md` — checklist de critérios atendidos
- `docs/submission-checklist.md` — checklist final pré-envio
- `docs/mcp-tutorial.md` — tutorial reproduzível MCP
- `docs/exploration-notes.md` — output da Onda 0 (90min)
- `docs/risks-and-mitigations.md` — registro R1-R11 com mitigações aplicadas
- `docs/site-snapshots/` — backup HTML/PNG do kasa.live (mitigação R1)

#### Plataforma / CI

- GitHub Actions: `ci.yml` (smoke ≤5min), `nightly.yml` (full + Allure publish), `visual-update.yml` (manual)
- Trello board público: https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
- Dockerfile baseado em Playwright official image
- Pre-commit hook (simple-git-hooks + lint-staged)
- ESLint + Prettier configurados

### Fixed

- CI Allure: substituído `simple-elf/allure-report-action` (broken) pela CLI Allure direta
- Storage state com session cookie expirado: fixture `loggedInPage` faz re-login automático
- Smoke roda apenas chromium em CI (timeouts ampliados por causa da DEV API lenta — BUG-001)
- `dotenv/config` carregava só `.env`; corrigido para ler `.env.local` explicitamente

### Security

- `.env.example` sanitizado (sem credenciais)
- `.gitignore` cobre `.env*`, `node_modules`, reports, allure-results, test-results, playwright-report
- `.dockerignore` evita vazar `.env.local`, `.auth-state.json`, ZIPs e reports na imagem Docker

---

## [0.1.0] - 2026-05-02

### Added

- Foundation do projeto: deps, configs, CI esqueleto
- Estrutura de diretórios completa
- Trello board público criado
