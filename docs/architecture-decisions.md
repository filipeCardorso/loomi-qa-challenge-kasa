# Architecture Decision Records (ADR)

Registro curto e estável das decisões arquiteturais do repo. Cada ADR cobre
contexto, decisão e consequência (formato leve estilo Michael Nygard).

## ADR-001: Components recebem `Page`, MatchCard recebe `Locator`

**Status:** Accepted (2026-05-02)

**Context:** UI Components (modais, popovers, panels) são UM no DOM em cada
momento (ex.: `LoginModal`, `MatchModal`, `ProfilePopover`,
`NotificationsPanel`). Já cards de partida (`MatchCard`) são REPETIDOS — uma
lista de N entradas.

**Decision:** `BaseComponent` (abstrata) aceita `Page` no construtor e expõe
`root: Locator` via getter abstract — cada subclasse decide como localizar a
si mesma. `MatchCard` é a EXCEÇÃO: recebe `Locator` pré-resolvido pelo POM
da página que listou os cards (`HomePage.getMatchCards()` instancia N).

**Consequence:**

- Modais/popovers ganham `isOpen()`/`waitForOpen()`/`waitForClose()` de graça.
- Cards podem ser instanciados em loops sem custo de re-localização.
- Se um `MatchCard` "vazasse" para fora da lista que o originou, ele ainda
  funciona — é desacoplado de qualquer página específica.

## ADR-002: Selectors centralizados em `support/selectors.ts`

**Status:** Accepted

**Context:** Chakra UI gera classes hash que mudam a cada build (ex.:
`css-7mca6u`). Espalhar esses seletores pelos POMs/specs cria flake brutal a
cada deploy.

**Decision:** Selectors voláteis vão em `SELECTORS` (const exportada
read-only). Refatorar = 1 arquivo. Discriminantes complexos (ex.: `LoginModal`
vs `MatchModal` que compartilham `role=dialog`) usam `:has(text=...)` ou
`:has(h2:has-text(...))` declarado lá.

**Consequence:** Quando o site mudar (e vai mudar), corrigir a suite custa
abrir 1 arquivo. Trade-off: discriminantes ficam levemente mais lentos que
seletores diretos por classe — aceitável (5-50ms a mais por modal).

## ADR-003: LiveBrowser e ResourceRegistry via factory + singleton

**Status:** Accepted

**Context:** Tools MCP (`getElementStatus`, `navigateTo`,
`extractDomSnapshot`) precisam de uma `Page` Playwright persistente entre
invocações. A v0.5 usava `class LiveBrowserSingleton` exportado direto —
acoplamento forte que dificultava mock em Vitest. Mesmo problema em
`resources/registry.ts` (Map module-scope global).

**Decision:** `createLiveBrowser(options)` e `createResourceRegistry()` são
factories que retornam interfaces (`BrowserDriver` / `ResourceRegistry`).
`liveBrowser` e `resourceRegistry` continuam exportados como singletons
default, MAS agora o tipo é a interface — testes podem mockar via
`vi.spyOn(liveBrowser, 'getPage')` ou injetar uma instância isolada via
`createXXX()`.

**Consequence:** Tools de produção não mudam (continuam importando o
singleton). Testes ganham isolamento real entre runs. Adiciona ~10 linhas de
boilerplate (interface + factory) em cada arquivo — vale.

## ADR-004: Login local (email/senha) em vez de Google OAuth E2E

**Status:** Accepted

**Context:** O site oferece dois métodos de login: email/senha (Firebase) e
"Entrar com o Google" (OAuth). Google OAuth requer 2FA + app verification +
gerenciamento de sessões Google reais — automação real exigiria conta de
serviço dedicada e violaria ToS do Google em modo headless.

**Decision:** Automação E2E primária usa email/senha local
(`KASA_USER_EMAIL`/`KASA_USER_PASSWORD` em `.env.local`). Google OAuth é
coberto apenas por um teste que valida `click → redirect` (não completa o
fluxo).

**Consequence:** Cobertura de auth real fica em 100% pra fluxo principal e
~50% pra Google OAuth (smoke do redirect). Aceitável dado o trade-off.
Documenta no `CHANGELOG.md` quando for renegociado.

## ADR-005: BDD como documentação, não runtime

**Status:** Accepted

**Context:** Cucumber/Gherkin runtime adiciona uma camada de tradução
`.feature` ↔ steps (typescript) que custa manutenção em duplicidade — toda
mudança de UI exige editar tanto o step quanto o spec Playwright equivalente.

**Decision:** Os arquivos `.feature` em `test-cases/` servem APENAS como
documentação executável-por-humano (descreve cenário em linguagem de
negócio). A automação Playwright é independente — testes em
`automation/tests/**` cobrem os mesmos cenários sem dependência de
`@cucumber/cucumber`.

**Consequence:** Times de produto/QA não-técnico leem `.feature` para
entender escopo. Devs/QA-eng trabalham direto em Playwright (faster
iteration). Risco: divergência feature vs spec — mitigado por revisão de PR
exigindo update conjunto.

