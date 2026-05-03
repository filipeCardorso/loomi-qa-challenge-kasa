# Riscos e Mitigações — Desafio QA Loomi

**Filipe Gabriel · 2026-05-02 (entrega) · revisado 2026-05-03**

Registro R1-R12 dos riscos identificados durante o planejamento e a execução do desafio, com a mitigação aplicada em cada caso. Esta lista é referenciada por `README.md`, `docs/exit-criteria.md` e `docs/progress-report.md`.

---

## Tabela de riscos

| #   | Risco                          | Mitigação aplicada                                                                                                                                                                                                                                           |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | kasa.live cair                 | Snapshots HTML/PNG salvos em `docs/site-snapshots/`                                                                                                                                                                                                          |
| R2  | Site mudar layout em 48h       | Seletores `getByRole`/`getByText`/testid; lista central                                                                                                                                                                                                      |
| R3  | OAuth Google exigir 2FA        | Não automatizado; 2 BDD manuais + 1 E2E parcial                                                                                                                                                                                                              |
| R4  | Visual baselines flakey        | Baseline gerada/commitada em CI Linux; threshold 2%; masking                                                                                                                                                                                                 |
| R5  | Tempo estourar                 | Cronograma com checkpoints; cortes pré-definidos não acionados                                                                                                                                                                                               |
| R6  | MCP quebrar com Claude Desktop | Vitest 80%+; tutorial reproduzível; logs JSONL                                                                                                                                                                                                               |
| R7  | Rede flakey nos perf tests     | Soft fail (warning), não bloqueia                                                                                                                                                                                                                            |
| R8  | Conta de teste banida/limitada | Sleep entre runs; mesma conta nas 48h                                                                                                                                                                                                                        |
| R9  | MCP canibaliza Tarefas 1-3     | Trilha C com timebox; entregue 7 tools sem comprometer outras                                                                                                                                                                                                |
| R10 | Ambiente local diferente       | Dockerfile + lock + `.nvmrc`                                                                                                                                                                                                                                 |
| R11 | Internet/PC fora no dia 4      | Backup ZIP, push contínuo, GitHub Pages publicado cedo                                                                                                                                                                                                       |
| R12 | IA-overuse sem revisão humana  | Uso de Claude Code declarado em progress-report §4; revisão crítica humana detectou e corrigiu issues pré-entrega (ex.: BUG-003→IMP-011, recalibragem de severidades 2026-05-03, BUG-011 com 3 modais distintos pós-recaptura, BUG-014 marcado Likely Fixed) |

---

## Notas operacionais

- **R1/R2 — disponibilidade do site:** os snapshots em `docs/site-snapshots/exploration/` permitem que o avaliador veja o estado do kasa.live no momento dos testes mesmo se o site sair do ar ou mudar de layout antes da revisão.
- **R3 — OAuth:** `automation/tests/e2e/login-google-oauth.spec.ts` cobre apenas a iniciação do flow; cenários completos estão em `test-cases/extras/` como BDD executados manualmente.
- **R4 — visual regression:** baselines geradas no runner Linux do GitHub Actions (`.github/workflows/visual-update.yml`); rodar local em macOS pode produzir diffs aceitáveis devido a renderização de fonte.
- **R5 — cronograma:** checkpoints intermediários em `docs/progress-report.md` §4.
- **R6 — MCP:** logs JSONL em `mcp-server/logs/mcp-YYYY-MM-DD.jsonl` e tutorial reproduzível em `docs/mcp-tutorial.md`.
- **R7 — perf flakey:** Lighthouse roda em chromium headless e tolera ±10% nos thresholds; falhas são warnings.
- **R8 — conta de teste:** `automation/fixtures/loggedInPage.ts` faz re-login automático em storageState expirado, evitando uso excessivo da conta.
- **R9 — MCP timebox:** Trilha C teve janela compacta (15:00-15:45 dia 02/05) e checkpoints curtos.
- **R10 — ambiente:** `docker/Dockerfile` baseado em `mcr.microsoft.com/playwright:v1.50.0-jammy` + `.nvmrc` (Node 20 LTS) + lockfile commitado.
- **R11 — contingência:** ZIP backup no e-mail próprio + push contínuo para GitHub + Allure publicado em GH Pages logo cedo.
- **R12 — IA-overuse:** O candidato usou Claude Code com subagentes paralelos como copilot de execução (gerar boilerplate de specs, scaffolding de Page Objects, revisão crítica pré-submissão). A coordenação de escopo/prioridade/decisão arquitetural foi humana. Mitigação evidenciada: 6+ correções pós-revisão crítica documentadas (reclassificação BUG-003, recalibragem de severidades, recaptura BUG-011 manual, ajuste de status BUG-014, separação de cross-references em IMPs com fato verificável). Sem submissão ressaltada por "ruído de IA" — todos os artefatos passaram por validação cruzada cross-document e Trello.
