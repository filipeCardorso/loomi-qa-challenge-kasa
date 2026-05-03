import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

/**
 * Driver de browser persistente usado pelas tools MCP que precisam de uma
 * Page Playwright entre invocações (`getElementStatus`, `navigateTo`,
 * `extractDomSnapshot`).
 *
 * Ver ADR-003: contrato pequeno (`getPage` + `close`) que mantém compat com
 * o singleton legado mas permite injeção de mock em testes Vitest.
 */
export interface BrowserDriver {
  getPage(): Promise<Page>;
  close(): Promise<void>;
}

export interface CreateLiveBrowserOptions {
  baseURL?: string;
  headless?: boolean;
}

/**
 * Factory de driver lazy: o `chromium.launch` só ocorre na primeira chamada
 * a `getPage`. Subsequentes reusam a mesma `Page`.
 */
export function createLiveBrowser(options: CreateLiveBrowserOptions = {}): BrowserDriver {
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let page: Page | undefined;

  return {
    async getPage(): Promise<Page> {
      if (!page) {
        browser = await chromium.launch({ headless: options.headless ?? true });
        context = await browser.newContext({ baseURL: options.baseURL ?? 'https://www.kasa.live' });
        page = await context.newPage();
      }
      return page;
    },
    async close(): Promise<void> {
      await context?.close();
      await browser?.close();
      page = context = browser = undefined;
    },
  };
}

/**
 * Singleton default usado em produção pelas tools (mantém o import-shape
 * legado `import { liveBrowser } from '../runner/liveBrowser.js'`).
 *
 * Em testes, mocke via `vi.spyOn(liveBrowser, 'getPage').mockResolvedValue(...)`
 * — funciona porque o singleton expõe os mesmos métodos do driver.
 */
export const liveBrowser: BrowserDriver = createLiveBrowser();