## ADR-006: BugEvidenceReporter como camada de regressão-por-bug

**Status:** Accepted (2026-05-03)

**Context:** Em pré-submissão (revisão de auditoria), identifiquei que bugs
documentados em `bug-reports/bugs/` viviam isolados de qualquer guarda
contínua. Quando o dev fizesse fix, o time não tinha como detectar
regressão automaticamente — só via inspeção manual do `.md` antigo.

**Alternatives considered:**

1. Adicionar asserts dos bugs nos specs E2E existentes (rejeitado — polui
   contract specs com lógica de "memória institucional", quebra Single
   Responsibility).
2. Suite separada `e2e/regression/` (rejeitado — não tem pipeline próprio
   de evidência).
3. Reporter Playwright custom + suite dedicada `tests/bugs/` com fixture
   `bugFindings` (escolhido).

**Decision:** Camada `automation/tests/bugs/` com:

- 21 specs `BUG-XXX-*.spec.ts` mapping 1:1 com `bug-reports/bugs/BUG-XXX-*.md`
- Polaridade: spec falha enquanto bug existir; passa quando dev fixar
- `_reporter.ts` (Playwright Reporter) auto-dump em `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/` com trace+screenshot+video+findings.json
- Fixture `bugFindings` (`_fixtures.ts`) anexa expected/actual ao testInfo
- npm scripts `test:bugs`, `test:bug -- @bug-XXX`

**Consequence:** Bugs ganham guarda contínua sem poluir contract specs.
Avaliador vê auto-evidence em CI e correlação 1:1 com `.md`. Trade-off: +
22 specs no inventário (compensados em quantidade pela suite, mas se
bug-regression cresce sem cleanup, suite fica pesada — política de
arquivamento após 6 meses verde + 1 release sem regressão documentada
no `automation/tests/bugs/README.md`).

## ADR-007: Allure publicado em GitHub Pages (não só local)

**Status:** Accepted (2026-05-02)

**Context:** O PDF do desafio não exige relatório navegável publicado, mas
avaliador precisa entender estado dos testes em ≤25min. HTML report do
Playwright local não é compartilhável; Allure local exige clone + install.

**Alternatives considered:**

1. Apenas `npm run report:allure` local (rejeitado — exige `git clone` +
   `npm install` apenas pra ver report).
2. Imagem Allure publicada em S3/Vercel (rejeitado — overhead de infra
   externa para entrega única).
3. Allure publicado em GitHub Pages via `peaceiris/actions-gh-pages` no
   workflow `nightly.yml` (escolhido).

**Decision:** `nightly.yml` faz matrix multi-browser (chromium/firefox/
webkit/mobile-chrome), gera Allure consolidado, publica em
`https://filipecardorso.github.io/loomi-qa-challenge-kasa/` com history
preservation entre runs.

**Consequence:** Avaliador clica 1 link e vê: trends, categorias, falhas
históricas. Custo: ~60min de setup (workflow + permissões + Allure CLI
install). Risco: GitHub Pages cair durante avaliação (mitigado por R11 —
ZIP backup + push contínuo).

## ADR-008: Playwright como runner único (E2E + API + Visual + A11y + Perf + Security)

**Status:** Accepted (2026-05-02)

**Context:** Suíte de QA pode fragmentar entre múltiplas ferramentas:
Cypress/Playwright (E2E), Postman/REST-assured (API), BackstopJS (visual),
axe-core CLI (a11y), Lighthouse CLI (perf), OWASP ZAP (security). Cada
uma com config própria, fixtures separadas, CI separado.

**Alternatives considered:**

1. Stack fragmentada (rejeitado — overhead de manutenção, devs precisam
   conhecer 5-6 ferramentas).
2. Cypress como runner único (rejeitado — Cypress não tem API context
   robusto, visual é addon pago Percy).
3. Playwright como runner único (escolhido — `request` fixture nativo,
   `toHaveScreenshot()` nativo, plugins maduros pra axe + lighthouse).

**Decision:** Toda a Trilha B usa `@playwright/test`:

- E2E: `page` fixture
- API: `request` fixture + Zod schemas
- Visual: `expect(page).toHaveScreenshot()` + masking
- A11y: `@axe-core/playwright` integrado em fixture
- Perf: `playwright-lighthouse` em projeto separado com CDP port 9222
- Security: `request` fixture pra header/cookie/CORS/rate-limit

**Consequence:** 1 ferramenta, 1 config, 1 reporter, 1 CI workflow. Devs
trabalham com mesmo modelo mental em todas as camadas. Trade-off:
funcionalidades específicas de ferramentas dedicadas (ex.: ZAP com fuzzing
profundo) são limitadas — mitigado documentando esses gaps explicitamente
em `docs/coverage-matrix.md` e nos specs (`security/payload-fuzz.spec.ts`).
