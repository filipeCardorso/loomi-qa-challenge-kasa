import { z } from 'zod';
import { liveBrowser } from '../runner/liveBrowser.js';

export const GetElementStatusInputSchema = z.object({
  url: z.string().url().optional(),
  selector: z.string(),
  timeoutMs: z.number().optional().default(5000),
});

export const getElementStatusTool = {
  name: 'get_element_status',
  description:
    'Retorna estado completo de um elemento (visibilidade, texto, atributos, bounding box, role)',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      selector: { type: 'string' },
      timeoutMs: { type: 'number' },
    },
    required: ['selector'],
  },
};

export async function getElementStatus(rawInput: unknown) {
  const input = GetElementStatusInputSchema.parse(rawInput);
  const page = await liveBrowser.getPage();
  if (input.url) await page.goto(input.url);

  const locator = page.locator(input.selector).first();
  const exists = (await locator.count()) > 0;
  if (!exists) {
    return { content: [{ type: 'text', text: JSON.stringify({ exists: false }, null, 2) }] };
  }

  const [visible, enabled, text, boundingBox, ariaRole] = await Promise.all([
    locator.isVisible(),
    locator.isEnabled().catch(() => true),
    locator.textContent().then((t) => t ?? ''),
    locator.boundingBox(),
    locator.getAttribute('role'),
  ]);

  const attributes = await locator.evaluate((el) => {
    const out: Record<string, string> = {};
    for (const attr of (el as Element).attributes) out[attr.name] = attr.value;
    return out;
  });

  const result = { exists: true, visible, enabled, text, boundingBox, attributes, ariaRole };
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
