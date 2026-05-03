import type { Locator, Page } from '@playwright/test';
import { SELECTORS } from '@support/selectors';
import { BaseComponent } from './BaseComponent';

/**
 * NotificationsPanel — popover que abre ao clicar no sino do header.
 *
 * Estado vazio padrão (exploration-notes §15.5):
 * "Você não tem notificações no momento."
 */
export class NotificationsPanel extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private get bellTrigger(): Locator {
    return this.page.getByRole('button', { name: /notifica/i }).first();
  }

  get root(): Locator {
    return this.page.locator(SELECTORS.notificationsPanel).first();
  }

  async open(): Promise<void> {
    await this.bellTrigger.click();
    await this.waitForOpen(5_000);
  }

  /**
   * Lista de mensagens visíveis. Vazio = empty state ("Você não tem notificações...").
   */
  async getMessages(): Promise<string[]> {
    const items = this.root.locator('li, [role="listitem"]');
    const count = await items.count();
    if (count === 0) return [];
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await items.nth(i).textContent())?.trim() ?? '';
      if (text) out.push(text);
    }
    return out;
  }
}
