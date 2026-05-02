# Exploração kasa.live — 2026-05-02

**Modo:** automatizada via Playwright headless (não manual). Coletei DOM real (com JS executado), screenshots fullpage de 9 páginas-tentadas, requisições XHR/fetch, estrutura completa.

**Raw data:** `docs/site-snapshots/exploration/__exploration-raw.json`
**Screenshots:** `docs/site-snapshots/exploration/*.png`

---

## 1. Sitemap real

| Rota                 | Status                    | Observação                                            |
| -------------------- | ------------------------- | ----------------------------------------------------- |
| `/`                  | 200                       | **Home = página principal de busca** (não só landing) |
| `/melhores-momentos` | 200                       | Página de highlights com filtros próprios             |
| `/termos-de-uso`     | 200                       | T&C estático, 15 headings                             |
| `/favoritos`         | 200 (mas conteúdo = home) | SPA fallback — rota não dedicada                      |
| `/calendario`        | 200 (mas conteúdo = home) | Idem — SPA fallback                                   |
| `/buscar`            | 404                       | Não existe — busca está embutida na home              |
| `/login`             | 404                       | Não existe — login é modal                            |
| `/calendar`          | 404                       | Não existe — Calendar é integração externa            |
| `/perfil`            | 404                       | Não existe                                            |

**Apenas 3 rotas reais:** `/`, `/melhores-momentos`, `/termos-de-uso`. Tudo mais é estado/modal dentro da SPA.

## 2. Stack identificada

- **Frontend:** Next.js (versão `v3.1-Web` rodapé), Chakra UI (classes `chakra-link`, `chakra-text`, `chakra-image`), HTML lang="pt-BR"
- **Backend API:** `https://kasa-live.api.dev.loomi.com.br/api/1.0/` (ambiente DEV exposto — atenção)
- **Tracking:** Google Analytics G-KERN92K795
- **Imagens via Next.js:** `/_next/static/media/...`

## 3. Endpoints API (descobertos via Network)

Base: `https://kasa-live.api.dev.loomi.com.br/api/1.0/`

| Endpoint      | Query params usados                                                    | Quando dispara                     |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| `GET /match/` | `status=ENDED &page=1 &ordering=DESC &with_channel=true`               | partidas finalizadas (lista geral) |
| `GET /match/` | `status=NOTSTARTED &date_start=YYYY-MM-DD &page=1 &with_channel=true`  | partidas futuras do dia            |
| `GET /match/` | `status=INPLAY &date_start=YYYY-MM-DD &with_channel=true`              | partidas ao vivo                   |
| `GET /match/` | `status=NOTSTARTED &date=YYYY-MM-DD &trending=true &with_channel=true` | partidas em alta (trending)        |

**Observações:**

- Status: `ENDED | NOTSTARTED | INPLAY` (3 estados)
- `with_channel=true` em todas as chamadas → backend resolve onde assistir junto com a partida
- Inconsistência observada: ora `date_start=`, ora `date=` → suspeita de bug ou variação
- Ambiente é DEV — pode haver instabilidade ou dados mockados

## 4. Funcionalidades core do desafio — mapeamento

### 🔍 Buscar partidas (Tarefa do desafio)

**Localização:** **HOME** (não rota dedicada)
**4 filtros descobertos** (todos `<input type="text">`):

- `placeholder="Qual time?"` — filtro time
- `placeholder="Qual campeonato?"` — filtro campeonato
- `placeholder="Apr 30, 2026"` — datepicker (formato MMM DD, YYYY)
- `placeholder="Onde quer ver?"` — filtro local de transmissão

Mais: **calendar mensal** com 31 botões (1-31 de maio 2026), botões "Go to previous/next month". H2 mostra mês atual ("maio 2026").

Paginação: "1 2 117" + "página anterior" + "próxima página" (~117 páginas = bastante conteúdo).

### 📺 Melhores momentos (Tarefa do desafio)

**Rota:** `/melhores-momentos`
**Filtros próprios** (mesmos 4 da home + 2 extras "Pesquisar"):

- 4 filtros idênticos (time/campeonato/data/local)
- 2 inputs `placeholder="Pesquisar"` (busca textual)
- Calendar mensal idêntico

3 H2: "maio 2026", "Filtros", **"Melhores momentos das Partidas Finalizadas"**

### ⭐ Favoritar times e partidas (Tarefa do desafio)

