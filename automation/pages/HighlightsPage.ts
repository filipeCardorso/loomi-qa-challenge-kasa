import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HighlightsPage — modela `/melhores-momentos` (vídeos de melhores momentos).
 *
 * Filtros (exploration-notes §4 / §13):
 * - Mesmos 4 filtros da home (time / campeonato / data / local)
 * - 2 inputs extras `placeholder="Pesquisar"` (busca textual)
 * - Calendar mensal idêntico
 *
 * H2 esperado: "Melhores momentos das Partidas Finalizadas"
 */
export class HighlightsPage extends BasePage {
  // Filtros principais
  get filtroQualTime(): Locator {
    return this.page.getByPlaceholder(/qual time/i);
  }

  get filtroQualCampeonato(): Locator {
    return this.page.getByPlaceholder(/qual campeonato/i);
  }

  get filtroData(): Locator {
    return this.page.getByPlaceholder(/^(hoje|amanh[ãa]|[A-Z][a-z]{2}\s\d+,\s\d{4})$/).first();
  }

  get filtroOndeQuerVer(): Locator {
    return this.page.getByPlaceholder(/onde quer ver/i);
  }

  /** Inputs textuais "Pesquisar" — primeiro é busca de partida; segundo é busca de vídeo. */
  get pesquisarInputs(): Locator {
    return this.page.getByPlaceholder(/^pesquisar$/i);
  }

  get headingPrincipal(): Locator {
    return this.page.getByRole('heading', {
      name: /melhores momentos das partidas finalizadas/i,
    });
  }

  async open(): Promise<void> {
    await this.goto('/melhores-momentos');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Vídeos exibidos na grade. Heurística: cada vídeo tem ≥1 elemento clicável e
   * está dentro de um container card do Chakra (classes `.css-...`).
   */
  videos(): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.locator('iframe, video, [class*="video"]') });
  }

  async getVideosCount(): Promise<number> {
    return this.videos().count();
  }

  /** Pesquisa textual no primeiro input "Pesquisar". */
  async searchHighlight(text: string): Promise<void> {
    await this.pesquisarInputs.first().fill(text);
    await this.pesquisarInputs.first().press('Enter');
  }
}
