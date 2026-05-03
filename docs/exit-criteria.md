# Exit Criteria — Desafio QA Loomi

**Filipe Gabriel · 2026-05-04**

Checklist do que precisava ser entregue por critério, com status final marcado. Critérios extraídos da spec §10.3.

Legenda: `[x]` entregue · `[ ]` não entregue · `[~]` parcial (com nota).

---

## Tarefa 1 — Casos de Teste BDD

- [x] **≥40 cenários** (alvo 55) → **56 entregues** (+40%)
- [x] **As 4 funcionalidades core** (favoritar times, favoritar partidas, buscar partidas, melhores momentos) cobertas em profundidade: ≥7 cenários cada
  - Favoritar times: 8 ✓
  - Favoritar partidas: 8 ✓
  - Buscar partidas: 10 ✓
  - Melhores momentos: 7 ✓
- [x] **Google Calendar tratado separadamente** (5 cenários, OAuth real é manual conforme R3) — não conta como core para o critério ≥7
- [x] **Linguagem comportamental** (Dado/Quando/Então; passa em lint Gherkin)
- [x] **README do `test-cases/` indexa todos** os 56 cenários

---

## Tarefa 2 — Automação

- [x] **≥30 testes** (alvo 45) → **68 entregues** (+112%)
- [x] **Manter ao menos 25 E2E + cobertura de 5 das 6 camadas** (E2E/API/Visual/A11y/Perf/Security) — não comprometer a "forma de diamante"
  - 27 E2E + 5 API + 5 Visual + 5 A11y + 3 Perf + 23 Security → todas as 6 camadas presentes
- [x] **Suite full passa verde 2x consecutivas localmente**
- [x] **CI verde** em PRs consecutivos
- [x] **Allure local sem erro** (e publicado em GH Pages — extra)
- [x] **Zero `waitForTimeout`** — só `waitFor` baseado em estado

---

## Tarefa 3 — Bugs / Melhorias

- [x] **≥12 bugs** (alvo 22) com evidência commitada → **21 entregues** (+75%)
  - Distribuição: 3 Critical · 5 High · 8 Medium · 5 Low
  - BUG-003 reclassificado para IMP-011 em pré-submissão (não era defeito; ver IMP-011)
- [x] **≥8 melhorias** (alvo 10) com evidência → **11 entregues** (+38%)
- [x] **Todos no Trello + `.md` no repo** (schema 1:1 entre card e arquivo)
- [x] **Severidade preenchida** em 100% dos bugs

---

## Tarefa 4 — MCP Server

- [x] **3 tools mandatórias funcionando** contra Claude Desktop
  - `run_test_case` ✓
  - `get_element_status` ✓
  - Resources de erro acessíveis via `loomi://artifacts/{testId}/...` ✓
- [x] **Resources de erro acessíveis após falha** (URI pattern + notification `notifications/resources/list_changed`)
- [x] **Tutorial reproduzível** (avaliador roda em ≤5min) → `docs/mcp-tutorial.md`
- [ ] ~~Vídeo demo do MCP~~ pulado (não exigido pelo PDF; tutorial escrito cobre)
- [x] **Extras (bonus):** 4 tools adicionais (`list_test_cases`, `navigate_to`, `extract_dom_snapshot`, `analyze_failure`) + 31 testes Vitest com ≥80% coverage target

---

## Transversais

- [x] **Trello público com URL no README** (https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel)
- [x] **Allure publicado em GitHub Pages** (https://filipecardorso.github.io/loomi-qa-challenge-kasa/)
- [x] **`progress-report.md` com 8 seções completas** → `docs/progress-report.md`
- [ ] ~~Vídeo demo geral~~ pulado (não exigido pelo PDF; documentação cobre comunicação)
- [x] **README raiz com setup ≤5min** (Quick Start + links + inventário)
- [x] **ZIP gerado por script**, sem `node_modules`, ≤50MB → `scripts/package.sh`

---

## Riscos mitigados

| #   | Risco                          | Mitigação aplicada                                             |
| --- | ------------------------------ | -------------------------------------------------------------- |
| R1  | kasa.live cair                 | Snapshots HTML/PNG salvos em `docs/site-snapshots/`            |
| R2  | Site mudar layout em 48h       | Seletores `getByRole`/`getByText`/testid; lista central        |
| R3  | OAuth Google exigir 2FA        | Não automatizado; 2 BDD manuais + 1 E2E parcial                |
| R4  | Visual baselines flakey        | Baseline gerada/commitada em CI Linux; threshold 2%; masking   |
| R5  | Tempo estourar                 | Cronograma com checkpoints; cortes pré-definidos não acionados |
| R6  | MCP quebrar com Claude Desktop | Vitest 80%+; tutorial reproduzível; logs JSONL                 |
| R7  | Rede flakey nos perf tests     | Soft fail (warning), não bloqueia                              |
| R8  | Conta de teste banida/limitada | Sleep entre runs; mesma conta nas 48h                          |
| R9  | MCP canibaliza Tarefas 1-3     | Trilha C com timebox; entregue 7 tools sem comprometer outras  |
| R10 | Ambiente local diferente       | Dockerfile + lock + `.nvmrc`                                   |
| R11 | Internet/PC fora no dia 4      | Backup ZIP, push contínuo, GitHub Pages publicado cedo         |

---

## Sumário final

| Critério             | Status                                    |
| -------------------- | ----------------------------------------- |
| Tarefa 1 (BDD)       | ✅ Estourado (+37%)                       |
| Tarefa 2 (Automação) | ✅ Estourado (+40%)                       |
| Tarefa 3 (Bugs)      | ✅ Estourado (+75% bugs · +38% melhorias) |
| Tarefa 4 (MCP)       | ✅ Estourado (+133% tools)                |
| Transversais         | ✅ Todos entregues                        |

Pronto para submissão.
