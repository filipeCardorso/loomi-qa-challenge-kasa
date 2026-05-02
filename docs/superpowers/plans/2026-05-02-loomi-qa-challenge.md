# Loomi QA Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o desafio QA Loomi (kasa.live) cobrindo Tarefas 1-4 com escopo Pleno S1+ (55 BDD / 18 bugs / 10 melhorias / 45 auto / 8 tools MCP) em ~30h produtivas até 2026-05-04 15:00.

**Architecture:** Monorepo TypeScript com 3 trilhas paralelas (Functional QA / Automation / Platform-MCP) integradas por Playwright como runner único cobrindo E2E + API + Visual + A11y + Perf. MCP server em Node/TS expõe runner pra LLMs. Allure publicado em GitHub Pages.

**Tech Stack:** TypeScript strict, Node 20 LTS (lts/iron), Playwright 1.50+, `@modelcontextprotocol/sdk`, `@axe-core/playwright`, `playwright-lighthouse`, Allure 2, Vitest, GitHub Actions, Docker, Trello.

**Spec referenciada:** `docs/superpowers/specs/2026-05-02-loomi-qa-challenge-design.md`

---

## Estrutura de fases (mapeia o cronograma da Spec §11)

| Fase | Quando | Trilha | Output principal |
|---|---|---|---|
| 0 — Foundation | D1 14:00-15:30 | ✱ | Repo skeleton, deps, configs, CI skeleton, Trello board criado |
| 1 — Exploration | D1 15:30-17:00 | A | `docs/exploration-notes.md` |
| 2 — Bug hunting wave 1 | D1 17:00-19:00 | A | Charters C1+C2 → 6 bugs |
| 3 — Automation foundation | D1 20:00-22:00 | B | Playwright config, fixtures, POMs, 8 E2E core |
| 4 — MCP skeleton | D1 22:00-23:30 | C | MCP rodando + `run_test_case` mínimo |
| 5 — Bug hunting wave 2 | D2 08:30-10:30 | A | Charters C3+C4 → +6 bugs, +3 melhorias |
| 6a — E2E batch 2 | D2 10:30-12:30 | B | +12 E2E (total 20) |
| 6b — API + Allure | D2 13:30-15:00 | B | +5 API (total 25), Allure local |
| 7 — MCP completion | D2 15:00-17:00 | C | `get_element_status`, browser persistente, Resources |
| 8 — Bug hunting wave 3 | D2 17:00-19:00 | A | Charters C5+C6+C7 → +6 bugs, +5 melhorias |
| 9 — Quality layers | D2 20:00-22:00 | B | Visual (5) + A11y (5), total 35 |
| 10 — BDD finalização | D2 22:00-23:30 | A | 55 cenários `.feature` completos |
| 11 — Final automation | D3 06:30-08:00 | B | E2E batch 3 (7) + Perf (3), total 45 |
| 12 — MCP polish | D3 08:00-10:00 | C | Tutorial reproduzível + extras + Vitest |
| 13 — CI/Allure publish | D3 10:00-11:00 | C | Allure publicado em GitHub Pages |
| 14 — Demo video | D3 11:00-12:30 | ✱ | Vídeo Loom 3-5min |
| 15 — Final docs | D3 13:30-14:30 | ✱ | progress-report.md + READMEs + checklist |
| 16 — Submission | D3 14:30-15:00 | ✱ | ZIP validado + e-mail enviado |

**Convenção:** cada fase tem várias **Tasks**. Cada task tem **Steps** numerados (2-5min cada quando código; granularidade maior em discovery/exploratório).

---

## Fase 0 — Foundation (D1 14:00-15:30)

**Goal:** Repo skeleton funcional com toda infra mínima (deps, config, CI esqueleto, Trello board público criado).

### Task 0.1 — Repo bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `.nvmrc`, `.gitignore`, `.editorconfig`, `.prettierrc`, `.gitattributes`, `LICENSE`, `.env.example`

- [ ] **Step 0.1.1 — Confirmar repo existe e Git inicializado**

```bash
cd /Users/filipegabriel/loomi-qa-challenge-kasa && git status
```
Expected: branch `main`, sem alterações pendentes (já tem 3 commits da spec).

- [ ] **Step 0.1.2 — Criar `.nvmrc`**

```bash
echo "lts/iron" > .nvmrc
```

- [ ] **Step 0.1.3 — Criar `.gitignore`**

Conteúdo:
```
node_modules/
*/node_modules/
dist/
build/
*/dist/
*/build/
.env
.env.local
*.log
playwright-report/
test-results/
allure-results/
allure-report/
reports/
mcp-server/logs/
.DS_Store
.idea/
.vscode/settings.json
*.tsbuildinfo
```

- [ ] **Step 0.1.4 — Criar `.editorconfig`**

```
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 0.1.5 — Criar `.prettierrc`**

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 0.1.6 — Criar `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.mp4 binary
*.zip binary
*.har binary
```

- [ ] **Step 0.1.6.5 — Criar `.prettierignore`**

Sem este arquivo, `prettier --check .` (rodado por `npm run lint`) tenta parsear `.github/workflows/*.yml` e crasha com `SyntaxError: Separator , missing in flow map` ao encontrar interpolações `${{ inputs.branch }}` em flow-mapping. Também evita reformatar lockfile, planos longos do superpowers e artefatos gerados.

`.prettierignore`:
```
node_modules/
*/node_modules/
dist/
build/
*/dist/
*/build/

# Lockfiles (managed by npm)
package-lock.json

# Generated/runtime artifacts
allure-results/
allure-report/
playwright-report/
test-results/
reports/

# CI workflows (Prettier YAML parser chokes on ${{ }} interpolations)
.github/workflows/

# Long planning markdown (out of scope for formatting)
docs/superpowers/

# Misc
*.log
.DS_Store
```

Expected após criar: `npm run lint` exit 0.

- [ ] **Step 0.1.7 — Criar `LICENSE` (MIT)**

Padrão MIT 2026 Filipe Gabriel.

- [ ] **Step 0.1.8 — Criar `.env.example`**

```
# Conta de teste no kasa.live (criada pra este desafio)
KASA_USER_EMAIL=
KASA_USER_PASSWORD=

# Google account pra testes manuais de Calendar
GOOGLE_TEST_EMAIL=
GOOGLE_TEST_APP_PASSWORD=

# Trello (para sincronização manual — apenas referência, não é usado em código)
TRELLO_BOARD_URL=
```

- [ ] **Step 0.1.9 — Criar `package.json` raiz**

```json
{
  "name": "loomi-qa-challenge-kasa",
  "version": "0.1.0",
  "private": true,
  "description": "Desafio QA Loomi - Suite de testes do kasa.live + MCP Server",
  "author": "Filipe Gabriel <filipecardosogabriel@gmail.com>",
  "license": "MIT",
  "engines": { "node": ">=20.0.0" },
  "workspaces": ["mcp-server"],
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:core": "playwright test --grep @core",
    "test:e2e": "playwright test automation/tests/e2e",
    "test:api": "playwright test automation/tests/api",
    "test:visual": "playwright test automation/tests/visual",
    "test:a11y": "playwright test automation/tests/a11y",
    "test:perf": "playwright test --project=perf",
    "test:full": "playwright test",
    "report:allure": "allure generate allure-results --clean -o allure-report && allure open allure-report",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "mcp:build": "npm -w mcp-server run build",
    "mcp:start": "npm -w mcp-server run start",
    "package": "bash scripts/package.sh"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "eslint-plugin-playwright": "^1.6.0",
    "prettier": "^3.2.0",
    "@axe-core/playwright": "^4.8.0",
    "playwright-lighthouse": "^4.0.0",
    "@faker-js/faker": "^8.4.0",
    "allure-playwright": "^2.15.0",
    "allure-commandline": "^2.27.0",
    "zod": "^3.22.0",
    "dotenv": "^16.4.0"
  }
}
```

- [ ] **Step 0.1.10 — Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["automation/pages/*"],
      "@fixtures/*": ["automation/fixtures/*"],
      "@support/*": ["automation/support/*"]
    }
  },
  "include": ["automation/**/*", "playwright.config.ts"],
  "exclude": ["node_modules", "dist", "build", "mcp-server"]
}
```

- [ ] **Step 0.1.11 — `npm install`**

```bash
npm install
```
Expected: instala sem erro. Se falhar por versão de Node: `nvm use lts/iron` primeiro.

- [ ] **Step 0.1.12 — Instalar browsers Playwright**

```bash
npx playwright install --with-deps chromium firefox webkit
```
Expected: 3 browsers instalados.

- [ ] **Step 0.1.13 — Commit foundation files**

```bash
git add . && git commit -m "chore: foundation (deps, configs, ts, lint)"
```

- [ ] **Step 0.1.14 — Stub `mcp-server/package.json`**

`package.json` raiz declara `"workspaces": ["mcp-server"]`. Sem um `mcp-server/package.json` válido, `npm ci` (em CI) quebra com `Cannot read properties of undefined (workspace)`. Criar um stub mínimo agora — o conteúdo real entra na Fase 4.

`mcp-server/package.json`:
```json
{
  "name": "@loomi-qa/mcp-server",
  "version": "0.0.0-stub",
  "private": true,
  "description": "Stub - será implementado na Fase 4"
}
```

Expected: `npm ci` passa sem erro de workspace.

### Task 0.2 — Estrutura de diretórios

- [ ] **Step 0.2.1 — Criar tree de pastas**

```bash
mkdir -p \
  automation/{tests/{e2e,api,visual,a11y,performance},pages/components,fixtures,support,reports} \
  test-cases/{core,extras} \
  mcp-server/{src/{tools,resources,runner,types},tests/{tools,resources,integration},logs} \
  bug-reports/{bugs,improvements,charters,evidence} \
  docker scripts \
  .github/workflows \
  docs/site-snapshots
```

- [ ] **Step 0.2.2 — Criar `.gitkeep` em pastas vazias**

```bash
touch automation/reports/.gitkeep \
      bug-reports/evidence/.gitkeep \
      docs/site-snapshots/.gitkeep \
      mcp-server/logs/.gitkeep
```

- [ ] **Step 0.2.3 — Commit estrutura**

```bash
git add . && git commit -m "chore: estrutura de diretórios completa"
```

### Task 0.3 — Configs Playwright + ESLint

**Files:**
- Create: `playwright.config.ts`, `eslint.config.mjs`

- [ ] **Step 0.3.1 — Criar `playwright.config.ts`**

```typescript
import 'dotenv/config'; // carrega .env.local automaticamente
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './automation/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: 'https://www.kasa.live',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    {
      name: 'perf',
      testDir: './automation/tests/performance',
      use: {
        ...devices['Desktop Chrome'],
        // playwright-lighthouse exige porta CDP exposta
        launchOptions: { args: ['--remote-debugging-port=9222'] },
      },
    },
  ],
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
```

> **Nota:** `import 'dotenv/config'` no topo carrega `.env.local` automaticamente, e o project `perf` expõe a porta CDP 9222 que `playwright-lighthouse` requer (sem isso a Fase 11 trava).

- [ ] **Step 0.3.2 — Criar `eslint.config.mjs`**

```javascript
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';

export default [
  { ignores: ['node_modules', 'dist', 'build', 'allure-*', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsparser, parserOptions: { ecmaVersion: 2022, sourceType: 'module' } },
    plugins: { '@typescript-eslint': tseslint, playwright },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
```

- [ ] **Step 0.3.3 — Validar configs**

Antes deste passo, criar o placeholder `automation/tests/bootstrap.smoke.spec.ts` (vide nota abaixo). Sem ele, `npx playwright test --grep @smoke` exit 1 com "No tests found" — quebraria `ci.yml` no primeiro push.

