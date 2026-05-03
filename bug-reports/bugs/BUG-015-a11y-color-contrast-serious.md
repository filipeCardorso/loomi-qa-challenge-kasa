# BUG-015 — A11y: violation color-contrast (serious) em todas as 5 rotas testadas

**Severidade:** High
**Prioridade:** P1
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 5/5 rotas testadas
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/N7RrCrN1

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Ferramenta axe-core para análise de contraste.

## Passos para reproduzir

1. Carregar https://www.kasa.live/.
2. Executar `axe.run()` filtrando `id === 'color-contrast'` e `impact === 'serious'`.
3. Anotar elementos afetados (texto cinza claro sobre fundo branco, badges de status com baixa diferença, links secundários).
4. Repetir para `/melhores-momentos`, `/calendario`, `/termos-de-uso`, `/politicas-de-privacidade`.

## Resultado esperado

- Razão de contraste mínima de 4.5:1 para texto normal e 3:1 para texto grande (WCAG 1.4.3 nível AA).

## Resultado obtido

- Violation `color-contrast` (impact=serious) presente em 5/5 rotas testadas.
- Múltiplos pares de cores com razão abaixo de 4.5:1 — incluindo:
  - Texto secundário cinza claro (`#9CA3AF` aprox) sobre fundo branco.
  - Badges de status (cinzas/cinzas-azulados) sobre fundo claro.
  - Links no rodapé com cor abaixo do mínimo.
- Footer e seções de conteúdo informativo são os mais afetados.

## Ambiente

- URL: https://www.kasa.live/, /melhores-momentos, /calendario, /termos-de-uso, /politicas-de-privacidade
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase 9 — A11y axe-core findings
- `docs/site-snapshots/a11y/` (output JSON axe.run() com pares de cores e razões)
- Output axe-core (re-executado em 2026-05-03 contra home anônima): `bug-reports/evidence/BUG-015/axe-color-contrast.json` — contagem de nós varia por execução (a regra detecta cores dinâmicas)

## Workaround conhecido

- Usuários podem aumentar zoom (Ctrl/Cmd +) ou ativar modo alto contraste do SO. Não resolve para usuários com daltonismo ou baixa visão moderada.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Design system com tokens de cor não auditados para contraste.
  2. Cores secundárias (cinzas) escolhidas apenas por estética sem testar com Stark/Contrast Checker.
- Fix sugerido:
  1. Auditar tokens de cor (ex.: Tailwind palette) e validar pares texto/fundo via ferramenta como Stark, Contrast Checker ou axe DevTools.
  2. Substituir cinza claro `text-gray-400` por `text-gray-600` (ou equivalente) em texto secundário.
  3. Definir mínimo de contraste no design system e aplicar via tokens semânticos (`color-text-secondary` que sempre passa AA).
  4. Adicionar teste CI com axe-core que falhe em violations `serious`.

## Impacto no usuário

- A11y: usuários com baixa visão, daltonismo ou astigmatismo não conseguem ler texto secundário/badges.
- Mobile: contraste baixo é amplificado por brilho de tela em ambientes externos (sol).
- Conformidade: WCAG 1.4.3 AA exigido por LBI e EU Accessibility Act.
- Conversão: texto ilegível em CTAs, badges de status e links pode reduzir engagement.
