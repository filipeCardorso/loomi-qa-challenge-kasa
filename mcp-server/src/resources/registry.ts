import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';

/**
 * Tipos de artefatos que podem ser registrados (nome do enum bate com o sufixo
 * usado no filename). Adicione novos tipos aqui + nos dois mapas internos.
 */
export type ResourceType =
  | 'screenshot'
  | 'video'
  | 'trace'
  | 'error.log'
  | 'console.log'
  | 'network.har'
  | 'dom.html';

interface ResourceEntry {
  uri: string;
  name: string;
  mimeType: string;
  localPath: string;
}

const MIME_MAP: Record<ResourceType, string> = {
  screenshot: 'image/png',
  video: 'video/mp4',
  trace: 'application/zip',
  'error.log': 'text/plain',
  'console.log': 'text/plain',
  'network.har': 'application/json',
  'dom.html': 'text/html',
};

const FILENAME_MAP: Record<ResourceType, string> = {
  screenshot: 'screenshot.png',
  video: 'video.mp4',
  trace: 'trace.zip',
  'error.log': 'error.log',
  'console.log': 'console.log',
  'network.har': 'network.har',
  'dom.html': 'dom.html',
};

/**
 * Contrato público do registry. Tools chamam `register`; o handler MCP usa
 * `list` + `read` (via `attachResourceHandlers`).
 *
 * Ver ADR-003: factory + singleton — em produção usa-se `resourceRegistry`,
 * em testes Vitest cria-se uma instância isolada via `createResourceRegistry`.
 */
export interface ResourceRegistry {
  register(testId: string, type: ResourceType, localPath: string): string;
  list(): ResourceEntry[];
  read(uri: string): Promise<{ mimeType: string; content: Buffer | string }>;
  /** Útil pra testes: zera o estado interno entre runs. */
  clear(): void;
}

export function createResourceRegistry(): ResourceRegistry {
  const entries = new Map<string, ResourceEntry>();

  return {
    register(testId, type, localPath) {
      const uri = `loomi://artifacts/${testId}/${FILENAME_MAP[type]}`;
      entries.set(uri, {
        uri,
        name: `${testId} ${type}`,
        mimeType: MIME_MAP[type],
        localPath,
      });
      return uri;
    },
    list() {
      return Array.from(entries.values());
    },
    async read(uri) {
      const entry = entries.get(uri);
      if (!entry) throw new Error(`Resource não encontrado: ${uri}`);
      const content = await readFile(entry.localPath);
      return { mimeType: entry.mimeType, content };
    },
    clear() {
      entries.clear();
    },
  };
}

/**
 * Singleton default usado em produção pelo `index.ts` e por
 * `tools/runTestCase.ts`. Em testes Vitest pode criar instância isolada.
 */
export const resourceRegistry: ResourceRegistry = createResourceRegistry();

/**
 * Helper retrocompatível — preserva a API pública antiga
 * `registerArtifact(testId, type, localPath)` usada por `runTestCase` e
 * pelos testes Vitest.
 */
export function registerArtifact(
  testId: string,
  type: ResourceType,
  localPath: string,
  registry: ResourceRegistry = resourceRegistry,
): string {
  return registry.register(testId, type, localPath);
}

/**
 * Anexa os 2 handlers MCP (`ListResources` + `ReadResource`) num `Server` SDK.
 *
 * Aceita qualquer `ResourceRegistry` (facilita teste isolando do singleton).
 */
export function attachResourceHandlers(
  server: Server,
  registry: ResourceRegistry = resourceRegistry,
): void {
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: registry.list().map(({ uri, name, mimeType }) => ({ uri, name, mimeType })),
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req: ReadResourceRequest) => {
    const { mimeType, content } = await registry.read(req.params.uri);
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      return {
        contents: [{ uri: req.params.uri, mimeType, text: content.toString('utf-8') }],
      };
    }
    return {
      contents: [{ uri: req.params.uri, mimeType, blob: content.toString('base64') }],
    };
  });
}
