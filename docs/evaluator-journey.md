# Journey do Avaliador — 20-25min review

**Filipe Gabriel · 2026-05-02 (entrega) · revisado 2026-05-03**

Roteiro otimizado para que o avaliador veja todos os entregáveis sem instalar nada. Tudo o que é mandatório (Trello + Allure + relatório de progresso) está acessível por link. Quick start opcional para quem quiser rodar local.

---

## 1. Descompactar ZIP / clonar repo (30s)

```bash
git clone https://github.com/filipeCardorso/loomi-qa-challenge-kasa.git
cd loomi-qa-challenge-kasa
```

Ou descompactar `loomi-qa-challenge-filipe-gabriel.zip` recebido por e-mail.

---

## 2. Abrir `README.md` + assistir vídeo demo (5min)

O `README.md` raiz tem TL;DR, Quick Start, links principais e inventário de entregáveis. O vídeo demo (Loom unlisted, 3-5min) está embedded e mostra:

- Tour pela estrutura do repo
- Suite passando localmente
- Allure publicado
- MCP server respondendo via Claude Desktop

---

## 3. Abrir Trello + Allure (links no README) (3min)

- **Trello (board público):** https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
  - Listas: Backlog · Sprint · Em andamento · Em revisão · Concluído · Bugs · Melhorias · Bloqueios
  - 22 cards de bug + 10 de melhoria + cards de progresso por trilha

- **Allure Report (GitHub Pages):** https://filipecardorso.github.io/loomi-qa-challenge-kasa/
  - 77 testes verdes
  - Severidade, categorias (epic/feature/story), histórico de runs
  - Anexos navegáveis (screenshot, video, trace) por teste

---

## 4. Quick start opcional (5min)

Para quem quiser rodar local. Pré-requisitos: Node 20 LTS (`nvm use` lê `.nvmrc`).

```bash
nvm use && npm install
npx playwright install --with-deps
npm run test:smoke              # 10 testes ≤5min
npm run report:allure           # gera HTML local
```

Alternativa via Docker (zero instalação local):

```bash
docker build -t loomi-qa -f docker/Dockerfile .
docker run --rm -v $(pwd)/reports:/app/reports loomi-qa npm run test:smoke
```

---

## 5. Navegar entregas (10min)

Cada pasta de topo é um entregável do desafio:

### `test-cases/` — 61 BDD em PT-BR (Tarefa 1)

- `core/` (5 features): favoritar times, favoritar partidas, buscar partidas, melhores momentos, google calendar
- `extras/` (4 features): navegação, responsividade, erro/edge, recursos não-core
- `README.md` indexa todos os 61 cenários
- Linguagem comportamental (Dado/Quando/Então) com lint Gherkin
- Funcionalidades core ≥7 cenários cada

### `bug-reports/` — 21 bugs + 11 melhorias (Tarefa 3)

- `bugs/BUG-001, 002, 004..022.md` — schema fixo (Severidade · Prioridade · Status · Reprodução · Evidência · Sugestão de fix · Impacto).
  - **Sequência pula BUG-003 propositalmente** — foi reclassificado em pré-submissão como IMP-011 (rotas `/buscar`, `/login`, `/calendar`, `/perfil` retornam 404 não por defeito mas por decisão de produto; melhor tratado como melhoria de UX/SEO via redirects 301). Card Trello original arquivado, IMP-011 tem card dedicado.
- `improvements/IMP-001..IMP-011.md` (IMP-011 é a continuação do BUG-003)
- `charters/` — 2 charters executados (C1, C5) + 5 charters da spec não executados por timebox
- `evidence/BUG-XXX/` — screenshots/HAR/console manuais + subpasta `auto-runs/` (gerada pela suite `automation/tests/bugs/` em cada falha — gitignored)
- `README.md` — índice geral com nota de recalibragem 2026-05-03
- Distribuição (atualizada 2026-05-03): **2 Critical · 5 High · 7 Medium · 7 Low** (BUG-008/009/012 rebaixados Medium→Low; BUG-021 rebaixado High→Medium; BUG-014 rebaixado Critical→High e marcado Likely Fixed; BUG-012 marcado Needs revalidation — detalhes nos `.md`)

