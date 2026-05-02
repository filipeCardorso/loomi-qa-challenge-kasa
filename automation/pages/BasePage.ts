import type { Locator, Page } from '@playwright/test';

/**
 * BasePage — utilitários comuns reutilizados pelos POMs.
 * Não contém lógica de teste; apenas navegação básica e helpers de espera.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navega para path relativo ao baseURL configurado. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Espera locator ficar visível com timeout configurável. */
  async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Tenta dispensar overlays/cookie banners se aparecerem.
   * Preventivo — kasa.live atualmente não exibe banner mas pode mudar.
   */
  async dismissCookiesIfPresent(): Promise<void> {
    const candidates = [
      this.page.getByRole('button', { name: /aceitar( todos)?( cookies)?/i }),
      this.page.getByRole('button', { name: /^ok$/i }),
      this.page.getByRole('button', { name: /entendi/i }),
    ];
    for (const c of candidates) {
      if (
        await c
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await c
          .first()
          .click()
          .catch(() => undefined);
      }
    }
  }
}
