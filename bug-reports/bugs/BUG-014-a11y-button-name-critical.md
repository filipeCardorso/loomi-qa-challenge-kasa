# BUG-014 — A11y: violation button-name (impact=critical) em home anônima e logada

**Severidade:** Critical
**Prioridade:** P0
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 2/2 contextos testados (anônimo e logado)
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Ferramenta axe-core configurada para escanear violations.

## Passos para reproduzir

1. Carregar https://www.kasa.live/ como usuário anônimo.
2. Executar `axe.run()` filtrando `id === 'button-name'` e `impact === 'critical'`.
3. Realizar login (quando rota disponível) ou simular sessão autenticada.
4. Repetir o `axe.run()` na home logada.

## Resultado esperado

- Zero violations da regra `button-name` (WCAG 4.1.2). Todos os `<button>` devem ter nome acessível via texto interno, `aria-label`, `aria-labelledby` ou `title`.

## Resultado obtido

- Violation `button-name` (impact=critical) presente em ambos os contextos (anônimo e logado).
- Botões identificados sem nome acessível: ícones de ação no header (ex.: notificações, perfil), botões "X" de fechar modais, botões de play/pause em vídeos embed, botões de favoritar (estrela) sem `aria-label`.
- Para usuários de leitor de tela, esses controles são anunciados como `"botão"` sem qualquer descrição funcional.

## Ambiente

- URL: https://www.kasa.live/ (anônimo e logado)
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase 9 — A11y axe-core findings
- `docs/site-snapshots/a11y/` (output JSON axe.run() listando seletores afetados)
- Screenshot: bug-reports/evidence/BUG-014/

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Componentes de ícone (`<button><Icon /></button>`) sem texto acessível.
  2. Botões "fechar" usando apenas `×` (caractere visual) sem `aria-label="Fechar"`.
  3. Botões de favoritar com estrela SVG e nenhum `aria-label="Favoritar partida X"`.
- Fix sugerido:
  1. Auditar todos os `<button>` que contêm apenas SVG/ícone e adicionar `aria-label` descritivo.
  2. Para botões dinâmicos (ex.: favoritar), o label deve refletir o estado atual: `aria-label="Adicionar Flamengo aos favoritos"` ou `"Remover Flamengo dos favoritos"`.
  3. Configurar regra `eslint-plugin-jsx-a11y/control-has-associated-label` no nível erro.
  4. Adicionar teste E2E que conta `button[aria-label=""]` e `button:empty` e falha se > 0.

## Impacto no usuário

- A11y: usuários de leitor de tela não conseguem identificar a função dos botões — bloqueio total para PCDs visuais.
- Funcional: navegação por teclado expõe botões sem rótulo, criando confusão para todos os usuários.
- Conformidade: violação direta de WCAG 4.1.2 (Name, Role, Value) — critério obrigatório nível A.
- Legal: risco regulatório sob LBI e EU Accessibility Act.