`automation/tests/bootstrap.smoke.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

// Placeholder @smoke ate Fase 3 substituir com smokes reais.
// Existe pra que CI tenha algo a rodar e fique verde desde o primeiro push.
test('@smoke bootstrap — runner saudavel', async () => {
  expect(typeof process.versions.node).toBe('string');
  expect(process.versions.node.startsWith('20')).toBe(true);
});
```

```bash
npx playwright test --list 2>&1 | head -5
```
Expected: lista 1 teste (`bootstrap.smoke.spec.ts`) sem erro de config.

```bash
npm run typecheck
```
Expected: sem erros.

```bash
npm run test:smoke
```
Expected: 1 passed.

Nota: o placeholder `automation/tests/bootstrap.smoke.spec.ts` permanece até Fase 3 — é deletado/substituído quando os 8 smokes reais entrarem (vide Step 3.3.1).

- [ ] **Step 0.3.4 — Sanity check de path aliases tsconfig**

Antes de seguir, validar que `@pages/*`, `@fixtures/*`, `@support/*` resolvem em runtime. Criar `automation/tests/sanity.spec.ts` mínimo:

```typescript
import { test, expect } from '@playwright/test';
// import só pra validar resolução do alias (vamos remover depois)
test('@smoke sanity: tsconfig paths resolve', async () => {
  expect(typeof process.versions.node).toBe('string');
});
```

```bash
npx playwright test automation/tests/sanity.spec.ts --reporter=list
```
Expected: 1 passed. Se falhou por alias: revisar `tsconfig.json` paths.

Após validado, deletar **apenas** `automation/tests/sanity.spec.ts`. **Não confundir com `automation/tests/bootstrap.smoke.spec.ts`** — o placeholder de smoke fica até Fase 3.

- [ ] **Step 0.3.5 — Commit configs**

```bash
git add . && git commit -m "chore: playwright e eslint config + sanity check"
```

