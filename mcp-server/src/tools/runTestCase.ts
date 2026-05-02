import { RunTestCaseInputSchema } from '../types/mcp.js';
import { runPlaywright } from '../runner/playwrightBridge.js';
import { parseResult } from '../runner/resultParser.js';
import { registerArtifact } from '../resources/registry.js';

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
  } catch {
    return [];
  }
}

export async function runTestCase(rawInput: unknown) {
  const input = RunTestCaseInputSchema.parse(rawInput);
  const run = await runPlaywright({
    grep: input.name,
    browser: input.browser,
    headed: input.headed,
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
  }

  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
