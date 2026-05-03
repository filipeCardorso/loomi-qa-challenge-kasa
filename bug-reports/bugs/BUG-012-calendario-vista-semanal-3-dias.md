# BUG-012 — /calendario exibe apenas 3 dias na vista semanal (Sex/Sáb/Dom) em vez de 7

**Severidade:** Low
**Prioridade:** P3
**Status:** Needs revalidation (ver "Re-investigação 2026-05-03" abaixo)
**Reproduzibilidade:** A re-investigar
**Frequência observada:** Reportado na exploração inicial (2026-05-02); recaptura em 2026-05-03 não encontrou grade semanal renderizada — ver nota
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/abMEy1yD

> **Re-investigação 2026-05-03:** captura recente em `/calendario` (sessão anônima, viewport 1440x900) mostra a rota como **listagem de "Partidas finalizadas" em grid de 3 colunas de cards** (`evidence/BUG-009/screenshot-calendario-dedicado.png` antes de removida e `evidence/BUG-012/recapture-grid-vs-sidebar-2026-05-03.json`), não como uma grade calendário-semanal de 7 colunas. Os 8 labels de dia (`dom, seg, ter, qua, qui, sex, sáb`) capturados originalmente no `visible-day-labels.json` provavelmente vieram do mini-calendário do popover/datepicker do header, não da "grade principal". A alegação central deste bug (3 dias renderizam onde deveria ter 7) **provavelmente é falso positivo** ou refere-se a uma feature/visualização que não está mais ativa. Severidade rebaixada de Medium/P2 para Low/P3 e status mudado para `Needs revalidation` enquanto não se confirma se há toggle de vista semanal escondido (ex.: somente em estado autenticado ou em outra rota).

## Pré-condição

- Acesso público a https://www.kasa.live/calendario.
- Vista semanal selecionada (default ou via toggle).

## Passos para reproduzir

1. Abrir https://www.kasa.live/calendario.
2. Garantir que a visão "Semana" esteja ativa.
3. Contar a quantidade de colunas/dias exibidas na grade.

## Resultado esperado

- Vista semanal exibe 7 dias (segunda a domingo, ou domingo a sábado, conforme locale pt-BR).
- Cada coluna do dia possui largura proporcional e exibe os jogos do dia.

## Resultado obtido

- Apenas 3 dias renderizam na grade: `Sexta`, `Sábado`, `Domingo`.
- Os 4 dias restantes (segunda a quinta) parecem estar cortados, ocultos por overflow ou nunca renderizados.
- O usuário não consegue navegar para os jogos da segunda metade da semana sem mudar de filtro/data.

## Ambiente

- URL: https://www.kasa.live/calendario
- Browser/versão: Chromium 130 (Playwright headless)
- Sistema: macOS 26.3.1
- Viewport: 1440x900
- Data/hora do achado: 2026-05-02

## Evidência

- `docs/exploration-notes.md` §12 (cheiro S12 — vista semanal cortada) — exploração inicial 2026-05-02
- `docs/site-snapshots/exploration/` (screenshot de /calendario + DOM dump da exploração inicial)
- Screenshot da exploração: `bug-reports/evidence/BUG-012/screenshot-calendar-3-dias.png` — capturado em 2026-05-02 mostrando 3 dias na grade
- Dump JSON dos labels visíveis (exploração inicial): `bug-reports/evidence/BUG-012/visible-day-labels.json` (8 labels capturados sem distinção de origem)
- **Recaptura 2026-05-03 separando grid principal vs sidebar:** `bug-reports/evidence/BUG-012/recapture-grid-vs-sidebar-2026-05-03.json` — `gridLabelsCount: 0`, `sidebarLabelsCount: 15`. Confirma que os labels de dia vinham do mini-calendário do popover, não da grade principal (que não renderiza labels de dia em texto).
- Reprodução: `node scripts/recapture-partials.mjs` (Playwright + DOM walking).

## Workaround conhecido

- Usuário pode navegar dia-a-dia via setas ou voltar à home para ver "próximas partidas" da semana inteira.

## Sugestão de fix / hipótese de causa raiz

- Hipóteses:
  1. CSS grid/flex com `overflow: hidden` cortando os primeiros 4 dias.
  2. Lógica de renderização truncando o array de dias (ex.: `days.slice(weekday, 7)` em vez de renderizar a semana completa).
  3. Container do calendário com largura fixa menor que o necessário para 7 colunas.
- Fix sugerido:
  1. Inspecionar o componente `WeekView` / `Calendar` e validar que renderiza `days.slice(0, 7)`.
  2. Garantir que o container use `display: grid; grid-template-columns: repeat(7, 1fr)` ou equivalente responsivo.
  3. Em viewports menores, oferecer scroll horizontal ao invés de cortar dias.
  4. Adicionar teste E2E que abre `/calendario`, conta `data-testid="day-column"` e valida `count === 7`.

## Impacto no usuário

- Funcional: usuário não consegue ver jogos de segunda a quinta-feira na vista semanal — feature core quebrada.
- Confiabilidade: defeito visível em rota dedicada ao calendário gera percepção de baixa qualidade.
- Negócio: agendamento de partidas é um dos pilares do site; se não funciona, usuário migra para concorrentes (Globoesporte, OneFootball).
