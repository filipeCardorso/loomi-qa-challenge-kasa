# BUG-012 — /calendario exibe apenas 3 dias na vista semanal (Sex/Sáb/Dom) em vez de 7

**Severidade:** Medium
**Prioridade:** P2
**Status:** Open
**Reproduzibilidade:** Sempre
**Frequência observada:** Reproduzido em viewport 1440x900 e em larguras menores
**Regressão?:** Desconhecido
**Trello card:** https://trello.com/c/abMEy1yD

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

- `docs/exploration-notes.md` §12 (cheiro S12 — vista semanal cortada)
- `docs/site-snapshots/exploration/` (screenshot de /calendario mostrando apenas 3 colunas + DOM dump)
- Screenshot: bug-reports/evidence/BUG-012/

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
