# IMP-011 — evidências (reclassificação de BUG-003)

Esta melhoria propõe **redirects 301** ou **404 melhorada com seção "Você
procurava…"** para rotas comuns (`/buscar`, `/login`, `/calendar`, `/perfil`)
que hoje retornam 404 explícito por decisão de produto.

## Histórico — reclassificação de BUG-003

| Data | Evento |
|---|---|
| 2026-05-02 | Reportado originalmente como **BUG-003** (Severity Low, Priority P3) durante exploração inicial |
| 2026-05-03 | **Reclassificado** após review pré-submissão — não é defeito, é decisão de produto. Card Trello original `https://trello.com/c/YZHQQrBF` arquivado, novo card dedicado criado em `https://trello.com/c/OaSXIQ4k` |

## Estado atual (verificado 2026-05-03)

| URL tentada | HTTP status | `<title>` | Comportamento |
|---|---|---|---|
| `/buscar` | 404 | "Página não encontrada" | 404 explícito (correto) |
| `/login` | 404 | "Página não encontrada" | 404 explícito (correto) |
| `/calendar` (sem `io`) | 404 | "Página não encontrada" | 404 explícito (correto) — rota canônica é `/calendario` |
| `/perfil` | 404 | "Página não encontrada" | 404 explícito (correto) |
| `/calendario` | 200 | Variável | Listagem de partidas (rota canônica) |

**Observação:** todas as 4 retornam 404 limpo (não fallback silencioso como
em BUG-004 — `/favoritos` que retorna 200 com conteúdo da home). Isso
confirma que o time já trata esses casos com 404 dedicado, só não há
redirect 301 nem sugestão de "Você procurava…".

## Estado desejado (após IMP-011)

```js
// next.config.js
module.exports = {
  async redirects() {
    return [
      { source: '/buscar', destination: '/?q=', permanent: true },   // 301
      { source: '/calendar', destination: '/calendario', permanent: true },
      { source: '/login', destination: '/?login=open', permanent: true },
      { source: '/perfil', destination: '/?perfil=open', permanent: true },
    ];
  },
};
```

OU melhorar a página 404 com seção "Você procurava…" linkando rotas reais.

## Justificativa

- UX: deeplinks "óbvios" (digitar `/login`, salvar `/perfil` nos favoritos do browser) caem em 404 — frustração
- SEO: 404s rastreáveis penalizam levemente o domínio
- Suporte: menos tickets "não consigo achar página de login"

## Esforço

- 1-2h adicionar redirects + testar manualmente
- +30min cobrir com teste E2E que valida `expect(response.status()).toBe(301)` ou URL final

## Referência

- BUG-003 original (arquivado): https://trello.com/c/YZHQQrBF
- IMP-011 ativo: https://trello.com/c/OaSXIQ4k
