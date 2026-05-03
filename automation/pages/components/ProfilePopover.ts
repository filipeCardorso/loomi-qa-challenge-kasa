import type { Locator, Page } from '@playwright/test';
import { SELECTORS } from '@support/selectors';
import { BaseComponent } from './BaseComponent';

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
export class ProfilePopover extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Avatar trigger no header (logado).
   *
   * Validado em 2026-05-02: o accessible-name do botão é "avatar" (vem do
   * `<img alt="avatar">` filho). Usamos `getByRole('button', { name: 'avatar' })`
   * ao invés de `button[aria-label="avatar"]` porque o atributo `aria-label`
   * pode não estar setado no botão (a label vem da imagem filha).
   *
   * O seletor antigo (`header button:has(img) ... .last()`) batia em
   * `button[data-cy="btn-logout-profile"]` (hidden) e quebrava o click.
   */
  private get avatarTrigger(): Locator {
    return this.page.getByRole('button', { name: 'avatar', exact: true }).first();
  }

  get root(): Locator {
    return this.page.locator(SELECTORS.profilePopover).first();
  }

  /** Abre o popover clicando no avatar. */
  async open(): Promise<void> {
    await this.avatarTrigger.click();
    await this.waitForOpen(5_000);
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
