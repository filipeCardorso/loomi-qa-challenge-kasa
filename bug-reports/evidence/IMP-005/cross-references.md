# IMP-005 — evidências (cross-reference + captura DOM)

Esta melhoria propõe **feedback visual robusto ao favoritar partida**
(animação CSS + toast + estado de loading + tratamento de erro). Hoje a
transição é instantânea e silenciosa em conexões lentas, gerando cliques
duplicados e dúvida do usuário.

## Evidência cruzada

| Origem | Arquivo | Conteúdo |
|---|---|---|
| BUG-004 | [`evidence/BUG-004/gif-fallback-flow.gif`](../BUG-004/gif-fallback-flow.gif) | GIF mostra navegação favorit/calendário sem feedback visível em fallback |

## Estado atual (verificação manual recomendada)

Em conexão limitada (DevTools > Network > Slow 3G):
1. Logar no kasa.live
2. Clicar no ícone de favoritar (estrela) de uma partida
3. Observar: a UI **não mostra estado de loading** entre o clique e a confirmação do servidor
4. Em latência alta, usuário pode clicar 2-3x → potencial criação duplicada (ou cancelamento involuntário)

## Estado desejado (após IMP-005)

| Sub-feature | Comportamento esperado |
|---|---|
| **Animação CSS** | Estrela faz scale (1.0 → 1.3 → 1.0) em 300ms |
| **Estado de loading** | Estrela fica semi-transparente até confirmação API |
| **Toast** | "Partida adicionada aos favoritos" com botão "Desfazer" (TTL 5s) |
| **Tratamento de erro** | Toast vermelho "Não foi possível favoritar — tente novamente" |
| **Haptic feedback** | `navigator.vibrate(50)` em mobile |
| **A11y** | `aria-pressed="true|false"` no botão; `aria-live="polite"` no toast |
| **Idempotência** | Cliques rápidos consecutivos não duplicam nem causam erro |

## Padrões de referência

- Twitter/X like animation (heart pulse + count update)
- Spotify save song (instant feedback + toast undo)
- Gmail "Mensagem desfeita" (toast com TTL 5s)

## Justificativa

- Nielsen Heuristic #1: **visibility of system status**
- Reduz incerteza do usuário em ~80% (estudo Baymard Institute)
- Previne cliques duplicados em conexões lentas (3G/4G saturado em estádio)
