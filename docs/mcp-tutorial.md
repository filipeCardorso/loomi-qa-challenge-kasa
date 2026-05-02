# Tutorial MCP Server — Loomi QA

Reproduzir em ate 5 minutos. Este servidor expoe 7 tools que permitem ao Claude (ou qualquer cliente MCP) listar, executar e investigar testes Playwright contra `https://www.kasa.live`.

## 1. Setup

```bash
git clone https://github.com/<seu-user>/loomi-qa-challenge-kasa.git
cd loomi-qa-challenge-kasa
npm install
npx playwright install chromium
npm run mcp:build
```

Pre-requisitos: Node >= 20, npm >= 10, macOS/Linux/WSL.

## 2. Configurar Claude Desktop

Editar `~/Library/Application Support/Claude/claude_desktop_config.json` (Linux: `~/.config/Claude/claude_desktop_config.json`, Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "loomi-qa": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/loomi-qa-challenge-kasa/mcp-server/dist/index.js"]
    }
  }
}
```

Salvar e reiniciar o Claude Desktop (Cmd+Q e reabrir, nao apenas fechar a janela).

## 3. Validar conexao

Abrir um chat novo no Claude Desktop. Confirmar que o icone de plugin aparece com `loomi-qa` listado.

Pergunta de teste:

> "Quais tools voce tem do servidor loomi-qa?"

Resposta esperada: lista com 7 tools — `run_test_case`, `get_element_status`, `navigate_to`, `list_test_cases`, `get_test_history`, `extract_dom_snapshot`, `analyze_failure`.

## 4. Tres prompts de exemplo

### Prompt 1 — Descobrir e rodar

> "Liste os casos de teste disponiveis no loomi-qa e rode o smoke test."

O Claude deve invocar `list_test_cases` (retorna nome, arquivo e tags) e depois `run_test_case` com `name='@smoke'`. Saida: status `passed` + duracao + `testId`.

### Prompt 2 — Analisar falha

> "Rode o teste de busca. Se falhar, leia o screenshot e o trace via resources, use analyze_failure no testId, e me diga a causa raiz."

Fluxo esperado:

1. `run_test_case({ name: 'busca' })` — falha
2. Resources `loomi://artifacts/{testId}/screenshot.png` + `trace.zip`
3. `analyze_failure({ testId })` — retorna `hypothesis` (ex: timeout, visibilidade), `relatedArtifacts` e `similarPastFailures`

### Prompt 3 — Exploracao ao vivo

> "Use navigate_to para ir em https://www.kasa.live/, depois use get_element_status no botao de favoritar do primeiro time que aparecer. Em seguida, capture um snapshot aria-tree do header."

Fluxo:

1. `navigate_to({ url: 'https://www.kasa.live/' })`
2. `get_element_status({ selector: 'button[aria-label*="favorit" i]' })` — visibilidade, bounding box, atributos
3. `extract_dom_snapshot({ format: 'aria-tree', selector: 'header' })`

## 5. Screenshots de interacao

Ver `docs/site-snapshots/mcp/` (capturas de tela serao adicionadas durante a entrega).

## 6. Tools disponiveis

| Tool                   | Input principal               | Saida                                                                    |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `run_test_case`        | `{ name, browser?, headed? }` | `{ status, duration_ms, errors, artifacts, testId }`                     |
| `get_element_status`   | `{ selector, url? }`          | `{ exists, visible, enabled, text, boundingBox, attributes, ariaRole }`  |
| `navigate_to`          | `{ url }`                     | `{ ok, finalUrl }`                                                       |
| `list_test_cases`      | `{ dir? }`                    | `{ total, tests: [{ name, file, tags }] }`                               |
| `get_test_history`     | `{ name?, limit? }`           | `{ total, runs: [{ testId, name, status, duration_ms, timestamp }] }`    |
| `extract_dom_snapshot` | `{ selector?, format }`       | `{ format, snapshot, length }`                                           |
| `analyze_failure`      | `{ testId }`                  | `{ hypothesis, matchedPatterns, relatedArtifacts, similarPastFailures }` |

## 7. Resources

Artefatos de runs falhos sao expostos via URIs `loomi://artifacts/{testId}/{screenshot.png|video.mp4|trace.zip|error.log}`. Listados em `resources/list` e lidos em `resources/read`.

## 8. Troubleshooting

- **"Tool not found" / plugin nao aparece** — reiniciou Claude Desktop com Cmd+Q? O caminho em `args` e absoluto?
- **`ENOENT spawn npx`** — `npx` precisa estar no PATH herdado pelo Claude. Teste `which npx`. Se vazio, rode `npm install -g npm` ou ajuste o `PATH` do shell.
- **Build do MCP falha** — confira Node >= 20 (`node -v`) e que `npm install` rodou na raiz para popular o workspace `mcp-server`.
- **`run_test_case` nunca termina** — Playwright esta rodando contra kasa.live; verifique conectividade. Use `headed: true` para inspecionar visualmente.
- **`analyze_failure` retorna "Nenhum registro"** — esse `testId` nunca falhou; o registro e gravado em `mcp-server/data/failures/{testId}.json` apos uma falha real.
- **Logs detalhados** — `mcp-server/logs/mcp-YYYY-MM-DD.jsonl` (se logging habilitado) e historico de runs em `mcp-server/data/history.jsonl`.

## 9. Desenvolvimento

```bash
npm test --workspace=mcp-server   # roda Vitest (31 testes)
npm run mcp:build                 # compila TypeScript
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  | node mcp-server/dist/index.js  # smoke test sem Claude Desktop
```

Estrutura:

```
mcp-server/
  src/
    index.ts                # wire up servidor + tools
    tools/                  # 7 tools (1 arquivo cada)
    runner/                 # playwrightBridge, liveBrowser, resultParser
    resources/              # registry de artefatos
    types/                  # zod schemas compartilhados
  tests/                    # vitest (31 testes)
  data/                     # history.jsonl + failures/ (gerados em runtime)
```
