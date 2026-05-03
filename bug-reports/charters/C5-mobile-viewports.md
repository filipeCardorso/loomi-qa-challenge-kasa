# Charter C5 — Responsividade Mobile

**Duração:** ~20min · **Data:** 2026-05-02
**Foco:** Layout em viewports mobile
**Persona:** torcedor no celular

## Setup

- Playwright headless, viewports: 375x667 (iPhone SE), 414x896 (iPhone 11), 768x1024 (iPad)
- URL: https://www.kasa.live/

## Achados

- Header colapsa adequadamente em 375px
- Calendar em /calendario mobile mantém problema do BUG-012 (3 dias visíveis na grade principal)
- Filtros da home empilham mas mantêm placeholders
- Cards de partida adaptam pra 1 coluna em mobile
- Footer com social icons fica muito próximo em iPhone SE (overflow potencial)

## Bugs gerados

Confirmou BUG-012 (calendar 3 dias) também ocorre em mobile. Sem bugs novos.

## Próximo

Charter de touch interactions (não coberto em headless).
