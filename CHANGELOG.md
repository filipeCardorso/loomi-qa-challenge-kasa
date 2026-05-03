# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [1.0.0] - 2026-05-04

### Added

#### Tarefa 1 — Casos de Teste BDD (56 cenários, +40% sobre Pleno S1)

- 5 features core em `test-cases/core/`: favoritar times (8), favoritar partidas (8), buscar partidas (10), melhores momentos (7), google calendar (5)
- 4 features extras em `test-cases/extras/`: navegação (4), responsividade (3), erro/edge cases (6), recursos não-core (5)
- README com índice geral dos 56 cenários

#### Tarefa 2 — Automação (68 testes, +112% sobre Pleno S1)

- 27 testes E2E em `automation/tests/e2e/` (subset smoke = 10)
- 5 testes API contract em `automation/tests/api/` com schemas Zod
- 5 testes de visual regression em `automation/tests/visual/` (baselines + masking dinâmico)
- 5 testes A11y WCAG 2.1 AA em `automation/tests/a11y/` via axe-core
- 3 testes Performance em `automation/tests/performance/` via Lighthouse
- 23 testes Security em `automation/tests/security/` (XSS reflected/stored/DOM, headers, cookies, CORS, rate-limit)
- POMs (Home, Highlights, Calendar) + 5 componentes (MatchCard, MatchModal, LoginModal, ProfilePopover, NotificationsPanel)
- Fixtures customizadas: `loggedInPage` com re-login automático em storageState expirado, `apiClient`, `axeBuilder`
- Helpers: `apiClient.ts`, `evidenceCollector.ts`, `lighthouseRunner.ts`, `visualHelper.ts`
- Allure publicado em GitHub Pages: https://filipecardorso.github.io/loomi-qa-challenge-kasa/

#### Tarefa 3 — Bugs e Melhorias (22 bugs + 10 melhorias, +83% / +25%)

- 22 bugs documentados em `bug-reports/bugs/` com schema fixo: 3 Critical · 5 High · 9 Medium · 5 Low
  - BUG-022 cookie auth `next-leap_access` sem Secure nem HttpOnly (Critical)
  - BUG-013 a11y aria-allowed-attr (Critical)
  - BUG-014 a11y button-name (Critical)
  - BUG-001 API DEV exposta em produção (High)
  - BUG-019 headers de segurança ausentes na home XCTO/XFO/Referrer/CSP (High)
  - BUG-021 API DEV sem rate limiting 50/50 → 200 (High)
  - BUG-015 a11y color-contrast (High)
  - BUG-016 a11y link-name (High)
  - 14 outros bugs (Medium/Low) cobrindo SEO, calendário, navegação, modais, perf, segurança (HSTS/CSP)
- 10 melhorias em `bug-reports/improvements/` (data-testid, accessible names, dark mode, i18n, LGPD, etc)
- 7 charters de session-based testing
- Evidências por bug em `bug-reports/evidence/`

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
