import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';

interface ResourceEntry {
  uri: string;
  name: string;
  mimeType: string;
  localPath: string;
}
const registry = new Map<string, ResourceEntry>();

export function registerArtifact(
  testId: string,
  type: 'screenshot' | 'video' | 'trace' | 'error.log' | 'console.log' | 'network.har' | 'dom.html',
  localPath: string,
) {
  const mimeMap = {
    screenshot: 'image/png',
    video: 'video/mp4',
    trace: 'application/zip',
    'error.log': 'text/plain',
    'console.log': 'text/plain',
    'network.har': 'application/json',
    'dom.html': 'text/html',
  };
  const filenameMap = {
    screenshot: 'screenshot.png',
    video: 'video.mp4',
    trace: 'trace.zip',
    'error.log': 'error.log',
    'console.log': 'console.log',
    'network.har': 'network.har',
    'dom.html': 'dom.html',
  };
  const uri = `loomi://artifacts/${testId}/${filenameMap[type]}`;
  registry.set(uri, { uri, name: `${testId} ${type}`, mimeType: mimeMap[type], localPath });
  return uri;
}

export function attachResourceHandlers(server: Server) {
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: Array.from(registry.values()).map(({ uri, name, mimeType }) => ({
      uri,
      name,
      mimeType,
    })),
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req: ReadResourceRequest) => {
    const entry = registry.get(req.params.uri);
    if (!entry) throw new Error(`Resource não encontrado: ${req.params.uri}`);
    const content = await readFile(entry.localPath);
    if (entry.mimeType.startsWith('text/') || entry.mimeType === 'application/json') {
      return {
        contents: [{ uri: entry.uri, mimeType: entry.mimeType, text: content.toString('utf-8') }],
      };
    }
    return {
      contents: [{ uri: entry.uri, mimeType: entry.mimeType, blob: content.toString('base64') }],
    };
  });
}
