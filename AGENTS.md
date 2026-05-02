# AGENTS.md — Guia para subagentes paralelos

## Ler antes de qualquer tarefa
1. `docs/superpowers/specs/2026-05-02-loomi-qa-challenge-design.md` (spec)
2. `docs/superpowers/plans/2026-05-02-loomi-qa-challenge.md` (plan)
3. Esta lista de convenções

## Convenções de naming
- Bug: `BUG-XXX-titulo-curto.md` (XXX zero-padded)
- Improvement: `IMP-XXX-titulo-curto.md`
- Charter: `CXX-titulo.md`
- Feature BDD: `funcionalidade-em-kebab.feature` (PT-BR)
- POM: `PageNamePage.ts` (PascalCase, sufixo `Page`)
- Component POM: `ComponentName.ts`
- Teste E2E: `funcionalidade-em-kebab.spec.ts`

## Padrão de commit
Conventional Commits. Exemplos:
- `test: adicionar 8 cenarios E2E para favoritar times`
- `feat(mcp): implementar tool run_test_case`
- `docs(bug): BUG-007 favorito perde apos reload`

## Padrão de bug report
Sempre seguir o schema do spec §4.5. Campos obrigatórios.
Severidade: Critical (bloqueia uso) / High (degrada muito) / Medium (impacta UX) / Low (cosmético).
Reproduzibilidade obrigatória, com N/M tentativas.

## Padrão de teste Playwright
- Seletores: `getByRole` > `getByTestId` > `getByText` > CSS. **NUNCA XPath**.
- Zero `waitForTimeout`. Use `waitFor` baseado em estado.
- Asserts com mensagem: `expect(x, 'razao').toBe(y)`.
- Evidência automática (config global captura).
- Tags: `@smoke`, `@core`, `@visual`, `@a11y`, `@perf`.

## Nunca faça
- waitForTimeout
- XPath
- console.log esquecido
- Lógica de teste em POM
- Test que depende de outro test (exceto describe.serial documentado)
- Commit com .env vazado

## Checklist pré-commit
- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] Smoke local passa (se mexeu em E2E)
- [ ] CHANGELOG atualizado se mudança relevante
