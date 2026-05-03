/**
 * Helpers HTTP de baixo nível pra specs de bugs que precisam fazer asserções
 * em headers/HTML brutos sem instanciar uma `Page` Playwright.
 *
 * Por que não reusar `KasaApiClient`? Esse client é tipado pra endpoints
 * conhecidos (`/match/`, `/team/`). Aqui queremos liberdade pra apontar pra
 * qualquer URL (sitemap.xml, /sitemap_index.xml, etc.) sem cerimônia.
 */

import { request as playwrightRequest, type APIResponse } from '@playwright/test';

const REQUEST_TIMEOUT = 30_000;

/**
 * GET simples — retorna a resposta crua do Playwright.
 *
 * Cuidado: o context é descartado depois, então leia `headers()` e `text()`
 * imediatamente.
 */
export async function fetchUrl(url: string): Promise<{
  status: number;
  headers: Record<string, string>;
  body: string;
}> {
  const ctx = await playwrightRequest.newContext({ timeout: REQUEST_TIMEOUT });
  try {
    const res: APIResponse = await ctx.get(url);
    return {
      status: res.status(),
      headers: res.headers(),
      body: await res.text(),
    };
  } finally {
    await ctx.dispose();
  }
}

/**
 * Conta ocorrências de uma substring exata num texto. Pra asserts simples
 * tipo "meta description aparece N vezes no HTML".
 */
export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }
  return count;
}
