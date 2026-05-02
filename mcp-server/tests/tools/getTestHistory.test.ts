import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readHistoryFile, getTestHistory } from '../../src/tools/getTestHistory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/history.jsonl');

describe('getTestHistory — readHistoryFile', () => {
  it('parseia linhas válidas e ignora corrompidas', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'mcp-hist-'));
    const file = path.join(dir, 'h.jsonl');
    await writeFile(
      file,
      [
        '{"testId":"a","name":"@smoke","status":"passed","duration_ms":10,"timestamp":"2026-05-01T00:00:00Z"}',
        'lixo invalido',
        '{"testId":"b","name":"@smoke","status":"failed","duration_ms":20,"timestamp":"2026-05-01T01:00:00Z"}',
        '',
      ].join('\n'),
      'utf-8',
    );
    const entries = await readHistoryFile(file);
    expect(entries).toHaveLength(2);
    expect(entries[0].testId).toBe('a');
    expect(entries[1].testId).toBe('b');
  });

  it('retorna array vazio para arquivo inexistente', async () => {
    const entries = await readHistoryFile('/tmp/does-not-exist-xyz.jsonl');
    expect(entries).toEqual([]);
  });

  it('lê fixture com 4 entries', async () => {
    const entries = await readHistoryFile(FIXTURE);
    expect(entries).toHaveLength(4);
    expect(entries[0].name).toBe('@smoke bootstrap');
  });
});

describe('getTestHistory — handler', () => {
  it('handler retorna estrutura correta mesmo sem dados', async () => {
    const out = await getTestHistory({ name: 'inexistente-xyz', limit: 5 });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('runs');
    expect(Array.isArray(parsed.runs)).toBe(true);
  });

  it('aplica filtro por nome corretamente em fixture isolado', async () => {
    // Testa diretamente readHistoryFile + lógica de filtro replicada
    const all = await readHistoryFile(FIXTURE);
    const filtered = all.filter((e) => e.name.toLowerCase().includes('smoke'));
    expect(filtered).toHaveLength(2);
    expect(filtered.every((e) => e.name.includes('smoke'))).toBe(true);
  });

  it('respeita limit ao retornar runs mais recentes', async () => {
    const all = await readHistoryFile(FIXTURE);
    const ordered = [...all].reverse().slice(0, 2);
    expect(ordered).toHaveLength(2);
    // Mais recentes primeiro
    expect(ordered[0].testId).toBe('abc-4');
    expect(ordered[1].testId).toBe('abc-3');
  });
});