**Status: NÃO MAPEADO no DOM da home anônima.**
**Hipótese 1:** aparece dentro do detalhe de uma partida (não conseguimos clicar em uma partida no script automatizado — TODO humano)
**Hipótese 2:** requer estar logado (botão favoritar só renderiza com auth)
**Hipótese 3:** estado por localStorage (sem login)

🧑 **Ação humana necessária:** logar via Google, clicar em uma partida específica, identificar onde está o botão "favoritar".

### 📅 Google Calendar (Tarefa do desafio)

**Status: NÃO MAPEADO no DOM da home anônima.**
Sem botão "Conectar Calendar" visível na home. **Hipótese:** aparece dentro do detalhe de uma partida favoritada (após login).

🧑 **Ação humana necessária:** mesma sessão de exploração de partida.

## 5. Login / Cadastro

**É modal, não rota** (`/login` retorna 404).

Fluxo:

1. Botão "Entrar" no header da home (existe 2x — desktop + mobile)
2. Botão "Criar conta" no header
3. Modal abre com heading "Entrar"
4. **Botão "Entrar com o Google"** → OAuth Google único método visível

⚠️ **Implicação crítica para automação:** **OAuth real de produção exige 2FA, app verification, etc.** Confirmar mitigação R3 da spec — não automatizar OAuth completo, apenas validar que o botão redireciona corretamente.

## 6. Estratégia de seletores

### ❌ Sem `data-testid` em lugar nenhum

**0 testids** em todas as 9 páginas analisadas. Vamos depender 100% de `getByRole`/`getByText`/`getByLabel`.

### ✅ Aria-labels úteis encontrados

- `"Notificações"` — botão de notificações (header)
- `"Go to previous month"` / `"Go to next month"` — calendar nav
- `"página anterior"` / `"próxima página"` — paginação

⚠️ Detectado: **35 botões com aria-label "Go to previous month"** na home → provável bug do site (aria-label duplicado em massa) ou padrão Chakra UI mal configurado. **Candidato a melhoria/bug.**

### Seletores recomendados pra automação

| Elemento                | Seletor sugerido                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Logo (link home)        | `getByRole('link', { name: 'home' })` (alt da img)                                   |
| Nav "Partidas"          | `getByRole('link', { name: 'Partidas' })`                                            |
| Nav "Melhores momentos" | `getByRole('link', { name: 'Melhores momentos' })`                                   |
| Botão Entrar            | `getByRole('button', { name: 'Entrar' }).first()`                                    |
| Botão Criar conta       | `getByRole('button', { name: 'Criar conta' })`                                       |
| Botão Google OAuth      | `getByRole('button', { name: /entrar com o google/i })`                              |
| Filtro time             | `getByPlaceholder('Qual time?')`                                                     |
| Filtro campeonato       | `getByPlaceholder('Qual campeonato?')`                                               |
| Filtro data             | `getByPlaceholder(/^[A-Z][a-z]{2}\s\d+,\s\d{4}$/)` (regex pra aceitar qualquer data) |
| Filtro local            | `getByPlaceholder('Onde quer ver?')`                                                 |
| Calendar prev/next      | `getByLabel('Go to previous month').first()`                                         |
| Notificações            | `getByLabel('Notificações')`                                                         |
| Paginação "próxima"     | `getByLabel('próxima página')`                                                       |

## 7. Footer

- "Termos de Uso e Política de Privacidade" → `/termos-de-uso`
- Copyright "© 2022 Kasa.live, LTDA."
- Versão "v3.1-Web"
- App stores: link Play Store + link App Store (`/_next/static/media/playstore.svg`, `appstore.svg`)
- Social: TikTok (`tiktok.com/@kasa.live`), Instagram (`instagram.com/kasa.live`)

## 8. Idioma e meta

- HTML `lang="pt-BR"` ✅
- Title: **"Kasa.Live - Encontre o Jogo"**
- Description: "O Kasa te ajuda a encontrar e assistir jogos de futebol. Aqui você consegue saber em qual canal assistir o jogo ao vivo e acompanhar o calendário do seu time favorito."
- OG image: `https://kasalive-api-stage.s3.amazonaws.com/og-cover-full.png`

## 9. Cheiros suspeitos (proto-bugs e melhorias)

