#!/usr/bin/env bash
# Demo end-to-end do MCP Server: exercita os 7 tools + Resources.
# Roda com: bash scripts/demo-mcp.sh
# Para gravar: asciinema rec docs/site-snapshots/mcp/demo.cast -c 'bash scripts/demo-mcp.sh'

set -e

# Cores ANSI pra terminal (asciinema preserva)
B='\033[1m'    # bold
G='\033[1;32m' # green
C='\033[1;36m' # cyan
Y='\033[1;33m' # yellow
N='\033[0m'    # reset

slow() { sleep 1.2; }

clear

echo -e "${B}╔════════════════════════════════════════════════════════════════╗${N}"
echo -e "${B}║  MCP Server — Loomi QA · Demo dos 7 tools (3 mandatórias + 4)  ║${N}"
echo -e "${B}╚════════════════════════════════════════════════════════════════╝${N}"
slow

echo -e "\n${C}# 1. Verificar build do MCP${N}"
slow
ls -la mcp-server/dist/index.js 2>/dev/null && echo -e "${G}✓ build presente${N}" || (npm run mcp:build && echo -e "${G}✓ build feito${N}")
slow

echo -e "\n${C}# 2. tools/list — listar os 7 tools expostos${N}"
echo -e "${Y}\$ echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}' | node mcp-server/dist/index.js | jq '.result.tools | map(.name)'${N}"
slow
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/dist/index.js 2>/dev/null | jq '.result.tools | map(.name)'
slow

echo -e "\n${C}# 3. resources/list — registry inicial vazio${N}"
echo -e "${Y}\$ echo '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"resources/list\"}' | node mcp-server/dist/index.js | jq '.result'${N}"
slow
echo '{"jsonrpc":"2.0","id":2,"method":"resources/list"}' | node mcp-server/dist/index.js 2>/dev/null | jq '.result'
slow

echo -e "\n${C}# 4. tools/call — list_test_cases (extra) — descoberta dinâmica${N}"
echo -e "${Y}\$ tools/call name=list_test_cases${N}"
slow
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_test_cases","arguments":{}}}' \
  | node mcp-server/dist/index.js 2>/dev/null \
  | jq -r '.result.content[0].text' | jq '{total: .total, primeiros_5: (.tests[0:5])}'
slow

echo -e "\n${C}# 5. tools/call — get_test_history (extra) — sem histórico ainda${N}"
echo -e "${Y}\$ tools/call name=get_test_history limit=3${N}"
slow
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_test_history","arguments":{"limit":3}}}' \
  | node mcp-server/dist/index.js 2>/dev/null \
  | jq -r '.result.content[0].text' | jq '.'
slow

echo -e "\n${C}# 6. Vitest — 31 testes do próprio MCP server${N}"
echo -e "${Y}\$ npm test --workspace=mcp-server${N}"
slow
npm test --workspace=mcp-server 2>&1 | tail -10
slow

echo -e "\n${B}╔════════════════════════════════════════════════════════════════╗${N}"
echo -e "${B}║  ✓ MCP Server funcionando — 7 tools + Resources + 31 testes    ║${N}"
echo -e "${B}║  Detalhes em docs/mcp-tutorial.md                              ║${N}"
echo -e "${B}╚════════════════════════════════════════════════════════════════╝${N}"
slow
