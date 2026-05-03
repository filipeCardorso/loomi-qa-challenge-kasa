import type { Locator } from '@playwright/test';

/**
 * MatchCard — componente reutilizável que envolve UM card de partida (`div.css-7mca6u`).
 *
 * EXCEÇÃO ARQUITETURAL (ver ADR-001): NÃO estende `BaseComponent` porque cards
 * são REPETIDOS no DOM (uma lista de N partidas). Diferente dos modais/popovers
 * — que são únicos — cards recebem `Locator` pré-resolvido pelo POM da página
 * que listou (ex.: `HomePage.getMatchCards()`), em vez de receber `Page`.
 *
 * Anatomia (ver docs/exploration-notes.md §15.1):
 * - chip campeonato (ex: "MLS")
 * - 2 linhas: escudo + nome + placar
 * - status: "Finalizada" | "Ao vivo" | etc
 * - 2 botões: câmera (vídeo highlight) + seta (abre modal)
 *
 * Estratégia de parse: extrai TODO o `innerText` do card UMA vez e fatia por
 * linhas, em vez de usar selectors ordinais frágeis (`text=/.+/.nth(N)`). Isso
 * resiste a re-arranjos de DOM internos do Chakra desde que a ordem visual
 * (campeonato → time1 → placar1 → time2 → placar2 → status) se mantenha.
 */
export class MatchCard {
  constructor(private readonly root: Locator) {}

  /** Retorna o locator raiz para asserts customizados externos. */
  get locator(): Locator {
    return this.root;
  }

  /**
   * Lê todas as linhas não-vazias do card de uma vez. Helper interno usado
   * pelos getters abaixo pra evitar N round-trips ao browser.
   */
  private async readLines(): Promise<string[]> {
    const fullText = (await this.root.innerText().catch(() => '')) ?? '';
    return fullText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  /**
   * Texto do chip de campeonato (ex: "MLS", "Premier League"). Geralmente é
   * a PRIMEIRA linha do card.
   */
  async getCampeonato(): Promise<string> {
    const lines = await this.readLines();
    return lines[0] ?? '';
  }

  /**
   * Retorna ambos os times de uma vez (home e away). Estrutura esperada:
   * `[campeonato, time1, placar1, time2, placar2, status]`.
   */
  async getTeams(): Promise<{ home: string; away: string }> {
    const lines = await this.readLines();
    return { home: lines[1] ?? '', away: lines[3] ?? '' };
  }

  /**
   * Retorna ambos os placares de uma vez. Tolera card sem placar (devolve 0).
   */
  async getScores(): Promise<{ home: number; away: number }> {
    const lines = await this.readLines();
    const home = Number.parseInt(lines[2] ?? '0', 10);
    const away = Number.parseInt(lines[4] ?? '0', 10);
    return {
      home: Number.isFinite(home) ? home : 0,
      away: Number.isFinite(away) ? away : 0,
    };
  }

  /**
   * Status textual da partida (Finalizada | Ao vivo | etc). Última linha
   * não-vazia do card.
   */
  async getStatus(): Promise<string> {
    const lines = await this.readLines();
    return lines[lines.length - 1] ?? '';
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
