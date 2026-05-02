import { RunTestCaseInputSchema } from '../types/mcp.js';
import { runPlaywright } from '../runner/playwrightBridge.js';
import { parseResult } from '../runner/resultParser.js';

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

export async function runTestCase(rawInput: unknown) {
  const input = RunTestCaseInputSchema.parse(rawInput);
  const run = await runPlaywright({
    grep: input.name,
    browser: input.browser,
    headed: input.headed,
  });
  const result = parseResult(run.stdout);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