| #   | Observação                                                                                                                                   | Tipo provável                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| S1  | API DEV exposta em produção (`*.api.dev.loomi.com.br`)                                                                                       | **Bug** — High                      |
| S2  | 35 botões com mesmo aria-label "Go to previous month"                                                                                        | **Bug** — Medium (a11y)             |
| S3  | `/buscar`, `/login`, `/calendar`, `/perfil` retornam 404 (rotas esperadas inexistentes)                                                      | **Melhoria UX** — Low               |
| S4  | `/favoritos` e `/calendario` retornam home (silent fallback sem indicar)                                                                     | **Bug** — Medium (UX)               |
| S5  | 0 `data-testid` em todo o site                                                                                                               | **Melhoria** — automação/manutenção |
| S6  | `og:url` vazio na meta tag                                                                                                                   | **Bug** — Low (SEO/social)          |
| S7  | Meta description duplicada (`<meta name="description"` aparece 2x)                                                                           | **Bug** — Low (SEO)                 |
| S8  | Inconsistência API: `date_start=` vs `date=` em chamadas similares                                                                           | **Bug** — Medium                    |
| S9  | Calendar texto duplicado: botão "11º maio" e "1111º maio" — número e ordinal grudam                                                          | **Bug** — Medium (visual)           |
| S10 | Title nas rotas inválidas é "Kasa.Live - Página não encontrada" mas a home na rota `/favoritos` mantém title genérico (sem indicar fallback) | **Bug** — Medium                    |

10 sinais identificados sem clicar em nada além de carregar página. **Sólida base pra atingir ≥18 bugs + ≥10 melhorias** após exploração interativa humana.

## 10. Perguntas abertas (precisam exploração humana)

1. **Onde está o botão "favoritar"?** Provavelmente no detalhe de uma partida.
2. **Como funciona "favoritar" sem login?** Localstorage ou bloqueia até logar?
3. **Detalhe de partida tem URL própria** (`/partida/123`)? Ou abre como modal?
4. **Player de melhores momentos** — qual provedor? YouTube embed? player próprio?
5. **Google Calendar** — onde aparece a opção "marcar no calendar"? Antes ou depois de login?
6. **Notificações** — clicar no sino mostra o quê? notificações de partidas favoritas?
7. **Limite de favoritos** — pode favoritar 100 times?
8. **Logout** — como? menu de perfil dropdown?
9. **App stores** — apps Android/iOS são parte do core ou separados?
10. **Resposta do site quando API DEV está fora** — handling gracioso?

## 11. Snapshots salvos

| Arquivo                                                 | URL                                   |
| ------------------------------------------------------- | ------------------------------------- |
| `home.png`                                              | https://www.kasa.live/                |
| `melhores-momentos.png`                                 | /melhores-momentos                    |
| `termos-de-uso.png`                                     | /termos-de-uso                        |
| `login-modal.png`                                       | modal de login (após clicar "Entrar") |
| `buscar.png`, `login.png`, `calendar.png`, `perfil.png` | 404s (mesmo screenshot fallback)      |
| `favoritos.png`, `calendario.png`                       | SPA fallback pra home                 |

## 12. Cobertura desta exploração vs charters

A exploração automatizada já alimenta os 7 charters da spec §6.2:

| Charter                  | Insumo já coletado                                                        |
| ------------------------ | ------------------------------------------------------------------------- |
| C1 (busca adversarial)   | 4 inputs identificados, paginação, calendar, API endpoint conhecido       |
| C2 (favoritar sem login) | Login é modal Google OAuth, mecanismo de favorito ainda desconhecido      |
| C3 (Calendar OAuth)      | Não detectado no DOM anônimo — confirmar se existe na sessão logada       |
| C4 (highlights)          | /melhores-momentos mapeado, busca textual + filtros — falta mapear player |
| C5 (mobile)              | Screenshots desktop coletados — viewport mobile pendente                  |
| C6 (a11y)                | 35 aria-labels duplicados já flagados, 0 testids                          |
| C7 (não-core)            | Login modal, T&C, social, app stores mapeados                             |

---

## Próximos passos imediatos

1. ✅ Estrutura geral mapeada — alimenta Phases 2/3/6/9/10
2. ✅ Sessão automatizada via login local (email/senha) — descobertas adicionais na seção 13 abaixo
3. 🧑 5-10min humanos pendentes pra: clicar numa partida (modal vs rota?), achar botão favoritar, achar Calendar
4. **Pode começar Phase 3** com seletores conhecidos; refinamento conforme novos achados

---

## 13. Pós-login (sessão automatizada com .env.local)

### 13.1 Login funciona via email/senha LOCAL (descoberta crítica)

❌ Spec/exploração inicial assumia OAuth Google único. **ERRADO.**
✅ Modal de "Entrar" tem **DOIS métodos**:

