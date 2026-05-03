# IMP-003 — evidências (cross-reference com BUG-004)

Esta melhoria propõe criar página dedicada para `/favoritos` (hoje a rota
silenciosamente cai na home). Evidência principal está em BUG-004.

## Evidência do problema atual

| Origem | Arquivo | Conteúdo |
|---|---|---|
| BUG-004 | [`evidence/BUG-004/gif-fallback-flow.gif`](../BUG-004/gif-fallback-flow.gif) | GIF mostrando navegação `/favoritos` em sessão anônima → conteúdo da home renderiza, sem aviso |
| BUG-004 | [`evidence/BUG-004/screenshot-favoritos-anon.png`](../BUG-004/screenshot-favoritos-anon.png) | Screenshot da rota `/favoritos` (URL exata) com conteúdo da home (não dedicado) |
| BUG-004 | [`evidence/BUG-004/screenshot-favoritos-fallback.png`](../BUG-004/screenshot-favoritos-fallback.png) | Confirmação visual da discrepância URL ↔ conteúdo |
| BUG-010 | [`evidence/BUG-010/comparison.txt`](../BUG-010/comparison.txt) | Tabela de `<title>` por rota — `/favoritos` mantém title genérico da home (não há contexto) |

## Estado atual resumido

- Rota `/favoritos` retorna HTTP 200 com conteúdo idêntico à home (anônimo)
- Sem heading "Favoritos", sem empty state, sem CTA "Entrar pra ver favoritos"
- `<title>` permanece "Kasa.Live - Encontre o Jogo" em vez de "Favoritos | Kasa.Live"

## Estado desejado (após IMP-003)

- Página dedicada com heading "Favoritos", empty state, ação em massa, persistência cross-device
- Anônimo: redireciona pra `/login` ou abre modal de login imediato
- Autenticado: lista favoritos com filtros (times | partidas | tabs)
- Title contextual ("Favoritos | Kasa.Live")
