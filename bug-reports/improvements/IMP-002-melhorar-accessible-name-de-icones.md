# IMP-002 — Melhorar accessible name de ícones

**Impacto:** High
**Categoria:** Acessibilidade
**Esforço estimado:** S
**Trello card:** https://trello.com/c/4pY9ttcj

## Contexto

Diversos botões da interface são apenas ícones (favoritar, fechar modal, navegação de calendário, hambúrguer, voltar). Sem accessible name adequado, leitores de tela anunciam apenas "button" ou o conteúdo SVG, o que é registrado em BUG-014 (axe `button-name` critical) e relacionado a BUG-002 (`aria-label` "Go to previous month" duplicado 35x).

## Problema observado

- Botões `<button>` sem texto, sem `aria-label` e sem `aria-labelledby`.
- `aria-label` em inglês ("Go to previous month") em uma UI em português, gerando inconsistência e ainda assim falhando porque está duplicado em 35 elementos.
- Ícones SVG decorativos não usam `aria-hidden="true"` quando deveriam.
- Falhas axe: `button-name` (critical), `link-name` (serious) — ver BUG-014 e BUG-016.

## Sugestão

1. Em todo botão somente-ícone, adicionar `aria-label` em **português** e único por contexto:
   - Favoritar: `aria-label="Favoritar partida {time A} x {time B}"`.
   - Calendário anterior/próximo: `aria-label="Mês anterior"` / `aria-label="Próximo mês"` (sem duplicar).
   - Fechar modal: `aria-label="Fechar"`.
2. Em SVGs puramente decorativos, marcar `aria-hidden="true"` e mover o texto para o botão pai.
3. Onde o ícone tem texto adjacente, usar `aria-labelledby` apontando para o `id` desse texto.
4. Validar com `axe-core` (já presente em `automation/`) — meta: 0 violações `button-name` e `link-name`.

## Por que melhora

- **Inclusão real:** usuários de leitor de tela conseguem operar a app.
- **Conformidade WCAG 2.1 AA** (critérios 1.1.1, 4.1.2).
- **Reduz risco legal** (LBI nº 13.146/2015 — Lei Brasileira de Inclusão).
- **SEO secundário:** crawlers entendem melhor a função dos elementos.

## Evidência

- BUG-002 — `bug-reports/bugs/BUG-002-aria-label-duplicado-go-to-previous-month.md`.
- BUG-014 — `bug-reports/bugs/BUG-014-a11y-button-name-critical.md`.
- BUG-016 — `bug-reports/bugs/BUG-016-a11y-link-name-serious.md`.
- Relatório axe: `bug-reports/evidence/IMP-002/axe-report-buttons.json` (a capturar).
