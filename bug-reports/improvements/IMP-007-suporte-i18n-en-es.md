# IMP-007 — Suporte a i18n (EN/ES)

**Impacto:** Low
**Categoria:** UX
**Esforço estimado:** L
**Trello card:** https://trello.com/c/B0UivRCI

## Contexto

A aplicação está exclusivamente em português. A presença de strings em inglês isoladas (ex.: `aria-label="Go to previous month"` — BUG-002) indica que parte do código vem de bibliotecas sem tradução. Para alcançar usuários hispano-falantes (mercado LATAM, especialmente Argentina e México) e anglófonos, é estratégico ter i18n.

## Problema observado

- Sem mecanismo de internacionalização — todas as strings hardcoded em PT-BR.
- `aria-label` em inglês quebra coerência (nem PT, nem traduzido).
- Datas formatadas só em pt-BR (ex.: "11º maio").
- Números, moeda, plurais não internacionalizados.
- Não há `<html lang>` dinâmico, nem hreflang em meta.

## Sugestão

1. **Biblioteca:** `react-intl` ou `i18next` (com `react-i18next`).
2. **Idiomas inicialmente:** PT-BR (padrão), EN, ES.
3. **Estrutura:** `src/locales/{pt-BR,en,es}/common.json` separados por feature/namespace.
4. **Detecção:** ordem `URL ?lang=` > `localStorage` > `navigator.language` > default PT-BR.
5. **Toggle visível:** dropdown no header com nomes nativos ("Português", "English", "Español").
6. **Datas/números:** `Intl.DateTimeFormat` e `Intl.NumberFormat` com locale dinâmico.
7. **SEO:** `<html lang>` dinâmico + `<link rel="alternate" hreflang>` para cada locale.
8. **A11y:** `aria-label` traduzido também.

## Por que melhora

- **Expansão de mercado** sem reescrever UI.
- **Coerência** — elimina mistura PT/EN.
- **SEO internacional** — hreflang melhora ranking por região.
- **Inclusão** de público que prefere ES/EN.

## Evidência

- BUG-002 — `bug-reports/bugs/BUG-002-aria-label-duplicado-go-to-previous-month.md` (string em inglês).
- Print mostrando "Go to previous month" no mês: `bug-reports/evidence/IMP-007/aria-en.png` (a capturar).
- Análise de mercado LATAM: `bug-reports/evidence/IMP-007/mercado-latam.md` (a gerar).
