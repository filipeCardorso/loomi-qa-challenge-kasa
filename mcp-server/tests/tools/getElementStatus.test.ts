import { describe, it, expect, vi, beforeEach } from 'vitest';
import { liveBrowser } from '../../src/runner/liveBrowser.js';
import { getElementStatus } from '../../src/tools/getElementStatus.js';

describe('getElementStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna exists:false quando elemento não existe', async () => {
    const fakePage = {
      goto: vi.fn(),
      locator: () => ({ first: () => ({ count: vi.fn().mockResolvedValue(0) }) }),
    } as unknown as Awaited<ReturnType<typeof liveBrowser.getPage>>;
    vi.spyOn(liveBrowser, 'getPage').mockResolvedValue(fakePage);

    const out = await getElementStatus({ selector: '#nope' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.exists).toBe(false);
  });

  it('retorna shape completo quando elemento existe', async () => {
    const locator = {
      count: vi.fn().mockResolvedValue(1),
      isVisible: vi.fn().mockResolvedValue(true),
      isEnabled: vi.fn().mockResolvedValue(true),
      textContent: vi.fn().mockResolvedValue('Favoritar'),
      boundingBox: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 40 }),
      getAttribute: vi.fn().mockResolvedValue('button'),
      evaluate: vi
        .fn()
        .mockResolvedValue({ class: 'btn btn-primary', 'aria-label': 'Favoritar time' }),
    };
    const fakePage = {
      goto: vi.fn(),
      locator: () => ({ first: () => locator }),
    } as unknown as Awaited<ReturnType<typeof liveBrowser.getPage>>;
    vi.spyOn(liveBrowser, 'getPage').mockResolvedValue(fakePage);

    const out = await getElementStatus({ selector: 'button[aria-label="Favoritar time"]' });
    const parsed = JSON.parse((out.content[0] as { type: string; text: string }).text);
    expect(parsed.exists).toBe(true);
    expect(parsed.visible).toBe(true);
    expect(parsed.enabled).toBe(true);
    expect(parsed.text).toBe('Favoritar');
    expect(parsed.boundingBox).toEqual({ x: 0, y: 0, width: 100, height: 40 });
    expect(parsed.ariaRole).toBe('button');
    expect(parsed.attributes['aria-label']).toBe('Favoritar time');
  });

  it('navega para url se fornecida antes de localizar', async () => {
    const goto = vi.fn().mockResolvedValue(null);
    const fakePage = {
      goto,
      locator: () => ({ first: () => ({ count: vi.fn().mockResolvedValue(0) }) }),
    } as unknown as Awaited<ReturnType<typeof liveBrowser.getPage>>;
    vi.spyOn(liveBrowser, 'getPage').mockResolvedValue(fakePage);

    await getElementStatus({ selector: '#x', url: 'https://www.kasa.live/' });
    expect(goto).toHaveBeenCalledWith('https://www.kasa.live/');
  });
});
