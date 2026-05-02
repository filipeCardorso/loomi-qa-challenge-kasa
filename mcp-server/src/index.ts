#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runTestCaseTool, runTestCase } from './tools/runTestCase.js';
import { getElementStatusTool, getElementStatus } from './tools/getElementStatus.js';
import { navigateToTool, navigateTo } from './tools/navigateTo.js';
import { attachResourceHandlers } from './resources/registry.js';

const server = new Server(
  { name: 'loomi-qa-mcp', version: '0.2.0' },
  { capabilities: { tools: {}, resources: {} } },
);

const tools = {
  run_test_case: runTestCase,
  get_element_status: getElementStatus,
  navigate_to: navigateTo,
};
const toolDefs = [runTestCaseTool, getElementStatusTool, navigateToTool];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefs }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const handler = tools[req.params.name as keyof typeof tools];
  if (!handler) throw new Error(`Tool desconhecido: ${req.params.name}`);
  return handler(req.params.arguments ?? {});
});

attachResourceHandlers(server);

const transport = new StdioServerTransport();
await server.connect(transport);
