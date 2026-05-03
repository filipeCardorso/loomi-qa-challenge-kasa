import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { MatchCard } from './components/MatchCard';
import { SELECTORS } from '@support/selectors';

/**
 * HomePage — modela `/` (página principal de busca + listagem de partidas).
 *
 * Funcionalidades cobertas (exploration-notes §4):
 * - 4 filtros (time / campeonato / data picker / local)
 * - Calendar mensal (~31 botões "Nº maio (sexta-feira)")
 * - Lista "Partidas finalizadas" com cards `div.css-7mca6u`
 * - Tabs nav (anônima: 2; logada: 4)
 * - Paginação
 */
export class HomePage extends BasePage {
  // ===== Filtros =====
  get filtroQualTime(): Locator {
    return this.page.getByPlaceholder(/qual time/i);
  }

  get filtroQualCampeonato(): Locator {
    return this.page.getByPlaceholder(/qual campeonato/i);
  }

  /** Datepicker (placeholder muda conforme o dia: "Hoje", "Apr 30, 2026", etc). */
  get filtroData(): Locator {
    return this.page.getByPlaceholder(/^(hoje|amanh[ãa]|[A-Z][a-z]{2}\s\d+,\s\d{4})$/).first();
  }

  get filtroOndeQuerVer(): Locator {
    return this.page.getByPlaceholder(/onde quer ver/i);
  }

  /** Botão de busca (lupa SVG verde, sem texto — último botão da search bar). */
  get searchButton(): Locator {
    // estratégia robusta: botão dentro do container dos filtros que NÃO tem texto
    return this.page.locator('button:has(svg)').filter({ hasNotText: /.+/ }).last();
  }

  // ===== Nav tabs =====
  // Chakra renderiza tabs como `<a title="Partidas">` com `<img>+<p>` dentro.
  // `getByRole('link', { name })` falha porque o accessible-name resolve via alt
  // da imagem (que difere entre tabs). Usamos `a[title="..."]` como seletor
  // mais robusto + estável.
  get tabPartidas(): Locator {
    return this.page.locator('a[title="Partidas"]');
  }

  get tabFavoritos(): Locator {
    return this.page.locator('a[title="Favoritos"], button[title="Favoritos"]');
  }

  get tabMelhoresMomentos(): Locator {
    return this.page.locator('a[title="Melhores momentos"]');
  }

  get tabCalendario(): Locator {
    return this.page.locator('a[title="Calendário"], a[title="Calendario"]');
  }

  // ===== Calendar mensal =====
  /** Botão "previous month" — usar `.first()` por causa do bug S2 (35 duplicados). */
  get calendarPrev(): Locator {
    return this.page.getByLabel(/go to previous month/i).first();
  }

  get calendarNext(): Locator {
    return this.page.getByLabel(/go to next month/i).first();
  }

  // ===== Header =====
  get headerEntrarButton(): Locator {
    return this.page.getByRole('button', { name: /^entrar$/i }).first();
  }

  // ===== Ações =====
  async open(): Promise<void> {
    await this.goto('/');
    // título principal carregado é proxy de readiness
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchByTeam(name: string): Promise<void> {
    await this.filtroQualTime.fill(name);
    await this.searchButton.click();
  }

  async searchByChampionship(name: string): Promise<void> {
    await this.filtroQualCampeonato.fill(name);
    await this.searchButton.click();
  }

  /** Clica num dia do calendar mensal. `day` é o número do dia (1-31). */
  async clickDayInCalendar(day: number): Promise<void> {
    // botões do calendar têm aria/text tipo "11º maio (sexta-feira)"
    const dayBtn = this.page.getByRole('button', { name: new RegExp(`^${day}[ºo]?\\s`) }).first();
    await dayBtn.click();
  }

  async clickToday(): Promise<void> {
    const today = new Date().getDate();
    await this.clickDayInCalendar(today);
  }

  async goToNextMonth(): Promise<void> {
    await this.calendarNext.click();
  }

  async goToPreviousMonth(): Promise<void> {
    await this.calendarPrev.click();
  }

  /** Retorna array de MatchCard a partir dos `div.css-7mca6u` visíveis. */
  async getMatchCards(): Promise<MatchCard[]> {
    const root = this.page.locator(SELECTORS.matchCard);
    const count = await root.count();
    const cards: MatchCard[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(new MatchCard(root.nth(i)));
    }
    return cards;
  }

  /** Atalho: pega o primeiro MatchCard que matcha um nome de time. */
  matchCardForTeam(teamName: string): MatchCard {
    const root = this.page.locator(SELECTORS.matchCard).filter({ hasText: teamName }).first();
    return new MatchCard(root);
  }

  /** Click numa tab nav. Nome textual ("Partidas", "Favoritos", etc). */
  async clickTab(
    tabName: 'Partidas' | 'Favoritos' | 'Melhores momentos' | 'Calendário',
  ): Promise<void> {
    const link = this.page.locator(`a[title="${tabName}"], button[title="${tabName}"]`).first();
    await link.click();
  }

  /** Conta quantas tabs nav-superiores estão visíveis (2 anônimo, 4 logado). */
  async countNavTabs(): Promise<number> {
    const tabs = await Promise.all(
      ['Partidas', 'Favoritos', 'Melhores momentos', 'Calendário'].map(async (name) => {
        const link = this.page.locator(`a[title="${name}"], button[title="${name}"]`).first();
        return (await link.isVisible().catch(() => false)) ? 1 : 0;
      }),
    );
    return tabs.reduce<number>((acc, n) => acc + n, 0);
  }
}