### `automation/` — 77 testes em 7 camadas (Tarefa 2)

- `tests/e2e/` — 27 testes funcionais (smoke = subset de 10)
- `tests/api/` — 5 testes contract (Zod schemas)
- `tests/visual/` — 5 testes regression
- `tests/a11y/` — 5 testes WCAG 2.1 AA
- `tests/performance/` — 3 testes Lighthouse
- `tests/security/` — 23 testes (XSS reflected/stored/DOM, headers, cookies, CORS, rate-limit)
- **`tests/bugs/` — 22 testes bug-regression em 21 specs (NOVA CAMADA), 1:1 com `bug-reports/bugs/`. Reporter custom dump trace/screenshot/findings em `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/` em cada falha. Polaridade: spec falha enquanto bug existir, fica verde quando dev fixar. Lifecycle e padrão em `automation/tests/bugs/README.md`. Comandos: `npm run test:bugs`, `npm run test:bug -- @bug-002`.**
- `pages/` — POMs · `fixtures/` — custom (incluindo `bugFindings`) · `support/` — helpers
- Suite passa verde 2x consecutivas localmente; CI verde

### `mcp-server/` — 7 tools + tutorial (Tarefa 4)

- `src/tools/` — 3 mandatórias (`run_test_case`, `get_element_status`, Resources de erro) + 5 extras (`list_test_cases`, `navigate_to`, `get_test_history`, `extract_dom_snapshot`, `analyze_failure`)
- `src/resources/` — registry com URIs `loomi://artifacts/{testId}/...`
- `tests/` — 31 testes Vitest (≥80% coverage)
- **Tutorial reproduzível:** [`docs/mcp-tutorial.md`](mcp-tutorial.md) — setup ≤5min com snippet pronto pro `claude_desktop_config.json` + 3 prompts de exemplo

### `docs/progress-report.md` — Autoavaliação 8 seções (Entregável obrigatório)

1. Visão geral da entrega
2. Como organizei demandas e atividades
3. Como priorizei as entregas
4. Cronograma executado (real vs planejado, hora-a-hora)
5. Principais dificuldades e como lidei (top 5 honesto)
6. Decisões técnicas relevantes
7. O que faria diferente com mais tempo
8. Métricas finais

---

## 6. Documentação suplementar (referência)

| Documento                                                 | Para quê                                           |
| --------------------------------------------------------- | -------------------------------------------------- |
| [`docs/architecture.md`](architecture.md)                 | Diagrama da suite + componentes principais         |
| [`docs/coverage-matrix.md`](coverage-matrix.md)           | Tabela funcionalidade × tipo de teste              |
| [`docs/exit-criteria.md`](exit-criteria.md)               | Checklist do que foi entregue por critério         |
| [`docs/submission-checklist.md`](submission-checklist.md) | Checklist final pré-envio                          |
| [`docs/mcp-tutorial.md`](mcp-tutorial.md)                 | Como rodar o MCP server contra Claude Desktop      |
| [`docs/exploration-notes.md`](exploration-notes.md)       | Output da Onda 0 (90min de exploração estruturada) |
| [`docs/superpowers/specs/`](superpowers/specs/)           | Design document fonte de tudo                      |

---

## 7. Resumo do que validar (checklist do avaliador)

- [ ] **Trello público acessível** em janela anônima
- [ ] **Allure URL acessível** em janela anônima (77 testes verdes)
- [ ] **`README.md` raiz** com TL;DR, Quick Start, links e inventário
- [ ] **`docs/progress-report.md`** com 8 seções completas
- [ ] **`test-cases/`** com 61 BDD organizados em core/extras
- [ ] **`bug-reports/bugs/`** com 21 bugs (Critical → Low)
- [ ] **`bug-reports/improvements/`** com 11 melhorias
- [ ] **`automation/tests/`** com 6 camadas (e2e/api/visual/a11y/performance/security)
- [ ] **`mcp-server/`** com 7 tools + 31 testes Vitest + tutorial reproduzível
- [ ] **CI verde** no último commit

Tudo pronto em ≤25min sem precisar instalar nada (Trello + Allure + repo no GitHub cobrem 90% da avaliação).
