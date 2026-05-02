import { describe, it, expect, vi } from 'vitest';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { registerArtifact, attachResourceHandlers } from '../../src/resources/registry.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface FakeServer {
  handlers: Map<unknown, (req: unknown) => Promise<unknown>>;
  setRequestHandler(schema: unknown, handler: (req: unknown) => Promise<unknown>): void;
}

function makeServer(): FakeServer {
  return {
    handlers: new Map(),
    setRequestHandler(schema, handler) {
      this.handlers.set(schema, handler);
    },
  };
}

describe('resources/registry', () => {
  it('registra artifact e retorna URI loomi://', () => {
    const uri = registerArtifact('test-id-1', 'screenshot', '/tmp/fake.png');
    expect(uri).toBe('loomi://artifacts/test-id-1/screenshot.png');
  });

  it('list inclui artifact registrado e read entrega conteúdo', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'mcp-registry-'));
    const filePath = path.join(dir, 'error.log');
    const payload = 'TimeoutError: timeout 30000ms exceeded';
    await writeFile(filePath, payload, 'utf-8');

    const uri = registerArtifact('test-id-2', 'error.log', filePath);

    const server = makeServer();
    attachResourceHandlers(server as unknown as Parameters<typeof attachResourceHandlers>[0]);

    const listHandler = server.handlers.get(ListResourcesRequestSchema)!;
    const readHandler = server.handlers.get(ReadResourceRequestSchema)!;
    expect(listHandler).toBeTruthy();
    expect(readHandler).toBeTruthy();

    const list = (await listHandler({})) as {
      resources: Array<{ uri: string; mimeType: string }>;
    };
    expect(list.resources.some((r) => r.uri === uri)).toBe(true);

    const read = (await readHandler({ params: { uri } })) as {
      contents: Array<{ uri: string; mimeType: string; text?: string; blob?: string }>;
    };
    expect(read.contents[0].text).toBe(payload);
    expect(read.contents[0].mimeType).toBe('text/plain');
  });

  it('read inexistente lança erro', async () => {
    const server = makeServer();
    attachResourceHandlers(server as unknown as Parameters<typeof attachResourceHandlers>[0]);
    const readHandler = server.handlers.get(ReadResourceRequestSchema)!;
    await expect(
      readHandler({ params: { uri: 'loomi://artifacts/does-not-exist/x.png' } }),
    ).rejects.toThrow(/não encontrado/);
  });

  it('binário (screenshot) retorna blob base64', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'mcp-registry-'));
    const filePath = path.join(dir, 'shot.png');
    const bin = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    await writeFile(filePath, bin);
    const uri = registerArtifact('test-id-bin', 'screenshot', filePath);

    const server = makeServer();
    attachResourceHandlers(server as unknown as Parameters<typeof attachResourceHandlers>[0]);
    const readHandler = server.handlers.get(ReadResourceRequestSchema)!;
    const read = (await readHandler({ params: { uri } })) as {
      contents: Array<{ blob?: string; mimeType: string }>;
    };
    expect(read.contents[0].blob).toBe(bin.toString('base64'));
    expect(read.contents[0].mimeType).toBe('image/png');
  });
});
