# BUG-004 — /favoritos e /calendario (anônimo) retornam home sem indicar fallback

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 2/2 rotas testadas em sessão anônima caem na home sem qualquer mensagem
**Regressão?:** Desconhecido
**Trello card:** TBD

## Pré-condição

- Sessão **anônima** (sem login / sem cookie de auth).
- URL alvo digitada diretamente na barra de endereço.

## Passos para reproduzir

1. Em uma janela anônima, acessar https://www.kasa.live/favoritos.
2. Observar a página renderizada e o `<title>`.
3. Repetir para https://www.kasa.live/calendario.
4. Comparar com o resultado de https://www.kasa.live/ (home).

## Resultado esperado

- Em sessão anônima, ao acessar uma rota que exige autenticação:
  - **Redirect explícito** para `/` (ou para o popover de login) com toast/banner informando "Faça login para acessar seus favoritos / seu calendário".
  - **Ou** página dedicada com call-to-action de login.
- Em qualquer caso, a URL final ou o conteúdo deve **deixar claro** ao usuário que ele caiu em fallback porque está deslogado.

## Resultado obtido

- A URL **permanece** em `/favoritos` ou `/calendario`, mas o **conteúdo renderizado é exatamente a home** (mesmos cards, mesmo header, sem indicação alguma).
- O `<title>` continua sendo o título genérico da home (não há "Kasa.Live - Página não encontrada" como nas outras rotas inválidas — vide BUG-003 e cheiro S10).
- Usuário pensa que clicou no link errado, ou que "favoritos está vazio" quando na verdade está deslogado.

## Ambiente

- URL: https://www.kasa.live/favoritos e https://www.kasa.live/calendario (sem auth)
- Browser/versão: Chromium 130 (Playwright headless, sem `storageState`)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §9 (cheiros S4 e S10)
- `docs/site-snapshots/exploration/` (snapshots de `/favoritos` e `/calendario` em modo anônimo)
- Screenshot: bug-reports/evidence/BUG-004/

## Workaround conhecido

- Fazer login antes de acessar essas URLs (mas o usuário não recebe nenhuma pista de que deveria).

## Sugestão de fix / hipótese de causa raiz

- Hipótese: o middleware de auth do Next.js renderiza o componente da home como fallback quando `session === null`, sem disparar `redirect()` nem mostrar toast.
- Fix sugerido:
  1. No middleware/route guard, fazer `redirect('/?login=required&redirectTo=/favoritos')` quando a sessão não existe.
  2. Mostrar um banner/toast persistente: "Faça login para ver seus favoritos".
  3. Quando o usuário logar, redirecionar de volta para a rota original (`redirectTo`).
  4. Atualizar o `<title>` para refletir a página corrente (ou pelo menos para "Faça login — Kasa.Live").

## Impacto no usuário

- UX: usuário fica confuso, pensa que perdeu seus favoritos ou que o site quebrou.
- Conversão: usuários novos que recebem deep-links de "favoritos compartilhados" não entendem o que precisam fazer.
- Suporte: aumenta tickets do tipo "meus favoritos sumiram".
