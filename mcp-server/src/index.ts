#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runTestCaseTool, runTestCase } from './tools/runTestCase.js';
import { getElementStatusTool, getElementStatus } from './tools/getElementStatus.js';
import { navigateToTool, navigateTo } from './tools/navigateTo.js';
import { listTestCasesTool, listTestCases } from './tools/listTestCases.js';
import { getTestHistoryTool, getTestHistory } from './tools/getTestHistory.js';
import { extractDomSnapshotTool, extractDomSnapshot } from './tools/extractDomSnapshot.js';
import { analyzeFailureTool, analyzeFailure } from './tools/analyzeFailure.js';
import { attachResourceHandlers } from './resources/registry.js';

const server = new Server(
  { name: 'loomi-qa-mcp', version: '0.6.0' },
  { capabilities: { tools: {}, resources: {} } },
);

const REGISTRY = [
  { def: runTestCaseTool, handler: runTestCase },
  { def: getElementStatusTool, handler: getElementStatus },
  { def: navigateToTool, handler: navigateTo },
  { def: listTestCasesTool, handler: listTestCases },
  { def: getTestHistoryTool, handler: getTestHistory },
  { def: extractDomSnapshotTool, handler: extractDomSnapshot },
  { def: analyzeFailureTool, handler: analyzeFailure },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: REGISTRY.map((r) => r.def),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const entry = REGISTRY.find((r) => r.def.name === req.params.name);
  if (!entry) throw new Error(`Tool desconhecido: ${req.params.name}`);
  return entry.handler(req.params.arguments ?? {});
});

attachResourceHandlers(server);

const transport = new StdioServerTransport();
await server.connect(transport);
