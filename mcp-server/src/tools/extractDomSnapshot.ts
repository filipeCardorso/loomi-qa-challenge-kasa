import { z } from 'zod';
import { liveBrowser } from '../runner/liveBrowser.js';

export const ExtractDomSnapshotInputSchema = z.object({
  selector: z.string().optional(),
  format: z.enum(['html', 'aria-tree']).default('html'),
});

export const extractDomSnapshotTool = {
  name: 'extract_dom_snapshot',
  description:
    'Captura snapshot do DOM da página atual do browser persistente. Formato html (page.content) ou aria-tree (locator.ariaSnapshot).',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'Opcional: limita o snapshot ao outerHTML/ariaSnapshot do elemento',
      },
      format: { type: 'string', enum: ['html', 'aria-tree'] },
    },
  },
};

export async function extractDomSnapshot(rawInput: unknown) {
  const input = ExtractDomSnapshotInputSchema.parse(rawInput ?? {});
  const page = await liveBrowser.getPage();

  let snapshot: string;
  if (input.format === 'aria-tree') {
    const target = input.selector ? page.locator(input.selector).first() : page.locator('body');
    snapshot = await target.ariaSnapshot();
  } else if (input.selector) {
    const locator = page.locator(input.selector).first();
    const count = await locator.count();
    if (count === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'selector não encontrado', selector: input.selector }),
          },
        ],
      };
    }
    snapshot = await locator.evaluate((el) => (el as Element).outerHTML);
  } else {
    snapshot = await page.content();
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ format: input.format, snapshot, length: snapshot.length }, null, 2),
      },
    ],
  };
}
