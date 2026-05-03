# IMP-002 — evidências (cross-reference com bugs)

Esta melhoria propõe corrigir accessible names de ícones na UI. As evidências
do estado atual (problema que a melhoria resolve) estão concentradas nos bugs
de a11y já documentados — não duplicamos screenshots/JSONs aqui.

## Evidência do problema atual

| Origem  | Arquivo                                                                                      | Conteúdo                                                                         |
| ------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| BUG-002 | [`evidence/BUG-002/console-output.txt`](../BUG-002/console-output.txt)                       | `aria-label="Go to previous month"` em inglês, observado em datepicker do header |
| BUG-002 | [`evidence/BUG-002/screenshot-datepicker-rdp.png`](../BUG-002/screenshot-datepicker-rdp.png) | Screenshot do datepicker com aria-label literal não-localizado                   |
| BUG-014 | [`evidence/BUG-014/axe-button-name.json`](../BUG-014/axe-button-name.json)                   | Output axe-core: 30 botões sem accessible name na home (capturado 2026-05-02)    |
| BUG-016 | [`evidence/BUG-016/axe-link-name.json`](../BUG-016/axe-link-name.json)                       | Output axe-core: 2 links sociais (TikTok, Instagram) sem accessible name         |

## Estado atual resumido

- **30** botões na home sem `aria-label`/texto/`aria-labelledby` (button-name critical)
- **2** links sociais no footer sem texto nem `aria-label` (link-name serious)
- **35** ocorrências de `aria-label="Go to previous month"` literal em inglês (exploração 2026-05-02; 1 ocorrência em recaptura 2026-05-03)

## Estado desejado (após IMP-002)

- 0 violations axe-core `button-name` e `link-name` na home, em todas as 5 rotas testadas em BUG-013/014/015/016
- aria-labels localizados em pt-BR e contextualizados (ex.: "Favoritar partida Flamengo x Vasco")
- Critério de aceite automatizado: spec `automation/tests/bugs/BUG-014-a11y-button-name.spec.ts` verde — atualmente já está verde em recaptura 2026-05-03 (likely fixed parcial), mas regrediria se IMP-002 não for implementado por completo

## Reprodução do estado atual

```bash
# 1. Rodar axe contra a home
node scripts/recapture-bug015.mjs   # captura color-contrast (relacionado)

# 2. Inspeção manual via DevTools
# DevTools > Console:
#   document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').length
```
