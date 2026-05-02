# BUG-010 — Title de rotas inválidas é "Página não encontrada", mas /favoritos (que cai na home) mantém title genérico

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 5/5 tentativas em rotas de fallback testadas
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Capacidade de inspecionar `<title>` via DevTools ou `document.title`.

## Passos para reproduzir

1. Abrir https://www.kasa.live/rota-que-nao-existe-xyz.
2. Observar `document.title` — exibe `"Página não encontrada"` (correto).
3. Abrir https://www.kasa.live/favoritos (rota que faz fallback silencioso para a home — ver BUG-004).
4. Observar `document.title` — continua exibindo o title genérico da home (`"Kasa - O melhor do futebol em um só lugar"`), apesar de a URL solicitada não existir oficialmente como rota mapeada.
5. Repetir o teste para outras rotas que não retornam 404 mas também não correspondem a páginas reais (`/calendar`, `/perfil`, `/buscar`, `/login` — todas listadas em BUG-003).

## Resultado esperado

- Toda rota inválida deve apresentar `<title>` consistente — `"Página não encontrada"` — independentemente de retornar 404 explícito ou cair em fallback silencioso.
- Alternativamente, rotas com fallback intencional (ex.: `/favoritos` → home) deveriam ser explicitamente redirecionadas (HTTP 301/302) para `/`, garantindo que o title da home seja semanticamente correto.

## Resultado obtido

- `/favoritos`, `/calendar`, `/perfil`, `/buscar`, `/login` retornam HTTP 200 mas exibem o title da home, escondendo o fato de que a rota não está implementada.
- Apenas rotas claramente quebradas (ex.: `/rota-aleatoria-xyz`) recebem o title `"Página não encontrada"`.
- Inconsistência de comportamento entre rotas inválidas distintas.

## Ambiente

- URL: https://www.kasa.live/favoritos, /calendar, /perfil, /buscar, /login, /rota-aleatoria-xyz
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §10 (cheiro S10 — title inconsistente em rotas inválidas)
- `docs/site-snapshots/exploration/` (dump de `document.title` por rota)
- Screenshot: bug-reports/evidence/BUG-010/

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: o roteador (provavelmente Next.js / React Router) tem catch-all que renderiza `Home` em vez de `NotFound` para certas rotas (relacionado a BUG-004).
- Fix sugerido:
  1. Mapear rotas válidas explicitamente e enviar todas as outras para o componente `NotFound`, garantindo `<title>` correto.
  2. Para rotas planejadas mas ainda não implementadas (`/favoritos`, `/calendar`, `/perfil`, `/buscar`, `/login`), exibir página de "em construção" com title específico (`"Em breve - Kasa"`).
  3. Adicionar teste E2E que percorre lista de rotas inválidas conhecidas e valida `expect(page).toHaveTitle(/Página não encontrada/)`.

## Impacto no usuário

- SEO: motores de busca indexam URLs inválidas com title da home, criando duplicidade de conteúdo.
- UX: usuário em aba clicada não sabe que clicou em rota errada (title da aba não muda).
- A11y: leitores de tela anunciam título incorreto, dificultando navegação por usuários cegos.
- Métricas: analytics agregam pageviews da home com pageviews de rotas inválidas, distorcendo dados.
