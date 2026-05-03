import type { Locator, Page } from '@playwright/test';

/**
 * Base abstrata pra todos os UI components que envolvem um único container
 * único do DOM (modais, popovers, panels). Cards REPETIDOS no DOM (ex.:
 * `MatchCard`) NÃO devem estender esta base — eles recebem `Locator`
 * pré-resolvido em vez de `Page` (ver ADR-001).
 *
 * Responsabilidades:
 * - Encapsula `root: Locator` (escopo do componente)
 * - Centraliza `isOpen()` / `waitForOpen()` / `waitForClose()` reutilizáveis
 * - Subclasses recebem `Page` no construtor e DEFINEM o `root` via getter
 *   abstract (lazy — re-avaliado a cada chamada, evitando locator stale)
 */
export abstract class BaseComponent {
  constructor(protected readonly page: Page) {}

  /** Locator raiz do componente (subclasse define como localizar). */
  abstract get root(): Locator;

  /** Verdadeiro se o root está visível agora (não-bloqueante). */
  async isOpen(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  /** Aguarda o root virar visível. */
  async waitForOpen(timeoutMs = 5_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  /** Aguarda o root sumir (após close). */
  async waitForClose(timeoutMs = 3_000): Promise<void> {
    await this.root.waitFor({ state: 'hidden', timeout: timeoutMs });
  }
}
