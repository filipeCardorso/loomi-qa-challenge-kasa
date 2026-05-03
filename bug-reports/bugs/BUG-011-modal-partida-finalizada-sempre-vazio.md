# BUG-011 — Modal "Melhores momentos" de partida finalizada sempre exibe estado vazio

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** 5/5 tentativas em partidas finalizadas distintas
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/upGcdsjB

## Pré-condição

- Acesso público a https://www.kasa.live/.
- Existir pelo menos uma partida com status "finalizada" listada na home ou em `/melhores-momentos`.

## Passos para reproduzir

1. Abrir https://www.kasa.live/.
2. Localizar uma partida com status "Finalizada" (badge ou marcador visual indicando jogo encerrado).
3. Clicar no botão/card que abre o modal "Melhores momentos" da partida.
4. Aguardar o modal carregar.
5. Repetir para 5 partidas finalizadas distintas (ex.: clássicos brasileiros recentes).

## Resultado esperado

- Modal exibe lista de momentos relevantes (gols, lances, cartões, substituições) com vídeo embed ou link para conteúdo oficial.
- Caso realmente não haja conteúdo, mostrar mensagem específica indicando isso (ex.: "Os melhores momentos desta partida ainda não foram processados — disponível em até 24h").

## Resultado obtido

- Em 5/5 tentativas o modal exibe sempre o mesmo estado vazio: `"Nada por aqui — Ainda não temos os melhores momentos da partida"`.
- Comportamento sugere que a integração com a fonte de melhores momentos nunca retorna dados, ou o componente está hardcoded para o estado vazio.

## Ambiente

- URL: https://www.kasa.live/ (modal aberto via card de partida finalizada)
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §11 (cheiro S11 — modal partida finalizada sempre vazio)
- `docs/site-snapshots/exploration/` (screenshot do modal aberto + DOM dump mostrando texto fixo)
- Screenshot: bug-reports/evidence/BUG-011/
- **Recaptura 2026-05-03 com 3 partidas distintas (resolve smoking gun de PNGs idênticos):** `bug-reports/evidence/BUG-011/manual-recapture-2026-05-03/`
  - `modal-1-*-mls-minnesota-utd.png` (MD5 `82c162cd...`) — Minnesota Utd. (MLS)
  - `modal-2-*-mls-toronto-fc.png` (MD5 `14b38c04...`) — Toronto FC (MLS)
  - `modal-3-*-mls-chicago.png` (MD5 `285fd0bc...`) — Chicago (MLS)
  - `findings.json` — metadata + excerpt do body de cada modal (todos confirmam empty state)
  - **3/3 modais distintos exibem o mesmo empty state** — bug confirmado em partidas diferentes (não 3 prints da mesma como antes)
- Reprodução: `node scripts/recapture-bug011.mjs`

## Workaround conhecido

- Nenhum no lado do usuário. A página `/melhores-momentos` exibe conteúdo separado (curado), então o usuário pode acessá-la diretamente.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. Endpoint de "melhores momentos por partida" nunca foi implementado e o front exibe sempre o fallback.
  2. Endpoint existe mas o request falha silenciosamente (ver BUG-004 sobre fallback silencioso).
  3. Permissão/feature flag desliga o conteúdo em produção mas o estado vazio é genérico demais.
- Fix sugerido:
  1. Inspecionar Network tab ao abrir modal — confirmar se há request HTTP e qual a resposta.
  2. Se endpoint não existe, ocultar o botão de "ver melhores momentos" para partidas sem conteúdo, ao invés de abrir modal vazio.
  3. Diferenciar mensagens: "Conteúdo em processamento" (partida recém-finalizada) vs "Conteúdo indisponível" (partida antiga sem registro).
  4. Adicionar teste E2E que abre 3 modais diferentes e valida que ao menos 1 retorna conteúdo (ou que todos exibem mensagem específica conforme estado).

## Impacto no usuário

- UX: usuário clica esperando ver conteúdo e recebe mensagem vazia repetida. Frustração e perda de confiança.
- Funcional: feature anunciada na UI não funciona — usuário pode pensar que o site está quebrado.
- Conversão: se modal é gateway para login/assinatura, a feature vazia mata o engajamento.
