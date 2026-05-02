# BUG-009 — Calendário com número de dia duplicado: "11º maio" / "1111º maio"

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** Reproduzível em múltiplos dias renderizados na faixa de calendário inline (em particular dia 1 vira "11º")
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/SMQpbiPQ

## Pré-condição

- Acesso público a https://www.kasa.live/ e/ou https://www.kasa.live/calendario.
- Período em que o calendário mostre dias de 1 dígito (ex.: 1, 2, 3 do mês).

## Passos para reproduzir

1. Abrir https://www.kasa.live/.
2. Localizar a faixa horizontal de calendário (mini-calendário inline).
3. Observar o texto dos botões de dia. Em particular o dia "1º maio" aparece renderizado como **"11º maio"**, e em alguns layouts como **"1111º maio"** (número repetido junto com o ordinal).
4. Reproduzir também em `/calendario` na visão semanal.

## Resultado esperado

- Cada botão exibe o número do dia uma única vez, seguido do mês — ex.: `"1º maio"`, `"2 mai"`, ou `"01/05"` (qualquer formato consistente, sem duplicação).

## Resultado obtido

- O número aparece duplicado: `"11º maio"` em vez de `"1º maio"`, e em variações layout-dependentes `"1111º maio"`.
- Provável concatenação dupla do número do dia: uma vez como label numérico e outra como parte do "ordinal" (ex.: template `"${day}${day}º ${month}"` ou render duplicado por chave instável).

## Ambiente

- URL: https://www.kasa.live/ e https://www.kasa.live/calendario
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S9) e §15.7 (S12 — vista semanal cortada em /calendario)
- `docs/site-snapshots/exploration/` (screenshots e dump de DOM da home + /calendario)
- Screenshot: bug-reports/evidence/BUG-009/

## Workaround conhecido

- Nenhum no lado do usuário. Visualmente conseguem inferir o dia, mas screen readers anunciam o número duplicado ("onze" em vez de "um").

## Sugestão de fix / hipótese de causa raiz

- Hipótese: template do botão de dia faz `${day}${ordinalSuffix(day)}` mas `ordinalSuffix` está retornando `${day}º` em vez de só `º` — então o número aparece duas vezes. Em layouts maiores, o componente é renderizado repetido (ex.: `${day}${day}${ordinalSuffix(day)}`) somando "1111º".
- Fix sugerido:
  1. Inspecionar a função de formatação de dia (`formatDayLabel(day)`) e garantir que o sufixo ordinal retorne só `"º"`, não `"${day}º"`.
  2. Usar `Intl.DateTimeFormat` ou biblioteca consolidada (date-fns/dayjs) com locale `pt-BR`.
  3. Adicionar snapshot test do componente de calendário cobrindo dias 1, 2, 10, 21 e 31.
  4. Cobrir com teste E2E que valide o regex do label (`/^(\d{1,2})(º)?\s/`).

## Impacto no usuário

- UX: confusão visual ("11º maio" sugere dia 11, não dia 1).
- A11y: leitor de tela anuncia o dia errado.
- Confiabilidade percebida: bug visível na primeira tela do site reduz confiança na qualidade do produto inteiro.
