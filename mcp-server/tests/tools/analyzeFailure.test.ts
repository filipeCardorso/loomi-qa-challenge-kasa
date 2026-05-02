import { describe, it, expect } from 'vitest';
import { analyzeStack, analyzeFailure } from '../../src/tools/analyzeFailure.js';

describe('analyzeFailure — analyzeStack', () => {
  it('detecta TimeoutError', () => {
    const r = analyzeStack('TimeoutError: page.click: Timeout 30000ms exceeded.');
    expect(r.matched).toContain('timeout');
    expect(r.hypothesis).toMatch(/timeout/i);
  });

  it('detecta elemento não visível', () => {
    const r = analyzeStack('Error: Element is not visible: button[data-testid="fav"]');
    expect(r.matched).toContain('visibility');
    expect(r.hypothesis).toMatch(/oculto|visível/i);
  });

  it('detecta erro de asserção', () => {
    const r = analyzeStack('expect(received).toBe(expected) // Object.is equality');
    expect(r.matched).toContain('assertion');
  });

  it('detecta erro de rede', () => {
    const r = analyzeStack('net::ERR_CONNECTION_REFUSED at https://www.kasa.live/api/teams');
    expect(r.matched).toContain('network');
  });

  it('detecta strict mode violation', () => {
    const r = analyzeStack('Error: strict mode violation: locator resolved to 5 elements');
    expect(r.matched).toContain('strict-mode');
  });

  it('retorna fallback quando nenhum padrão casa', () => {
    const r = analyzeStack('Algum erro super específico que não conhecemos');
    expect(r.matched).toEqual([]);
    expect(r.hypothesis).toMatch(/Nenhum padrão/i);
  });

  it('combina múltiplas hipóteses', () => {
    const r = analyzeStack(
      'TimeoutError: timeout. Also: Element is not visible. expect(x).toBe(y)',
    );
    expect(r.matched.length).toBeGreaterThanOrEqual(2);
  });
});

describe('analyzeFailure — handler', () => {
  it('retorna mensagem de "não encontrado" para testId desconhecido', async () => {
    const out = await analyzeFailure({ testId: 'totally-fake-id-12345' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.hypothesis).toMatch(/Nenhum registro/i);
    expect(parsed.matchedPatterns).toEqual([]);
    expect(parsed.relatedArtifacts).toEqual([]);
    expect(parsed.similarPastFailures).toEqual([]);
  });

  it('valida input com zod (testId obrigatório)', async () => {
    await expect(analyzeFailure({})).rejects.toThrow();
  });
});
