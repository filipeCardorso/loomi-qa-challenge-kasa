import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/tools/getTestHistory.js -> mcp-server root: ../..
const MCP_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(MCP_ROOT, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.jsonl');

export const GetTestHistoryInputSchema = z.object({
  name: z.string().optional(),
  limit: z.number().int().positive().max(500).optional().default(20),
});

export const getTestHistoryTool = {
  name: 'get_test_history',
  description:
    'Retorna o histórico recente de execuções de testes (mcp-server/data/history.jsonl), opcionalmente filtrado por nome/tag.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Filtra por nome/tag (substring case-insensitive)' },
      limit: { type: 'number', description: 'Máximo de runs retornados (padrão 20, max 500)' },
    },
  },
};

export interface HistoryEntry {
  testId: string;
  name: string;
  status: string;
  duration_ms: number;
  timestamp: string;
}

export async function readHistoryFile(file: string = HISTORY_FILE): Promise<HistoryEntry[]> {
  await mkdir(path.dirname(file), { recursive: true }).catch(() => {});
  let raw: string;
  try {
    raw = await readFile(file, 'utf-8');
  } catch {
    return [];
  }
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const out: HistoryEntry[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as HistoryEntry);
    } catch {
      // pula linhas corrompidas
    }
  }
  return out;
}

export async function getTestHistory(rawInput: unknown) {
  const input = GetTestHistoryInputSchema.parse(rawInput ?? {});
  const all = await readHistoryFile();
  const filtered = input.name
    ? all.filter((e) => e.name.toLowerCase().includes(input.name!.toLowerCase()))
    : all;
  // Mais recentes primeiro
  const ordered = [...filtered].reverse().slice(0, input.limit);
  return {
    content: [
      { type: 'text', text: JSON.stringify({ total: ordered.length, runs: ordered }, null, 2) },
    ],
  };
}
