# IMP-005 — Feedback visual ao favoritar time/partida

> **Evidências:** ver [`bug-reports/evidence/IMP-005/cross-references.md`](../evidence/IMP-005/cross-references.md) — cross-reference com BUG-004 + verificação manual em Slow 3G.

**Impacto:** Medium
**Categoria:** UX
**Esforço estimado:** S
**Trello card:** https://trello.com/c/e1Wuzevd

## Contexto

A ação de favoritar (coração nos cards de partida e time) altera o estado interno, mas não fornece feedback visual claro: sem animação, sem snackbar, sem mudança imediata de cor com transição. O usuário fica em dúvida se a ação ocorreu, o que aumenta cliques duplicados (toggle indesejado).

## Problema observado

- Ícone de coração troca instantaneamente de outline para preenchido sem transição.
- Não há toast/snackbar ("Adicionado aos favoritos").
- Em conexão lenta (slow 3G), o ícone não mostra estado intermediário (loading spinner) — usuário clica novamente achando que falhou.
- Sem som ou haptic feedback no mobile.
- Estado não é refletido na rota `/favoritos` (vinculado a IMP-003).

## Sugestão

1. **Animação:** transição CSS de 200ms com leve scale (1 → 1.2 → 1) ao favoritar; fade do preenchimento.
2. **Toast:** mensagem curta "Adicionado aos favoritos" / "Removido dos favoritos" com botão "Desfazer" (reverte a ação por 5s).
3. **Estado de loading:** spinner pequeno no lugar do ícone enquanto a chamada de API está pending (com `aria-busy="true"`).
4. **Tratamento de erro:** se API falhar, reverter o estado visual e mostrar toast de erro com retry.
5. **Haptic mobile:** `navigator.vibrate(10)` em dispositivos compatíveis.
6. **A11y:** `aria-pressed="true|false"` no botão para refletir estado ao leitor de tela.

## Por que melhora

- **Reduz incerteza** — feedback é princípio fundamental de UX (Nielsen #1).
- **Diminui cliques duplicados acidentais** (toggle indesejado).
- **Aumenta percepção de qualidade** do produto.
- **Habilita "desfazer"** — feature requisitada por usuários em apps similares.

## Evidência

- Vídeo do clique sem feedback: `bug-reports/evidence/IMP-005/sem-feedback.webm` (a capturar).
- Comparativo com app de referência (Globo Esporte, OneFootball): `bug-reports/evidence/IMP-005/comparativo.png` (a capturar).
- HAR mostrando latência da chamada favorite: `bug-reports/evidence/IMP-005/network.har` (a capturar).
