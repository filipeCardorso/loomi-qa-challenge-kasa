# Bug Reports e Melhorias — Loomi QA Challenge

**Total:** 21 bugs · 11 melhorias

## 🐛 Bugs (21)

| ID      | Título                                                           | Severidade | Status             | Categoria        | Trello                        |
| ------- | ---------------------------------------------------------------- | ---------- | ------------------ | ---------------- | ----------------------------- |
| BUG-001 | API DEV exposta em produção                                      | High       | Open               | Segurança        | https://trello.com/c/bo9Cuj7V |
| BUG-002 | aria-label "Go to previous month" duplicado                      | Medium     | Open               | A11y             | https://trello.com/c/mJTsYQsn |
| BUG-004 | /favoritos e /calendario fallback silencioso                     | Medium     | Open               | UX               | https://trello.com/c/NriAeXTN |
| BUG-005 | 0 data-testid em todo o site                                     | Low        | Open               | Manutenibilidade | https://trello.com/c/XqB6fQzv |
| BUG-006 | og:url meta tag vazio                                            | Low        | Open               | SEO              | https://trello.com/c/ho0umxI2 |
| BUG-007 | Meta description duplicada                                       | Low        | Open               | SEO              | https://trello.com/c/qJGFStBU |
| BUG-008 | API inconsistência date= vs date_start= (design debt)            | Low        | Open               | API              | https://trello.com/c/zKVntVFT |
| BUG-009 | Calendar `textContent` duplicado ("11º maio") — só DOM           | Low        | Open               | UI/A11y          | https://trello.com/c/SMQpbiPQ |
| BUG-010 | /favoritos cai na home mas mantém title genérico                 | Medium     | Open               | UX/SEO           | https://trello.com/c/kNexAnW2 |
| BUG-011 | Modal partida finalizada sempre vazio                            | Medium     | Open               | Funcional        | https://trello.com/c/upGcdsjB |
| BUG-012 | /calendario só mostra 3 dias na semana                           | Low        | Needs revalidation | UI/Layout        | https://trello.com/c/abMEy1yD |
| BUG-013 | A11y aria-allowed-attr critical                                  | Critical   | Open               | A11y             | https://trello.com/c/PpFuwqQ9 |
| BUG-014 | A11y button-name critical                                        | High       | Likely Fixed       | A11y             | https://trello.com/c/zAqivo5E |
| BUG-015 | A11y color-contrast serious                                      | High       | Open               | A11y             | https://trello.com/c/N7RrCrN1 |
| BUG-016 | A11y link-name serious                                           | High       | Open               | A11y             | https://trello.com/c/pnSvKiDW |
| BUG-017 | sitemap.xml inexistente                                          | Low        | Open               | SEO              | https://trello.com/c/nkMqx4d2 |
| BUG-018 | Lighthouse perf=63 + CLS 0.705 na home                           | Medium     | Open               | Performance      | https://trello.com/c/QVVET5c2 |
| BUG-019 | Headers de segurança ausentes na home (XCTO/XFO/Referrer/CSP)    | High       | Open               | Segurança        | https://trello.com/c/yauoSSdo |
| BUG-020 | API DEV sem HSTS nem CSP                                         | Medium     | Open               | Segurança        | https://trello.com/c/5Ff1yKKB |
| BUG-021 | API DEV sem rate limiting (50/50 → 200) — burst maior necessário | Medium     | Open               | Segurança        | https://trello.com/c/DFaX3goR |
| BUG-022 | Cookie auth `next-leap_access` sem Secure nem HttpOnly           | Critical   | Open               | Segurança        | https://trello.com/c/TQ1Bwbv6 |

**Distribuição por severidade (atualizada 2026-05-03):** 2 Critical · 5 High · 7 Medium · 7 Low

> **Nota sobre rebaixamentos:** BUG-008/009/012 rebaixados Medium→Low (design debt / re-investigação). BUG-021 rebaixado High→Medium (burst de 50 reqs não é prova conclusiva). BUG-014 rebaixado Critical→High e marcado `Likely Fixed` (axe-core retornou 0 nodes em 2026-05-03 vs 30 em 2026-05-02 — downgrade até validação manual logado+mobile). BUG-012 status `Needs revalidation` (rota não tem vista semanal hoje). BUG-003 reclassificado em IMP-011 (rotas que não existem por design viraram improvement). Detalhes em cada `.md`.

## 💡 Melhorias (11)

| ID      | Título                                            | Impacto    | Categoria        | Esforço | Trello                        |
| ------- | ------------------------------------------------- | ---------- | ---------------- | ------- | ----------------------------- |
| IMP-001 | Adicionar data-testid                             | Medium     | Manutenibilidade | M       | https://trello.com/c/0EuSpblu |
| IMP-002 | Accessible-name de ícones                         | High       | A11y             | S       | https://trello.com/c/4pY9ttcj |
| IMP-003 | /favoritos com página dedicada                    | Medium     | UX               | M       | https://trello.com/c/NxxjipSZ |
| IMP-004 | Confirmação antes de excluir conta                | High       | UX               | S       | https://trello.com/c/Cf6ayq9g |
| IMP-005 | Feedback visual ao favoritar                      | Medium     | UX               | S       | https://trello.com/c/e1Wuzevd |
| IMP-006 | Otimizar bundle da home                           | High       | Performance      | L       | https://trello.com/c/m4NfECwr |
| IMP-007 | i18n EN/ES                                        | Low        | UX               | L       | https://trello.com/c/B0UivRCI |
| IMP-008 | Cookie banner LGPD                                | Medium     | Compliance       | M       | https://trello.com/c/wM8SBBas |
| IMP-009 | Toggle dark mode                                  | Low        | UX               | M       | https://trello.com/c/MLYTDoAB |
| IMP-010 | Empty states informativos                         | Medium     | UX               | S       | https://trello.com/c/AhKOKfrs |
| IMP-011 | Deeplinks pra rotas comuns (/buscar, /login, etc) | Low–Medium | UX               | S       | https://trello.com/c/OaSXIQ4k |

## Como navegar

- `bug-reports/bugs/BUG-XXX-titulo.md` — schema fixo (severidade, status, passos, evidência, etc.)
- `bug-reports/improvements/IMP-XXX-titulo.md`
- `bug-reports/evidence/<ID>/` — evidências manuais
- `bug-reports/evidence/<ID>/auto-runs/<timestamp>/` — evidência viva gerada pela suite `automation/tests/bugs/` em cada falha (gitignored — só local/CI)

## Suite de regressão por bug

Cada bug tem um spec Playwright dedicado em `automation/tests/bugs/BUG-XXX-*.spec.ts` que asserta o comportamento esperado pós-fix. Ver `automation/tests/bugs/README.md` para lifecycle, polaridade e padrão.

## Trello

Board público: https://trello.com/b/jL2scQSj/loomi-qa-challenge-filipe-gabriel
