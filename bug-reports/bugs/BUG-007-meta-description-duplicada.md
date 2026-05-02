# BUG-007 — Tag `<meta name="description">` aparece duplicada no HTML

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 2/1 — sempre que a home é renderizada, há 2 tags `<meta name="description">`
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/qJGFStBU

## Pré-condição

- Acesso público a https://www.kasa.live/.

## Passos para reproduzir

1. Abrir https://www.kasa.live/.
2. Inspecionar o `<head>` (View Source ou DevTools).
3. Executar no console:
   ```js
   document.querySelectorAll('head meta[name="description"]').length;
   ```
4. Verificar valores via `Array.from(document.querySelectorAll('head meta[name="description"]')).map(m => m.content)`.

## Resultado esperado

- Exatamente **1** tag `<meta name="description">` por página, com texto descritivo único e ≤ 160 caracteres.
- Validação por Lighthouse / SEO scanners passando sem warning de "duplicate description".

## Resultado obtido

- A página retorna **2** tags `<meta name="description">` no `<head>`. Crawlers (Google, Bing) podem usar qualquer uma delas (ou nenhuma) e ferramentas de SEO reportam warning de tag duplicada.

## Ambiente

- URL: https://www.kasa.live/
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S7)
- `docs/site-snapshots/exploration/__exploration-raw.json` (HTML completo da home)
- Screenshot: bug-reports/evidence/BUG-007/

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: a tag `<meta name="description">` é definida tanto no `_document.tsx` (estática) quanto no `<Head>` da página (dinâmica), e o Next.js não está deduplicando porque os atributos `key` não foram explicitamente definidos.
- Fix sugerido:
  1. No `<Head>`, sempre passar `key="description"` para que o Next consolide tags repetidas.
  2. Auditar `_document.tsx` e `_app.tsx` e remover description estática se houver uma dinâmica.
  3. Adicionar teste de smoke: `expect(page.locator('head meta[name="description"]')).toHaveCount(1)` em cada rota.
  4. Adicionar Lighthouse SEO no CI com threshold ≥ 90.

## Impacto no usuário

- SEO: penalidade leve em rankings, possível description "errada" sendo escolhida pelo Google.
- Branding: snippet inconsistente entre Google Search e Bing.
- QA: indica processo de revisão de SEO frouxo.
