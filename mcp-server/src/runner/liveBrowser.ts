import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

class LiveBrowserSingleton {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  async getPage(): Promise<Page> {
    if (!this.page) {
      this.browser = await chromium.launch({ headless: true });
      this.context = await this.browser.newContext({ baseURL: 'https://www.kasa.live' });
      this.page = await this.context.newPage();
    }
    return this.page;
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.page = this.context = this.browser = undefined;
  }
}

export const liveBrowser = new LiveBrowserSingleton();
