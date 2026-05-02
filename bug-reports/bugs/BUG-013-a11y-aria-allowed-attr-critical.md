# BUG-013 — A11y: violation aria-allowed-attr (impact=critical) em todas as 5 rotas testadas

**Severidade:** Critical
**Prioridade:** P0
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 5/5 rotas testadas com axe-core
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Ferramenta axe-core (via @axe-core/playwright ou extensão de browser) instalada.

## Passos para reproduzir

1. Carregar https://www.kasa.live/ (home anônima).
2. Executar `axe.run()` ou `AxeBuilder().analyze()` na página.
3. Filtrar violations por `id === 'aria-allowed-attr'` e `impact === 'critical'`.
4. Repetir para as rotas: `/melhores-momentos`, `/calendario`, `/termos-de-uso`, `/politicas-de-privacidade`.

## Resultado esperado

- Zero violations da regra `aria-allowed-attr` (WCAG 4.1.2). Cada elemento ARIA deve usar apenas atributos permitidos para seu role.

## Resultado obtido

- Violation `aria-allowed-attr` (impact=critical) presente em 5/5 rotas testadas.
- Padrão identificado: elementos com role inválido recebem atributos ARIA não suportados (ex.: `aria-pressed` em `<div>` sem role="button", `aria-expanded` em elementos não interativos).
- Conta-se a violação em múltiplos nós por página (home com >5 ocorrências).

## Ambiente

- URL: https://www.kasa.live/, /melhores-momentos, /calendario, /termos-de-uso, /politicas-de-privacidade
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase 9 — A11y axe-core findings
- `docs/site-snapshots/a11y/` (output JSON de axe.run() por rota)
- Screenshot: bug-reports/evidence/BUG-013/

## Workaround conhecido

- Nenhum no lado do usuário. Tecnologias assistivas podem ignorar ou anunciar incorretamente os elementos afetados.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Componentes customizados (ex.: `<div onClick>`) recebem atributos ARIA sem o role apropriado.
  2. Bibliotecas de UI desatualizadas estão emitindo combinações inválidas (ex.: Radix/Headless UI com versão antiga).
  3. Atributo `aria-controls` apontando para id inexistente.
- Fix sugerido:
  1. Rodar `axe-core` localmente e enumerar nós afetados por seletor CSS.
  2. Para cada componente, ou (a) adicionar role correto (ex.: `role="button"`) ou (b) substituir por elemento semântico (`<button>`).
  3. Adicionar regra de lint `eslint-plugin-jsx-a11y` configurada no nível de erro.
  4. Adicionar teste E2E `axe.run()` no pipeline CI que falhe em qualquer violação `critical`.

## Impacto no usuário

- A11y: usuários de tecnologias assistivas (NVDA, JAWS, VoiceOver) podem não conseguir interagir com elementos críticos da UI.
- Conformidade legal: WCAG 2.1 AA é requisito da Lei Brasileira de Inclusão (LBI) e da EU Accessibility Act 2025.
- Risco jurídico: site público com violations critical aumenta exposição a ações por discriminação.
- Reputação: marca esportiva com público amplo (incluindo PCDs) deve atender padrões a11y.
