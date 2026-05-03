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
   * LoginModal — `dialog` com heading "Entrar" ou "Cadastrar".
   * Discrimina do MatchModal (que usa o mesmo `role=dialog`).
   */
  loginModal:
    '[role="dialog"]:has(h2:has-text("Entrar")), [role="dialog"]:has(h2:has-text("Cadastrar"))',

  /**
   * MatchModal — `dialog` cujo conteúdo descreve uma partida. O texto do
   * header é "Partida Finalizada" / "Partida Não Iniciada" / "Partida Ao
   * Vivo" (ou variantes).
   */
  matchModal: '[role="dialog"]:has(text=/Partida (Finalizada|N[aã]o Iniciada|Ao Vivo|Ao\\sVivo)/i)',

  /** Popover Chakra do avatar (perfil). */
  profilePopover: '[role="dialog"][aria-labelledby^="popover-header"]',

  /**
   * NotificationsPanel — popover sem heading próprio, identificado por texto.
   * O conteúdo sempre tem "notifica" (empty state ou itens).
   */
  notificationsPanel: '[role="dialog"]:has-text("notifica")',
} as const;
