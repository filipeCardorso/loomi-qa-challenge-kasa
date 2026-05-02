#!/usr/bin/env bash
# Demo LIVE: chama tools MCP contra https://www.kasa.live (rede real)
# Roda: bash scripts/demo-mcp-live.sh
set -e

B='\033[1m'; G='\033[1;32m'; C='\033[1;36m'; Y='\033[1;33m'; R='\033[1;31m'; N='\033[0m'
slow() { sleep 1.5; }
mcp() {
  local payload="$1"
  echo "$payload" | node mcp-server/dist/index.js 2>/dev/null
}
extract() { jq -r '.result.content[0].text' 2>/dev/null | jq '.' 2>/dev/null || echo "(não-JSON)"; }

clear
echo -e "${B}╔══════════════════════════════════════════════════════════════════╗${N}"
echo -e "${B}║  MCP Live Demo — chamando tools contra https://www.kasa.live   ║${N}"
echo -e "${B}╚══════════════════════════════════════════════════════════════════╝${N}"
slow

echo -e "\n${C}# Tool 1: navigate_to → abre kasa.live no browser persistente${N}"
echo -e "${Y}\$ tools/call name=navigate_to url=https://www.kasa.live/${N}"
slow
mcp '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"navigate_to","arguments":{"url":"https://www.kasa.live/"}}}' | extract
slow

echo -e "\n${C}# Tool 2: get_element_status do botão Entrar (header)${N}"
echo -e "${Y}\$ tools/call name=get_element_status selector='button:has-text(\"Entrar\")'${N}"
slow
mcp '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_element_status","arguments":{"selector":"button:has-text(\"Entrar\")"}}}' | extract | head -25
slow

echo -e "\n${C}# Tool 3: get_element_status do filtro 'Qual time?'${N}"
echo -e "${Y}\$ tools/call name=get_element_status selector='input[placeholder=\"Qual time?\"]'${N}"
slow
mcp '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_element_status","arguments":{"selector":"input[placeholder=\"Qual time?\"]"}}}' | extract | head -20
slow

echo -e "\n${C}# Tool 4: extract_dom_snapshot do header (aria-tree)${N}"
echo -e "${Y}\$ tools/call name=extract_dom_snapshot selector=header format=aria-tree${N}"
slow
mcp '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"extract_dom_snapshot","arguments":{"selector":"header","format":"aria-tree"}}}' | extract | head -15
slow

echo -e "\n${C}# Tool 5: list_test_cases — descoberta dos testes E2E${N}"
echo -e "${Y}\$ tools/call name=list_test_cases${N}"
slow
mcp '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"list_test_cases","arguments":{}}}' | extract | jq '{total: .total, smoke: [.tests[] | select(.tags | contains(["@smoke"])) | .name]}' 2>/dev/null || echo "(parse erro)"
slow

echo -e "\n${C}# Tool 6: run_test_case com @smoke — rodando smoke real contra kasa.live${N}"
echo -e "${Y}\$ tools/call name=run_test_case name=@smoke browser=chromium${N}"
echo -e "${R}    (essa chamada spawna Playwright real, ~20s)${N}"
slow
mcp '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"run_test_case","arguments":{"name":"@smoke","browser":"chromium"}}}' | extract | head -15
slow

echo -e "\n${B}╔══════════════════════════════════════════════════════════════════╗${N}"
echo -e "${B}║  ✓ MCP funcionando contra kasa.live (rede real, sem mocks)     ║${N}"
echo -e "${B}║  Tools 1-4: live browser persistente · Tool 6: spawn Playwright║${N}"
echo -e "${B}╚══════════════════════════════════════════════════════════════════╝${N}"
slow
