# BUG-003 — Rotas /buscar, /login, /calendar e /perfil retornam 404

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 4/4 rotas testadas retornam página de "Página não encontrada"
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Conhecimento das rotas equivalentes que de fato existem no app (ex.: `/calendario`, `/melhores-momentos`).

## Passos para reproduzir

1. Acessar diretamente cada uma das URLs abaixo (digitando na barra do browser ou via `curl -I`):
   - https://www.kasa.live/buscar
   - https://www.kasa.live/login
   - https://www.kasa.live/calendar
   - https://www.kasa.live/perfil
2. Observar o `<title>` retornado e o conteúdo principal da página.

## Resultado esperado

- Para nomes "naturais" como `/buscar`, `/login`, `/calendar` e `/perfil`, uma das duas opções:
  - **Redirect 301** para a rota canônica equivalente (`/`, `/calendario`, etc.), preservando deep-links que usuários colem ou compartilhem.
  - **Página dedicada** (caso a feature exista) — ex.: `/login` com formulário próprio, `/perfil` com a área do usuário.

## Resultado obtido

- As 4 URLs retornam a página 404 do Next.js com `<title>Kasa.Live - Página não encontrada</title>`.
- Não há redirect, não há sugestão da rota correta, e não há link "voltar para o início" tematizado.
- Usuário que tentar deep-link "intuitivo" (ex.: salvou `/perfil` nos favoritos do navegador) cai num beco sem saída.

## Ambiente

- URL: https://www.kasa.live/{buscar|login|calendar|perfil}
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S3)
- `docs/site-snapshots/exploration/` (snapshots das rotas 404)
- Screenshot: bug-reports/evidence/BUG-003/

## Workaround conhecido

- Usuário precisa adivinhar/decobrir as rotas reais (`/calendario` em vez de `/calendar`; login fica no popover do header, sem URL própria).

## Sugestão de fix / hipótese de causa raiz

- Hipótese: o app expõe apenas as rotas exatas implementadas (`/`, `/calendario`, `/melhores-momentos`, etc.), sem mapeamento de aliases comuns.
- Fix sugerido:
  1. Adicionar redirects 301 no `next.config.js` (ou equivalente) para os aliases mais óbvios:
     - `/buscar` → `/`
     - `/calendar` → `/calendario`
     - `/perfil` → modal/popover do avatar, ou criar página dedicada
     - `/login` → abrir modal/popover de login
  2. Melhorar a página 404: incluir busca, links para as principais seções e link para a home.
  3. Cobrir com testes E2E que validem o redirect status code (`expect(response.status()).toBe(301)`).

## Impacto no usuário

- UX: usuário que tenta um deep-link "óbvio" não chega no destino e pensa que o site quebrou.
- SEO: 4 URLs retornando 404 reduzem ligeiramente a percepção de qualidade pelos crawlers.
- Suporte: aumenta tickets de "não consigo achar minha conta / página de login".
