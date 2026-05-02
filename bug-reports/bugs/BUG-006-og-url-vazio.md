# BUG-006 — Meta tag `og:url` com `content=""` (vazio)

**Severidade:** Low
**Prioridade:** P3
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 1/1 — toda renderização da home retorna `<meta property="og:url" content="">`
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Acesso ao HTML servido (View Source ou `curl https://www.kasa.live/`).

## Passos para reproduzir

1. Acessar https://www.kasa.live/.
2. Visualizar o código-fonte HTML (Ctrl+U ou `curl -s https://www.kasa.live/ | grep -i 'og:url'`).
3. Localizar a linha `<meta property="og:url" ...>`.

## Resultado esperado

- `<meta property="og:url" content="https://www.kasa.live/">` (URL canônica preenchida).
- Em rotas internas, a URL canônica daquela rota (ex.: `https://www.kasa.live/melhores-momentos`).
- Validação no Facebook Sharing Debugger e Twitter Card Validator passando sem warnings.

## Resultado obtido

- `<meta property="og:url" content="">` — o atributo `content` está literalmente vazio.
- Resultado: ao compartilhar a URL no WhatsApp/Twitter/Facebook/Slack/Telegram, o "card rico" do site fica sem URL canônica, alguns dos validadores reportam warning, e a deduplicação de links pelos crawlers fica comprometida.

## Ambiente

- URL: https://www.kasa.live/
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiro S6)
- `docs/site-snapshots/exploration/__exploration-raw.json` (busca por `og:url`)
- Screenshot: bug-reports/evidence/BUG-006/

## Workaround conhecido

- Nenhum no lado do usuário.

## Sugestão de fix / hipótese de causa raiz

- Hipótese: o componente `<Head>` do Next.js define `og:url` a partir de uma variável de ambiente (`NEXT_PUBLIC_SITE_URL` ou similar) que não está setada no build de produção, então cai num fallback de string vazia.
- Fix sugerido:
  1. Garantir `NEXT_PUBLIC_SITE_URL=https://www.kasa.live` no build de produção.
  2. Tornar o valor do `og:url` dinâmico por rota (`useRouter().asPath`) e validá-lo com Zod/typebox antes do build.
  3. Adicionar teste de smoke que verifica que `og:url` não é vazio em todas as rotas principais.
  4. Validar com Facebook Sharing Debugger e armazenar o report no CI.

## Impacto no usuário

- Compartilhamento social menos atraente (sem deduplicação correta de links, possível ausência da URL canônica em previews).
- SEO: ligeiramente prejudicado, especialmente para conteúdo dinâmico que poderia ser viralizado.
- Marca: percepção de "site mal cuidado" para quem inspeciona o source.