### Task 0.4 — CI esqueleto

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/nightly.yml`, `.github/workflows/visual-update.yml`, `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 0.4.1 — Criar `ci.yml` (PR gate)**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install --with-deps chromium
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:smoke
        env: { CI: 'true' }
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: traces, path: test-results/ }
```

- [ ] **Step 0.4.2 — Criar `nightly.yml`**

```yaml
name: Nightly Full Suite + Allure Publish
on:
  schedule: [{ cron: '0 3 * * *' }]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  full:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit, mobile-chrome]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.project == 'mobile-chrome' && 'chromium' || matrix.project }}
      - run: npx playwright test --project=${{ matrix.project }}
        env: { CI: 'true' }
        continue-on-error: true
      - uses: actions/upload-artifact@v4
        with:
          name: allure-results-${{ matrix.project }}
          path: allure-results/
  publish:
    needs: full
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: gh-pages, path: gh-pages }
        continue-on-error: true
      - uses: actions/download-artifact@v4
        with: { path: ./all-results }
      - name: Merge Allure results
        run: |
          mkdir -p allure-results
          find ./all-results -type d -name 'allure-results-*' -exec cp -r {}/. allure-results/ \;
      - name: Allure history
        run: |
          mkdir -p allure-results/history
          if [ -d gh-pages/history ]; then cp -r gh-pages/history/* allure-results/history/; fi
      - uses: simple-elf/allure-report-action@v1
        with: { allure_results: allure-results, gh_pages: gh-pages, allure_report: allure-report }
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: allure-history
```

- [ ] **Step 0.4.3 — Criar `visual-update.yml`**

```yaml
name: Update Visual Baselines
on:
  workflow_dispatch:
    inputs:
      branch: { description: 'branch alvo', required: true, default: 'main' }
permissions:
  contents: write
  pull-requests: write
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: ${{ inputs.branch }} }
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium automation/tests/visual --update-snapshots
        continue-on-error: true
      - uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/update-visual-baselines
          title: 'chore: atualizar baselines visuais'
          commit-message: 'chore: atualizar baselines visuais'
          body: 'PR automático gerado por workflow_dispatch.'
```

- [ ] **Step 0.4.4 — Criar `PULL_REQUEST_TEMPLATE.md`**

```markdown
## O que mudou
[1-2 linhas]

## Por quê
[motivação curta — link pra spec/issue se houver]

## Como testei
- [ ] Lint + typecheck passa
- [ ] Smoke local passa
- [ ] Allure local sem erro novo

## Checklist
- [ ] Conventional Commit no título do PR
- [ ] Sem `waitForTimeout`
- [ ] Sem `console.log` esquecido
- [ ] Evidências/artefatos commitados quando aplicável
```

- [ ] **Step 0.4.5 — Commit CI**

```bash
git add .github/ && git commit -m "ci: workflows ci/nightly/visual-update + PR template"
```

### Task 0.5 — Trello board público

**Não-técnico — execução manual.**

- [ ] **Step 0.5.1 — Criar board no Trello**

Manualmente em trello.com:
- Nome: "Loomi QA Challenge — Filipe Gabriel"
- Visibilidade: **Público (read-only via link)**
- Listas: Backlog · Sprint atual (48h) · Em andamento · Em revisão · Concluído · Bugs reportados · Melhorias sugeridas · Bloqueios/Riscos
- Labels: Critical(🔴) · High(🟡) · Medium(🟢) · Low(⚪) · trilha-A · trilha-B · trilha-C · tarefa-1 · tarefa-2 · tarefa-3 · tarefa-4 · relatório

- [ ] **Step 0.5.2 — Salvar URL no `docs/trello-board-link.md`**

```markdown
# Trello Board

URL público (read-only): <colar-aqui>

## Estrutura
- 8 listas conforme spec §9.5
- Labels por prioridade, trilha e tarefa

## Como o avaliador navega
1. Abrir link
2. Lista "Concluído" mostra entregas finais
3. Lista "Bugs reportados" tem todos os bugs com link cruzado pro repo
4. Cada card tem template padronizado (idêntico ao .md)
```

- [ ] **Step 0.5.3 — Commit Trello link**

```bash
git add docs/trello-board-link.md && git commit -m "docs: link público do trello board"
```

### Task 0.6 — README inicial

**Files:** Create: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md`

- [ ] **Step 0.6.1 — `README.md` esqueleto** (será refinado na Fase 15)

```markdown
# Desafio QA Loomi — Filipe Gabriel

> **TL;DR:** Suite completa de testes do kasa.live (E2E + API + Visual + A11y + Perf) + MCP Server para testes via LLM, entregue em 48h conforme escopo Pleno S1+.

## 🚀 Quick Start (≤5min)

```bash
nvm use && npm install
npx playwright install --with-deps
npm run test:smoke
npm run report:allure
```

## 🔗 Links principais
- 📋 Trello: <preencher>
- 📊 Allure Report: <preencher>
- 🎥 Vídeo demo: <preencher>
- 📝 Relatório: [docs/progress-report.md](docs/progress-report.md)

## 📦 Inventário de entregáveis
| Tarefa | Pasta | Status |
|---|---|---|
| 1 — Casos BDD | `test-cases/` | em construção |
| 2 — Automação | `automation/` | em construção |
| 3 — Bugs/Melhorias | `bug-reports/` | em construção |
| 4 — MCP Server | `mcp-server/` | em construção |

## 📂 Estrutura
Ver tree completo em [docs/architecture.md](docs/architecture.md).

## 👤 Autor
Filipe Gabriel · filipecardosogabriel@gmail.com
```

- [ ] **Step 0.6.2 — `CHANGELOG.md`**

```markdown
# Changelog
Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

## [0.1.0] - 2026-05-02
### Added
- Foundation do projeto: deps, configs, CI esqueleto
- Estrutura de diretórios completa
- Trello board público criado
```

- [ ] **Step 0.6.3 — `CONTRIBUTING.md`**

```markdown
# Contributing

Convenções para este repo:
- Conventional Commits (feat:, fix:, test:, docs:, chore:, refactor:, ci:, perf:)
- Subject ≤72 chars
- Branches: feat/trilha-X-Y, fix/Y, docs/Y
- Self-PRs auditáveis usando `.github/PULL_REQUEST_TEMPLATE.md`
- Lint + typecheck antes de commit
```

- [ ] **Step 0.6.4 — `AGENTS.md`** (guia para subagentes paralelos)

```markdown
# AGENTS.md — Guia para subagentes paralelos

## Ler antes de qualquer tarefa
1. `docs/superpowers/specs/2026-05-02-loomi-qa-challenge-design.md` (spec)
2. `docs/superpowers/plans/2026-05-02-loomi-qa-challenge.md` (plan)
3. Esta lista de convenções

## Convenções de naming
- Bug: `BUG-XXX-titulo-curto.md` (XXX zero-padded)
- Improvement: `IMP-XXX-titulo-curto.md`
- Charter: `CXX-titulo.md`
- Feature BDD: `funcionalidade-em-kebab.feature` (PT-BR)
- POM: `PageNamePage.ts` (PascalCase, sufixo `Page`)
- Component POM: `ComponentName.ts`
- Teste E2E: `funcionalidade-em-kebab.spec.ts`

## Padrão de commit
Conventional Commits. Exemplos:
- `test: adicionar 8 cenarios E2E para favoritar times`
- `feat(mcp): implementar tool run_test_case`
- `docs(bug): BUG-007 favorito perde apos reload`

## Padrão de bug report
Sempre seguir o schema do spec §4.5. Campos obrigatórios.
Severidade: Critical (bloqueia uso) / High (degrada muito) / Medium (impacta UX) / Low (cosmético).
Reproduzibilidade obrigatória, com N/M tentativas.

## Padrão de teste Playwright
- Seletores: `getByRole` > `getByTestId` > `getByText` > CSS. **NUNCA XPath**.
- Zero `waitForTimeout`. Use `waitFor` baseado em estado.
- Asserts com mensagem: `expect(x, 'razao').toBe(y)`.
- Evidência automática (config global captura).
- Tags: `@smoke`, `@core`, `@visual`, `@a11y`, `@perf`.

## Nunca faça
- waitForTimeout
- XPath
- console.log esquecido
- Lógica de teste em POM
- Test que depende de outro test (exceto describe.serial documentado)
- Commit com .env vazado

## Checklist pré-commit
- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] Smoke local passa (se mexeu em E2E)
- [ ] CHANGELOG atualizado se mudança relevante
```

- [ ] **Step 0.6.5 — Commit READMEs iniciais**

```bash
git add README.md CHANGELOG.md CONTRIBUTING.md AGENTS.md && git commit -m "docs: README inicial + CHANGELOG + CONTRIBUTING + AGENTS"
```

### Task 0.7 — Push tudo + tag v0.1.0

- [ ] **Step 0.7.1 — Criar repo remoto no GitHub**

Manualmente: github.com → New repo → `loomi-qa-challenge-kasa` → Public.

- [ ] **Step 0.7.2 — Adicionar remote e push**

```bash
git remote add origin git@github.com:<user>/loomi-qa-challenge-kasa.git
git branch -M main
git push -u origin main
```

- [ ] **Step 0.7.3 — Tag**

```bash
git tag -a v0.1.0-foundation -m "Foundation completa"
git push origin v0.1.0-foundation
```

**Checkpoint Fase 0:** repo público + Trello + CI configurado + tag.

---

## Fase 1 — Exploration (D1 15:30-17:00, timebox 90min)

**Goal:** Mapear o produto kasa.live antes de inventar testes.

### Task 1.1 — Sessão de exploração cronometrada

**Output:** `docs/exploration-notes.md`

- [ ] **Step 1.1.1 — Setup do timer e arquivo**

```bash
touch docs/exploration-notes.md
# Iniciar timer de 90min
```

- [ ] **Step 1.1.2 — Navegar kasa.live com DevTools aberto**

Abrir kasa.live em chromium em janela anônima. Anotar TUDO:
- URLs visitadas (sitemap)
- Funcionalidades core encontradas (e a ordem de complexidade)
- DevTools Network: endpoints internos, métodos, payloads exemplares
- DevTools Elements: existe `data-testid`? Existe `aria-label`? Padrão de classes?
- "Cheiros" suspeitos (proto-bugs anotados em rough)
- Perguntas abertas (ex: Calendar exige login Google? Favoritos persistem sem login?)

Salvar prints relevantes em `docs/site-snapshots/exploration/`.

- [ ] **Step 1.1.3 — Estruturar `docs/exploration-notes.md`**

Schema:
```markdown
# Exploração kasa.live — 2026-05-02

**Início:** HH:MM · **Fim:** HH:MM · **Duração:** 90min

## 1. Sitemap real
[Lista de URLs descobertas com 1 linha cada]

## 2. Funcionalidades core encontradas
| # | Funcionalidade | Complexidade | URL |
|---|---|---|---|
| 1 | Favoritar times | Média | /times |
| ... | ... | ... | ... |

## 3. Funcionalidades NÃO-core (Charter C7)
[Login, perfil, dark mode, notificações, idioma, cookies, footer, etc]

## 4. Endpoints internos (DevTools)
| Endpoint | Método | Payload exemplar | Notas |
|---|---|---|---|
| ... | ... | ... | ... |

## 5. Estratégia de seletores
- `data-testid` presente? [Sim/Não]
- `aria-*` consistente? [Sim/Não]
- Convenção: usar `getByRole` + `getByText` priorizados

## 6. Cheiros suspeitos (proto-bugs)
1. [observação rough]
2. ...

## 7. Perguntas abertas
1. ...

## 8. Snapshots salvos
- docs/site-snapshots/exploration/home.png
- ...
```

- [ ] **Step 1.1.4 — Snapshots HTML de páginas-chave (mitigação R1)**

```bash
# Para cada página crítica, salvar snapshot
mkdir -p docs/site-snapshots/exploration
# Usar "Save as HTML complete" ou: curl -L https://www.kasa.live/<rota> > docs/site-snapshots/exploration/<rota>.html
```

Páginas a salvar: home, página de busca, página de detalhe de partida, página de melhores momentos.

- [ ] **Step 1.1.5 — Commit exploration notes**

```bash
git add docs/ && git commit -m "docs: exploration notes do kasa.live (Onda 0)"
```

**Checkpoint Fase 1:** `exploration-notes.md` completo + snapshots HTML/PNG salvos.

---

## Fase 2 — Bug hunting wave 1 (D1 17:00-19:00)

**Goal:** Charters C1+C2 → primeiros 6 bugs documentados.

### Task 2.1 — Charter C1 (Busca com inputs adversariais)

- [ ] **Step 2.1.1 — Setup do charter**

Criar `bug-reports/charters/C1-busca-adversarial.md`:
```markdown
# Charter C1 — Busca com inputs adversariais

**Duração:** 45min · **Iniciado:** HH:MM
**Foco:** Filtros, edge cases de busca

## Setup
- Navegador anônimo, chromium
- DevTools aberto (Network + Console)
- Sem login

## Inputs a testar
- String vazia
- Apenas espaços
- 1 caractere
- 1000+ caracteres
- Caracteres especiais: ' " < > & % $ # ! ? \
- HTML/script: `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`
- Emoji
- Caractere unicode raro
- SQL-like: ' OR '1'='1
- Times conhecidos exatos
- Times com erro de digitação
- Combinação de filtros conflitantes

## Observações (durante)
[anotar em tempo real]

## Achados (ao final)
- BUG-001: [título]
- BUG-002: ...
```

- [ ] **Step 2.1.2 — Executar charter por 45min**

Foco em achados, não em documentação detalhada (essa vem depois).

- [ ] **Step 2.1.3 — Salvar evidências de cada achado**

Para cada bug encontrado:
```bash
mkdir -p bug-reports/evidence/BUG-XXX/
# Mover screenshots/vídeos para essa pasta
```

### Task 2.2 — Charter C2 (Favoritar sem login / sessão expirada)

- [ ] **Step 2.2.1 — Setup C2**

Criar `bug-reports/charters/C2-favoritar-sem-login.md` com mesmo schema.

Foco:
- Favoritar sem estar logado: o que acontece?
- Favoritar, fazer logout, fazer login: o favorito persiste?
- Favoritar em janela A, abrir janela B logada: aparece em B?
- Sessão expirada (limpar cookies enquanto na página): próxima ação como?
- Favoritar 100+ times: limite? performance?

- [ ] **Step 2.2.2 — Executar charter por 45min**

- [ ] **Step 2.2.3 — Salvar evidências**

### Task 2.3 — Documentar bugs encontrados (formato `.md`)

Para cada bug (BUG-001 a BUG-006 estimado):

- [ ] **Step 2.3.1 — Aplicar template do AGENTS.md**

Criar `bug-reports/bugs/BUG-XXX-titulo-kebab.md` com schema completo:
```markdown
# BUG-XXX — [Título específico]

**Severidade:** Critical | High | Medium | Low
**Prioridade:** P0 | P1 | P2 | P3
**Status:** Open
**Reproduzibilidade:** Sempre | Intermitente | Raro
**Frequência observada:** N/M
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição
## Passos para reproduzir
1. ...
## Resultado esperado
## Resultado obtido
## Ambiente
- URL, browser, sistema, viewport, data/hora
## Evidência
- Screenshot: [evidence/BUG-XXX/screenshot.png]
- Vídeo: ...
## Workaround conhecido
## Sugestão de fix
## Impacto no usuário
```

- [ ] **Step 2.3.2 — Sincronizar com Trello**

Para cada bug:
1. Criar card no Trello (lista "Bugs reportados")
2. Aplicar labels (severidade + trilha-A + tarefa-3)
3. Copiar conteúdo do `.md`
4. Linkar do `.md` para o card (atualizar campo "Trello card")

- [ ] **Step 2.3.3 — Commit bugs wave 1**

```bash
git add bug-reports/ && git commit -m "docs(bugs): wave 1 - charters C1 e C2 (6 bugs)"
```

- [ ] **Step 2.3.4 — Atualizar `bug-reports/README.md`**

Tabela índice:
```markdown
# Bugs e Melhorias

## Bugs (18 total)
| ID | Título | Severidade | Status | Charter | Trello |
|---|---|---|---|---|---|
| BUG-001 | ... | High | Open | C1 | [link] |
```

- [ ] **Step 2.3.5 — Commit índice**

```bash
git add bug-reports/README.md && git commit -m "docs(bugs): atualizar índice"
```

**Checkpoint Fase 2:** ≥6 bugs documentados + Trello sincronizado.

---

## Fase 3 — Automation foundation (D1 20:00-22:00)

**Goal:** POMs, fixtures, support, e 8 E2E core verdes.

### Task 3.1 — POMs base

**Files:**
- Create: `automation/pages/BasePage.ts`, `HomePage.ts`, `MatchSearchPage.ts`, `FavoritesPage.ts`, `HighlightsPage.ts`, `CalendarPage.ts`
- Create: `automation/pages/components/{MatchCard,FilterBar,VideoPlayer}.ts`

- [ ] **Step 3.1.1 — `BasePage.ts`**

```typescript
import type { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForVisible(locator: Locator, timeoutMs = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async getConsoleErrors(): Promise<string[]> {
    // Console errors são capturados via fixture (ver evidenceCollector)
    return [];
  }
}
```

- [ ] **Step 3.1.2 — `HomePage.ts`**

```typescript
import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly selectors = {
    heroTitle: () => this.page.getByRole('heading', { level: 1 }).first(),
    popularTeams: () => this.page.getByTestId('popular-teams'),
    teamCard: (name: string) => this.page.getByRole('article').filter({ hasText: name }),
    favoriteButton: (teamName: string) =>
      this.selectors.teamCard(teamName).getByRole('button', { name: /favoritar|favorite/i }),
  };

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitForVisible(this.selectors.heroTitle());
  }

  async isPopularTeamsVisible(): Promise<boolean> {
    return this.selectors.popularTeams().isVisible();
  }

  async favoriteTeam(teamName: string): Promise<void> {
    await this.selectors.favoriteButton(teamName).click();
  }

  async isTeamFavorited(teamName: string): Promise<boolean> {
    const button = this.selectors.favoriteButton(teamName);
    return (await button.getAttribute('aria-pressed')) === 'true';
  }
}
```

> **Nota:** seletores acima são hipotéticos. **Refinar com base em `exploration-notes.md`** — ajustar testid/role/text reais. Se o site não tem `data-testid`, fallback ordenado por priority do AGENTS.md.

- [ ] **Step 3.1.3 — `MatchSearchPage.ts`**

```typescript
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MatchSearchPage extends BasePage {
  private readonly selectors = {
    searchInput: () => this.page.getByRole('searchbox'),
    resultsList: () => this.page.getByTestId('search-results'),
    resultItem: () => this.selectors.resultsList().getByRole('article'),
    filterChampionship: () => this.page.getByLabel(/campeonato/i),
    filterDate: () => this.page.getByLabel(/data/i),
    emptyState: () => this.page.getByText(/nenhum.*encontrad/i),
  };

  async open(): Promise<void> {
    await this.goto('/buscar');
  }

  async search(term: string): Promise<void> {
    await this.selectors.searchInput().fill(term);
    await this.selectors.searchInput().press('Enter');
  }

  async resultCount(): Promise<number> {
    return this.selectors.resultItem().count();
  }

  async filterByChampionship(name: string): Promise<void> {
    await this.selectors.filterChampionship().selectOption({ label: name });
  }

  async hasEmptyState(): Promise<boolean> {
    return this.selectors.emptyState().isVisible();
  }
}
```

- [ ] **Step 3.1.4 — `FavoritesPage.ts`, `HighlightsPage.ts`, `CalendarPage.ts`**

Mesmo padrão. Estruturas mínimas — métodos serão preenchidos conforme testes os requisitarem (TDD).

- [ ] **Step 3.1.5 — Components: `MatchCard.ts`, `FilterBar.ts`, `VideoPlayer.ts`**

Cada component recebe um `Locator` no construtor (não `Page`), permitindo composição.

```typescript
import type { Locator } from '@playwright/test';

export class MatchCard {
  constructor(private readonly root: Locator) {}

  async getTitle(): Promise<string> {
    return (await this.root.getByRole('heading').textContent()) ?? '';
  }

  async favorite(): Promise<void> {
    await this.root.getByRole('button', { name: /favoritar/i }).click();
  }

  async isFavorited(): Promise<boolean> {
    return (await this.root.getByRole('button', { name: /favoritar/i }).getAttribute('aria-pressed')) === 'true';
  }
}
```

- [ ] **Step 3.1.6 — Typecheck**

```bash
npm run typecheck
```
Expected: pass.

- [ ] **Step 3.1.7 — Commit POMs**

```bash
git add automation/pages/ && git commit -m "feat(automation): POMs base (Home, Search, Favorites, Highlights, Calendar) + components"
```

### Task 3.2 — Fixtures customizadas

**File:** Create: `automation/fixtures/index.ts`

- [ ] **Step 3.2.1 — Criar `fixtures/index.ts`**

```typescript
import { test as base, expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { MatchSearchPage } from '@pages/MatchSearchPage';
import { FavoritesPage } from '@pages/FavoritesPage';
import { HighlightsPage } from '@pages/HighlightsPage';
import { CalendarPage } from '@pages/CalendarPage';
import { TestDataFactory } from '@support/testDataFactory';
import AxeBuilder from '@axe-core/playwright';

type Fixtures = {
  homePage: HomePage;
  matchSearchPage: MatchSearchPage;
  favoritesPage: FavoritesPage;
  highlightsPage: HighlightsPage;
  calendarPage: CalendarPage;
  testDataFactory: TestDataFactory;
  axeBuilder: AxeBuilder;
  pristineAccount: void;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  matchSearchPage: async ({ page }, use) => use(new MatchSearchPage(page)),
  favoritesPage: async ({ page }, use) => use(new FavoritesPage(page)),
  highlightsPage: async ({ page }, use) => use(new HighlightsPage(page)),
  calendarPage: async ({ page }, use) => use(new CalendarPage(page)),
  testDataFactory: async ({}, use) => use(new TestDataFactory()),
  axeBuilder: async ({ page }, use) => use(new AxeBuilder({ page })),
  pristineAccount: [async ({ page }, use) => {
    // setup: snapshot do estado inicial (favoritos atuais)
    // (implementação real depende de descobertas da exploração)
    await use();
    // teardown: restaurar estado se mutações ocorreram
  }, { auto: false }],
});

export { expect };
```

- [ ] **Step 3.2.2 — Criar `support/testDataFactory.ts`**

```typescript
import { faker } from '@faker-js/faker/locale/pt_BR';

export class TestDataFactory {
  randomTeamName(): string {
    return faker.company.name();
  }
  randomEmail(): string {
    return faker.internet.email();
  }
  randomMatchId(): string {
    return faker.string.alphanumeric(8);
  }
}
```

- [ ] **Step 3.2.3 — Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3.2.4 — Commit fixtures**

```bash
git add automation/ && git commit -m "feat(automation): fixtures customizadas + testDataFactory"
```

### Task 3.3 — 8 testes E2E core (TDD)

Para cada teste: escrever falhando → rodar e ver falha → ajustar POM/seletor → ver passar → commit.

**File:** Create: `automation/tests/e2e/home.spec.ts`, `favoritar-times.spec.ts`, `buscar-partidas.spec.ts`

- [ ] **Step 3.3.1 — Teste 1: home carrega (smoke)**

> **Nota:** deletar `automation/tests/bootstrap.smoke.spec.ts` antes de adicionar os smokes reais — ele foi criado na Fase 0 só pra CI ter algo a rodar e a partir daqui é substituído pelos 8 smokes reais desta task.

`automation/tests/e2e/home.spec.ts`:
```typescript
import { test, expect } from '@fixtures/index';

test.describe('Home page', () => {
  test('@smoke @core home carrega sem erros de console', async ({ homePage, page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await homePage.open();
    await expect(page).toHaveTitle(/kasa/i);
    expect(errors, 'console deve estar limpo').toHaveLength(0);
  });
});
```

- [ ] **Step 3.3.2 — Rodar teste 1**

```bash
npx playwright test automation/tests/e2e/home.spec.ts --project=chromium --reporter=list
```
Expected: passa OU falha. Se falhar: ajustar seletor com base em `exploration-notes.md`.

- [ ] **Step 3.3.3 — Teste 2: lista de times populares**

```typescript
test('@smoke @core lista de times populares renderiza ≥10 itens', async ({ homePage, page }) => {
  await homePage.open();
  await expect(page.getByTestId('popular-teams').getByRole('article')).toHaveCount(10, { timeout: 5000 });
});
```

- [ ] **Step 3.3.4 — Teste 3: busca retorna resultados**

`buscar-partidas.spec.ts`:
```typescript
import { test, expect } from '@fixtures/index';

test('@smoke @core busca por time conhecido retorna ≥1 resultado', async ({ matchSearchPage }) => {
  await matchSearchPage.open();
  await matchSearchPage.search('Flamengo');
  expect(await matchSearchPage.resultCount(), 'busca deve retornar resultados').toBeGreaterThan(0);
});
```

- [ ] **Step 3.3.5 — Teste 4: filtro de campeonato altera listagem**

```typescript
test('@core filtro de campeonato altera listagem', async ({ matchSearchPage }) => {
  await matchSearchPage.open();
  const before = await matchSearchPage.resultCount();
  await matchSearchPage.filterByChampionship('Brasileirão Série A');
  const after = await matchSearchPage.resultCount();
  expect(after, 'filtro deve alterar contagem').not.toBe(before);
});
```

- [ ] **Step 3.3.6 — Teste 5: favoritar persiste após reload**

`favoritar-times.spec.ts`:
```typescript
import { test, expect } from '@fixtures/index';

test('@smoke @core favoritar time persiste após reload', async ({ homePage, page }) => {
  await homePage.open();
  const team = 'Flamengo';
  await homePage.favoriteTeam(team);
  expect(await homePage.isTeamFavorited(team), 'deve estar favoritado').toBe(true);
  await page.reload();
  expect(await homePage.isTeamFavorited(team), 'persiste após reload').toBe(true);
});
```

- [ ] **Step 3.3.7 — Teste 6: desfavoritar remove**

```typescript
test('@smoke @core desfavoritar time remove da lista de favoritos', async ({ homePage, favoritesPage }) => {
  await homePage.open();
  await homePage.favoriteTeam('Flamengo');
  await favoritesPage.open();
  // assumindo método para desfavoritar via favorites page
  await favoritesPage.unfavorite('Flamengo');
  expect(await favoritesPage.list(), 'flamengo removido').not.toContain('Flamengo');
});
```

- [ ] **Step 3.3.8 — Teste 7: página de partida**

`detalhe-partida.spec.ts`:
```typescript
test('@smoke @core página de partida abre detalhe completo', async ({ matchSearchPage, page }) => {
  await matchSearchPage.open();
  await matchSearchPage.search('Flamengo');
  await page.getByRole('article').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

- [ ] **Step 3.3.9 — Teste 8: aba melhores momentos**

`melhores-momentos.spec.ts`:
```typescript
test('@smoke @core aba Melhores Momentos lista vídeos', async ({ highlightsPage }) => {
  await highlightsPage.open();
  expect(await highlightsPage.videoCount(), 'deve ter vídeos').toBeGreaterThan(0);
});
```

- [ ] **Step 3.3.10 — Rodar suite smoke completa**

```bash
npm run test:smoke
```
Expected: 8 testes verdes (ou falhas reais que viram bugs novos!).

- [ ] **Step 3.3.11 — Se algum falhar: criar bug + skip teste com link**

Se teste real falhar por bug do site (não erro de seletor):
1. Criar BUG-XXX
2. `test.skip('motivo: ver BUG-XXX', () => ...)` no teste
3. Commitar separadamente

- [ ] **Step 3.3.12 — Commit testes E2E core**

```bash
git add automation/ && git commit -m "test(e2e): 8 cenarios @smoke @core (home, favoritar, buscar, partida, highlights)"
```

- [ ] **Step 3.3.13 — Tag**

```bash
git tag -a v0.2.0-automation-foundation -m "Foundation B: POMs + 8 E2E"
git push --follow-tags
```

**Checkpoint Fase 3:** 8 E2E verdes localmente, suite roda em <2min.

---

## Fase 4 — MCP skeleton (D1 22:00-23:30)

**Goal:** MCP server inicial com `run_test_case` mínimo funcionando contra Claude Desktop.

### Task 4.1 — MCP server bootstrap

**Files:**
- Create: `mcp-server/package.json`, `mcp-server/tsconfig.json`, `mcp-server/src/index.ts`, `mcp-server/src/types/mcp.ts`

- [ ] **Step 4.1.1 — `mcp-server/package.json`**

```json
{
  "name": "@loomi-qa/mcp-server",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": { "loomi-qa-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch & node --watch dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "playwright": "^1.50.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 4.1.2 — `mcp-server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true,
    "noUnusedLocals": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4.1.3 — Install MCP server deps**

```bash
npm install --workspace=mcp-server
```

- [ ] **Step 4.1.4 — `mcp-server/src/index.ts` (esqueleto)**

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runTestCaseTool, runTestCase } from './tools/runTestCase.js';

const server = new Server(
  { name: 'loomi-qa-mcp', version: '0.1.0' },
  { capabilities: { tools: {}, resources: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [runTestCaseTool],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'run_test_case') {
    return runTestCase(req.params.arguments ?? {});
  }
  throw new Error(`Tool desconhecido: ${req.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

- [ ] **Step 4.1.5 — `mcp-server/src/types/mcp.ts`**

```typescript
import { z } from 'zod';

export const RunTestCaseInputSchema = z.object({
  name: z.string().describe('Nome do teste ou tag (ex: @smoke, "favoritar")'),
  browser: z.enum(['chromium', 'firefox', 'webkit']).optional(),
  headed: z.boolean().optional(),
});
export type RunTestCaseInput = z.infer<typeof RunTestCaseInputSchema>;

export const RunTestCaseOutputSchema = z.object({
  status: z.enum(['passed', 'failed', 'timedOut', 'skipped']),
  duration_ms: z.number(),
  errors: z.array(z.object({ message: z.string(), stack: z.string().optional(), location: z.string().optional() })),
  artifacts: z.object({ screenshot: z.string().optional(), video: z.string().optional(), trace: z.string().optional() }),
  testId: z.string(),
});
export type RunTestCaseOutput = z.infer<typeof RunTestCaseOutputSchema>;
```

### Task 4.2 — Tool `run_test_case` mínimo

**Files:** Create: `mcp-server/src/tools/runTestCase.ts`, `mcp-server/src/runner/playwrightBridge.ts`, `mcp-server/src/runner/resultParser.ts`

- [ ] **Step 4.2.1 — `runner/playwrightBridge.ts`**

```typescript
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath compat com Node 20.0+ (import.meta.dirname só em 20.11+)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

export interface RunOptions {
  grep: string;
  browser?: string;
  headed?: boolean;
}

export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runPlaywright(opts: RunOptions): Promise<RunResult> {
  const args = ['playwright', 'test', `--grep=${opts.grep}`, '--reporter=json'];
  if (opts.browser) args.push(`--project=${opts.browser}`);
  if (opts.headed) args.push('--headed');

  return new Promise((resolve) => {
    const proc = spawn('npx', args, { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' } });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });
}
```

- [ ] **Step 4.2.2 — `runner/resultParser.ts`**

```typescript
import { randomUUID } from 'node:crypto';
import type { RunTestCaseOutput } from '../types/mcp.js';

interface PlaywrightJsonReport {
  suites: Array<{ specs: Array<{ tests: Array<{ results: Array<PlaywrightTestResult>; }>; title: string }>; }>;
  stats: { duration: number };
}
interface PlaywrightTestResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  errors?: Array<{ message: string; stack?: string; location?: { file: string; line: number } }>;
  attachments?: Array<{ name: string; path?: string; contentType: string }>;
}

export function parseResult(stdout: string): RunTestCaseOutput {
  const testId = randomUUID();
  let report: PlaywrightJsonReport;
  try {
    report = JSON.parse(stdout);
  } catch {
    return { status: 'failed', duration_ms: 0, errors: [{ message: 'Falha ao parsear output do Playwright' }], artifacts: {}, testId };
  }

  const firstResult = report.suites[0]?.specs[0]?.tests[0]?.results[0];
  if (!firstResult) {
    return { status: 'failed', duration_ms: 0, errors: [{ message: 'Nenhum teste encontrado' }], artifacts: {}, testId };
  }

  const status = firstResult.status === 'interrupted' ? 'failed' : firstResult.status;
  const artifacts: RunTestCaseOutput['artifacts'] = {};
  for (const att of firstResult.attachments ?? []) {
    if (att.name === 'screenshot' && att.path) artifacts.screenshot = `loomi://artifacts/${testId}/screenshot.png`;
    if (att.name === 'video' && att.path) artifacts.video = `loomi://artifacts/${testId}/video.mp4`;
    if (att.name === 'trace' && att.path) artifacts.trace = `loomi://artifacts/${testId}/trace.zip`;
  }

  return {
    status,
    duration_ms: firstResult.duration,
    errors: (firstResult.errors ?? []).map(e => ({
      message: e.message,
      stack: e.stack,
      location: e.location ? `${e.location.file}:${e.location.line}` : undefined,
    })),
    artifacts,
    testId,
  };
}
```

- [ ] **Step 4.2.3 — `tools/runTestCase.ts`**

```typescript
import { RunTestCaseInputSchema } from '../types/mcp.js';
import { runPlaywright } from '../runner/playwrightBridge.js';
import { parseResult } from '../runner/resultParser.js';

export const runTestCaseTool = {
  name: 'run_test_case',
  description: 'Executa um teste Playwright filtrado por nome ou tag (ex: @smoke). Retorna status, duração, erros e artefatos.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Nome do teste ou tag (@smoke, "favoritar")' },
      browser: { type: 'string', enum: ['chromium', 'firefox', 'webkit'] },
      headed: { type: 'boolean' },
    },
    required: ['name'],
  },
};

export async function runTestCase(rawInput: unknown) {
  const input = RunTestCaseInputSchema.parse(rawInput);
  const run = await runPlaywright({ grep: input.name, browser: input.browser, headed: input.headed });
  const result = parseResult(run.stdout);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
```

- [ ] **Step 4.2.4 — Build MCP server**

```bash
npm run mcp:build
```
Expected: gera `mcp-server/dist/`.

- [ ] **Step 4.2.5 — Smoke test do MCP via stdio (manual)**

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/dist/index.js
```
Expected: response com `run_test_case` listado.

- [ ] **Step 4.2.6 — Configurar Claude Desktop**

Editar `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "loomi-qa": {
      "command": "node",
      "args": ["/Users/filipegabriel/loomi-qa-challenge-kasa/mcp-server/dist/index.js"]
    }
  }
}
```
Reiniciar Claude Desktop.

- [ ] **Step 4.2.7 — Validar via Claude Desktop**

Prompt em Claude: "Liste os tools disponíveis no servidor loomi-qa"
Expected: aparece `run_test_case`.

Prompt: "Use o tool run_test_case com name=@smoke e me mostre o resultado"
Expected: roda smoke e retorna JSON.

- [ ] **Step 4.2.8 — Commit MCP skeleton**

```bash
git add mcp-server/ && git commit -m "feat(mcp): skeleton + tool run_test_case minimo (3 mandatory: 1/3)"
```

**Checkpoint Fase 4 (FIM DIA 1):** repo + Trello + ≥6 bugs + 8 E2E verdes + MCP esqueleto. Tag `v0.3.0-mcp-skeleton`.

```bash
git tag -a v0.3.0-mcp-skeleton -m "MCP skeleton + run_test_case"
git push --follow-tags
```

**🛑 PONTO DE NÃO-RETORNO 1:** se MCP não funcionou até aqui, acionar Plano B (MCP mínimo absoluto, foco trilhas A/B).

---

## Fase 5 — Bug hunting wave 2 (D2 08:30-10:30)

**Goal:** Charters C3+C4 → +6 bugs, +3 melhorias.

### Task 5.1 — Charter C3 (Calendar OAuth)

- [ ] **Step 5.1.1 — Setup C3** (mesmo template das fases anteriores)

Foco em:
- Botão "Conectar Calendar" — onde leva?
- Fluxo OAuth — quais escopos pede?
- Cancelar OAuth no meio — UX?
- Token expirado — site detecta? mostra erro útil?
- Desconectar Calendar — o que acontece com favoritos no calendar?

- [ ] **Step 5.1.2 — Executar (45min)**

- [ ] **Step 5.1.3 — Documentar achados em `bug-reports/charters/C3-*.md`**

### Task 5.2 — Charter C4 (Melhores momentos / vídeos)

- [ ] **Step 5.2.1 — Setup C4**

Foco em:
- Player carrega? Em quanto tempo?
- Controles funcionam (pause, seek, fullscreen, volume)?
- Lazy load funciona?
- Sem conexão / conexão lenta?
- Vídeo de campeonato sem highlights — o que mostra?

- [ ] **Step 5.2.2 — Executar (45min)**

- [ ] **Step 5.2.3 — Documentar**

### Task 5.3 — Documentar bugs e melhorias

Mesmo processo da Fase 2.3. Diferença: aqui surgem **melhorias** (não só bugs).

- [ ] **Step 5.3.1 — Bugs em `bug-reports/bugs/`** (BUG-007 a BUG-012 estimado)

- [ ] **Step 5.3.2 — Melhorias em `bug-reports/improvements/`**

Schema da melhoria (similar ao bug, sem severidade — usar **Impacto**):
```markdown
# IMP-XXX — [Título]

**Impacto:** High | Medium | Low
**Categoria:** UX | Performance | Acessibilidade | Consistência
**Esforço estimado:** S | M | L
**Trello card:** TBD

## Contexto
## Problema observado
## Sugestão
## Por que melhora
## Evidência
```

- [ ] **Step 5.3.3 — Sincronizar Trello + commit**

```bash
git add bug-reports/ && git commit -m "docs(bugs): wave 2 - charters C3 e C4 (6 bugs + 3 melhorias)"
```

**Checkpoint Fase 5:** ≥12 bugs total + ≥3 melhorias.

---

## Fase 6a — E2E batch 2 (D2 10:30-12:30)

**Goal:** +12 testes E2E, total 20.

### Task 6a.1 — E2E busca avançada (4 testes)

**File:** `automation/tests/e2e/buscar-avancado.spec.ts`

- [ ] **Step 6a.1.1 — Teste: busca por nome parcial**
- [ ] **Step 6a.1.2 — Teste: busca sem resultados (estado vazio)**
- [ ] **Step 6a.1.3 — Teste: combinar 2 filtros**
- [ ] **Step 6a.1.4 — Teste: limpar filtros restaura listagem**

(Cada um segue o padrão TDD: escrever → rodar → ajustar → commit.)

### Task 6a.2 — E2E favoritar partidas (4 testes)

**File:** `automation/tests/e2e/favoritar-partidas.spec.ts`

- [ ] Cenários: favoritar partida da listagem, favoritar do detalhe, desfavoritar, partida favoritada aparece no calendário do site

### Task 6a.3 — E2E navegação + responsividade (4 testes)

**File:** `automation/tests/e2e/navegacao.spec.ts`, `responsividade.spec.ts`

- [ ] Cenários: navegar pelo menu, voltar do detalhe, mobile viewport, sticky header

- [ ] **Step 6a.4 — Rodar suite completa**

```bash
npm test
```
Expected: 20 testes verdes.

- [ ] **Step 6a.5 — Commit batch 2**

```bash
git add automation/ && git commit -m "test(e2e): batch 2 - busca avancada, favoritar partidas, navegacao (12 testes)"
```

**Checkpoint Fase 6a:** 20 E2E verdes.

---

## Fase 6b — API + Allure integração (D2 13:30-15:00)

**Goal:** +5 testes API, Allure local funcionando.

### Task 6b.1 — Helper API client

**File:** `automation/support/apiClient.ts`

- [ ] **Step 6b.1.1 — Wrapper tipado**

```typescript
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';

export class ApiClient {
  constructor(private readonly request: APIRequestContext, private readonly baseURL = 'https://www.kasa.live/api') {}

  async getJson<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
    const res = await this.request.get(`${this.baseURL}${path}`);
    expect(res.ok()).toBeTruthy();
    return schema.parse(await res.json());
  }
}
```

> **Nota:** os endpoints concretos vêm da exploração (Fase 1). Ajustar paths reais.

### Task 6b.2 — 5 testes API

**File:** `automation/tests/api/endpoints.spec.ts`

- [ ] **Step 6b.2.1 — Teste: endpoint de times retorna lista válida**
- [ ] **Step 6b.2.2 — Teste: endpoint de busca aceita query**
- [ ] **Step 6b.2.3 — Teste: endpoint de partida retorna detalhe**
- [ ] **Step 6b.2.4 — Teste: tempo de resposta ≤2s (perf básica via API)**
- [ ] **Step 6b.2.5 — Teste: endpoint inválido retorna 404 com schema de erro**

- [ ] **Step 6b.2.6 — Rodar API tests**

```bash
npm run test:api
```
Expected: 5 verdes.

### Task 6b.3 — Validar Allure local

- [ ] **Step 6b.3.1 — Rodar suite e gerar Allure**

```bash
npm test
npm run report:allure
```
Expected: Allure abre no browser, testes categorizados por feature.

- [ ] **Step 6b.3.2 — Adicionar labels Allure aos testes existentes**

Refactor: adicionar a cada `test.describe` (helpers em `support/allureHelpers.ts`):
```typescript
import { allure } from 'allure-playwright';
test.beforeEach(async () => {
  allure.epic('Kasa Live');
  allure.owner('Filipe Gabriel');
});
// dentro de cada test:
allure.feature('Favoritar Times');
allure.story('Favoritar da lista popular');
allure.severity('critical');
allure.tag('@smoke');
```

- [ ] **Step 6b.3.3 — Commit API + Allure**

```bash
git add . && git commit -m "test(api): 5 testes contract + integracao Allure"
```

**Checkpoint Fase 6b:** 25 auto verdes + Allure local OK.

---

## Fase 7 — MCP completion (D2 15:00-17:00)

**Goal:** `get_element_status` + browser persistente + Resources de erro.

### Task 7.1 — LiveBrowser persistente

**File:** `mcp-server/src/runner/liveBrowser.ts`

- [ ] **Step 7.1.1 — Implementar singleton de browser**

```typescript
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

class LiveBrowserSingleton {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  async getPage(): Promise<Page> {
    if (!this.page) {
      this.browser = await chromium.launch({ headless: true });
      this.context = await this.browser.newContext({ baseURL: 'https://www.kasa.live' });
      this.page = await this.context.newPage();
    }
    return this.page;
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.page = this.context = this.browser = undefined;
  }
}

export const liveBrowser = new LiveBrowserSingleton();
```

### Task 7.2 — Tool `get_element_status`

**File:** `mcp-server/src/tools/getElementStatus.ts`

- [ ] **Step 7.2.1 — Implementar tool**

```typescript
import { z } from 'zod';
import { liveBrowser } from '../runner/liveBrowser.js';

export const GetElementStatusInputSchema = z.object({
  url: z.string().url().optional(),
  selector: z.string(),
  timeoutMs: z.number().optional().default(5000),
});

export const getElementStatusTool = {
  name: 'get_element_status',
  description: 'Retorna estado completo de um elemento (visibilidade, texto, atributos, bounding box, role)',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      selector: { type: 'string' },
      timeoutMs: { type: 'number' },
    },
    required: ['selector'],
  },
};

export async function getElementStatus(rawInput: unknown) {
  const input = GetElementStatusInputSchema.parse(rawInput);
  const page = await liveBrowser.getPage();
  if (input.url) await page.goto(input.url);

  const locator = page.locator(input.selector).first();
  const exists = (await locator.count()) > 0;
  if (!exists) {
    return { content: [{ type: 'text', text: JSON.stringify({ exists: false }, null, 2) }] };
  }

  const [visible, enabled, text, boundingBox, ariaRole] = await Promise.all([
    locator.isVisible(),
    locator.isEnabled().catch(() => true),
    locator.textContent().then(t => t ?? ''),
    locator.boundingBox(),
    locator.getAttribute('role'),
  ]);

  const attributes = await locator.evaluate((el) => {
    const out: Record<string, string> = {};
    for (const attr of (el as Element).attributes) out[attr.name] = attr.value;
    return out;
  });

  const result = { exists: true, visible, enabled, text, boundingBox, attributes, ariaRole };
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
```

### Task 7.3 — Tool `navigate_to`

**File:** `mcp-server/src/tools/navigateTo.ts`

- [ ] **Step 7.3.1 — Implementar**

```typescript
import { z } from 'zod';
import { liveBrowser } from '../runner/liveBrowser.js';

export const navigateToTool = {
  name: 'navigate_to',
  description: 'Navega o browser persistente para uma URL',
  inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
};

export async function navigateTo(rawInput: unknown) {
  const { url } = z.object({ url: z.string().url() }).parse(rawInput);
  const page = await liveBrowser.getPage();
  await page.goto(url);
  return { content: [{ type: 'text', text: JSON.stringify({ ok: true, finalUrl: page.url() }) }] };
}
```

### Task 7.4 — Resources de erro

**File:** `mcp-server/src/resources/registry.ts`

- [ ] **Step 7.4.1 — Implementar registry dinâmico**

```typescript
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';

interface ResourceEntry { uri: string; name: string; mimeType: string; localPath: string; }
const registry = new Map<string, ResourceEntry>();

export function registerArtifact(testId: string, type: 'screenshot' | 'video' | 'trace' | 'error.log' | 'console.log' | 'network.har' | 'dom.html', localPath: string) {
  const mimeMap = { screenshot: 'image/png', video: 'video/mp4', trace: 'application/zip', 'error.log': 'text/plain', 'console.log': 'text/plain', 'network.har': 'application/json', 'dom.html': 'text/html' };
  const filenameMap = { screenshot: 'screenshot.png', video: 'video.mp4', trace: 'trace.zip', 'error.log': 'error.log', 'console.log': 'console.log', 'network.har': 'network.har', 'dom.html': 'dom.html' };
  const uri = `loomi://artifacts/${testId}/${filenameMap[type]}`;
  registry.set(uri, { uri, name: `${testId} ${type}`, mimeType: mimeMap[type], localPath });
  return uri;
}

export function attachResourceHandlers(server: any) {
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: Array.from(registry.values()).map(({ uri, name, mimeType }) => ({ uri, name, mimeType })),
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req: any) => {
    const entry = registry.get(req.params.uri);
    if (!entry) throw new Error(`Resource não encontrado: ${req.params.uri}`);
    const content = await readFile(entry.localPath);
    if (entry.mimeType.startsWith('text/') || entry.mimeType === 'application/json') {
      return { contents: [{ uri: entry.uri, mimeType: entry.mimeType, text: content.toString('utf-8') }] };
    }
    return { contents: [{ uri: entry.uri, mimeType: entry.mimeType, blob: content.toString('base64') }] };
  });
}
```

### Task 7.5 — Integrar tudo no `index.ts`

- [ ] **Step 7.5.1 — Atualizar `mcp-server/src/index.ts`**

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runTestCaseTool, runTestCase } from './tools/runTestCase.js';
import { getElementStatusTool, getElementStatus } from './tools/getElementStatus.js';
import { navigateToTool, navigateTo } from './tools/navigateTo.js';
import { attachResourceHandlers } from './resources/registry.js';

const server = new Server(
  { name: 'loomi-qa-mcp', version: '0.2.0' },
  { capabilities: { tools: {}, resources: {} } },
);

const tools = { run_test_case: runTestCase, get_element_status: getElementStatus, navigate_to: navigateTo };
const toolDefs = [runTestCaseTool, getElementStatusTool, navigateToTool];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefs }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const handler = tools[req.params.name as keyof typeof tools];
  if (!handler) throw new Error(`Tool desconhecido: ${req.params.name}`);
  return handler(req.params.arguments ?? {});
});

attachResourceHandlers(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```

- [ ] **Step 7.5.2 — Atualizar `runTestCase` para registrar artifacts**

Em `tools/runTestCase.ts`, após `parseResult`, chamar `registerArtifact` para cada artifact path retornado pelo Playwright (lendo dos paths reais do `test-results/`).

- [ ] **Step 7.5.3 — Build + smoke**

```bash
npm run mcp:build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/dist/index.js
```
Expected: 3 tools listados.

- [ ] **Step 7.5.4 — Validar via Claude Desktop**

Reiniciar Claude. Prompts:
- "Use navigate_to com url=https://www.kasa.live"
- "Use get_element_status com selector='h1'"

- [ ] **Step 7.5.5 — Commit MCP completo**

```bash
git add mcp-server/ && git commit -m "feat(mcp): get_element_status + navigate_to + Resources registry (3/3 mandatory + 2 extras)"
```

**Checkpoint Fase 7:** MCP com 3 tools mandatórias + 2 extras + Resources funcionando.

---

## Fase 8 — Bug hunting wave 3 (D2 17:00-19:00)

**Goal:** Charters C5+C6+C7 → +6 bugs, +5 melhorias. Total ao fim: ≥18 bugs, ≥10 melhorias.

### Task 8.1 — Charter C5 (Mobile + viewports atípicos)

- [ ] **Step 8.1.1 — Executar (40min)**

Foco em: 320px, 375px, 414px, 768px, 1024px (atípicos: 280px ultrawide, dobrável). DevTools device emulation.

- [ ] **Step 8.1.2 — Documentar**

### Task 8.2 — Charter C6 (A11y exploratória)

- [ ] **Step 8.2.1 — Executar (40min)**

Tab através da página; tentar usar com VoiceOver (macOS); contraste; alt texts; ordem de foco.

- [ ] **Step 8.2.2 — Documentar**

### Task 8.3 — Charter C7 (Recursos não-core)

- [ ] **Step 8.3.1 — Executar (40min)**

Login/cadastro fluxo, perfil, dark mode (existe?), notificações, idioma, cookies banner, footer, sobre, política de privacidade.

- [ ] **Step 8.3.2 — Documentar**

### Task 8.4 — Consolidar bugs e melhorias

- [ ] **Step 8.4.1 — Documentar BUG-013..BUG-018 + IMP-001..IMP-010**

> **Nota sobre contagem de melhorias:** as ondas explícitas geram +3 (Fase 5) +5 (Fase 8) = 8 melhorias. As 2 melhorias restantes para chegar a 10 vêm oportunisticamente de: (a) Fase 2 charters C1/C2 (se houver achados não-críticos), (b) Fase 9 violations a11y `moderate` (não bloqueiam mas viram IMP), (c) achados durante Fase 6/9 ao escrever automação. Se ao fim da Fase 8 ainda faltarem melhorias, fazer micro-charter de 30min em UX/cosméticos pra fechar a meta.

- [ ] **Step 8.4.2 — Sincronizar Trello (todos)**

- [ ] **Step 8.4.3 — Atualizar `bug-reports/README.md` com índice completo**

- [ ] **Step 8.4.4 — Commit wave 3**

```bash
git add bug-reports/ && git commit -m "docs(bugs): wave 3 - C5/C6/C7 + consolidar 18 bugs e 10 melhorias"
```

**Checkpoint Fase 8:** ≥18 bugs + ≥10 melhorias documentados e no Trello.

---

## Fase 9 — Quality layers (D2 20:00-22:00)

**Goal:** 5 visual + 5 a11y, total auto = 35.

### Task 9.1 — Visual regression (5 testes)

**File:** `automation/tests/visual/pages.spec.ts`

- [ ] **Step 9.1.1 — Helper `support/visualHelper.ts` (masking dinâmico)**

```typescript
import type { Page } from '@playwright/test';

export async function maskDynamic(page: Page) {
  return [
    page.locator('time, [data-dynamic="timestamp"]'),
    page.locator('video, .video-player'),
    page.locator('[data-ad], .ad-banner'),
  ];
}
```

- [ ] **Step 9.1.2 — Teste 1: home**

```typescript
import { test, expect } from '@fixtures/index';
import { maskDynamic } from '@support/visualHelper';

test('@visual home matches baseline', async ({ homePage, page }) => {
  await homePage.open();
  await expect(page).toHaveScreenshot('home.png', { mask: await maskDynamic(page), fullPage: true });
});
```

- [ ] **Step 9.1.3 — Gerar baseline**

```bash
npx playwright test automation/tests/visual --update-snapshots --project=chromium
```
Expected: cria `__screenshots__/home.png-chromium-darwin.png`.

- [ ] **Step 9.1.4 — Repetir para 4 outras páginas**

Search results, match detail, favorites, highlights.

- [ ] **Step 9.1.5 — Rodar suite visual**

```bash
npm run test:visual
```
Expected: 5 verdes (baseline = atual).

- [ ] **Step 9.1.6 — Commit visual + baselines**

```bash
git add automation/ && git commit -m "test(visual): 5 testes regression + baselines geradas"
```

### Task 9.2 — A11y (5 testes)

**File:** `automation/tests/a11y/pages.spec.ts`

- [ ] **Step 9.2.1 — Teste padrão**

```typescript
import { test, expect } from '@fixtures/index';

test.describe('Acessibilidade WCAG 2.1 AA', () => {
  for (const route of ['/', '/buscar', '/partida/exemplo', '/favoritos', '/highlights']) {
    test(`@a11y ${route} sem violations serious/critical`, async ({ page, axeBuilder }) => {
      await page.goto(route);
      const results = await axeBuilder
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});
```

- [ ] **Step 9.2.2 — Rodar a11y**

```bash
npm run test:a11y
```
Expected: 5 testes (passando ou falhando — falhas viram bugs/melhorias).

- [ ] **Step 9.2.3 — Para cada violation: criar IMP ou BUG**

(Se violation = bloqueia uso pra usuário com deficiência → BUG. Se = dificulta mas tem workaround → IMP.)

- [ ] **Step 9.2.4 — Commit a11y**

```bash
git add automation/ && git commit -m "test(a11y): 5 testes WCAG 2.1 AA"
```

**Checkpoint Fase 9:** 35 testes auto verdes (8+12+5+5+5).

---

## Fase 10 — BDD finalização (D2 22:00-23:30)

**Goal:** 55 cenários `.feature` completos + indexados.

### Task 10.1 — Escrever `.feature` files

**Estratégia paralela:** dispatch 3 subagentes simultâneos, cada um escreve 1-2 features baseado nas notas de exploração + bugs/melhorias encontrados.

**Files:**
- `test-cases/core/favoritar-times.feature` (8 cenários)
- `test-cases/core/favoritar-partidas.feature` (8 cenários)
- `test-cases/core/buscar-partidas.feature` (10 cenários)
- `test-cases/core/melhores-momentos.feature` (7 cenários)
- `test-cases/core/google-calendar.feature` (5 cenários)
- `test-cases/extras/responsividade.feature` (3 cenários)
- `test-cases/extras/navegacao.feature` (4 cenários)
- `test-cases/extras/recursos-nao-core.feature` (5 cenários)
- `test-cases/extras/erro-edge-cases.feature` (5 cenários)

### Task 10.1 — Dispatch subagentes para escrever features

- [ ] **Step 10.1.1 — Preparar input para subagente**

Cada subagente recebe:
- Path do `.feature` a criar
- Conteúdo de `docs/exploration-notes.md`
- Conteúdo de `bug-reports/bugs/*.md` relacionados
- Template Gherkin (PT-BR `# language: pt`)
- Template estrutura: `Funcionalidade:` + 2 linhas de "como/quero/para" + N `Cenário:` + cada `Cenário` com Dado/Quando/Então
- AGENTS.md

- [ ] **Step 10.1.2 — Dispatch 3 agentes em paralelo (1ª onda: favoritar-times, favoritar-partidas, buscar-partidas)**

(Via Agent tool com subagent_type=general-purpose, prompts auto-contidos.)

- [ ] **Step 10.1.3 — Revisar outputs e ajustar**

- [ ] **Step 10.1.4 — Dispatch 3 agentes em paralelo (2ª onda: melhores-momentos, google-calendar, extras/responsividade)**

- [ ] **Step 10.1.5 — Dispatch 3 agentes em paralelo (3ª onda: extras restantes)**

- [ ] **Step 10.1.6 — Revisar todos**

### Task 10.2 — Lint Gherkin + índice

- [ ] **Step 10.2.1 — Verificar formato Gherkin**

Inspeção manual: cada `.feature` começa com `# language: pt`, tem `Funcionalidade:`, cada `Cenário:` tem Dado/Quando/Então.

- [ ] **Step 10.2.2 — Criar `test-cases/README.md`**

```markdown
# Casos de Teste BDD (55 cenários)

## Por funcionalidade core

| Funcionalidade | Arquivo | # Cenários |
|---|---|---|
| Favoritar times | [core/favoritar-times.feature](core/favoritar-times.feature) | 8 |
| Favoritar partidas | [core/favoritar-partidas.feature](core/favoritar-partidas.feature) | 8 |
| Buscar partidas | [core/buscar-partidas.feature](core/buscar-partidas.feature) | 10 |
| Melhores momentos | [core/melhores-momentos.feature](core/melhores-momentos.feature) | 7 |
| Google Calendar | [core/google-calendar.feature](core/google-calendar.feature) | 5 |
| **Subtotal core** | | **38** |

## Extras

| Cenário | Arquivo | # |
|---|---|---|
| Navegação | [extras/navegacao.feature](extras/navegacao.feature) | 4 |
| Responsividade | [extras/responsividade.feature](extras/responsividade.feature) | 3 |
| Recursos não-core | [extras/recursos-nao-core.feature](extras/recursos-nao-core.feature) | 5 |
| Erro/edge cases | [extras/erro-edge-cases.feature](extras/erro-edge-cases.feature) | 5 |
| **Subtotal extras** | | **17** |

**TOTAL: 55 cenários** (vs 40 do Pleno S1 → +37%)

## Convenção
- Gherkin em PT-BR
- Cada cenário cobre **1 caminho de usuário comum**
- Edge cases extremos viram bugs/charters, não cenários
```

- [ ] **Step 10.2.3 — Commit BDD**

```bash
git add test-cases/ && git commit -m "docs(bdd): 55 cenarios em PT-BR + indice"
```

**Checkpoint Fase 10 (FIM DIA 2):** 55 BDD + 35 auto + 18 bugs + 10 melhorias + MCP funcional. Tag `v0.4.0-day2-done`.

```bash
git tag -a v0.4.0-day2-done -m "Fim dia 2: BDD + Auto + Bugs + MCP"
git push --follow-tags
```

---

## Fase 11 — Final automation (D3 06:30-08:00)

**Goal:** +7 E2E + 3 Perf, total auto = 45.

### Task 11.1 — E2E batch 3 (7 testes)

**Files:** completar `automation/tests/e2e/` cobrindo:
- Calendar OAuth iniciação (1)
- Highlights playback (3 cenários)
- Edge cases não-core (3 cenários)

- [ ] **Step 11.1.1 — Escrever 7 testes (mesmo padrão TDD)**
- [ ] **Step 11.1.2 — Rodar suite E2E**

```bash
npm run test:e2e
```
Expected: 27 verdes.

- [ ] **Step 11.1.3 — Commit batch 3**

### Task 11.2 — Performance (3 testes)

**File:** `automation/tests/performance/lighthouse.spec.ts`

- [ ] **Step 11.2.1 — Helper `support/lighthouseRunner.ts`**

```typescript
import { playAudit } from 'playwright-lighthouse';
import type { Page } from '@playwright/test';

export async function runLighthouse(page: Page, name: string) {
  await playAudit({
    page,
    port: 9222,
    thresholds: { performance: 80, accessibility: 90, 'best-practices': 80, seo: 80 },
    reports: { formats: { html: true, json: true }, name, directory: './reports/lighthouse' },
  });
}
```

- [ ] **Step 11.2.2 — 3 testes**

```typescript
import { test } from '@fixtures/index';
import { runLighthouse } from '@support/lighthouseRunner';

for (const route of ['/', '/buscar?q=flamengo', '/highlights']) {
  test(`@perf lighthouse ${route}`, async ({ page }) => {
    await page.goto(route);
    await runLighthouse(page, `lh-${route.replace(/\W/g, '_')}`);
  });
}
```

- [ ] **Step 11.2.3 — Rodar perf**

```bash
npm run test:perf
```

- [ ] **Step 11.2.4 — Commit perf**

```bash
git add automation/ && git commit -m "test(perf): 3 lighthouse audits (home, search, highlights)"
```

- [ ] **Step 11.2.5 — Rodar suite full**

```bash
npm test
```
Expected: 45 testes verdes.

**Checkpoint Fase 11:** 45 auto verdes. Tarefa 2 fechada.

```bash
git tag -a v0.5.0-automation-done -m "45 testes auto verdes"
git push --follow-tags
```

---

## Fase 12 — MCP polish (D3 08:00-10:00)

**Goal:** Tutorial reproduzível + 3 extras restantes + testes Vitest.

### Task 12.1 — 3 extras MCP

**Files:** `mcp-server/src/tools/{listTestCases,getTestHistory,extractDomSnapshot,analyzeFailure}.ts`

- [ ] **Step 12.1.1 — `list_test_cases`**

Lê arquivos `.spec.ts` de `automation/tests/`, parse de `test('@tag titulo', ...)`, retorna lista.

- [ ] **Step 12.1.2 — `get_test_history`**

Lê `reports/results.json` histórico (mantém último N runs em `mcp-server/data/history.jsonl`).

- [ ] **Step 12.1.3 — `extract_dom_snapshot`**

```typescript
const html = await page.content();
// ou para aria-tree: await page.accessibility.snapshot()
```

- [ ] **Step 12.1.4 — `analyze_failure`**

Heurística simples: regex em stack (`TimeoutError`, `Element is not visible`, `expect(...).toBe...`) → hipótese textual.

- [ ] **Step 12.1.5 — Registrar todos no `index.ts`**

- [ ] **Step 12.1.6 — Build + smoke**

```bash
npm run mcp:build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/dist/index.js
```
Expected: 8 tools.

### Task 12.2 — Testes Vitest do MCP

**Files:** `mcp-server/tests/tools/*.test.ts`

- [ ] **Step 12.2.1 — `runTestCase.test.ts` com mock do spawn**

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as bridge from '../../src/runner/playwrightBridge.js';
import { runTestCase } from '../../src/tools/runTestCase.js';

describe('runTestCase', () => {
  it('retorna estrutura de output válida quando teste passa', async () => {
    vi.spyOn(bridge, 'runPlaywright').mockResolvedValue({
      exitCode: 0,
      stdout: JSON.stringify({ stats: { duration: 100 }, suites: [{ specs: [{ tests: [{ results: [{ status: 'passed', duration: 100 }] }], title: 'x' }] }] }),
      stderr: '',
    });
    const out = await runTestCase({ name: '@smoke' });
    const parsed = JSON.parse((out.content[0] as any).text);
    expect(parsed.status).toBe('passed');
    expect(parsed.testId).toBeTruthy();
  });
});
```

- [ ] **Step 12.2.2 — `getElementStatus.test.ts`**

Mock do `liveBrowser`, valida shape do retorno.

- [ ] **Step 12.2.3 — `registry.test.ts`**

Valida register/list/read.

- [ ] **Step 12.2.4 — Rodar Vitest**

```bash
npm test --workspace=mcp-server
```
Expected: ≥80% coverage, todos verdes.

### Task 12.3 — Tutorial reproduzível

**File:** `docs/mcp-tutorial.md`

- [ ] **Step 12.3.1 — Estrutura completa**

```markdown
# Tutorial MCP Server — Loomi QA

Reproduzir em ≤5 minutos.

## 1. Setup
\`\`\`bash
git clone <repo>
cd loomi-qa-challenge-kasa
npm install
npx playwright install chromium
npm run mcp:build
\`\`\`

## 2. Configurar Claude Desktop

Editar `~/Library/Application Support/Claude/claude_desktop_config.json`:
\`\`\`json
{
  "mcpServers": {
    "loomi-qa": {
      "command": "node",
      "args": ["<caminho-absoluto>/loomi-qa-challenge-kasa/mcp-server/dist/index.js"]
    }
  }
}
\`\`\`

Reiniciar Claude Desktop.

## 3. Validar
Pergunta para Claude: "Quais tools você tem do servidor loomi-qa?"
Resposta esperada: lista 8 tools.

## 4. 3 prompts de exemplo

### Prompt 1: descobrir e rodar
> "Liste os casos de teste disponíveis no loomi-qa e rode o smoke test."

### Prompt 2: analisar falha
> "Rode o teste de busca. Se falhar, leia o screenshot e o trace, e me diga a causa raiz."

### Prompt 3: exploração ao vivo
> "Use navigate_to para ir em https://www.kasa.live/, depois use get_element_status para me dizer o estado do botão de favoritar do primeiro time."

## 5. Screenshots de interação
[Anexar GIFs/screenshots da conversa funcionando]

## 6. Troubleshooting
- "Tool not found" → reiniciou Claude Desktop?
- "ENOENT spawn npx" → npx no PATH? `which npx`
- Logs detalhados em `mcp-server/logs/mcp-YYYY-MM-DD.jsonl`
```

- [ ] **Step 12.3.2 — Capturar screenshots/GIFs reais**

Usar Cmd+Shift+5 ou Loom curto. Salvar em `docs/site-snapshots/mcp/`.

- [ ] **Step 12.3.3 — Commit MCP polish**

```bash
git add . && git commit -m "feat(mcp): 3 tools extras + Vitest 80%+ + tutorial reproduzivel"
git tag -a v0.6.0-mcp-done -m "MCP completo (8 tools + tutorial + tests)"
git push --follow-tags
```

**Checkpoint Fase 12:** Tarefa 4 fechada.

---

## Fase 13 — CI publish Allure (D3 10:00-11:00)

**Goal:** Allure publicado em GitHub Pages com URL pública.

### Task 13.1 — Trigger nightly + verificar publish

- [ ] **Step 13.1.1 — Trigger manual primeiro (cria branch `gh-pages`)**

A branch `gh-pages` não existe ainda. O workflow `nightly.yml` cria ela na primeira execução via `peaceiris/actions-gh-pages`. Por isso: **rodar workflow ANTES de configurar Pages**.

```bash
gh workflow run nightly.yml
```

Aguardar conclusão.

> **Verificação no primeiro trigger:** o `nightly.yml` usa `publish_dir: allure-history` (path produzido por `simple-elf/allure-report-action@v1` na working dir do runner). Confirmar nos logs do step "Deploy" que `peaceiris/actions-gh-pages@v3` encontrou o diretório. Se acusar "directory not found", testar `./allure-history` ou inspecionar artefatos pra ver onde o action gravou. O README oficial do `simple-elf/allure-report-action` documenta `PUBLISH_DIR: allure-history` como padrão — então o caminho atual deve funcionar, mas vale verificar.

- [ ] **Step 13.1.2 — Habilitar GitHub Pages (após branch existir)**

Settings do repo → Pages → Source = "Deploy from branch" → branch = `gh-pages` → folder = `/ (root)` → Save.

- [ ] **Step 13.1.3 — Trigger novamente para publicar com Pages habilitado**

```bash
gh workflow run nightly.yml
```
Ou: Actions tab → Nightly → Run workflow.

- [ ] **Step 13.1.4 — Aguardar conclusão (~25min)**

Monitorar:
```bash
gh run watch
```

- [ ] **Step 13.1.5 — Verificar Allure no Pages**

URL: `https://<user>.github.io/loomi-qa-challenge-kasa/`

Abrir em janela anônima — deve carregar report navegável.

- [ ] **Step 13.1.6 — Atualizar README com URL**

```bash
sed -i '' 's|<preencher>|https://<user>.github.io/loomi-qa-challenge-kasa/|' README.md
git add README.md && git commit -m "docs: link do Allure publicado no README"
```

**Plano B (se falhou):** rodar Allure local + screenshots → adicionar ao relatório como evidência.

**Checkpoint Fase 13:** Allure URL pública no ar.

---

## Fase 14 — Demo video (D3 11:00-12:30)

**Goal:** Vídeo Loom 3-5min demonstrando entrega.

### Task 14.1 — Roteiro

- [ ] **Step 14.1.1 — Dispatch 1 subagente para gerar roteiro**

Input para o agente: `progress-report.md` rascunho + spec + estrutura de pastas. Output: roteiro de 4-5min em PT-BR com timing por seção.

Roteiro esperado (estrutura):
1. **Intro (15s)** — quem sou, qual o desafio
2. **README + estrutura (30s)** — abrir repo, mostrar tree
3. **Tarefa 1: BDD (40s)** — abrir `test-cases/`, mostrar 1 `.feature`, mencionar 55 cenários
4. **Tarefa 2: Automação (60s)** — `npm run test:smoke` rodando, abrir Allure publicado
5. **Tarefa 3: Bugs (40s)** — abrir Trello, abrir 2 bugs com evidência
6. **Tarefa 4: MCP (60s)** — abrir Claude Desktop, prompt usando tool, mostrar resultado
7. **Outro (15s)** — métricas finais (delta vs Pleno S1), link relatório

### Task 14.2 — Gravar com Loom

- [ ] **Step 14.2.1 — Setup Loom**

Loom desktop ou web. Resolução 1080p. Microfone ok.

- [ ] **Step 14.2.2 — Gravar uma tomada (sem cortes)**

Seguir roteiro. Se erro grave: pausar e regravar.

- [ ] **Step 14.2.3 — Configurar como "unlisted"**

Não deletar — link unlisted (sem login).

- [ ] **Step 14.2.4 — Atualizar `docs/demo-video.md`**

```markdown
# Vídeo Demo

**Link:** <colar-url-loom>
**Duração:** 4min30s
**Idioma:** PT-BR

## Conteúdo coberto
1. Introdução e contexto
2. Estrutura do repo
3. Tarefa 1: 55 cenários BDD
4. Tarefa 2: Automação rodando + Allure
5. Tarefa 3: Trello + bugs
6. Tarefa 4: MCP via Claude Desktop
7. Métricas finais
```

- [ ] **Step 14.2.5 — Atualizar README com URL do vídeo**

- [ ] **Step 14.2.6 — Commit**

```bash
git add docs/demo-video.md README.md && git commit -m "docs: video demo (Loom unlisted, 4-5min)"
```

**Checkpoint Fase 14:** vídeo publicado e linkado.

---

## Fase 15 — Final docs (D3 13:30-14:30)

**Goal:** progress-report.md + READMEs finais + checklist + matriz de cobertura.

### Task 15.1 — `docs/progress-report.md` (entregável obrigatório)

- [ ] **Step 15.1.1 — Estruturar 8 seções da spec §9.6**

```markdown
# Relatório de Progresso — Desafio QA Loomi
**Filipe Gabriel · 2026-05-04**

## 1. Visão geral da entrega
[Sumário executivo: 1 parágrafo + tabela métricas + 4 links principais]

## 2. Como organizei demandas e atividades
[Trello board + 3 trilhas paralelas + WIP limit + cadência push]

## 3. Como priorizei as entregas
[Critério: cobertura × impacto × tempo. Decisões de escopo. O que cortei e por quê]

## 4. Cronograma executado
[Tabela hora-a-hora real (extraída dos timestamps de commit) vs planejado]

## 5. Principais dificuldades e como lidei
[Top 5 obstáculos honestos com mitigação aplicada]

## 6. Decisões técnicas relevantes
[Stack, BDD-as-doc, MCP arch, Playwright único runner — o "por quê"]

## 7. O que faria diferente com mais tempo
[Roadmap "se eu tivesse mais 1 semana"]

## 8. Métricas finais
[Tabela: planejado vs entregue por entregável]
```

- [ ] **Step 15.1.2 — Preencher seção 4 com timestamps reais**

```bash
git log --pretty=format:'%ai %s' --reverse > docs/git-timeline.txt
```
Usar como base.

### Task 15.2 — `docs/coverage-matrix.md`

- [ ] **Step 15.2.1 — Criar matriz formal**

Copiar da spec §7.2 + atualizar com números reais entregues.

### Task 15.3 — `docs/exit-criteria.md`

- [ ] **Step 15.3.1 — Checklist preenchido**

Copiar da spec §10.3 + marcar [x] tudo que foi entregue.

### Task 15.4 — `docs/risks-and-mitigations.md`

- [ ] **Step 15.4.1 — Copiar tabela R1-R11 + atualizar com riscos materializados (se algum)**

### Task 15.5 — `docs/architecture.md`

- [ ] **Step 15.5.1 — Diagrama ASCII**

```
┌──────────────────────────────────────────────────────────────┐
│  Trilha A (Functional QA)    Trilha B (Automation)    Trilha C (Platform/MCP)  │
│       test-cases/                automation/              mcp-server/          │
│       bug-reports/               playwright + axe         MCP SDK + LiveBrowser│
└──────────────────────────────────────────────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │  CI/CD + Allure   │
                  │  GitHub Pages     │
                  └───────────────────┘
```

### Task 15.6 — `docs/evaluator-journey.md`

- [ ] **Step 15.6.1 — 5 passos do avaliador**

```markdown
# Avaliador Journey — 20-25min

1. **Descompactar ZIP + abrir README.md** (30s)
2. **Ler TL;DR + assistir vídeo demo** (5min)
3. **Abrir Trello (link no README) + Allure (link no README)** (3min)
4. **Quick start opcional: `npm i && npm run test:smoke`** (5min)
5. **Navegar `bug-reports/`, `test-cases/`, ler `progress-report.md`** (10min)
```

### Task 15.7 — `docs/test-account-setup.md`

- [ ] **Step 15.7.1 — Documentar como criar conta de teste**

(Para o avaliador rodar localmente se quiser.)

### Task 15.8 — README raiz finalizado

- [ ] **Step 15.8.1 — Reescrever conforme spec §9.8**

Estrutura completa: TL;DR + Quick Start + Links + Inventário + Arquitetura + Como rodar + Critérios + Estrutura + Autor.

- [ ] **Step 15.8.2 — Atualizar status de cada tarefa para "✅ Concluído"**

- [ ] **Step 15.8.3 — Tabela "Critérios atendidos vs Pleno S1"**

(Da spec Apêndice B.)

### Task 15.9 — `CHANGELOG.md` final

- [ ] **Step 15.9.1 — Adicionar entrada `[1.0.0] - 2026-05-04` com tudo entregue**

### Task 15.10 — `docs/submission-checklist.md`

- [ ] **Step 15.10.1 — Copiar da spec §10.5 + começar a marcar [x]**

- [ ] **Step 15.10.2 — Commit todos os docs finais**

```bash
git add docs/ README.md CHANGELOG.md && git commit -m "docs: progress report + READMEs finais + checklist"
```

**Checkpoint Fase 15:** documentação completa.

---

## Fase 16 — Submission (D3 14:30-15:00)

**Goal:** ZIP validado + e-mail enviado.

### Task 16.1 — Script `package.sh`

**File:** `scripts/package.sh`

- [ ] **Step 16.1.1 — Criar conforme spec §10.4**

```bash
#!/usr/bin/env bash
set -euo pipefail
OUTPUT="loomi-qa-challenge-filipe-gabriel.zip"

rm -rf node_modules mcp-server/node_modules
rm -rf reports/ allure-results/ allure-report/
rm -rf playwright-report/ test-results/
rm -rf */dist */build

