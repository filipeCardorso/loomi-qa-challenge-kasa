import type { Locator, Page } from '@playwright/test';

/**
 * NotificationsPanel — popover que abre ao clicar no sino do header.
 *
 * Estado vazio padrão (exploration-notes §15.5):
 * "Você não tem notificações no momento."
 */
export class NotificationsPanel {
  constructor(private readonly page: Page) {}

  private get bellTrigger(): Locator {
    return this.page.getByRole('button', { name: /notifica/i }).first();
  }

  get root(): Locator {
    return this.page
      .locator('[role="dialog"]')
      .filter({ hasText: /notifica/i })
      .first();
  }

  async open(): Promise<void> {
    await this.bellTrigger.click();
    await this.root.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async isOpen(timeout = 5_000): Promise<boolean> {
    return this.root.isVisible({ timeout }).catch(() => false);
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
