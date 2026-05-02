# BUG-017 — SEO: https://www.kasa.live/sitemap.xml retorna 404 (sitemap inexistente)

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 5/5 tentativas
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/nkMqx4d2

## Pré-condição

- Acesso público à internet.
- Cliente HTTP (browser, curl, wget).

## Passos para reproduzir

1. Executar `curl -I https://www.kasa.live/sitemap.xml`.
2. Observar status code retornado.
3. Validar também via browser abrindo a URL diretamente.
4. Conferir `https://www.kasa.live/robots.txt` e ver se há referência ao sitemap.

## Resultado esperado

- HTTP 200 OK retornando XML válido conforme spec sitemaps.org, listando todas as URLs públicas indexáveis (home, /melhores-momentos, /calendario, páginas de partidas individuais, /termos-de-uso, /politicas-de-privacidade).
- `robots.txt` deve referenciar `Sitemap: https://www.kasa.live/sitemap.xml`.

## Resultado obtido

- `https://www.kasa.live/sitemap.xml` retorna HTTP 404.
- Sem sitemap, motores de busca dependem apenas de descoberta por crawl, perdendo páginas profundas e atualizações rápidas.

## Ambiente

- URL: https://www.kasa.live/sitemap.xml
- Browser/versão: Chromium 130 (Playwright headless) e curl 8.x
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase SEO — sitemap inexistente
- `docs/site-snapshots/seo/` (response headers de /sitemap.xml e /robots.txt)
- Screenshot: bug-reports/evidence/BUG-017/

## Workaround conhecido

- Nenhum. Motores de busca seguirão descobrindo URLs por crawl orgânico, mas mais lentamente.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Sitemap nunca foi gerado.
  2. Build não emite sitemap.xml estaticamente nem dinamicamente.
- Fix sugerido:
  1. Se Next.js: usar `next-sitemap` ou App Router com `app/sitemap.ts`.
  2. Listar URLs estáticas + URLs dinâmicas (partidas, melhores momentos por jogo) na geração.
  3. Atualizar `robots.txt` para incluir `Sitemap: https://www.kasa.live/sitemap.xml`.
  4. Submeter sitemap ao Google Search Console e Bing Webmaster Tools.
  5. Adicionar teste E2E que valida `expect(await page.goto('/sitemap.xml')).toHaveStatus(200)` e que content-type é `application/xml`.

## Impacto no usuário

- SEO: descoberta mais lenta de páginas novas/atualizadas; perda de tráfego orgânico.
- Negócio: site esportivo com agenda dinâmica (jogos diários) precisa de sitemap atualizado para indexar partidas em tempo hábil.
- Concorrência: Globoesporte, OneFootball e SofaScore têm sitemaps robustos — Kasa fica em desvantagem competitiva nas SERPs.
