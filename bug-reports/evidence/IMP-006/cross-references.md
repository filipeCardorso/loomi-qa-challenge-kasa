# IMP-006 — evidências (cross-reference com bugs)

Esta melhoria propõe otimizar o bundle da Home (Lighthouse Performance). As
evidências do estado atual estão na pasta de BUG-018 — não duplicamos os
arquivos pesados (Lighthouse JSON 580KB, HTML report 770KB) aqui.

## Evidência do problema atual

| Origem  | Arquivo                                                                                  | Conteúdo                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| BUG-018 | [`evidence/BUG-018/score-summary.txt`](../BUG-018/score-summary.txt)                     | Resumo da auditoria Lighthouse 2026-05-03 — Performance score, métricas Core Web Vitals, top oportunidades |
| BUG-018 | [`evidence/BUG-018/lighthouse-home.json`](../BUG-018/lighthouse-home.json)               | Relatório completo Lighthouse JSON (580KB) — todas as auditorias, oportunidades estimadas, diagnostics     |
| BUG-018 | [`evidence/BUG-018/lighthouse-home.report.html`](../BUG-018/lighthouse-home.report.html) | Relatório HTML interativo do Lighthouse (770KB) — abrir no browser pra navegação                           |
| BUG-018 | [`evidence/BUG-018/screenshot-lighthouse.png`](../BUG-018/screenshot-lighthouse.png)     | Screenshot do gauge de scores no DevTools                                                                  |

## Estado atual resumido (run 2026-05-03)

| Métrica                           | Valor     | Threshold | Status             |
| --------------------------------- | --------- | --------- | ------------------ |
| Performance Score                 | **63**    | ≥ 80      | 🔴 Vermelho        |
| LCP (Largest Contentful Paint)    | 1.9s      | < 2.5s    | 🟢                 |
| TBT (Total Blocking Time)         | 10ms      | < 200ms   | 🟢                 |
| **CLS (Cumulative Layout Shift)** | **0.705** | **< 0.1** | **🔴 7× o limite** |
| FCP                               | 0.8s      | < 1.8s    | 🟢                 |
| Speed Index                       | 2.2s      | < 3.4s    | 🟢                 |

**Diagnóstico:** CLS é o ofensor dominante (imagens sem dimensões fixas,
cards/banners que entram tardiamente). LCP/TBT estão saudáveis — o problema
não é peso de bundle puro, é layout shift.

## Estado desejado (após IMP-006)

- Performance Score ≥ 80
- CLS ≤ 0.1
- Spec `automation/tests/performance/lighthouse.spec.ts` ativo com threshold elevado

## Top oportunidades (extraídas de score-summary.txt)

- `unused-javascript`: economia estimada 230ms — Reduce unused JavaScript
- `server-response-time`: economia estimada 7ms — initial server response was short

## Reprodução

```bash
npm run test:perf
# OU
npx lighthouse https://www.kasa.live/ --only-categories=performance --view
```
