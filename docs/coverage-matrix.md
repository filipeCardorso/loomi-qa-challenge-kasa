# Matriz de Cobertura — kasa.live

**Filipe Gabriel · 2026-05-04**

Cruzamento funcionalidade × tipo de teste. Os números refletem o estado entregue (56 BDD + 68 automatizados).

---

## 1. Funcionalidade × tipo de teste

| Funcionalidade         |    BDD |    E2E |   API | Visual |  A11y |  Perf | Security | Auto total |
| ---------------------- | -----: | -----: | ----: | -----: | ----: | ----: | -------: | ---------: |
| Favoritar times        |      8 |      5 |     1 |      1 |     1 |     – |        – |      **8** |
| Favoritar partidas     |      8 |      5 |     1 |      1 |     1 |     – |        – |      **8** |
| Buscar partidas        |     10 |      6 |     2 |      1 |     1 |     1 |        9 |     **20** |
| Melhores momentos      |      7 |      4 |     1 |      1 |     1 |     1 |        – |      **8** |
| Google Calendar        |      5 |    2\* |     – |      – |     – |     – |        – |      **2** |
| Navegação / home       |      4 |      2 |     – |      1 |     1 |     1 |        4 |      **9** |
| Responsividade         |      3 |      1 |     – |      – |     – |     – |        – |      **1** |
| Erro / edge cases      |      6 |      – |     – |      – |     – |     – |        – |      **0** |
| Não-core (descobertos) |      5 |      2 |     – |      – |     – |     – |        – |      **2** |
| Auth / cookies         |      – |      – |     – |      – |     – |     – |       10 |     **10** |
| **TOTAL**              | **56** | **27** | **5** |  **5** | **5** | **3** |   **23** |     **68** |

\* OAuth real é manual (decisão deliberada — risco R3 da spec). E2E cobre apenas iniciação do flow.

---

## 2. Pirâmide adaptada (diamante)

Site externo, sem acesso ao backend → estrutura em diamante:

```
        Visual / A11y / Perf / Security  (36 testes)
       E2E funcional                     (27 testes)
      API contract                       (5 testes)
     Smoke (subset E2E)                  (10 testes — não soma no total)
```

**Total: 68 testes automatizados** (vs 30-32 do Pleno S1 → +112%). Smoke é subset do E2E e não é contado no total.

---

## 3. Tags utilizadas

| Tag         | Significado                                 | Onde aparece                    |
| ----------- | ------------------------------------------- | ------------------------------- |
| `@smoke`    | Subset crítico que roda em todo PR (≤5min)  | E2E core                        |
| `@core`     | Funcionalidade de negócio principal         | E2E                             |
| `@visual`   | Asserção visual via `toHaveScreenshot()`    | `automation/tests/visual/`      |
| `@a11y`     | Validação WCAG 2.1 AA via axe-core          | `automation/tests/a11y/`        |
| `@perf`     | Lighthouse com thresholds                   | `automation/tests/performance/` |
| `@security` | XSS / headers / cookies / CORS / rate-limit | `automation/tests/security/`    |
| `@flaky`    | Quarantine — não bloqueia CI                | (vazio na entrega final)        |

---

## 4. Smoke list (10 testes nominais)

Subset de E2E que roda no PR gate (`ci.yml`, ≤5min):

1. Home carrega sem erro de console (HTTP 200, título correto)
2. Lista de times populares renderiza ≥10 itens
3. Busca por time conhecido retorna ≥1 resultado
4. Filtro de campeonato altera listagem
5. Favoritar time persiste após reload
6. Desfavoritar time remove da lista de favoritos
7. Página de partida abre detalhe completo
8. Aba Melhores Momentos lista vídeos
9. Player de vídeo inicia reprodução (sem erro)
10. Botão "Conectar Google Calendar" redireciona pro `accounts.google.com`

---

## 5. Thresholds aplicados

### Visual (`automation/tests/visual/`)

- `maxDiffPixelRatio: 0.02` (2%)
- Áreas dinâmicas masked via `mask:` (datas, contadores, vídeos)

### A11y (`automation/tests/a11y/`)

- WCAG 2.1 AA
- Falha em violations `serious` ou `critical`
- `moderate`/`minor` registradas mas não bloqueiam

### Performance (`automation/tests/performance/`)

- Performance score ≥80 (warning, não bloqueia — soft fail conforme R7)
- LCP ≤2500ms
- CLS ≤0.1
- TBT ≤300ms

### API (`automation/tests/api/`)

- Status code esperado (200, 4xx)
- Schema validado via Zod
- Response time p95 (warning)

### Security (`automation/tests/security/`)

- XSS reflected nos filtros (alert + raw HTML check)
- SQL-injection-like na API (5xx + leak markers)
- Headers HTTP de segurança (HSTS, XFO, XCTO, Referrer-Policy, CSP)
- Auth bypass em rotas protegidas (`/calendario`, `/favoritos`, `/perfil`)
- Fuzz unicode/emoji/large-payload no input de busca
- Rate limiting (50 req paralelas → esperado >0 com 429)
- Cookies de auth com flags Secure + HttpOnly + SameSite
- CORS reflexivo + preflight com Authorization
- Roda serial (`--workers=1`) para não auto-DoS a API DEV

---

## 6. Cruzamento bug → cobertura

22 bugs documentados em `bug-reports/bugs/`; cruzando com a matriz acima, todos têm cobertura BDD e/ou automatizada equivalente:

| Bug                                       | Funcionalidade impactada  | Cobertura na suite                   |
| ----------------------------------------- | ------------------------- | ------------------------------------ |
| BUG-001 (API DEV em PROD)                 | Buscar partidas           | API tests + E2E (timeouts ampliados) |
| BUG-002 (aria-label duplicado)            | Calendário                | A11y + E2E calendário                |
| BUG-003 (rotas 404)                       | Navegação                 | E2E navegação                        |
| BUG-004 (favoritos calendário)            | Favoritar times           | E2E + BDD                            |
| BUG-005 (zero data-testid)                | Transversal               | Documentado em IMP-001               |
| BUG-006/007 (SEO)                         | Home                      | E2E navegação + Visual               |
| BUG-008 (API date inconsistência)         | Buscar partidas           | API tests                            |
| BUG-009 (calendar número duplicado)       | Calendário                | E2E calendário                       |
| BUG-010 (título rota inválida)            | Navegação                 | E2E navegação                        |
| BUG-011 (modal partida finalizada vazio)  | Buscar partidas / partida | E2E + BDD                            |
| BUG-012 (calendário vista semanal 3 dias) | Calendário                | E2E calendário + responsividade      |
| BUG-013/014/015/016 (a11y)                | Transversal               | A11y axe-core 5 testes               |
| BUG-017 (sitemap.xml)                     | SEO                       | API                                  |
| BUG-018 (Lighthouse Perf 41)              | Home                      | Perf Lighthouse                      |
| BUG-019 (security headers home)           | Transversal/Home          | Security `security-headers.spec.ts`  |
| BUG-020 (API DEV sem HSTS/CSP)            | API                       | Security `security-headers.spec.ts`  |
| BUG-021 (API sem rate limiting)           | API                       | Security `rate-limiting.spec.ts`     |
| BUG-022 (cookie auth sem Secure/HttpOnly) | Auth/Cookies              | Security `cookies-flags.spec.ts`     |
