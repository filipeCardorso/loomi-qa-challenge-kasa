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
