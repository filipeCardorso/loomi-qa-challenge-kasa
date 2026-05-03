# Desafio QA Loomi — Filipe Gabriel

> **TL;DR:** Suite completa de testes do kasa.live (E2E + API + Visual + A11y + Performance) + MCP Server para testes via LLM. Entrega com escopo Pleno S1 estourado em todos os eixos.

## Quick Start (<=5min)

```bash
nvm use && npm install
npx playwright install --with-deps
npm run test:smoke   # 7 testes verdes em ~17s
npm run report:allure
```

> **Suite completa requer credenciais.** Os specs que dependem de login (`loggedInPage` fixture) precisam de `.env.local` com `KASA_USER_EMAIL` / `KASA_USER_PASSWORD`. Sem isso, `test:smoke` e a maioria de `test:bugs` rodam normalmente (anônimos); apenas BUG-022 (cookie auth) é skippado. Template em `.env.example`.

## Links principais

- 📦 **Repositório:** https://github.com/filipeCardorso/loomi-qa-challenge-kasa
- 📋 **Trello (board público):** https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
- 📊 **Allure Report (publicado em GitHub Pages):** https://filipecardorso.github.io/loomi-qa-challenge-kasa/
- 🎬 **Demos MCP em ação:** [Terminal](docs/site-snapshots/mcp/demo.gif) (7 tools via stdio) · [Browser - match modal](docs/site-snapshots/mcp/playwright-match-modal.gif) · [Browser - busca typeahead](docs/site-snapshots/mcp/playwright-busca-time.gif) (Playwright real contra kasa.live)
- 📝 **Relatório de Progresso:** [docs/progress-report.md](docs/progress-report.md)

## Inventário de entregáveis

| #   | Tarefa             | Pasta                          | Métrica entregue                                | Status |
| --- | ------------------ | ------------------------------ | ----------------------------------------------- | ------ |
| 1   | Casos de Teste BDD | [`test-cases/`](test-cases/)   | **61** cenários (PT-BR Gherkin)                 | ✅     |
| 2   | Automação          | [`automation/`](automation/)   | **77** testes (55 contract + 22 bug-regression) | ✅     |
| 3   | Bugs e Melhorias   | [`bug-reports/`](bug-reports/) | **21** bugs + **11** melhorias (Trello + repo)  | ✅     |
| 4   | MCP Server         | [`mcp-server/`](mcp-server/)   | **7** tools + 31 testes Vitest + tutorial       | ✅     |

## Critérios atendidos vs Pleno S1

| Critério                | Pleno S1 (PDF) | Entregue | Delta     |
| ----------------------- | -------------- | -------- | --------- |
| Casos BDD               | 40             | **60**   | **+50%**  |
| Bugs                    | 12             | **21**   | **+75%**  |
| Melhorias               | 8              | **11**   | **+38%**  |
| Automação               | 30-32          | **77**   | **+140%** |
| Tools MCP (mandatórias) | 3              | 3        | ✅        |
| Tools MCP (totais)      | —              | **7**    | **+133%** |

## Diferenciais além do PDF

- 🌐 Allure Report **publicado em URL pública** (GitHub Pages)
- 🤖 MCP Server com 4 tools extras + 31 testes Vitest + tutorial reproduzível
- 📈 7 camadas de teste: 6 de contrato (E2E + API + Visual regression + A11y WCAG AA + Performance Lighthouse + Security) **+ 1 de regressão-por-bug** (`automation/tests/bugs/` com 21 specs 1:1 mapeados aos `.md` em `bug-reports/bugs/`, reporter custom que dump trace/screenshot/video em falha)
- 🐳 Docker pronto para uso (`docker/Dockerfile`)
- 🔄 CI/CD GitHub Actions com smoke gate em PR + nightly multi-browser
- 📚 Documentação ponta-a-ponta em [`docs/`](docs/) (8 documentos)
- 🧪 ~70 commits seguindo Conventional Commits PT-BR

## Como rodar cada peça

| O que                             | Comando                                  |
| --------------------------------- | ---------------------------------------- |
| Smoke (7 testes, ≤20s)            | `npm run test:smoke`                     |
| E2E completo                      | `npm run test:e2e`                       |
| API contract                      | `npm run test:api`                       |
| Visual regression                 | `npm run test:visual`                    |
| Acessibilidade                    | `npm run test:a11y`                      |
| Performance                       | `npm run test:perf`                      |
| Security                          | `npm run test:security`                  |
| **Bug regression** (21 specs 1:1) | `npm run test:bugs`                      |
| Bug específico (ex.: BUG-002)     | `npm run test:bug -- @bug-002`           |
| MCP Server (build + start)        | `npm run mcp:build && npm run mcp:start` |
| Allure local                      | `npm run report:allure`                  |
| Suite completa                    | `npm test`                               |

## Estrutura do repo

```
.
├── automation/          # Trilha B — POMs + 106 testes Playwright (6 camadas de contrato + 1 de bug-regression)
│   └── tests/bugs/      # 21 specs 1:1 com bug-reports/bugs/ (reporter custom auto-evidence)
├── test-cases/          # Trilha A — 64 cenários BDD em PT-BR Gherkin
├── bug-reports/         # Trilha A — 21 bugs + 11 melhorias estruturados
├── mcp-server/          # Trilha C — MCP server Node/TS com 7 tools + Vitest
├── docs/                # 8 documentos: arquitetura, relatório, matriz, journey, etc
├── docker/              # Dockerfile baseado em Playwright official image
├── scripts/             # package.sh (gera ZIP) + sync-trello.mjs + exploradores
└── .github/workflows/   # CI (gate PR) + nightly (Allure publish) + visual-update
```

Tree completo em [`docs/architecture.md`](docs/architecture.md).

## Documentação navegável

| Documento                                            | Descrição                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| [Relatório de Progresso](docs/progress-report.md)    | 8 seções: organização, priorização, dificuldades, decisões, métricas |
| [Matriz de cobertura](docs/coverage-matrix.md)       | Funcionalidade × tipo de teste                                       |
| [Arquitetura](docs/architecture.md)                  | Diagrama das 3 trilhas + componentes                                 |
| [Tutorial MCP](docs/mcp-tutorial.md)                 | Como rodar o MCP server em Claude Desktop em ≤5min                   |
| [Riscos e mitigações](docs/risks-and-mitigations.md) | Registro R1-R11                                                      |
| [Exit criteria](docs/exit-criteria.md)               | Checklist do que foi entregue                                        |
| [Evaluator journey](docs/evaluator-journey.md)       | Roteiro de revisão em 20-25min                                       |
| [Notas de exploração](docs/exploration-notes.md)     | Mapeamento técnico do kasa.live                                      |

## Autor

**Filipe Gabriel** · filipecardosogabriel@gmail.com · QA Senior
