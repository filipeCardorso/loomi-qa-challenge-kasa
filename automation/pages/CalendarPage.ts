import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CalendarPage — modela `/calendario` (página real, não SPA-state — só logado).
 *
 * Layout (exploration-notes §15.3):
 * - Side panel esquerdo:
 *   - Mini-calendar mensal
 *   - Filtro "Times" (collapse)
 *   - Filtro "Campeonatos" (collapse)
 *   - Switch "Partidas favoritas"
 * - Painel direito:
 *   - Botão "Hoje" + setas + label do mês
 *   - Vista semanal grade (3 dias visíveis em desktop padrão — possível bug S12)
 *   - Empty state "Nada por aqui — Sem informações..."
 */
export class CalendarPage extends BasePage {
  get hojeButton(): Locator {
    return this.page.getByRole('button', { name: /^hoje$/i });
  }

  get monthLabel(): Locator {
    // ex: "Maio de 2026"
    return this.page.locator('text=/[A-Z][a-z]+ de \\d{4}/').first();
  }

  get partidasFavoritasSwitch(): Locator {
    // Chakra Switch — input hidden + label clicável
    return this.page.getByText(/partidas favoritas/i).first();
  }

  get timesCollapseTrigger(): Locator {
    return this.page.getByRole('button', { name: /^times$/i });
  }

  get campeonatosCollapseTrigger(): Locator {
    return this.page.getByRole('button', { name: /^campeonatos$/i });
  }

  async open(): Promise<void> {
    await this.goto('/calendario');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async togglePartidasFavoritas(): Promise<void> {
    await this.partidasFavoritasSwitch.click();
  }

  async expandTimes(): Promise<void> {
    if (await this.timesCollapseTrigger.isVisible().catch(() => false)) {
      await this.timesCollapseTrigger.click();
    }
  }

  async expandCampeonatos(): Promise<void> {
    if (await this.campeonatosCollapseTrigger.isVisible().catch(() => false)) {
      await this.campeonatosCollapseTrigger.click();
    }
  }

  /**
   * Retorna os dias visíveis na vista semanal (ex: "01 Sex", "02 Sáb", "03 Dom").
   * Bug confirmado S12: vista pode mostrar só 3 dias em vez de 7.
   */
  async getWeekViewDays(): Promise<string[]> {
    const headers = this.page.locator('text=/^\\d{2}\\s(Seg|Ter|Qua|Qui|Sex|S[áa]b|Dom)/i');
    return headers.allTextContents();
  }
}
