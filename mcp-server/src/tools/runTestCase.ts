import { mkdir, appendFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RunTestCaseInputSchema } from '../types/mcp.js';
import { runPlaywright } from '../runner/playwrightBridge.js';
import { parseResult } from '../runner/resultParser.js';
import { registerArtifact } from '../resources/registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/tools/runTestCase.js -> mcp-server root: ../..
const MCP_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(MCP_ROOT, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.jsonl');
const FAILURES_DIR = path.join(DATA_DIR, 'failures');

export const runTestCaseTool = {
  name: 'run_test_case',
  description:
    'Executa um teste Playwright filtrado por nome ou tag (ex: @smoke). Retorna status, duração, erros e artefatos.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Nome do teste ou tag (@smoke, "favoritar")' },
      browser: { type: 'string', enum: ['chromium', 'firefox', 'webkit'] },
      headed: { type: 'boolean' },
    },
    required: ['name'],
  },
};

interface PlaywrightAttachment {
  name: string;
  path?: string;
  contentType: string;
}

function extractAttachments(stdout: string): PlaywrightAttachment[] {
  try {
    const report = JSON.parse(stdout);
    return report?.suites?.[0]?.specs?.[0]?.tests?.[0]?.results?.[0]?.attachments ?? [];
  } catch (err) {
    // Stdout pode não ser JSON válido (ex.: erro precoce do playwright). Loga
    // pra diagnóstico mas não interrompe — retorna lista vazia.
    console.error(
      '[mcp:runTestCase] extractAttachments: falha ao parsear stdout JSON do reporter:',
      err,
    );
    return [];
  }
}

async function appendHistory(entry: {
  testId: string;
  name: string;
  status: string;
  duration_ms: number;
  timestamp: string;
}): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(HISTORY_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    // Histórico é best-effort; falha silenciosa não bloqueia execução, mas
    // logamos pra observabilidade (filesystem cheio, permissão, etc).
    console.error('[mcp:runTestCase] appendHistory: falha ao gravar history.jsonl:', err);
  }
}

async function persistFailure(
  testId: string,
  name: string,
  errors: Array<{ message: string; stack?: string; location?: string }>,
): Promise<void> {
  try {
    await mkdir(FAILURES_DIR, { recursive: true });
    const file = path.join(FAILURES_DIR, `${testId}.json`);
    await writeFile(
      file,
      JSON.stringify({ testId, name, errors, timestamp: new Date().toISOString() }, null, 2),
      'utf-8',
    );
  } catch (err) {
    // best-effort — analyzeFailure ainda funciona via history.jsonl mesmo
    // sem o snapshot. Loga pra trilha.
    console.error(`[mcp:runTestCase] persistFailure: falha ao gravar ${testId}.json:`, err);
  }
}

export async function runTestCase(rawInput: unknown) {
  const input = RunTestCaseInputSchema.parse(rawInput);
  const run = await runPlaywright({
    grep: input.name,
    browser: input.browser,
    headed: input.headed,
    // Respeita o CI=true real do shell em vez de forçar (refactor 8)
    ciMode: process.env.CI === 'true',
  });
  const result = parseResult(run.stdout);

  if (result.status === 'failed' || result.status === 'timedOut') {
    const attachments = extractAttachments(run.stdout);
    for (const att of attachments) {
      if (!att.path) continue;
      if (att.name === 'screenshot') registerArtifact(result.testId, 'screenshot', att.path);
      else if (att.name === 'video') registerArtifact(result.testId, 'video', att.path);
      else if (att.name === 'trace') registerArtifact(result.testId, 'trace', att.path);
    }
    await persistFailure(result.testId, input.name, result.errors);
  }

  await appendHistory({
    testId: result.testId,
    name: input.name,
    status: result.status,
    duration_ms: result.duration_ms,
    timestamp: new Date().toISOString(),
  });

  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
