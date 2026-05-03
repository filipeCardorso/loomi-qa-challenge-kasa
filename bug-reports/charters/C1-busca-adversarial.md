# Charter C1 — Busca com inputs adversariais

**Duração:** ~30min · **Data:** 2026-05-02
**Foco:** Filtros de busca e tipos de injection/edge cases
**Persona:** torcedor curioso/adversário

## Setup

- Browser: Chromium 130 headless via Playwright
- URL: https://www.kasa.live/
- Sem login

## Inputs testados

- `"Flamengo"` (caminho feliz)
- `""` (string vazia)
- `"<script>alert(1)</script>"` (XSS payload)
- `"' OR '1'='1"` (SQL-like)
- `"🔥"` (emoji)
- `"ZZZZZZZZ"` (sem matches)

## Achados

- ✓ Caminho feliz funciona (typeahead dispara `/team/?name=Flamengo`)
- ✓ XSS escapado pelo React (sem alert disparado)
- ✓ SQL-like não causa 500 nem leak (ver BUG-008: API responde 200 mesmo com payload)
- Typeahead não tem botão de submit explícito — busca é puramente reativa
- Empty state quando sem matches usa texto "Nada por aqui — Sem informações..." (consistente com BUG-011)

## Bugs gerados

Nenhum bug NOVO específico desse charter. Confirmou comportamentos já documentados em BUG-008, BUG-011 e cobertos pela suite Security (`automation/tests/security/xss-filtros.spec.ts`, `automation/tests/security/sql-injection-api.spec.ts`).

## Próximo

Repetir o charter logado pra ver se busca pessoal (ex: "meus times") existe.
