# BUG-016 — A11y: violation link-name (serious) — links sem nome acessível (ex.: ícones de redes sociais no footer)

**Severidade:** High
**Prioridade:** P1
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** Presente em todas as rotas (footer compartilhado)
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/pnSvKiDW

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Ferramenta axe-core para detecção de violations.

## Passos para reproduzir

1. Carregar https://www.kasa.live/.
2. Executar `axe.run()` filtrando `id === 'link-name'` e `impact === 'serious'`.
3. Inspecionar os links afetados — em particular o footer com ícones de Instagram, Facebook, Twitter/X.
4. Validar que `<a href="https://instagram.com/...">` contém apenas SVG sem `aria-label`, `aria-labelledby` ou texto visível.

## Resultado esperado

- Todo `<a>` deve ter nome acessível via:
  - texto visível, ou
  - `aria-label="Instagram do Kasa"`, ou
  - `<img alt="Instagram">` dentro do link, ou
  - `aria-labelledby` referenciando texto associado.

## Resultado obtido

- Links de redes sociais no footer (Instagram, Facebook, Twitter/X, possivelmente YouTube) renderizam apenas o ícone SVG sem qualquer nome acessível.
- Leitor de tela anuncia esses links como `"link"` sem indicar destino (Instagram, Facebook, etc.).
- Outros links de navegação secundária podem estar afetados (ícones-link no header).

## Ambiente

- URL: https://www.kasa.live/ (footer presente em todas rotas)
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase 9 — A11y axe-core findings
- `docs/site-snapshots/a11y/` (output JSON axe.run() listando seletores afetados)
- Screenshot: bug-reports/evidence/BUG-016/

## Workaround conhecido

- Nenhum no lado do usuário. Visualmente o usuário identifica pelo logo, mas usuários de leitor de tela ficam sem informação.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Componente `<SocialIcon />` aceita `href` mas não força `aria-label`.
  2. Designer/dev assumiu que SVG do ícone seria suficiente, sem considerar leitor de tela.
- Fix sugerido:
  1. Adicionar `aria-label` em todos os links sociais: `<a href="..." aria-label="Instagram do Kasa">`.
  2. Alternativamente, incluir texto visualmente oculto via classe `.sr-only`.
  3. Configurar `eslint-plugin-jsx-a11y/anchor-has-content` no nível erro.
  4. Adicionar teste E2E que percorre `a[href]` e valida que cada link tem texto acessível (`page.getByRole('link', { name: /.+/ })`).

## Impacto no usuário

- A11y: usuários de leitor de tela não sabem para onde os links levam — funcionalidade inacessível.
- SEO: motores de busca usam texto de âncora para entender destino; ícones sem texto perdem ranking.
- UX: usuários de teclado navegando via Tab não recebem feedback claro do destino.
- Conformidade: WCAG 2.4.4 (Link Purpose) — critério nível A.
