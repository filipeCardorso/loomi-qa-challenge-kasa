import type { Locator, Page } from '@playwright/test';
import { SELECTORS } from '@support/selectors';
import { BaseComponent } from './BaseComponent';

/**
 * MatchModal — modal Chakra que abre ao clicar em card de partida.
 *
 * Discriminator vs LoginModal: usa `SELECTORS.matchModal` que escopa o filtro
 * `:has-text("Partida")` no header semântico do modal — sem isso o seletor
 * vazaria pra popovers ou modais arbitrários que mencionem "Partida" no body.
 *
 * Estrutura típica (ver exploration-notes §15.2):
 * - Header: "Partida Finalizada" (ou similar) + data DD/MM/YYYY
 * - Centro: campeonato + escudo+time + placar (X) + escudo+time
 * - Body (FINALIZADA): empty state "Nada por aqui — Ainda não temos os
 *   melhores momentos da partida"
 *
 * Estratégia de parse: lê o `innerText` do modal UMA vez via `readLines()`
 * e identifica cada peça por exclusão (data via regex DD/MM/YYYY, placares
 * via `^\d+$`, separador "X", times = sobra). Substitui os antigos selectors
 * ordinais frágeis (`text=/.+/.nth(N)`) — ver fix paralelo no MatchCard.
 */
export class MatchModal extends BaseComponent {
  /** Headers conhecidos do modal de partida. */
  private static readonly STATUS_HEADERS = new Set<string>([
    'Partida Finalizada',
    'Ao vivo',
    'Acompanhe a próxima',
  ]);

  /** Ruído textual que aparece no body mas não é dado estruturado. */
  private static readonly NOISE_LINES = new Set<string>([
    'X',
    'Acompanhe a próxima',
    'Nada por aqui',
    'Ainda não temos os melhores momentos da partida',
  ]);

  constructor(page: Page) {
    super(page);
  }

  get root(): Locator {
    return this.page.locator(SELECTORS.matchModal).first();
  }

  /** Alias retrocompatível pra asserts externos como `expect(modal.locator)`. */
  get locator(): Locator {
    return this.root;
  }

  /**
   * Lê todas as linhas não-vazias do modal de uma vez. Helper interno usado
   * pelos getters abaixo pra evitar N round-trips ao browser e fugir de
   * selectors ordinais frágeis.
   */
  private async readLines(): Promise<string[]> {
    const fullText = (await this.root.innerText().catch(() => '')) ?? '';
    return fullText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  /** Retorna o título do header ("Partida Finalizada", "Ao vivo", etc). */
  async getStatus(): Promise<string> {
    const lines = await this.readLines();
    // Tenta primeiro casar com headers conhecidos (resiliente a mudanças de
    // ordem das primeiras linhas).
    const known = lines.find((l) => MatchModal.STATUS_HEADERS.has(l));
    if (known) return known;
    // Heurística defensiva: a primeira linha que começa com "Partida".
    return lines.find((l) => /^Partida/i.test(l)) ?? lines[0] ?? '';
  }

  /** Retorna a data em formato DD/MM/YYYY (ou string vazia se não achar). */
  async getDate(): Promise<string> {
    const lines = await this.readLines();
    return lines.find((l) => /^\d{2}\/\d{2}\/\d{4}$/.test(l)) ?? '';
  }

  /**
   * Texto de campeonato dentro do modal. Vem APÓS a data e ANTES do primeiro
   * time. Identificado por exclusão: não é header, não é data, não é placar,
   * não é nome de time conhecido.
   */
  async getCampeonato(): Promise<string> {
    const lines = await this.readLines();
    const dateIdx = lines.findIndex((l) => /^\d{2}\/\d{2}\/\d{4}$/.test(l));
    if (dateIdx >= 0 && dateIdx + 1 < lines.length) {
      const candidate = lines[dateIdx + 1];
      if (candidate && !MatchModal.NOISE_LINES.has(candidate) && !/^\d+$/.test(candidate)) {
        return candidate;
      }
    }
    // Fallback: terceira linha textual (status, data, campeonato).
    return lines[2] ?? '';
  }

  /**
   * Retorna ambos os times de uma vez identificando-os por exclusão:
   * - não é header de status conhecido
   * - não é data (DD/MM/YYYY)
   * - não é placar (apenas dígitos)
   * - não é separador "X"
   * - não é ruído conhecido (empty state, etc.)
   * - não é o nome do campeonato (linha imediatamente após a data)
   */
  async getTeams(): Promise<{ home: string; away: string }> {
    const lines = await this.readLines();
    const dateIdx = lines.findIndex((l) => /^\d{2}\/\d{2}\/\d{4}$/.test(l));
    const campeonato = dateIdx >= 0 ? lines[dateIdx + 1] : undefined;

    const candidates = lines.filter((l) => {
      if (MatchModal.STATUS_HEADERS.has(l)) return false;
      if (MatchModal.NOISE_LINES.has(l)) return false;
      if (/^\d+$/.test(l)) return false;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(l)) return false;
      if (campeonato && l === campeonato) return false;
      return true;
    });

    return { home: candidates[0] ?? '', away: candidates[1] ?? '' };
  }

  async getHomeTeam(): Promise<string> {
    return (await this.getTeams()).home;
  }

  async getAwayTeam(): Promise<string> {
    return (await this.getTeams()).away;
  }

  /** Placar concatenado (ex: "0 X 0"). Retorna string vazia se não houver. */
  async getScore(): Promise<string> {
    const lines = await this.readLines();
    const numbers = lines.filter((l) => /^\d+$/.test(l));
    if (numbers.length < 2) return '';
    return `${numbers[0]} X ${numbers[1]}`;
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
    await this.waitForClose(5_000).catch(() => undefined);
  }
}
