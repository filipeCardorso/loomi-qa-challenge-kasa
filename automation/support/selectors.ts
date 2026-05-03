/**
 * Seletores compartilhados — Chakra UI gera classes CSS hash que mudam entre builds.
 * Centralizando aqui pra atualizar UMA vez quando o site mudar.
 */
export const SELECTORS = {
  /** Card de partida na home (div.css-7mca6u tem onclick) */
  matchCard: 'div.css-7mca6u',
  /** Modal Chakra de partida (clicar card abre) */
  matchModalDialog: '[role="dialog"][aria-labelledby^="chakra-modal--header"]',
  /** Popover Chakra do avatar (perfil) */
  profilePopover: '[role="dialog"][aria-labelledby^="popover-header"]',
} as const;
