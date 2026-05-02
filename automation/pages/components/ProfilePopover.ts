import type { Locator, Page } from '@playwright/test';

/**
 * ProfilePopover — popover que abre ao clicar no avatar do usuário logado (header).
 *
 * Items (exploration-notes §15.4):
 * - Email read-only
 * - Botão "Editar perfil"
 * - Botão "Excluir conta" (destrutivo)
 * - Switch `#switch-google-calendar` "Conectar com seu Google Calendar"
 * - Botão "Sair"
 */
export class ProfilePopover {
  constructor(private readonly page: Page) {}

  /** Avatar trigger no header (logado). */
  private get avatarTrigger(): Locator {
    return this.page.locator('header button:has(img), header [role="button"]:has(img)').last();
  }

  get root(): Locator {
    return this.page.locator('[role="dialog"][aria-labelledby^="popover-header"]').first();
  }

  /** Abre o popover clicando no avatar. */
  async open(): Promise<void> {
    await this.avatarTrigger.click();
    await this.root.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async isOpen(timeout = 5_000): Promise<boolean> {
    return this.root.isVisible({ timeout }).catch(() => false);
  }

  /** Email exibido no popover (read-only). */
  async getEmail(): Promise<string> {
    const emailLocator = this.root.locator('text=/@/').first();
    return (await emailLocator.textContent())?.trim() ?? '';
  }

  async clickSair(): Promise<void> {
    await this.root.getByRole('button', { name: /^sair$/i }).click();
  }

  /** Toggle do switch Google Calendar (Chakra Switch). */
  async toggleGoogleCalendar(): Promise<void> {
    const switchInput = this.page.locator('input#switch-google-calendar');
    // Chakra Switch: input está hidden, clicar no label envia o evento real
    const label = this.page.locator('label[for="switch-google-calendar"]');
    if (await label.isVisible().catch(() => false)) {
      await label.click();
    } else {
      await switchInput.check({ force: true });
    }
  }

  /** True se Google Calendar conectado (switch ON). */
  async isGoogleCalendarConnected(): Promise<boolean> {
    const switchInput = this.page.locator('input#switch-google-calendar');
    return switchInput.isChecked().catch(() => false);
  }
}
