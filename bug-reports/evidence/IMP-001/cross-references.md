# IMP-001 — evidências (cross-reference com bugs)

Esta melhoria propõe adicionar `data-testid` em elementos críticos da UI pra
estabilizar automação. A evidência do estado atual está nos arquivos de
BUG-005 — não duplicamos aqui.

## Evidência do problema atual

| Origem | Arquivo | Conteúdo |
|---|---|---|
| BUG-005 | [`evidence/BUG-005/console-zero-testids.txt`](../BUG-005/console-zero-testids.txt) | Output do console: `document.querySelectorAll('[data-testid]').length === 0` em 1161 elementos |
| BUG-005 | [`evidence/BUG-005/screenshot-devtools-elements.png`](../BUG-005/screenshot-devtools-elements.png) | Screenshot DevTools Elements mostrando ausência total de `data-testid` |

## Estado atual resumido

- **0** elementos com `data-testid` em toda a home
- **1161** elementos no DOM da home — todos sem identificador estável de teste
- 3 elementos com `data-cy` (convenção alternativa parcial — não cobre header, busca, login, perfil, modais)

## Estado desejado (após IMP-001)

- ≥ 5 `data-testid` em elementos críticos: `header-search`, `card-match`, `modal-match-details`, `button-favorite`, `button-login`
- Convenção: `<dominio>-<componente>-<acao>` (ex.: `match-card-finalizada`)
- Spec `automation/tests/bugs/BUG-005-zero-data-testid.spec.ts` verde quando threshold atingido

## Reprodução

```bash
# DevTools > Console:
document.querySelectorAll('[data-testid]').length
# Saída atual: 0
```
