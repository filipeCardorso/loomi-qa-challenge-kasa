import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bridge from '../../src/runner/playwrightBridge.js';
import { runTestCase } from '../../src/tools/runTestCase.js';

const PASSING_REPORT = JSON.stringify({
  stats: { duration: 100 },
  suites: [
    {
      specs: [
        {
          title: '@smoke bootstrap',
          tests: [{ results: [{ status: 'passed', duration: 100 }] }],
        },
      ],
    },
  ],
});

const FAILING_REPORT = JSON.stringify({
  stats: { duration: 5000 },
  suites: [
    {
      specs: [
        {
          title: '@core busca',
          tests: [
            {
              results: [
                {
                  status: 'failed',
                  duration: 5000,
                  errors: [{ message: 'Element is not visible' }],
                  attachments: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

describe('runTestCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna estrutura de output válida quando teste passa', async () => {
    vi.spyOn(bridge, 'runPlaywright').mockResolvedValue({
      exitCode: 0,
      stdout: PASSING_REPORT,
      stderr: '',
    });

    const out = await runTestCase({ name: '@smoke' });
    expect(out.content).toHaveLength(1);
    expect(out.content[0].type).toBe('text');
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.status).toBe('passed');
    expect(parsed.duration_ms).toBe(100);
    expect(parsed.testId).toBeTruthy();
    expect(parsed.errors).toEqual([]);
    expect(parsed.artifacts).toBeDefined();
  });

  it('persiste falha e retorna status failed', async () => {
    vi.spyOn(bridge, 'runPlaywright').mockResolvedValue({
      exitCode: 1,
      stdout: FAILING_REPORT,
      stderr: '',
    });

    const out = await runTestCase({ name: '@core' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.status).toBe('failed');
    expect(parsed.errors[0].message).toContain('Element is not visible');
    expect(parsed.testId).toBeTruthy();
  });

  it('retorna failed quando stdout não é JSON válido', async () => {
    vi.spyOn(bridge, 'runPlaywright').mockResolvedValue({
      exitCode: 1,
      stdout: 'lixo não json',
      stderr: '',
    });

    const out = await runTestCase({ name: '@bogus' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.status).toBe('failed');
    expect(parsed.errors[0].message).toContain('parsear');
  });

  it('valida input com zod (rejeita name ausente)', async () => {
    await expect(runTestCase({})).rejects.toThrow();
  });
});
