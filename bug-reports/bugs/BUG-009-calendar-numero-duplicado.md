# BUG-009 — Botões do calendário expõem texto duplicado em `textContent` ("11º maio")

**Severidade:** Low
**Prioridade:** P3
**Status:** Open (re-investigado em 2026-05-03)
**Reproduzibilidade:** Sempre (no DOM); nunca (visualmente)
**Frequência observada:** 11/31 botões `.rdp-day` no date picker da home expõem `textContent` duplicado
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

- Visualmente o calendário renderiza **corretamente**: dias 1, 2, 3 ... 31 sem duplicação (ver `screenshot-calendar.png`).
- Porém, o `textContent` dos botões `.rdp-day` aparece duplicado: `"11º maio (sexta-feira)"` em vez de `"1º maio"`.
- Causa raiz: o `react-day-picker` empilha dois spans no botão:
  - `<span aria-hidden="true">1</span>` — número visível
  - `<span class="rdp-vhidden">1º maio (sexta-feira)</span>` — label acessível (oculto por CSS)

  Quando código JS lê `el.textContent`, ele concatena os dois spans, gerando `"11º maio..."`. Isso afeta:
  - Ferramentas de QA/automação que dependem de `textContent` para asserts ou seletores
  - Crawlers/indexadores que extraem texto do DOM bruto
  - Alguns leitores de tela mais antigos podem anunciar "1, 1º maio (sexta-feira)" ao invés de só "1º maio (sexta-feira)"

- Em buttons com 2 dígitos (ex. dia 11) o textContent vira `"1111º maio (segunda-feira)"`. Em 1 dígito (ex. dia 1) vira `"11º maio (sexta-feira)"`.

## Ambiente

- URL: https://www.kasa.live/ e https://www.kasa.live/calendario
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S9) e §15.7 (S12 — vista semanal cortada em /calendario)
- `docs/site-snapshots/exploration/` (screenshots e dump de DOM da home + /calendario)
- Screenshot recortado do componente: `bug-reports/evidence/BUG-009/screenshot-calendar-duplicate.png` (mostra que visualmente os dias estão CORRETOS — bug é só no DOM/textContent). Mesmo screenshot usado em BUG-002: justificado, é o mesmo elemento `react-day-picker` no datepicker da home expondo dois bugs ortogonais (aria-label genérico em inglês para BUG-002; duplicação de textContent para BUG-009).
- Dump JSON com 31 ocorrências e 11 com pattern duplicado: `bug-reports/evidence/BUG-009/duplicate-text-findings.json`
- Recaptura 2026-05-03 (ordem dos botões + contagem): `bug-reports/evidence/BUG-009/recapture-calendario-2026-05-03.json` (rota /calendario hoje não tem datepicker — confirma que o bug é específico do datepicker da home).

## Workaround conhecido

- Nenhum no lado do usuário. Visualmente conseguem inferir o dia, mas screen readers anunciam o número duplicado ("onze" em vez de "um").

## Sugestão de fix / hipótese de causa raiz

- Causa raiz confirmada: padrão padrão do `react-day-picker` que mantém um span visível com o número (`aria-hidden="true"`) e um span oculto via CSS (`.rdp-vhidden`) com o label completo para leitores de tela. Quando JS lê `textContent` os dois são concatenados.
- Fix sugerido (defensivo, opcional):
  1. Sobrescrever `formatDay` no react-day-picker para que o aria-label não comece com o mesmo dígito (ex.: `"Dia 1, 1º de maio (sexta-feira)"`) — assim mesmo concatenado, fica humanamente legível.
  2. Documentar internamente que asserts/automação devem usar o span visível (`.rdp-day > span[aria-hidden="true"]`), não `textContent` do botão inteiro.
  3. Considerar suprimir o span vhidden e usar `aria-label` direto no `<button>` — mais simples, sem duplicação de DOM.

## Impacto no usuário

- UX visual: nenhum (renderização correta).
- Automação/QA: testes que usam `textContent` do botão recebem string confusa ("11º maio") em vez de "1".
- Confiabilidade percebida: tooling externo (analytics, crawlers) pode reportar duplicação que não existe visualmente.

> **Reclassificação 2026-05-03:** o bug foi originalmente reportado como Medium/visível. Após reinvestigação, é Low/só-DOM. Mantido na lista por relevância pra automação e como dívida técnica de a11y.
