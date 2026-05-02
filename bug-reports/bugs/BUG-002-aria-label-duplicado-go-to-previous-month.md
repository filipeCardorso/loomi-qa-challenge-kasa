# BUG-002 — 35 botões com mesmo aria-label "Go to previous month" na home

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 35/35 botões com aria-label idêntico (confirmado em sessão anônima e logada)
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/mJTsYQsn

## Pré-condição

- Página inicial https://www.kasa.live/ carregada (sessão anônima ou logada — reproduz nas duas).
- Ferramenta de inspeção de a11y (axe DevTools, Accessibility Insights) ou simples query DOM `document.querySelectorAll('[aria-label="Go to previous month"]').length`.

## Passos para reproduzir

1. Abrir https://www.kasa.live/.
2. Aguardar a renderização completa da home (cards de partida + barras de calendário inline).
3. No console executar `document.querySelectorAll('[aria-label="Go to previous month"]').length`.
4. (Opcional) Rodar o axe DevTools para listar issues de a11y por landmark/duplicidade.

## Resultado esperado

- Apenas 1 (no máximo 2) botões "Go to previous month" por viewport, cada um com `aria-label` único e contextualizado (ex.: "Voltar para abril de 2026 nos cards de partida").
- Nenhum scanner de a11y deve reportar `duplicate accessible name` para o conjunto.

## Resultado obtido

- 35 botões idênticos com `aria-label="Go to previous month"` na mesma página.
- aria-label em **inglês** num site **PT-BR**, o que também quebra o contexto de leitor de tela do usuário brasileiro.
- Screen readers vão anunciar "Go to previous month" repetido 35× ao tabular pela home, tornando o site praticamente inutilizável via teclado/leitor de tela.

## Ambiente

- URL: https://www.kasa.live/
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S2) e §13.7 (bug confirmado: aria-label duplicado)
- `docs/site-snapshots/exploration/__exploration-raw.json` (busca por `aria-label="Go to previous month"`)
- Screenshot: bug-reports/evidence/BUG-002/

## Workaround conhecido

- Usuários de leitor de tela: navegar via heading/landmark em vez de botão por botão. Não é mitigação real.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: componente de "card de partida" que inclui um mini-calendário/seletor de data foi reaproveitado N vezes na home sem que o `aria-label` do botão de navegação fosse parametrizado pelo contexto (data do card, time da partida, etc.).
- Fix sugerido:
  1. Tornar o `aria-label` dinâmico: incluir mês/ano alvo e contexto do card. Ex.: `aria-label="Ver partidas de abril de 2026 — Flamengo x Vasco"`.
  2. Traduzir para PT-BR (consistência de idioma).
  3. Se o botão é puramente decorativo dentro daquele contexto, marcar com `aria-hidden="true"` e expor um único controle global de navegação de mês.
  4. Adicionar regra no axe-core/Pa11y do CI que falhe quando houver `>1` aria-label idêntico na mesma página.

## Impacto no usuário

- A11y: usuários de leitor de tela perdem completamente a capacidade de distinguir cards/calendários da home. WCAG 2.1 violado (4.1.2 Name, Role, Value).
- Automação: testes E2E usando aria-label como seletor (Playwright `getByRole('button', { name: 'Go to previous month' })`) ficam inutilizáveis sem `.nth(n)`, gerando flakiness.
- SEO/qualidade percebida: ferramentas de auditoria (Lighthouse, axe) reportam score de a11y baixo.
