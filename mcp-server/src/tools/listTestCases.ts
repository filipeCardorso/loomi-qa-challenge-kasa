import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/tools/listTestCases.js -> repo root: ../../..
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_TESTS_DIR = path.join(REPO_ROOT, 'automation', 'tests');

export const ListTestCasesInputSchema = z.object({
  dir: z.string().optional(),
});

export const listTestCasesTool = {
  name: 'list_test_cases',
  description:
    'Lista os casos de teste Playwright disponíveis em automation/tests, extraindo nome, arquivo e tags (@smoke, @core etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      dir: {
        type: 'string',
        description: 'Diretório alternativo (padrão: automation/tests)',
      },
    },
  },
};

export interface TestCase {
  name: string;
  file: string;
  tags: string[];
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    let info;
    try {
      info = await stat(full);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (info.isFile() && full.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

// Captures: test('title' | test("title" | test(`title` | test.only/skip/fixme variants
const TEST_REGEX = /\btest(?:\.(?:only|skip|fixme|describe))?\s*\(\s*(['"`])([^'"`]+?)\1/g;
const TAG_REGEX = /(@[a-z][a-zA-Z0-9_-]*)/g;

export function parseTestsFromSource(source: string, file: string): TestCase[] {
  const cases: TestCase[] = [];
  let match: RegExpExecArray | null;
  TEST_REGEX.lastIndex = 0;
  while ((match = TEST_REGEX.exec(source)) !== null) {
    const title = match[2];
    const tags: string[] = [];
    let tagMatch: RegExpExecArray | null;
    TAG_REGEX.lastIndex = 0;
    while ((tagMatch = TAG_REGEX.exec(title)) !== null) tags.push(tagMatch[1]);
    cases.push({ name: title, file, tags });
  }
  return cases;
}

export async function listTestCases(rawInput: unknown) {
  const input = ListTestCasesInputSchema.parse(rawInput ?? {});
  const baseDir = input.dir ? path.resolve(input.dir) : DEFAULT_TESTS_DIR;
  const files = await walk(baseDir);
  const all: TestCase[] = [];
  for (const file of files) {
    try {
      const source = await readFile(file, 'utf-8');
      const rel = path.relative(REPO_ROOT, file);
      all.push(...parseTestsFromSource(source, rel));
    } catch {
      // pula arquivos ilegíveis
    }
  }
  return {
    content: [{ type: 'text', text: JSON.stringify({ total: all.length, tests: all }, null, 2) }],
  };
}
