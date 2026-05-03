/**
 * Seletores compartilhados — Chakra UI gera classes CSS hash que mudam entre
 * builds (ex.: `css-7mca6u`). Centralizando aqui pra atualizar UMA vez quando
 * o site mudar (ver ADR-002).
 *
 * IMPORTANTE: tanto LoginModal quanto MatchModal usam o role `dialog` com
 * `aria-labelledby^="chakra-modal--header"`. Pra discriminar usamos
 * `:has(...)` em volta do conteúdo característico de cada um.
 */
export const SELECTORS = {
  /** Card de partida na home (`div.css-7mca6u` tem onclick). */
  matchCard: 'div.css-7mca6u',

  /**
   * Modal Chakra GENÉRICO (qualquer dialog Chakra). Mantido pra compat e como
   * fallback — preferir `loginModal`/`matchModal` quando souber qual é.
   */
  matchModalDialog: '[role="dialog"][aria-labelledby^="chakra-modal--header"]',

  /**
   * LoginModal — modal Chakra (`aria-labelledby^="chakra-modal--header"`) com
   * heading "Entrar" ou "Cadastrar". Discriminator vs MatchModal — ambos
   * usam o mesmo prefixo `chakra-modal--header`.
   *
   * Nota: `:has-text()` é Playwright-only (válido dentro de `:has()` CSS).
   * `text=/regex/` é a engine `text=`, NÃO usar dentro de `:has()`.
   */
  loginModal:
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(h2:has-text("Entrar")), [role="dialog"][aria-labelledby^="chakra-modal--header"]:has(h2:has-text("Cadastrar"))',

  /**
   * MatchModal — modal Chakra (`aria-labelledby^="chakra-modal--header"`)
   * cujo conteúdo descreve uma partida. Usamos `:has-text("Partida")` em
   * cima do filtro `chakra-modal--header` pra excluir popovers
   * (`popover-header-...`) que podem conter "Partida" no body.
   */
  matchModal: '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has-text("Partida")',

  /** Popover Chakra do avatar (perfil). */
  profilePopover: '[role="dialog"][aria-labelledby^="popover-header"]',

  /**
   * NotificationsPanel — popover sem heading próprio, identificado por texto.
   * O conteúdo sempre tem "notifica" (empty state ou itens).
   */
  notificationsPanel: '[role="dialog"]:has-text("notifica")',
} as const;