[ -f .env ] && { echo "❌ .env existe. Abortando."; exit 1; }
[ -f .env.local ] && { echo "❌ .env.local existe. Abortando."; exit 1; }

echo "Arquivos >5MB:"
find . -size +5M -not -path "./node_modules/*" -not -path "./.git/*"

zip -r "$OUTPUT" . \
  -x ".git/*" -x "node_modules/*" -x "*/node_modules/*" \
  -x "reports/*" -x "allure-results/*" -x "test-results/*" \
  -x ".env*" -x "*.log"

if unzip -l "$OUTPUT" | grep -E "\.env|node_modules" > /dev/null; then
  echo "❌ ZIP contém arquivo proibido"; exit 1
fi
echo "✅ ZIP pronto: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
```

- [ ] **Step 16.1.2 — `chmod +x scripts/package.sh`**

### Task 16.2 — Backup "candidato" às 12:00 (mitigação R11)

- [ ] **Step 16.2.1 — Rodar package.sh às 12:00 com estado atual (mesmo incompleto)**

```bash
bash scripts/package.sh
```

- [ ] **Step 16.2.2 — Enviar para e-mail próprio como backup**

E-mail para meu próprio gmail com ZIP anexo.

### Task 16.3 — ZIP final + validação

- [ ] **Step 16.3.1 — Reinstalar deps + rodar tudo uma última vez**

```bash
npm install
npm run lint && npm run typecheck && npm run test:smoke
npm run mcp:build
```
Expected: tudo verde.

- [ ] **Step 16.3.2 — Rodar `package.sh` final**

```bash
bash scripts/package.sh
```

- [ ] **Step 16.3.3 — Validar ZIP em pasta nova**

```bash
mkdir -p /tmp/loomi-validation && cd /tmp/loomi-validation
unzip -q ~/loomi-qa-challenge-kasa/loomi-qa-challenge-filipe-gabriel.zip
npm install && npm run test:smoke
```
Expected: smoke passa em pasta nova.

### Task 16.4 — Submission checklist final

- [ ] **Step 16.4.1 — Marcar [x] todos os itens de `docs/submission-checklist.md`**

- [ ] **Step 16.4.2 — Verificar Trello público em janela anônima**

Janela anônima → colar URL Trello → deve abrir sem login.

- [ ] **Step 16.4.3 — Verificar Allure URL em janela anônima**

- [ ] **Step 16.4.4 — Verificar vídeo Loom em janela anônima**

### Task 16.5 — Tag final + push

- [ ] **Step 16.5.1 — Tag**

```bash
git tag -a v1.0.0-submission -m "Submissão final do desafio QA Loomi"
git push --follow-tags
```

### Task 16.6 — Enviar e-mail

- [ ] **Step 16.6.1 — Compor e-mail**

```
Para: processoseletivo@loomi.com.br
Assunto: Desafio QA Abril 26 — Filipe Gabriel

