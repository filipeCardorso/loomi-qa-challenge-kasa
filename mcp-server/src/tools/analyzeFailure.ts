import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { readHistoryFile, type HistoryEntry } from './getTestHistory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/tools/analyzeFailure.js -> mcp-server root: ../..
const MCP_ROOT = path.resolve(__dirname, '../..');
const FAILURES_DIR = path.join(MCP_ROOT, 'data', 'failures');

export const AnalyzeFailureInputSchema = z.object({
  testId: z.string(),
});

export const analyzeFailureTool = {
  name: 'analyze_failure',
  description:
    'Analisa heuristicamente uma falha de teste a partir de seu testId. Retorna hipótese da causa raiz, artefatos relacionados e falhas anteriores similares.',
  inputSchema: {
    type: 'object',
    properties: {
      testId: { type: 'string', description: 'testId retornado por run_test_case' },
    },
    required: ['testId'],
  },
};

interface FailureRecord {
  testId: string;
  name: string;
  errors: Array<{ message: string; stack?: string; location?: string }>;
  timestamp: string;
}

interface AnalyzeOutput {
  hypothesis: string;
  matchedPatterns: string[];
  relatedArtifacts: string[];
  similarPastFailures: HistoryEntry[];
}

const PATTERNS: Array<{ pattern: RegExp; tag: string; hypothesis: string }> = [
  {
    pattern: /TimeoutError|exceeded.*timeout|Timeout \d+ms exceeded/i,
    tag: 'timeout',
    hypothesis:
      'Provável timeout em waitFor/locator: elemento não apareceu no tempo esperado. Verifique seletor, condições de carregamento e ajuste timeoutMs se necessário.',
  },
  {
    pattern: /Element is not visible|element is hidden|not visible/i,
    tag: 'visibility',
    hypothesis:
      'Seletor encontra elemento mas está oculto (display:none, visibility:hidden ou fora do viewport). Aguarde scroll ou estado correto antes de interagir.',
  },
  {
    pattern: /expect\([^)]*\)\.(toBe|toEqual|toContain|toHaveText|toHaveValue|toHaveURL)/i,
    tag: 'assertion',
    hypothesis:
      'Mismatch de asserção: o valor recebido não corresponde ao esperado. Compare actual vs expected nos logs para identificar a divergência.',
  },
  {
    pattern: /net::ERR|ECONNREFUSED|ENOTFOUND|fetch failed/i,
    tag: 'network',
    hypothesis:
      'Erro de rede: backend offline, DNS falhou ou conexão recusada. Verifique se a URL alvo está acessível.',
  },
  {
    pattern: /strict mode violation|resolved to \d+ elements/i,
    tag: 'strict-mode',
    hypothesis:
      'Strict mode violation: o seletor casa com múltiplos elementos. Refine com .first() ou um seletor mais específico.',
  },
  {
    pattern: /Element is not attached|detached from the DOM/i,
    tag: 'detached',
    hypothesis:
      'Elemento foi removido do DOM antes da interação (re-render). Re-localize o elemento após mudança de estado.',
  },
];

export function analyzeStack(text: string): { hypothesis: string; matched: string[] } {
  const matched: string[] = [];
  const hypotheses: string[] = [];
  for (const { pattern, tag, hypothesis } of PATTERNS) {
    if (pattern.test(text)) {
      matched.push(tag);
      hypotheses.push(hypothesis);
    }
  }
  if (hypotheses.length === 0) {
    return {
      hypothesis:
        'Nenhum padrão conhecido casou. Inspecione manualmente o stack trace, screenshot e trace para identificar a causa.',
      matched,
    };
  }
  return { hypothesis: hypotheses.join(' | '), matched };
}

async function loadFailureRecord(testId: string): Promise<FailureRecord | null> {
  const file = path.join(FAILURES_DIR, `${testId}.json`);
  try {
    const raw = await readFile(file, 'utf-8');
    return JSON.parse(raw) as FailureRecord;
  } catch {
    return null;
  }
}

export async function analyzeFailure(rawInput: unknown) {
  const { testId } = AnalyzeFailureInputSchema.parse(rawInput);
  const record = await loadFailureRecord(testId);

  if (!record) {
    const out: AnalyzeOutput = {
      hypothesis: `Nenhum registro de falha encontrado para testId=${testId}. Confirme o testId ou execute o teste novamente.`,
      matchedPatterns: [],
      relatedArtifacts: [],
      similarPastFailures: [],
    };
    return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
  }

  const stack = record.errors.map((e) => `${e.message}\n${e.stack ?? ''}`).join('\n\n');
  const { hypothesis, matched } = analyzeStack(stack);

  const relatedArtifacts = [
    `loomi://artifacts/${testId}/screenshot.png`,
    `loomi://artifacts/${testId}/video.mp4`,
    `loomi://artifacts/${testId}/trace.zip`,
  ];

  const history = await readHistoryFile();
  const similarPastFailures = history
    .filter(
      (h) =>
        h.testId !== testId &&
        h.name === record.name &&
        (h.status === 'failed' || h.status === 'timedOut'),
    )
    .slice(-5);

  const out: AnalyzeOutput = {
    hypothesis,
    matchedPatterns: matched,
    relatedArtifacts,
    similarPastFailures,
  };
  return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
}
