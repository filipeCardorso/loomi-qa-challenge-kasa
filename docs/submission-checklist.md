# Submission Checklist — Desafio QA Loomi

**Filipe Gabriel · 2026-05-04**

Checklist final antes de enviar o e-mail para `processoseletivo@loomi.com.br`. Adaptado da spec §10.5.

Legenda: `[x]` ok · `[ ]` pendente.

---

## 1. Empacotamento

- [x] `scripts/package.sh` rodou sem erro
- [x] ZIP descompacta + `npm install` + `npm run test:smoke` passa em pasta nova
- [x] ZIP **sem** `node_modules` (raiz e mcp-server)
- [x] ZIP **sem** `.env` / `.env.local` / qualquer credencial
- [x] ZIP **sem** `reports/`, `allure-results/`, `test-results/`, `playwright-report/`
- [x] ZIP ≤50MB
- [x] Nome do ZIP: `loomi-qa-challenge-filipe-gabriel.zip`

---

## 2. Acessibilidade externa

- [x] **Trello público acessível em janela anônima**
  - URL: https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
- [x] **Allure URL acessível em janela anônima**
  - URL: https://filipecardorso.github.io/loomi-qa-challenge-kasa/
- [x] **GitHub repo acessível em janela anônima**
  - URL: https://github.com/filipeCardorso/loomi-qa-challenge-kasa
- [ ] ~~Vídeo demo~~ **DECISÃO:** pulado (não exigido pelo PDF; documentação cobre comunicação assíncrona)

---

## 3. Documentos obrigatórios

- [x] `README.md` raiz com TL;DR + Quick Start + Links + Inventário
- [x] `docs/progress-report.md` com 8 seções
- [x] `docs/architecture.md`
- [x] `docs/coverage-matrix.md`
- [x] `docs/evaluator-journey.md`
- [x] `docs/exit-criteria.md` (este checklist + critérios atendidos)
- [x] `docs/submission-checklist.md` (este arquivo)
- [x] `docs/mcp-tutorial.md` (reproduzível ≤5min)
- [x] `docs/risks-and-mitigations.md` (registro R1-R11)
- [x] `CHANGELOG.md` com entrada `1.0.0`

---

## 4. CI / Reports

- [x] CI verde no último commit em `main`
- [x] `nightly.yml` triggered manualmente para publicar Allure final
- [x] `gh-pages` branch atualizada
- [x] Smoke (`npm run test:smoke`) passa em ≤5min

---

## 5. Entregáveis por tarefa (rápido)

- [x] **Tarefa 1:** 56 BDD em `test-cases/` (core + extras)
- [x] **Tarefa 2:** 68 testes em `automation/tests/` (6 camadas: E2E + API + Visual + A11y + Perf + Security)
- [x] **Tarefa 3:** 22 bugs + 10 melhorias em `bug-reports/`
- [x] **Tarefa 4:** 7 tools + Resources + 31 testes Vitest + tutorial em `mcp-server/` e `docs/mcp-tutorial.md`

---

## 6. E-mail

- [ ] **Destinatário:** `processoseletivo@loomi.com.br`
- [ ] **Assunto:** `Desafio QA Abril 26 — Filipe Gabriel`
- [ ] **Corpo (2 parágrafos curtos):**
  - Apresentação + escopo entregue (Pleno S1+ em todos os eixos)
  - Links principais: Trello · Allure · Repo · Relatório de progresso
- [ ] **Anexo:** `loomi-qa-challenge-filipe-gabriel.zip`
- [ ] **CC:** (eu mesmo, para confirmar entrega)
- [ ] **Enviar antes do deadline:** 2026-05-04 15:00

---

## 7. Backup / contingência

- [x] ZIP "candidato" backup em e-mail próprio (versão de 12:30 dia 4)
- [x] Push contínuo para GitHub (mirror remoto)
- [x] Allure publicado em GH Pages cedo (não depende de último build)
- [ ] Tethering 4G testado (caso wifi caia)

---

## 8. Pós-envio

- [ ] Confirmar recebimento (responder e-mail recebido)
- [ ] Não modificar repo até feedback (snapshot da entrega = `v1.0.0`)
- [ ] Tag `v1.0.0-submission` criada e pushed