Olá, time Loomi!

Segue minha entrega do Desafio QA de Abril/26 para a vaga de QA Senior.

Resumo dos entregáveis:
- 55 casos de teste BDD em PT-BR (Tarefa 1)
- 45 testes automatizados (E2E + API + Visual + A11y + Perf — Tarefa 2)
- 18 bugs + 10 melhorias com evidências (Tarefa 3)
- MCP Server com 8 tools + tutorial reproduzível (Tarefa 4)

Links principais:
- Trello (board público): <url>
- Allure Report (publicado em GH Pages): <url>
- Vídeo demo (4-5min): <url>
- Repositório completo no anexo .zip

Agradeço a oportunidade. Disponível para qualquer esclarecimento.

Filipe Gabriel
filipecardosogabriel@gmail.com
```

- [ ] **Step 16.6.2 — Anexar ZIP**

- [ ] **Step 16.6.3 — Enviar antes das 15:00**

✅ **Submetido.**

---

## Apêndice — Dispatch de subagentes paralelos

Locais marcados no plano onde dispatchar agentes em paralelo:

1. **Fase 10.1** — 9 features `.feature` em 3 ondas de 3 agentes
2. **Após cada charter (Fases 2/5/8)** — 1 agente transforma notas em bug reports estruturados
3. **Fase 12.3** — 1 agente gera tutorial MCP a partir do código
4. **Fase 14.1** — 1 agente gera roteiro do vídeo demo

**Padrão de prompt para subagente:** auto-contido, referencia AGENTS.md + spec/plan paths + arquivos de input específicos. Não decide escopo — só executa scaffolding/draft.

---

## Apêndice — Pontos de não-retorno (resumo)

| Hora | Decisão | Default se NÃO |
|---|---|---|
| 23:30 D1 | MCP skeleton funcionando? | Plano B: MCP mínimo, foco trilhas A/B |
| 12:30 D2 | ≥15 E2E verdes? | Cortar A11y/Visual extras |
| 19:00 D2 | ≥12 bugs documentados? | +1h extra de hunt |
| 10:00 D3 | CI publica Allure? | Allure local + screenshot |
| 11:00 D3 | Tudo verde? | Vídeo de 5min vira 2min |

Cortes pré-decididos da spec §10.2 aplicados em ordem se necessário.
