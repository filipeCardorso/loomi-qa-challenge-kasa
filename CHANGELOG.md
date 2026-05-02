# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [1.0.0] - 2026-05-04

### Added

#### Tarefa 1 — Casos de Teste BDD (55 cenários, +37% sobre Pleno S1)

- 5 features core em `test-cases/core/`: favoritar times (8), favoritar partidas (8), buscar partidas (10), melhores momentos (7), google calendar (5)
- 4 features extras em `test-cases/extras/`: navegação, responsividade, erro/edge cases, recursos não-core
- README com índice geral dos 55 cenários

#### Tarefa 2 — Automação (45 testes, +40% sobre Pleno S1)

- 27 testes E2E em `automation/tests/e2e/` (subset smoke = 10)
- 5 testes API contract em `automation/tests/api/` com schemas Zod
- 5 testes de visual regression em `automation/tests/visual/` (baselines + masking dinâmico)
- 5 testes A11y WCAG 2.1 AA em `automation/tests/a11y/` via axe-core
- 3 testes Performance em `automation/tests/performance/` via Lighthouse
- POMs (Home, Highlights, Calendar) + 5 componentes (MatchCard, MatchModal, LoginModal, ProfilePopover, NotificationsPanel)
- Fixtures customizadas: `loggedInPage` com re-login automático em storageState expirado, `apiClient`, `axeBuilder`
- Helpers: `apiClient.ts`, `evidenceCollector.ts`, `lighthouseRunner.ts`, `visualHelper.ts`
- Allure publicado em GitHub Pages: https://filipecardorso.github.io/loomi-qa-challenge-kasa/

#### Tarefa 3 — Bugs e Melhorias (18 bugs + 10 melhorias, +50% / +25%)

- 18 bugs documentados em `bug-reports/bugs/` com schema fixo: 2 Critical · 3 High · 7 Medium · 6 Low
  - BUG-001 API DEV exposta em produção (Critical)
  - BUG-013 a11y aria-allowed-attr (Critical)
  - BUG-014 a11y button-name (Critical)
  - BUG-011 modal de partida finalizada sempre vazio (High)
  - BUG-018 Lighthouse Perf home = 41 (High)
  - 13 outros bugs (Medium/Low) cobrindo SEO, calendário, navegação, modais, perf
- 10 melhorias em `bug-reports/improvements/` (data-testid, accessible names, dark mode, i18n, LGPD, etc)
- 7 charters de session-based testing
- Evidências por bug em `bug-reports/evidence/`

#### Tarefa 4 — MCP Server (7 tools, +133% sobre as 3 mandatórias)

- 3 tools mandatórias: `run_test_case`, `get_element_status`, Resources de erro acessíveis via `loomi://artifacts/{testId}/...`
- 4 tools extras: `list_test_cases`, `navigate_to`, `extract_dom_snapshot`, `analyze_failure`
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

---

## [0.1.0] - 2026-05-02

### Added

- Foundation do projeto: deps, configs, CI esqueleto
- Estrutura de diretórios completa
- Trello board público criado
