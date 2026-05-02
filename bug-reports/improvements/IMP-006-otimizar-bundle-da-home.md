# IMP-006 — Otimizar bundle da Home

**Impacto:** High
**Categoria:** Performance
**Esforço estimado:** L
**Trello card:** https://trello.com/c/m4NfECwr

## Contexto

A Home apresenta Lighthouse Performance = **41** (BUG-018), bem abaixo do limiar saudável (>= 75). Métricas como LCP e TBT estão degradadas, impactando diretamente conversão, SEO (Core Web Vitals) e percepção de qualidade.

## Problema observado

- **Performance score 41/100** no Lighthouse mobile.
- Bundle JS principal grande (Chakra UI completo importado, sem tree-shaking efetivo).
- Imagens de escudos servidas em PNG sem `loading="lazy"` nem `srcset`/`sizes`.
- Múltiplas chamadas API em série no boot (poderiam ser paralelas).
- Web fonts carregadas sem `font-display: swap`.
- Sem code splitting por rota.
- Sem CDN para assets estáticos (servidos pelo Fly.io app).

## Sugestão

Plano em 3 ondas:

### Onda 1 — Quick wins (S)

- `loading="lazy"` em `<img>` abaixo da dobra.
- `font-display: swap` nas web fonts.
- `preconnect` para origens críticas (API, CDN de imagens).
- Habilitar gzip/brotli no servidor (verificar Fly.io config).

### Onda 2 — Bundle (M)

- Trocar imports de Chakra para sub-paths (`@chakra-ui/button` em vez do barrel).
- Code splitting por rota com `React.lazy` + `Suspense`.
- Remover dependências não usadas (analisar com `source-map-explorer`).
- Mover libs grandes (date-fns, lodash) para versões modulares.

### Onda 3 — Imagens e dados (L)

- Migrar escudos para WebP/AVIF com fallback PNG.
- CDN (Cloudflare/Bunny) com cache de longo prazo e `immutable`.
- Paralelizar fetches do boot (`Promise.all`).
- Pré-carregar dados críticos via `<link rel="preload" as="fetch">`.

**Meta:** Lighthouse Performance >= 80 mobile, LCP < 2.5s, TBT < 200ms.

## Por que melhora

- **SEO:** Core Web Vitals afetam ranking no Google.
- **Conversão:** cada 100ms de LCP reduz conversão em ~1% (Akamai).
- **Acessibilidade em conexões ruins** (3G, redes do interior).
- **Custo de CDN** menor com bundle menor.

## Evidência

- BUG-018 — `bug-reports/bugs/BUG-018-perf-home-lighthouse-41.md`.
- Lighthouse JSON: `bug-reports/evidence/IMP-006/lighthouse-home.json` (a capturar).
- Bundle analyzer: `bug-reports/evidence/IMP-006/bundle-stats.html` (a gerar).
- Network waterfall: `bug-reports/evidence/IMP-006/waterfall.png` (a capturar).
