#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runTestCaseTool, runTestCase } from './tools/runTestCase.js';

const server = new Server(
  { name: 'loomi-qa-mcp', version: '0.1.0' },
  { capabilities: { tools: {}, resources: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [runTestCaseTool],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'run_test_case') {
    return runTestCase(req.params.arguments ?? {});
  }
  throw new Error(`Tool desconhecido: ${req.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
