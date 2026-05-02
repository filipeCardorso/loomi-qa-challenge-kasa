import type { Locator } from '@playwright/test';

/**
 * MatchCard — componente reutilizável que envolve UM card de partida (`div.css-7mca6u`).
 * Recebe o Locator raiz já filtrado pelo POM da página que listou os cards.
 *
 * Anatomia (ver docs/exploration-notes.md §15.1):
 * - chip campeonato (ex: "MLS")
 * - 2 linhas: escudo + nome + placar
 * - status: "Finalizada" | "Ao vivo" | etc
 * - 2 botões: câmera (vídeo highlight) + seta (abre modal)
 */
export class MatchCard {
  constructor(private readonly root: Locator) {}

  /** Retorna o locator raiz para asserts customizados externos. */
  get locator(): Locator {
    return this.root;
  }

  /** Texto do nome do time da casa (primeiro span/img+nome encontrado). */
  async getTeamHome(): Promise<string> {
    return (await this.root.locator('text=/.+/').nth(1).textContent())?.trim() ?? '';
  }

  /** Texto do nome do time visitante. */
  async getTeamAway(): Promise<string> {
    return (await this.root.locator('text=/.+/').nth(3).textContent())?.trim() ?? '';
  }

  /** Placar do time da casa (string — pode ser "0", "1", etc). */
  async getScoreHome(): Promise<string> {
    return (await this.root.locator('text=/^\\d+$/').nth(0).textContent())?.trim() ?? '';
  }

  /** Placar do time visitante. */
  async getScoreAway(): Promise<string> {
    return (await this.root.locator('text=/^\\d+$/').nth(1).textContent())?.trim() ?? '';
  }

  /** Status textual da partida (Finalizada | Ao vivo | etc). */
  async getStatus(): Promise<string> {
    const status = this.root.locator('text=/Finalizada|Ao vivo|Adiada|Cancelada/i').first();
    return (await status.textContent())?.trim() ?? '';
  }

  /** Texto do chip de campeonato (ex: "MLS", "Premier League"). */
  async getCampeonato(): Promise<string> {
    // chip costuma ser o primeiro span do card
    return (await this.root.locator('span').first().textContent())?.trim() ?? '';
  }

  /**
   * Click real (via Playwright) no card para abrir o modal de detalhes.
   * NÃO usar `evaluate(el => el.click())` — não dispara React handler.
   */
  async clickToOpenModal(): Promise<void> {
    await this.root.click();
  }

  /** Click no ícone de câmera (vídeo de melhores momentos). */
  async clickHighlightCamera(): Promise<void> {
    await this.root.locator('button').first().click();
  }
}
