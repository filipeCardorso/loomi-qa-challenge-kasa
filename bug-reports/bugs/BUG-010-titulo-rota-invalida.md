# BUG-010 — `/favoritos` cai na home silenciosamente mas mantém title genérico (sem indicar fallback)

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 2/2 rotas testadas (`/favoritos` e `/calendario` em sessão anônima)
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/kNexAnW2

## Contexto e nuance vs IMP-011 / BUG-004

- `/buscar`, `/login`, `/calendar`, `/perfil` → retornam **404 explícito** com title `"Kasa.Live - Página não encontrada"` (tratado em **IMP-011** como sugestão de redirects, não como defeito).
- `/favoritos` e `/calendario` (sessão anônima) → retornam **HTTP 200 com conteúdo da home** (coberto em **BUG-004** quanto ao fallback silencioso).

Este bug (BUG-010) trata especificamente do **terceiro sintoma** dessa segunda categoria: além do conteúdo errado, o `<title>` também não muda — fica o título genérico da home, escondendo do usuário, do leitor de tela e dos crawlers que a rota solicitada não existe / exige login.

## Pré-condição

- Sessão **anônima** (sem cookie de auth).
- Capacidade de inspecionar `<title>` via DevTools, `document.title` ou `curl -s URL | grep '<title>'`.

## Passos para reproduzir

1. Em janela anônima, acessar https://www.kasa.live/favoritos.
2. Inspecionar `document.title` — exibe `"Kasa - O melhor do futebol em um só lugar"` (mesmo title da home).
3. Acessar https://www.kasa.live/rota-que-nao-existe-xyz.
4. Inspecionar `document.title` — exibe `"Kasa.Live - Página não encontrada"` (correto para 404).
5. Acessar https://www.kasa.live/calendario (anônimo).
6. Inspecionar `document.title` — também exibe o título genérico da home.

## Resultado esperado

Toda rota que **não corresponde a uma página efetivamente renderizada para o usuário corrente** deve ter `<title>` consistente com o estado real:

- Se a intenção for fallback silencioso para a home (não recomendado — ver BUG-004), no mínimo o `<title>` deveria refletir um estado intermediário (`"Faça login para ver seus favoritos — Kasa"`) ou ser idêntico ao da home **somente** após redirect HTTP 301/302 explícito (caso em que o usuário veria a URL `/`).
- Idealmente, fazer `redirect('/?login=required&redirectTo=/favoritos')` (ver fix sugerido em BUG-004), o que naturalmente alinha o title à rota final `/`.

## Resultado obtido

- `/favoritos` e `/calendario` (anônimo): HTTP 200 + conteúdo da home + `<title>` da home, sem nenhum sinal visual ou semântico de que a rota solicitada não existe ou exige login.
- A inconsistência aparece quando se compara com rotas claramente quebradas (`/rota-aleatoria-xyz`), que recebem o title `"Página não encontrada"` corretamente.

## Ambiente

- URL: https://www.kasa.live/favoritos e https://www.kasa.live/calendario (sem auth)
- Browser/versão: Chromium 130 (Playwright headless, sem `storageState`)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiros S4 e S10)
- `docs/site-snapshots/exploration/` (dump de `document.title` por rota)
- Screenshot: `bug-reports/evidence/BUG-010/`

## Workaround conhecido

- Nenhum no lado do usuário. Apenas a equipe pode corrigir o middleware/route-guard.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: o roteador (provavelmente Next.js) tem catch-all que renderiza `Home` em vez de `NotFound` quando a rota requer auth e não há sessão, sem ajustar metadata.
- Fix sugerido:
  1. Mapear `/favoritos` e `/calendario` explicitamente como rotas autenticadas.
  2. Em sessão anônima, fazer `redirect('/?login=required&redirectTo=/favoritos')` (alinhado com fix de BUG-004).
  3. Para rotas planejadas mas ainda não implementadas, exibir página de "em construção" com title específico (`"Em breve — Kasa"`).
  4. Adicionar teste E2E que percorre lista de rotas autenticadas conhecidas em sessão anônima e valida que o title final reflete a URL final (após redirect) ou contém `"Faça login"`.

## Relação com outros bugs

- **IMP-011** — sugere redirects para `/buscar /login /calendar /perfil` (originalmente reportado como BUG-003, reclassificado como melhoria).
- **BUG-004** — `/favoritos` e `/calendario` retornam home silenciosamente (sintoma de conteúdo).
- **BUG-010 (este)** — mesma classe de rotas de BUG-004, mas sintoma específico de `<title>` inconsistente.

Os bugs têm causa raiz parcial em comum (roteamento sem fallback adequado para rotas autenticadas), mas tratam sintomas distintos com fixes complementares.

## Impacto no usuário

- SEO: motores de busca indexam `/favoritos` com title da home, criando duplicidade de conteúdo na SERP.
- UX: usuário em aba clicada não percebe que clicou em rota errada (title da aba não muda).
- A11y: leitores de tela anunciam título incorreto, dificultando navegação por usuários cegos.
- Métricas: analytics agregam pageviews da home com pageviews de rotas com fallback, distorcendo dados de acesso real à home.
