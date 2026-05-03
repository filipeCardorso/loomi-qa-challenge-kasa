# IMP-010 — evidências (cross-reference com BUG-011 e BUG-004)

Esta melhoria propõe **componente reutilizável `<EmptyState />`** pra unificar
o tratamento de "sem dados" em modais, calendário, favoritos e busca. Hoje
diversas situações sofrem de empty states mudos ou genéricos demais.

## Evidência cruzada — empty states problemáticos identificados

| Caso de uso | Origem | Arquivo | Estado atual |
|---|---|---|---|
| Modal "Melhores momentos" de partida finalizada | BUG-011 | [`evidence/BUG-011/manual-recapture-2026-05-03/findings.json`](../BUG-011/manual-recapture-2026-05-03/findings.json) | 3/3 modais distintos exibem `"Nada por aqui — Ainda não temos os melhores momentos da partida"` (mensagem fixa, sem CTA) |
| Modal "Melhores momentos" — screenshots | BUG-011 | [`evidence/BUG-011/manual-recapture-2026-05-03/modal-*.png`](../BUG-011/manual-recapture-2026-05-03/) | 3 partidas distintas (Minnesota Utd, Toronto FC, Chicago) — todas com mesma tela vazia |
| Rota `/favoritos` em sessão anônima | BUG-004 | [`evidence/BUG-004/screenshot-favoritos-anon.png`](../BUG-004/screenshot-favoritos-anon.png) | Não tem heading "Favoritos" nem empty state — silenciosamente cai na home |

## Estado atual resumido

| Cenário | Mensagem atual | Problema |
|---|---|---|
| Modal melhores momentos vazio | "Nada por aqui" + 1 frase fixa | Sem CTA, sem indicação se é problema de dados ou erro |
| `/favoritos` anônimo | Conteúdo da home | Empty state inexistente — usuário não sabe que precisa logar |
| Calendário sem partidas no dia | (verificar manualmente) | Provavelmente vazio sem CTA "Ver outros dias" |
| Busca sem resultados | (verificar manualmente) | Provavelmente vazio sem sugestões |

## Estado desejado (após IMP-010)

Componente reutilizável `<EmptyState />` com props:

```tsx
<EmptyState
  icon={<IconSparkles />}
  title="Sem partidas hoje"
  description="Mas tem 3 partidas amanhã com seus times."
  action={{ label: "Ver amanhã", onClick: goTomorrow }}
  secondary={{ label: "Mudar filtros", onClick: openFilters }}
/>
```

Aplicado a:

1. Modal melhores momentos: "Conteúdo em processamento" (24h) vs "Conteúdo indisponível" (mais antigo) — diferenciados por idade da partida
2. `/favoritos` anônimo: heading + CTA "Entrar pra ver favoritos"
3. Calendário vazio: CTA "Ver próximas semanas"
4. Busca sem resultados: sugestões baseadas em times populares

## Justificativa UX

- Reduz "wall" (parede branca) percebida em estados ausentes
- Oferece **next best action** (Nielsen #5)
- Diferencia "sem dado por enquanto" vs "sem dado nunca" — confiança
