# MCP Server — Loomi QA

Servidor [Model Context Protocol](https://modelcontextprotocol.io) que expõe a suíte Playwright como tools que uma IA pode invocar.

## TL;DR

- **7 tools** (3 mandatórias do desafio + 4 extras)
- **31 testes Vitest** (handlers de tools/resources)
- **Resources dinâmicos** via URI `loomi://artifacts/{testId}/{tipo}` após falhas
- **Tutorial completo:** [`../docs/mcp-tutorial.md`](../docs/mcp-tutorial.md)

## Quick check (≤30s, sem Claude Desktop)

```bash
# Da raiz do repo:
npm install
npm run mcp:build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server/dist/index.js
```

Esperado: JSON com 7 tools.

## Tools

| Mandatória | Tool                   | Propósito                                                         |
| ---------- | ---------------------- | ----------------------------------------------------------------- |
| ✅         | `run_test_case`        | Spawna Playwright filtrado por nome/tag, retorna resultado tipado |
| ✅         | `get_element_status`   | Estado completo de elemento via browser persistente               |
| Extra      | `navigate_to`          | Move browser persistente pra URL                                  |
| Extra      | `list_test_cases`      | Descoberta dinâmica de testes                                     |
| Extra      | `get_test_history`     | Histórico das últimas execuções                                   |
| Extra      | `extract_dom_snapshot` | HTML ou aria-tree de um seletor                                   |
| Extra      | `analyze_failure`      | Heurística sobre stack traces de falhas                           |

## Tests

```bash
npm test --workspace=mcp-server
```

31 testes em 6 arquivos (handlers + registry).

## Estrutura

```
src/
├── index.ts          # bootstrap MCP + wire de 7 tools + Resources
├── tools/            # 1 arquivo por tool
├── runner/           # playwrightBridge, liveBrowser, resultParser
├── resources/        # registry de artefatos com URI loomi://
└── types/            # Zod schemas
tests/                # Vitest (31 testes)
```

Detalhes completos em [`../docs/mcp-tutorial.md`](../docs/mcp-tutorial.md).
