import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listTestCases, parseTestsFromSource } from '../../src/tools/listTestCases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

describe('listTestCases — parseTestsFromSource', () => {
  it('extrai títulos e tags de chamadas test()', () => {
    const source = `
      import { test } from '@playwright/test';
      test('@smoke titulo basico', async () => {});
      test("@core @regression busca por time", async () => {});
      test.skip('@flaky teste pulado', async () => {});
    `;
    const cases = parseTestsFromSource(source, 'fake.spec.ts');
    expect(cases).toHaveLength(3);
    expect(cases[0].name).toBe('@smoke titulo basico');
    expect(cases[0].tags).toEqual(['@smoke']);
    expect(cases[1].tags).toEqual(['@core', '@regression']);
    expect(cases[2].name).toBe('@flaky teste pulado');
  });

  it('ignora chamadas sem string literal', () => {
    const source = `test(myDynamicName, async () => {});`;
    expect(parseTestsFromSource(source, 'x.spec.ts')).toEqual([]);
  });

  it('lida com template literals simples', () => {
    const source = 'test(`@perf p95`, async () => {});';
    const cases = parseTestsFromSource(source, 'p.spec.ts');
    expect(cases).toHaveLength(1);
    expect(cases[0].tags).toEqual(['@perf']);
  });
});

describe('listTestCases — handler', () => {
  it('lê fixture spec e retorna 3 testes (smoke, core, regression)', async () => {
    const out = await listTestCases({ dir: FIXTURES_DIR });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.total).toBeGreaterThanOrEqual(3);
    const tags = parsed.tests.flatMap((t: { tags: string[] }) => t.tags);
    expect(tags).toContain('@smoke');
    expect(tags).toContain('@core');
    expect(tags).toContain('@regression');
  });

  it('retorna lista vazia para diretório inexistente', async () => {
    const out = await listTestCases({ dir: '/tmp/nope-does-not-exist-xyz' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.total).toBe(0);
    expect(parsed.tests).toEqual([]);
  });
});
