# IMP-008 — Cookie banner LGPD

**Impacto:** Medium
**Categoria:** Compliance
**Esforço estimado:** M
**Trello card:** https://trello.com/c/wM8SBBas

## Contexto

A aplicação não exibe banner de consentimento de cookies. A LGPD (Lei 13.709/2018) exige base legal para tratamento de dados pessoais; cookies não estritamente necessários (analytics, marketing, preferências) precisam de **consentimento prévio, livre, informado e inequívoco** (ANPD — Guia Orientativo de Cookies, 2022).

## Problema observado

- Sem banner / pop-up de cookies na primeira visita.
- `localStorage` armazena `chakra-ui-color-mode` e provavelmente outros sem aviso.
- Sem política de privacidade linkada do rodapé.
- Sem painel para o usuário revisar/revogar consentimento.
- Sem distinção entre cookies essenciais e opcionais.

**Evidência capturada 2026-05-03 (visita anônima sem consentimento):**

- Cookies setados imediatamente: **2** (incluindo `next-leap_access` — ver BUG-022 sobre flags ausentes)
- localStorage entries setadas: **1** (`chakra-ui-color-mode`)
- Cookie banner detectado na UI: **não** (busca por texto `/cookie|consentimento|aceitar|consent/i` retornou zero matches visíveis)
- Arquivos: [`bug-reports/evidence/IMP-008/cookies-localstorage-anonimo.json`](../evidence/IMP-008/cookies-localstorage-anonimo.json) + [`screenshot-home-sem-banner.png`](../evidence/IMP-008/screenshot-home-sem-banner.png)
- Reprodução: `node scripts/capture-imp-evidence.mjs`

## Sugestão

1. **Banner inicial** (não-bloqueante, fixo no rodapé):
   - Texto curto explicando uso de cookies.
   - 3 botões: `Aceitar todos`, `Rejeitar opcionais`, `Personalizar`.
2. **Modal "Personalizar"** com toggles por categoria:
   - **Essenciais** (sempre on): autenticação, preferência de tema, segurança.
   - **Analytics** (off por padrão): GA, Hotjar, etc.
   - **Marketing** (off por padrão): Meta Pixel, ads.
3. **Persistência:** salvar consentimento em `localStorage` + cookie `cookie-consent` com TTL 12 meses.
4. **Ferramenta de revogação:** link "Gerenciar cookies" no footer reabrindo o modal.
5. **Política de privacidade:** página `/privacidade` linkada do banner.
6. **Bloqueio de scripts:** scripts opcionais só carregam após consentimento (ex.: `<script type="text/plain" data-category="analytics">`).
7. **Logging:** registrar timestamp, versão da política e escolha por usuário (auditoria ANPD).

## Por que melhora

- **Conformidade LGPD** — evita multas (até 2% do faturamento, máx. R$ 50M por infração).
- **Transparência** com usuário.
- **Habilita analytics legítimo** sem risco jurídico.
- **Boa prática internacional** (GDPR-aligned, facilita expansão).

## Evidência

- LGPD art. 7º, IX e art. 8º (consentimento) — referência legal.
- ANPD "Guia Orientativo Cookies e Proteção de Dados Pessoais" (10/2022).
- Print da Home sem banner: `bug-reports/evidence/IMP-008/sem-banner.png` (a capturar).
- Inspeção `Application > Storage` mostrando cookies sem consent: `bug-reports/evidence/IMP-008/storage.png` (a capturar).
