import type { Locator, Page } from '@playwright/test';

/**
 * MatchModal — modal Chakra que abre ao clicar em card de partida.
 * Selector raiz: `[role="dialog"][aria-labelledby^="chakra-modal--header"]`
 *
 * Estrutura (ver exploration-notes §15.2):
 * - Header: "Partida Finalizada" + data DD/MM/YYYY
 * - Centro: campeonato + escudo+time + placar (X) + escudo+time
 * - Body (FINALIZADA): empty state "Nada por aqui..."
 */
export class MatchModal {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('[role="dialog"][aria-labelledby^="chakra-modal--header"]').first();
  }

  get locator(): Locator {
    return this.root;
  }

  async isOpen(timeout = 5_000): Promise<boolean> {
    return this.root.isVisible({ timeout }).catch(() => false);
  }

  async waitForOpen(timeout = 10_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }

  /** Retorna o título do header ("Partida Finalizada", "Ao vivo", etc). */
  async getStatus(): Promise<string> {
    const header = this.root.locator('header, [class*="Header"]').first();
    return (await header.textContent())?.trim() ?? '';
  }

  /** Retorna a data em formato textual (DD/MM/YYYY ou similar). */
  async getDate(): Promise<string> {
    const dateMatch = this.root.locator('text=/\\d{2}\\/\\d{2}\\/\\d{4}/').first();
    return (await dateMatch.textContent())?.trim() ?? '';
  }

  /** Texto de campeonato dentro do modal. */
  async getCampeonato(): Promise<string> {
    // primeiro span genérico do body do modal costuma trazer campeonato
    return (await this.root.locator('span').first().textContent())?.trim() ?? '';
  }

  async getHomeTeam(): Promise<string> {
    return (await this.root.locator('text=/.+/').nth(2).textContent())?.trim() ?? '';
  }

  async getAwayTeam(): Promise<string> {
    return (await this.root.locator('text=/.+/').nth(4).textContent())?.trim() ?? '';
  }

  /** Placar concatenado (ex: "0 X 0"). */
  async getScore(): Promise<string> {
    const scores = await this.root.locator('text=/^\\d+$/').allTextContents();
    if (scores.length < 2) return '';
    return `${scores[0]} X ${scores[1]}`;
  }

  /** Mensagem de empty state quando não há highlights ("Nada por aqui..."). */
  async getEmptyHighlightsMessage(): Promise<string | null> {
    const empty = this.root.locator('text=/Nada por aqui/i').first();
    if (await empty.isVisible().catch(() => false)) {
      return (await empty.textContent())?.trim() ?? null;
    }
    return null;
  }

  /** Fecha o modal via botão Close (X) — Chakra usa aria-label="Close". */
  async close(): Promise<void> {
    const closeBtn = this.root.getByRole('button', { name: /close/i }).first();
    await closeBtn.click();
    await this.root.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
  }
}
