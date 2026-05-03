import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * FilterableSearchPage — classe intermediária que centraliza os 4 filtros
 * compartilhados entre `HomePage` (`/`) e `HighlightsPage` (`/melhores-momentos`).
 *
 * Antes desta classe, ambos os POMs duplicavam os mesmos getters
 * (filtroQualTime, filtroQualCampeonato, filtroData, filtroOndeQuerVer),
 * exigindo manutenção em dois lugares cada vez que o placeholder do Chakra
 * mudasse. ADR-002 (selectors centralizados) cobria classes hash, mas não
 * resolvia duplicação cross-POM.
 *
 * Subclasses (HomePage, HighlightsPage) podem adicionar getters próprios e
 * sobrescrever `open()`, mas os 4 filtros vêm de graça.
 */
export abstract class FilterableSearchPage extends BasePage {
  /** Input "Qual time?" do header da busca. */
  get filtroQualTime(): Locator {
    return this.page.getByPlaceholder(/qual time/i);
  }

  /** Input "Qual campeonato?" do header da busca. */
  get filtroQualCampeonato(): Locator {
    return this.page.getByPlaceholder(/qual campeonato/i);
  }

  /**
   * Datepicker — placeholder muda conforme o dia: "Hoje", "Amanhã",
   * "Apr 30, 2026", etc. Regex coletivo cobre os 3 estados conhecidos.
   */
  get filtroData(): Locator {
    return this.page.getByPlaceholder(/^(hoje|amanh[ãa]|[A-Z][a-z]{2}\s\d+,\s\d{4})$/).first();
  }

  /** Input "Onde quer ver?" (filtro de canal/local de transmissão). */
  get filtroOndeQuerVer(): Locator {
    return this.page.getByPlaceholder(/onde quer ver/i);
  }
}
