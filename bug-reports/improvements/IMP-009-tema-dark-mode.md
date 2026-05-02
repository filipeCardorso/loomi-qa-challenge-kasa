# IMP-009 — Toggle de tema (dark mode)

**Impacto:** Low
**Categoria:** UX
**Esforço estimado:** M
**Trello card:** TBD

## Contexto

Inspecionando o `localStorage`, encontra-se a chave `chakra-ui-color-mode` — sinal de que o Chakra UI **já está configurado para suportar dark mode**, mas **não há toggle visível** em nenhum lugar da UI. O modo claro está fixado.

## Problema observado

- Chave `chakra-ui-color-mode` presente em `localStorage` (geralmente com valor `light`).
- Nenhum botão/switch/menu para alternar tema.
- Sem detecção de `prefers-color-scheme: dark` do SO.
- Componentes Chakra renderizam só com tokens de tema light (potencial bug visual ao forçar `dark` no devtools).
- Usuários em ambientes escuros (uso noturno) sofrem com brilho excessivo.

## Sugestão

1. **Toggle no header** (ícone sol/lua) e/ou no menu do perfil.
2. **`useColorMode`** do Chakra para alternar — Chakra já gerencia persistência via `localStorage`.
3. **Detecção inicial:** respeitar `prefers-color-scheme` na primeira visita; depois persistir escolha do usuário.
4. **Auditoria visual:** revisar tokens em todos os componentes (cards, modais, calendário, escudos com transparência) para garantir contraste em ambos os modos.
5. **Acessibilidade:** garantir contraste >= 4.5:1 (WCAG AA) em ambos — relacionado a BUG-015 (color-contrast serious).
6. **Meta theme-color:** atualizar `<meta name="theme-color">` dinamicamente para a barra de status mobile.
7. **A11y do toggle:** `aria-label="Alternar tema"`, `aria-pressed`.

## Por que melhora

- **Aproveita configuração existente** — esforço pequeno para grande percepção.
- **Conforto visual** em ambientes escuros e à noite.
- **Economia de bateria** em telas OLED.
- **Modernidade** — feature esperada em apps de 2025/2026.

## Evidência

- DevTools > Application > Local Storage > `chakra-ui-color-mode`: `bug-reports/evidence/IMP-009/localstorage.png` (a capturar).
- Comparação visual light vs dark forçado: `bug-reports/evidence/IMP-009/comparativo.png` (a capturar).
- Doc Chakra `useColorMode`: https://chakra-ui.com/docs/styled-system/color-mode
