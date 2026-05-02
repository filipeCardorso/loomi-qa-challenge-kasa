# BUG-005 — Zero `data-testid` em todo o site

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 0 ocorrências de `data-testid` em todas as páginas inspecionadas (home, /melhores-momentos, /calendario, modais)
**Regressão?:** Desconhecido (provavelmente nunca existiu)
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/ e às demais rotas.
- DevTools/console ou snapshot HTML salvo.

## Passos para reproduzir

1. Abrir https://www.kasa.live/ no Chromium.
2. No console executar:
   ```js
   document.querySelectorAll('[data-testid]').length;
   ```
3. Repetir nas rotas `/melhores-momentos`, `/calendario`, no modal de detalhe de partida e no popover do avatar (logado).
4. Conferir também os snapshots HTML em `docs/site-snapshots/exploration/`.

## Resultado esperado

- Elementos críticos de QA possuem `data-testid` único e estável:
  - Cards de partida, botões de favoritar, switch de Google Calendar, inputs de busca, botões de filtro, etc.
- Convenção documentada (kebab-case, prefixo por feature) e enforced em code review.

## Resultado obtido

- **0** elementos com `data-testid` em qualquer página/componente inspecionado.
- Automação E2E é forçada a usar seletores frágeis: aria-label (que ainda por cima é duplicado — vide BUG-002), texto visível em PT-BR (quebra se UI mudar), classes CSS auto-geradas pelo Chakra (mudam a cada build).

## Ambiente

- URL: https://www.kasa.live/ (e demais rotas)
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §6 ("Sem data-testid em lugar nenhum") e §9 (cheiro S5)
- `docs/site-snapshots/exploration/__exploration-raw.json`
- Screenshot: bug-reports/evidence/BUG-005/

## Workaround conhecido

- QA: usar combinação de role + accessible name + index relativo para construir seletores. Custo alto de manutenção e flakiness.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: time de frontend nunca incluiu `data-testid` como prática; testes E2E (se existem) usam outros seletores.
- Fix sugerido:
  1. Definir convenção: `data-testid="<feature>-<elemento>-<modificador>"` (ex.: `data-testid="match-card-favorite-button"`).
  2. Adicionar `data-testid` nos componentes críticos: cards de partida, botões de ação, inputs de busca, switches, modais, abas de navegação.
  3. Em build de produção, manter o atributo (custo de bytes desprezível).
  4. Lint rule (eslint-plugin-testing-library ou custom) avisando quando um componente de UI público não declara `data-testid`.

## Impacto no usuário

- Não impacta diretamente o usuário final, mas:
  - QA gasta mais tempo escrevendo/mantendo testes E2E.
  - Maior probabilidade de bugs chegarem em produção por testes serem instáveis e desabilitados.
  - Time de produto perde velocidade em refactors de UI por medo de quebrar testes.
