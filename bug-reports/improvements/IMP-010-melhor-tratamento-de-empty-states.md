# IMP-010 — Melhor tratamento de empty states

**Impacto:** Medium
**Categoria:** UX
**Esforço estimado:** S
**Trello card:** https://trello.com/c/AhKOKfrs

## Contexto

Diversas áreas da app podem apresentar estado vazio: nenhuma partida no dia, nenhum favorito, modal de partida finalizada sem dados (BUG-011), busca sem resultado, etc. Hoje a maioria desses casos cai em **estado mudo** (tela em branco, modal vazio, ausência de mensagem) — péssima experiência.

## Problema observado

- Modal de partida finalizada abre **sempre vazio** (BUG-011).
- Calendário em datas sem jogos não mostra mensagem.
- `/favoritos` faz fallback silencioso (BUG-004) — não há "você não tem favoritos".
- Busca (rota `/buscar` retorna 404 — ver IMP-011), mas mesmo nas buscas internas existentes, sem resultado fica em branco.
- Não há diferenciação entre **erro** (falha de API) e **vazio** (sem dados).

## Sugestão

Padronizar componente `<EmptyState />` com props:

- `icon` (ilustração leve, SVG inline para evitar request).
- `title` (curto, ação ou explicação — "Nenhuma partida hoje").
- `description` (1 frase orientadora — "Que tal explorar partidas dos próximos dias?").
- `action` (CTA opcional — botão "Ver calendário").

Aplicar em:

1. **Modal de partida finalizada vazio** (BUG-011): "Esta partida ainda não tem dados disponíveis."
2. **Calendário em dia sem jogos**: "Nenhuma partida em DD/MM" + CTA "Ir para hoje".
3. **`/favoritos` vazia**: "Você ainda não favoritou nada" + CTA "Ver partidas".
4. **Busca sem resultado**: "Nenhum resultado para 'XYZ'" + sugestão de termos.
5. **Erro de API**: estado distinto com retry — "Não foi possível carregar. Tentar novamente?"

## Por que melhora

- **Reduz a sensação de quebra** — o usuário entende o que aconteceu.
- **Conduz à próxima ação** (princípio do _next best action_).
- **Cobre vários bugs com uma só implementação** (BUG-011, BUG-004, parcialmente IMP-011).
- **Melhora métricas:** menos bounces e tickets "está quebrado".

## Evidência

- BUG-011 — `bug-reports/bugs/BUG-011-modal-partida-finalizada-sempre-vazio.md`.
- BUG-004 — `bug-reports/bugs/BUG-004-favoritos-calendario-fallback-silencioso.md`.
- Print modal vazio: `bug-reports/evidence/IMP-010/modal-vazio.png` (a capturar).
- Print calendário em dia sem jogos: `bug-reports/evidence/IMP-010/calendario-sem-jogos.png` (a capturar).