1. **Email/Senha local** (form padrão) — primário, fácil de automatizar
   - `getByPlaceholder('Digite seu e-mail')`
   - `getByPlaceholder('Digite sua senha')`
   - Botão `getByRole('button', { name: 'Entrar' }).last()` (do modal — não do header)
2. **"Entrar com o Google"** — secundário, OAuth real (manter mitigação R3 — só validar redirect)

**Implicação pra automação:** OAuth não é mais o caminho crítico; usar login local em todos os E2E que exigem auth. Storage state pode ser persistido em `.auth-state.json` (gitignored).

### 13.2 Nav LOGADA tem 4 tabs (não 2)

| Tab               | Rota                         | Ícone       |
| ----------------- | ---------------------------- | ----------- |
| Partidas          | `/`                          | grid/casa   |
| Favoritos         | (mesma URL `/`, state-based) | ⭐ estrela  |
| Melhores momentos | `/melhores-momentos`         | ▷ play      |
| Calendário        | (mesma URL `/`, state-based) | 📅 calendar |

Tabs são state interno da SPA — clicar não muda URL. Renderização via React state.
Header logado **substitui "Entrar" por avatar (👤)** + mantém sino 🔔.

### 13.3 Cards de partida — anatomia visual

Cada card (em "Partidas finalizadas"):

- Pequeno chip do campeonato no topo (ex: "MLS", "Premier League")
- 2 linhas com: ícone de escudo + nome do time + placar (`0`)
- Linha de status: **"Finalizada"** (texto bold)
- Controles à direita: ícone 📹 câmera (vídeo highlight) + → seta (vai pro detalhe)
- Sem botão "Favoritar" visível NO CARD (provavelmente só no detalhe)

Cards aparentemente **não são `<a>` com href próprio** — clicar no → setinha não mudou URL no script automatizado. Hipótese: detalhe abre como modal OU é roteamento client-side dinâmico que requer interação real.

### 13.4 Toggle de view layout

Top-right da seção "Partidas finalizadas" tem 2 ícones:

- Grid (default selecionado)
- Lista

Vira candidato a teste de UI alternativa.

### 13.5 Onde "favoritar" aparece textualmente

Página `/melhores-momentos` contém a palavra "favorit" em algum elemento (confirmado por `body.innerText` regex). Provavelmente existe filtro "Apenas favoritos" ou indicador visual em vídeo de time favoritado. Detalhar humano.

### 13.6 Onde "calendar" aparece textualmente

Em **nenhuma das páginas** anônimas detectamos texto "Google Calendar" ou "calendar" no body. Hipóteses:

- Aparece somente no detalhe de partida (modal)
- Aparece após favoritar uma partida específica
- Aparece em página de configuração de conta (não acessada)

Detalhar humano.

### 13.7 Bug confirmado: aria-label duplicado

**35 botões com aria-label "Go to previous month"** confirmado tanto em sessão anônima quanto logada. **BUG-001 candidato sólido (a11y, severity Medium-High):** screen readers vão anunciar 35 vezes "Go to previous month" para usuário tabuando o calendar.

### 13.8 Contas de teste: estado do site

Site **PERMITE registro local** com email/senha. Conta de teste do desafio está cadastrada com:

- E-mail: `filipecardosogabriel@gmail.com`
- Storage state: `.auth-state.json` (gitignored)

Login persistente funciona com `storageState`. Logout não testado ainda.

---

## 14. Recomendação de estratégia para automação

Com base nesta exploração, a estratégia ótima:

1. **Criar fixture `loggedInPage`** que injeta `storageState: '.auth-state.json'` automaticamente nos testes que precisam auth
2. **Criar fixture `freshAccount`** que faz login programaticamente via API (descobrir endpoint POST /auth/login no devTools — TODO) ou via UI quando estável
3. **POM HomePage** com 4 filtros + calendar mensal + paginação
4. **POM MatchSearchPage = HomePage** (não é página separada — é state da home)
5. **POM HighlightsPage** (`/melhores-momentos`) com filtros próprios + 2 buscas textuais
6. **POM MatchCard** componente reutilizável (campeonato, times, placar, status, controles câmera+seta)
7. **Detalhe de partida (TBD após sessão humana):** se for modal → POM MatchDetailModal; se for rota → POM MatchDetailPage
8. **OAuth Google:** apenas teste que valida click → redireciona para accounts.google.com (sem completar)
9. **API tests:** usar diretamente `https://kasa-live.api.dev.loomi.com.br/api/1.0/match/` com `request` fixture do Playwright
