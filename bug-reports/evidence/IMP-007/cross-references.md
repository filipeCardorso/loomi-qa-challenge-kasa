# IMP-007 — evidências (cross-reference com BUG-002)

Esta melhoria propõe **suporte a i18n (PT-BR / EN / ES)** com infraestrutura
react-intl ou i18next. Evidência do problema atual está em BUG-002.

## Evidência do problema atual

| Origem | Arquivo | Conteúdo |
|---|---|---|
| BUG-002 | [`evidence/BUG-002/console-output.txt`](../BUG-002/console-output.txt) | Console: `aria-label="Go to previous month"` — string em **inglês** num site **pt-BR** |
| BUG-002 | [`evidence/BUG-002/screenshot-datepicker-rdp.png`](../BUG-002/screenshot-datepicker-rdp.png) | Screenshot mostrando aria-label não-localizado |
| BUG-002 | [`evidence/BUG-002/recapture-2026-05-03.json`](../BUG-002/recapture-2026-05-03.json) | Re-validação 2026-05-03: `Go to previous month` ainda presente em 1 ocorrência |

## Estado atual resumido

- Strings da UI em pt-BR (interface visível)
- **Strings de a11y (aria-label) em inglês** no datepicker do header (`react-day-picker` não-localizado)
- Sem detecção de `Accept-Language` nem toggle de idioma na UI
- Mercado LATAM (Argentina, Chile, Colombia, México) não atendido em ES

## Estado desejado (após IMP-007)

| Sub-feature | Comportamento |
|---|---|
| Infraestrutura | `i18next` + arquivos `locales/{pt|en|es}/common.json` |
| Detecção | URL slug (`/en`, `/es`) > localStorage > `navigator.language` |
| Cobertura | 100% das strings da UI + aria-labels + alt + title |
| SEO | `<html lang>` dinâmico + `<link rel="alternate" hreflang>` |
| Dates | `Intl.DateTimeFormat(locale)` em vez de strings literais |
| Plurais | ICU MessageFormat (`{count, plural, one {1 partida} other {# partidas}}`) |

## Mercado / motivação

Brasil + Argentina + Chile + Colombia + México = ~600M habitantes. ES é
chave pra expansão regional natural do produto (futebol é universal LATAM).

## Validação automatizada esperada

- Spec axe-core não acusa `aria-label="Go to previous month"` em qualquer rota
- Spec verifica que `navigator.language='es-AR'` carrega bundle ES
