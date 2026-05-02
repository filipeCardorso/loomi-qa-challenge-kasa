# BUG-018 — Performance: Lighthouse score 41 na home (vs 95 em /melhores-momentos, 97 em /termos-de-uso)

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 3/3 execuções de Lighthouse na home
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/QVVET5c2

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Lighthouse CLI ou DevTools instalado.

## Passos para reproduzir

1. Abrir DevTools no Chromium e ir até aba "Lighthouse" (ou rodar `npx lighthouse https://www.kasa.live/ --only-categories=performance --view`).
2. Selecionar categoria Performance, dispositivo Desktop, throttling padrão.
3. Executar análise.
4. Observar Performance Score.
5. Repetir o procedimento para `/melhores-momentos` e `/termos-de-uso`.

## Resultado esperado

- Performance Score >= 80 em rotas públicas core (especialmente a home, ponto de entrada principal).
- Métricas Core Web Vitals dentro do verde:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

## Resultado obtido

- **Home (/):** Performance Score = **41** (vermelho).
- **/melhores-momentos:** Performance Score = 95 (verde).
- **/termos-de-uso:** Performance Score = 97 (verde).
- A discrepância de >50 pontos entre a home e as outras rotas indica problema específico da home (possivelmente carregamento pesado de carrossel de jogos, imagens não otimizadas, JS de terceiros, vídeos auto-load).
- Métricas afetadas (esperadas): LCP alto, TBT alto, possivelmente CLS por imagens sem dimensões.

## Ambiente

- URL: https://www.kasa.live/, /melhores-momentos, /termos-de-uso
- Browser/versão: Chromium 130 (Lighthouse 12.x)
- Sistema: macOS 26.3.1
- Viewport: 1440x900 (Desktop preset)
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` Phase Performance — Lighthouse comparativo
- `docs/site-snapshots/perf/` (relatórios HTML de Lighthouse para cada rota)
- Screenshot: bug-reports/evidence/BUG-018/

## Workaround conhecido

- Nenhum no lado do usuário. Pode-se acessar páginas internas (/melhores-momentos) diretamente, evitando a home.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses (a confirmar via relatório Lighthouse detalhado):
  1. Imagens de partidas/escudos servidas em alta resolução sem `srcset` ou formato moderno (WebP/AVIF).
  2. Bundle JS pesado (carrossel + calendário inline + modais pré-renderizados).
  3. Scripts de terceiros (analytics, ads, pixels) bloqueando renderização.
  4. Sem code splitting por rota — home carrega o bundle inteiro.
  5. Fonts customizadas sem `font-display: swap`.
- Fix sugerido:
  1. Rodar Lighthouse em modo `--view` e priorizar top 3 oportunidades.
  2. Aplicar `next/image` (ou equivalente) com `priority` no LCP element e `loading="lazy"` no resto.
  3. Code-split componentes pesados (modais, carrosséis) com `dynamic import`.
  4. Mover scripts de terceiros para `defer`/`async` ou adiar até interação.
  5. Adicionar `<link rel="preload">` para fontes críticas + `font-display: swap`.
  6. Configurar CI com Lighthouse budget que falhe se Performance < 80 na home.

## Impacto no usuário

- UX: home é primeira impressão; carregamento lento aumenta bounce rate (>3s LCP perde >50% dos usuários conforme estudos Google).
- SEO: Core Web Vitals ruins penalizam ranking no Google.
- Mobile: usuários em 3G/4G abandonam home pesada antes de interagir.
- Negócio: home é principal funil de descoberta de partidas/melhores momentos — perda de pageviews afeta toda a jornada.
