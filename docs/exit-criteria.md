# Exit Criteria — Desafio QA Loomi

**Filipe Gabriel · 2026-05-02 (entrega) · revisado 2026-05-03**

Checklist do que precisava ser entregue por critério, com status final marcado. Critérios extraídos da spec §10.3.

Legenda: `[x]` entregue · `[ ]` não entregue · `[~]` parcial (com nota).

---

## Tarefa 1 — Casos de Teste BDD

- [x] **≥40 cenários** (alvo 55) → **60 entregues** (+50%)
- [x] **As 4 funcionalidades core** (favoritar times, favoritar partidas, buscar partidas, melhores momentos) cobertas em profundidade: ≥7 cenários cada
  - Favoritar times: 8 ✓
  - Favoritar partidas: 8 ✓
  - Buscar partidas: 10 ✓
  - Melhores momentos: 7 ✓
- [x] **Google Calendar tratado separadamente** (7 cenários, 6 OAuth manuais conforme R3 + 1 estado pré-conexão automatizável) — atende ≥7 cenários
- [x] **Linguagem comportamental** (Dado/Quando/Então; passa em lint Gherkin)
- [x] **README do `test-cases/` indexa todos** os 60 cenários

---

## Tarefa 2 — Automação

- [x] **≥30 testes** (alvo 45) → **77 entregues** (+140%)
- [x] **Manter ao menos 25 E2E + cobertura de 6 camadas + nova camada bug-regression** — não comprometer a "forma de diamante"
  - 31 E2E + 8 API (5 contract + 3 negativos) + 5 Visual + 1 A11y baseline + 1 Perf Lighthouse + 12 Security + 22 bug-regression (BUG-015 expandido em 5 rotas) → todas as 7 camadas presentes
- [x] **Suite full passa verde 2x consecutivas localmente**
- [x] **CI verde** em PRs consecutivos
- [x] **Allure local sem erro** (e publicado em GH Pages — extra)
- [x] **Zero `waitForTimeout`** — só `waitFor` baseado em estado

---

## Tarefa 3 — Bugs / Melhorias

- [x] **≥12 bugs** (alvo 22) com evidência commitada → **21 entregues** (+75%)
  - Distribuição (recalibrada 2026-05-03): **2 Critical · 5 High · 7 Medium · 7 Low**
  - BUG-003 reclassificado para IMP-011 em pré-submissão (não era defeito; ver IMP-011)
  - Recalibragens 2026-05-03: BUG-008 Medium→Low (design debt), BUG-009 Medium→Low (só DOM), BUG-012 Medium→Low (Needs revalidation), BUG-021 High→Medium (burst de 50 reqs não conclusivo), BUG-014 marcado Likely Fixed
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

| #   | Risco                          | Mitigação aplicada                                                                                                                                                                                                                                                              |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | kasa.live cair                 | Snapshots HTML/PNG salvos em `docs/site-snapshots/`                                                                                                                                                                                                                             |
| R2  | Site mudar layout em 48h       | Seletores `getByRole`/`getByText`/testid; lista central                                                                                                                                                                                                                         |
| R3  | OAuth Google exigir 2FA        | Não automatizado; 2 BDD manuais + 1 E2E parcial                                                                                                                                                                                                                                 |
| R4  | Visual baselines flakey        | Baseline gerada/commitada em CI Linux; threshold 2%; masking                                                                                                                                                                                                                    |
| R5  | Tempo estourar                 | Cronograma com checkpoints; cortes pré-definidos não acionados                                                                                                                                                                                                                  |
| R6  | MCP quebrar com Claude Desktop | Vitest 80%+; tutorial reproduzível; logs JSONL                                                                                                                                                                                                                                  |
| R7  | Rede flakey nos perf tests     | Soft fail (warning), não bloqueia                                                                                                                                                                                                                                               |
| R8  | Conta de teste banida/limitada | Sleep entre runs; mesma conta nas 48h                                                                                                                                                                                                                                           |
| R9  | MCP canibaliza Tarefas 1-3     | Trilha C com timebox; entregue 7 tools sem comprometer outras                                                                                                                                                                                                                   |
| R10 | Ambiente local diferente       | Dockerfile + lock + `.nvmrc`                                                                                                                                                                                                                                                    |
| R11 | Internet/PC fora no dia 4      | Backup ZIP, push contínuo, GitHub Pages publicado cedo                                                                                                                                                                                                                          |
| R12 | IA-overuse sem revisão humana  | Uso de Claude Code declarado abertamente em progress-report §4. Coordenação humana de escopo + revisão crítica pré-entrega detectou e corrigiu issues (BUG-003→IMP-011, BUG-009/011/012/018 reinvestigados 2026-05-03, recalibragem de severidades). Sem IA-overuse silencioso. |

---

## Sumário final

| Critério             | Status                                    |
| -------------------- | ----------------------------------------- |
| Tarefa 1 (BDD)       | ✅ Estourado (+50%)                       |
| Tarefa 2 (Automação) | ✅ Estourado (+140%)                      |
| Tarefa 3 (Bugs)      | ✅ Estourado (+75% bugs · +38% melhorias) |
| Tarefa 4 (MCP)       | ✅ Estourado (+133% tools)                |
| Transversais         | ✅ Todos entregues                        |

Pronto para submissão.
