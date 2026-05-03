/**
 * Seletores compartilhados — Chakra UI gera classes CSS hash que mudam entre
 * builds (ex.: `css-7mca6u`). Centralizando aqui pra atualizar UMA vez quando
 * o site mudar (ver ADR-002).
 *
 * IMPORTANTE: tanto LoginModal quanto MatchModal usam o role `dialog` com
 * `aria-labelledby^="chakra-modal--header"`. Pra discriminar escopamos o
 * filtro de texto NO HEADER do modal (não no body inteiro), evitando que o
 * texto "Partida" / "Entrar" no corpo de outro modal cause falso positivo.
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
   * LoginModal — modal Chakra cujo HEADER contém "Entrar", "Cadastrar" ou
   * "Criar conta". Escopamos `:has-text(...)` no header semântico (Chakra
   * renderiza dentro de `header` ou `.chakra-modal__header`) em vez do
   * dialog inteiro pra evitar falso positivo quando outro modal tem essas
   * palavras no body.
   *
   * Nota: `:has-text()` é Playwright-only (válido dentro de `:has()` CSS).
   * `text=/regex/` é a engine `text=`, NÃO usar dentro de `:has()`.
   */
  loginModal: [
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(header:has-text("Entrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(header:has-text("Cadastrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(header:has-text("Criar conta"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(.chakra-modal__header:has-text("Entrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(.chakra-modal__header:has-text("Cadastrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(.chakra-modal__header:has-text("Criar conta"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(h2:has-text("Entrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(h2:has-text("Cadastrar"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(h2:has-text("Criar conta"))',
  ].join(', '),

  /**
   * MatchModal — modal Chakra cujo HEADER (não body) descreve uma partida.
   * Header típico: "Partida Finalizada", "Partida ao vivo", etc. Filtrar
   * pelo header (e não pelo dialog inteiro) impede vazamento pra modais
   * que mencionem "Partida" apenas no body (ex.: notificação, confirmação).
   */
  matchModal: [
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(header:has-text("Partida"))',
    '[role="dialog"][aria-labelledby^="chakra-modal--header"]:has(.chakra-modal__header:has-text("Partida"))',
  ].join(', '),

  /** Popover Chakra do avatar (perfil). */
  profilePopover: '[role="dialog"][aria-labelledby^="popover-header"]',

  /**
   * NotificationsPanel — popover sem heading próprio, identificado por texto.
   * O conteúdo sempre tem "notifica" (empty state ou itens).
   */
  notificationsPanel: '[role="dialog"]:has-text("notifica")',
} as const;
