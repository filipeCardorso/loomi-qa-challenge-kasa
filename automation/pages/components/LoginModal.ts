import type { Locator, Page } from '@playwright/test';
import { SELECTORS } from '@support/selectors';
import { BaseComponent } from './BaseComponent';

/**
 * LoginModal — modal "Entrar" que abre ao clicar no botão "Entrar" do header.
 *
 * Descobertas críticas (exploration-notes §13.1):
 * - Login PRIMÁRIO é email/senha LOCAL (não OAuth Google)
 * - Existe "Entrar com o Google" como opção secundária — só validar redirect
 * - Botão Entrar do MODAL é `.last()` (porque header também tem um)
 *
 * Discriminator vs MatchModal: ver `SELECTORS.loginModal`
 * (`:has(h2:has-text("Entrar"))`) — ambos usam o mesmo `role=dialog` Chakra.
 */
export class LoginModal extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  get root(): Locator {
    return this.page.locator(SELECTORS.loginModal).first();
  }

  get emailInput(): Locator {
    return this.root.getByPlaceholder(/digite seu e-?mail/i);
  }

  get passwordInput(): Locator {
    return this.root.getByPlaceholder(/digite sua senha/i);
  }

  /** Botão "Entrar" DENTRO do modal (escopo `root` evita o do header). */
  get submitEntrarButton(): Locator {
    return this.root.getByRole('button', { name: /^entrar$/i }).last();
  }

  get criarContaButton(): Locator {
    return this.root.getByRole('button', { name: /criar conta/i }).last();
  }

  get googleButton(): Locator {
    return this.root.getByRole('button', { name: /entrar com o google/i });
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
