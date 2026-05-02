import { z } from 'zod';
import { liveBrowser } from '../runner/liveBrowser.js';

export const navigateToTool = {
  name: 'navigate_to',
  description: 'Navega o browser persistente para uma URL',
  inputSchema: {
    type: 'object',
    properties: { url: { type: 'string' } },
    required: ['url'],
  },
};

export async function navigateTo(rawInput: unknown) {
  const { url } = z.object({ url: z.string().url() }).parse(rawInput);
  const page = await liveBrowser.getPage();
  await page.goto(url);
  return { content: [{ type: 'text', text: JSON.stringify({ ok: true, finalUrl: page.url() }) }] };
}
