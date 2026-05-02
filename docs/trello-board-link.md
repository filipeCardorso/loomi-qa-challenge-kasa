# Trello Board

**URL público (read-only):** https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel

## Estrutura

Conforme spec §9.5:

### Listas

1. 📋 Backlog
2. 🎯 Sprint atual (48h)
3. 🏃 Em andamento (WIP máximo 3)
4. 🔍 Em revisão
5. ✅ Concluído
6. 🐛 Bugs reportados
7. 💡 Melhorias sugeridas
8. ⚠️ Bloqueios / Riscos

### Labels

- 🔴 Critical · 🟡 High · 🟢 Medium · ⚪ Low
- Por trilha: `trilha-A` (functional QA) · `trilha-B` (automation) · `trilha-C` (platform/MCP)
- Por tarefa: `tarefa-1-casos` · `tarefa-2-auto` · `tarefa-3-bugs` · `tarefa-4-mcp` · `relatório`

## Como o avaliador navega

1. Abrir link público (sem login necessário)
2. Lista "Concluído" mostra entregas finais
3. Lista "Bugs reportados" tem todos os bugs com link cruzado pro repo (`bug-reports/bugs/BUG-XXX.md`)
4. Lista "Melhorias sugeridas" tem improvements com mesmo padrão
5. Cada card de bug usa o mesmo schema do `.md` no repo (copy-paste 1:1)

## Sincronização com repo

Manual mas disciplinada. Para cada bug/melhoria:

1. Cria `.md` no repo (fonte da verdade)
2. Cria card no Trello copiando o conteúdo
3. Card linka pro `.md` no repo + pro `bug-reports/evidence/BUG-XXX/`
4. `.md` linka pro card via campo "Trello card"

Campo "Trello card" pode aparecer como `TBD` em commits intermediários; deve estar preenchido até o checkpoint diário.
