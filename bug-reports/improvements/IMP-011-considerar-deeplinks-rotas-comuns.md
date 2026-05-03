# IMP-011 — Considerar adicionar deeplinks pra rotas comuns (/buscar, /login, /calendar, /perfil)

**Impacto:** Low–Medium
**Categoria:** UX / Discoverability
**Esforço:** S (pequeno — adicionar redirects no `next.config.js`)
**Status:** Open
**Trello card:** https://trello.com/c/OaSXIQ4k (card dedicado do IMP-011; o card original BUG-003 https://trello.com/c/YZHQQrBF foi arquivado em 2026-05-03)

## Contexto

Hoje as URLs `/buscar`, `/login`, `/calendar` e `/perfil` retornam 404 (página "Página não encontrada") porque essas rotas não existem como features no produto atual:

- Busca é typeahead na home (sem rota dedicada)
- Login é modal/popover do header (sem rota própria)
- Calendar canônico é `/calendario` (com "io")
- Perfil é popover do header (sem rota própria)

Originalmente isso foi reportado como **BUG-003 (Severity: Low)**. Após reflexão, **não é defeito** — é product decision: essas rotas simplesmente não foram criadas. Reclassifico como melhoria por dois motivos:

1. Usuários podem tentar deeplinks "óbvios" (digitar `/login` na barra, salvar `/perfil` nos favoritos do browser).
2. Crawlers de SEO podem encontrar essas URLs via terceiros e penalizar levemente o domínio por 404.

## Sugestão

Adicionar redirects 301 no `next.config.js` (ou equivalente):

| URL tentada | Redireciona para                         |
| ----------- | ---------------------------------------- |
| `/buscar`   | `/?q=` ou só `/`                         |
| `/calendar` | `/calendario`                            |
| `/login`    | `/?login=open` (e abrir modal via query) |
| `/perfil`   | `/?perfil=open` (idem)                   |

Alternativa: melhorar a página 404 atual com uma seção "Você procurava…" com links pra `/`, `/calendario`, `/melhores-momentos` e abrir busca/login/perfil via prompt.

## Esforço estimado

- 1-2h pra adicionar redirects + testar manualmente
- +30min pra cobrir com teste E2E `expect(response.status()).toBe(301)` ou validação de URL final

## Impacto esperado

- UX: usuário com deeplink antigo cai onde queria (ou perto).
- SEO: reduz 404s rastreáveis.
- Suporte: menos tickets de "não consigo achar página de login".

---

## Histórico

- **2026-05-02:** Reportado originalmente como BUG-003 (Severity Low, Priority P3) durante exploração.
- **2026-05-03:** Reclassificado para melhoria após review pré-submissão — não é defeito, é decisão de produto. Card Trello mantido com link cruzado.
