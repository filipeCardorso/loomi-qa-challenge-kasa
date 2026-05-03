/**
 * Timeouts padronizados — site DEV API tem latência variável (cold-start) e o
 * Firebase Auth pode demorar 25s+ sob contenção paralela. Use estas constantes
 * em vez de magic numbers (10_000, 30_000, etc) nos POMs/specs.
 *
 * NÃO substituir em `playwright.config.ts` (config é declarativo, OK ter
 * literais) nem em testes que precisam de um valor MUITO específico (ex.:
 * `1_000` pra "deve sumir já").
 */
export const TIMEOUTS = {
  /** Ações rápidas (click, fill). */
  fast: 5_000,
  /** Asserções com retry (toBeVisible, toHaveText). */
  normal: 10_000,
  /** Network calls e navegação SPA. */
  network: 15_000,
  /** API DEV cold-start (`kasa-live.api.dev.loomi.com.br`). */
  devApiSlow: 30_000,
  /** Login flow (UI + Firebase auth) + suites com `describe.configure`. */
  login: 90_000,
  /** Lighthouse audits. */
  lighthouse: 120_000,
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
