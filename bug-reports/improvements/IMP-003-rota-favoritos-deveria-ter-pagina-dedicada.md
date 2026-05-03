# IMP-003 — Rota `/favoritos` deveria ter página dedicada

> **Evidências:** ver [`bug-reports/evidence/IMP-003/cross-references.md`](../evidence/IMP-003/cross-references.md) — cross-reference com BUG-004 (GIF + screenshots do fallback silencioso) e BUG-010 (title genérico).

**Impacto:** Medium
**Categoria:** UX
**Esforço estimado:** M
**Trello card:** https://trello.com/c/NxxjipSZ

## Contexto

A rota `/favoritos` existe no header e é um caminho natural para o usuário ver tudo que marcou como favorito (times, campeonatos, partidas). Hoje ela faz **fallback silencioso** para a Home (BUG-004), sem tela própria, sem listagem e sem distinção de URL no contexto de produto.

## Problema observado

- Acessar `/favoritos` carrega o mesmo conteúdo da Home, sem qualquer indicação de que o roteador caiu em fallback.
- O usuário não consegue revisitar a lista de itens favoritados, exportar, remover em lote ou organizar por categoria.
- Sem página dedicada, não há ponto de entrada para futuras features (notificações por favorito, alertas de partida, etc.).
- Métrica de engajamento perdida: não dá para medir CTR na seção favoritos.

## Sugestão

Criar uma página `/favoritos` com:

1. **Tabs ou seções** por tipo: Partidas favoritas | Times favoritos | Campeonatos favoritos.
2. **Empty state** informativo (ver IMP-010): "Você ainda não favoritou nenhuma partida. Toque no coração em qualquer card para começar."
3. **Ação em massa:** desfavoritar múltiplos.
4. **Sincronização** com o estado global usado nos cards.
5. **Persistência** em `localStorage` (e backend, se houver login) — invalidar cache ao logout.
6. **SEO/meta:** `<title>Favoritos — Kasa</title>` e `description` própria.

## Por que melhora

- **Cumpre a expectativa** criada pelo link no header (princípio do menor susto).
- **Aumenta retenção:** usuário tem motivo para voltar.
- **Resolve BUG-004** de forma definitiva (em vez de só corrigir o fallback).
- **Habilita features futuras** (notificações, recomendações).

## Evidência

- BUG-004 — `bug-reports/bugs/BUG-004-favoritos-calendario-fallback-silencioso.md`.
- Print da rota carregando Home: `bug-reports/evidence/IMP-003/favoritos-fallback.png` (a capturar).
- HAR mostrando ausência de chamada API de favoritos: `bug-reports/evidence/IMP-003/network.har` (a capturar).
