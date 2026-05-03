import type { Locator, Page } from '@playwright/test';
import { SELECTORS } from '@support/selectors';

/**
 * LoginModal — modal "Entrar" que abre ao clicar no botão "Entrar" do header.
 *
 * Descobertas críticas (exploration-notes §13.1):
 * - Login PRIMÁRIO é email/senha LOCAL (não OAuth Google)
 * - Existe "Entrar com o Google" como opção secundária — só validar redirect
 * - Botão Entrar do MODAL é `.last()` (porque header também tem um)
 */
export class LoginModal {
  constructor(private readonly page: Page) {}

  get root(): Locator {
    return this.page.locator(SELECTORS.matchModalDialog).first();
  }

  get emailInput(): Locator {
    return this.page.getByPlaceholder(/digite seu e-?mail/i);
  }

  get passwordInput(): Locator {
    return this.page.getByPlaceholder(/digite sua senha/i);
  }

  /** Botão "Entrar" DENTRO do modal (último — `.last()` evita o do header). */
  get submitEntrarButton(): Locator {
    return this.page.getByRole('button', { name: /^entrar$/i }).last();
  }

  get criarContaButton(): Locator {
    return this.page.getByRole('button', { name: /criar conta/i }).last();
  }

  get googleButton(): Locator {
    return this.page.getByRole('button', { name: /entrar com o google/i });
  }

  async isOpen(timeout = 5_000): Promise<boolean> {
    return this.emailInput.isVisible({ timeout }).catch(() => false);
  }

  async waitForOpen(timeout = 10_000): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible', timeout });
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitEntrar(): Promise<void> {
    await this.submitEntrarButton.click();
  }

  async clickCriarConta(): Promise<void> {
    await this.criarContaButton.click();
  }

  /**
   * Click no Google OAuth — apenas valida redirect (não completa OAuth real).
   * Retorna a URL para a qual o site redirecionou.
   */
  async clickGoogleOAuth(): Promise<string> {
    await this.googleButton.click();
    await this.page.waitForURL(/google/i, { timeout: 10_000 }).catch(() => undefined);
    return this.page.url();
  }
}
