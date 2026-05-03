# Bug-regression suite

Camada dedicada de regressão **por bug**. Cada `BUG-XXX-*.spec.ts` mapeia 1:1
com `bug-reports/bugs/BUG-XXX-*.md`.

## Princípio

Especs aqui asseguram **memória institucional**: cada bug encontrado vira um
teste que falha enquanto o defeito existir e fica verde quando o dev fixar.
Diferente da camada de contrato (`smoke/`, `e2e/`, `security/`, `a11y/`),
que descreve **o que o produto deve fazer**, esta camada descreve **o que
não pode voltar a acontecer**.

## Lifecycle de um spec

1. **Open** — bug detectado, `.md` criado, spec adicionado aqui. Teste **falha**
   no estado atual (intencional). Card no Trello em "Bugs reportados".
2. **In dev** — dev abre PR de fix. Roda `npm run test:bug -- BUG-XXX` localmente.
3. **Fixed** — spec passa em CI. `.md` Status muda pra `Closed`. Card move pra
   "Concluído".
4. **Archived** — após 6 meses verde + 1 release importante sem regressão, o spec
   pode ser deletado.

## Polaridade dos specs

Asserts são sempre do **comportamento esperado** (nunca do defeito atual).
Quando o dev fix, o teste passa naturalmente — sem inversão de lógica.

| Status atual do bug | Resultado esperado do spec |
| ------------------- | -------------------------- |
| Bug presente        | ❌ Vermelho (intencional)  |
| Bug fixado          | ✅ Verde                   |
| Bug volta           | ❌ Vermelho — alerta CI    |

## Auto-evidence em falha

Toda falha grava em `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/`
através do reporter `_reporter.ts` (registrado no `playwright.config.ts`):

- `summary.json` — bugId, testTitle, status, duration, error, findings (resumo)
- `findings.json` — payload do `bugFindings.set(...)` do spec (expected/actual)
- `trace.zip` — anexo Playwright (`trace: retain-on-failure` na config global)
- `screenshot.png` — anexo Playwright (`screenshot: only-on-failure`)
- `video.webm` — anexo Playwright (`video: retain-on-failure`)
- `error-context.md` — contexto do erro (gerado pelo Playwright)

Execução **verde não gera artefato** — pasta `auto-runs/` só cresce em regressão.

### Por que reporter e não fixture afterEach?

`testInfo.attachments` só termina de ser populado APÓS o teardown do `page`,
que roda DEPOIS dos teardowns de fixtures customizadas. Reporter executa
em `onTestEnd`, garantia post-teardown de tudo. Ver `_reporter.ts` JSDoc.

## Comandos

```bash
# Roda todos os specs de bugs (~21)
npm run test:bugs

# Roda um bug específico
npm run test:bug -- @bug-002
npm run test:bug -- "@bug-013|@bug-014"

# Rodar fora dos bugs (suíte completa)
npm test
```

> **Cuidado:** evite passar `--reporter=...` na CLI ao rodar a suite de bugs. O
> Playwright **substitui** a lista de reporters da config quando a flag CLI é
> usada — e isso desliga o `BugEvidenceReporter`, perdendo a auto-evidence.
> Use `npm run test:bugs` direto.

## Padrão de spec

```ts
import { test, expect } from '@bugs/_fixtures';

test('@bug @bug-XXX descrição curta do esperado', async ({ page, bugFindings }) => {
  // 1. Setup: navegar / abrir modal / etc.
  await page.goto('https://www.kasa.live/');

  // 2. Coletar evidência (não falha aqui)
  const observed = await page.evaluate(() => /* ... */);

  // 3. Preencher findings ANTES do assert (pra dump em falha)
  bugFindings.set({
    bugId: 'BUG-XXX',
    testTitle: '...',
    url: '...',
    expected: '...',
    actual: observed,
  });

  // 4. Assert do comportamento esperado
  expect(observed.someCount, 'mensagem clara apontando o bug').toBe(0);
});
```

## Specs com `test.fixme`

Bugs que dependem de infra/dados fora do nosso controle ficam em
`test.fixme` com nota explícita:

| Bug     | Motivo                                                                   |
| ------- | ------------------------------------------------------------------------ |
| BUG-012 | `Needs revalidation` — `/calendario` hoje não tem vista semanal visual   |
| BUG-018 | Coberto via project `perf` (Lighthouse). Reativar quando threshold subir |

`fixme` não cria evidência nem falha CI. Quando o dev fixar (ou o pré-condição
mudar), trocar `test.fixme(...)` por `test(...)`.

## Tagging

- `@bug` — todos os specs aqui
- `@bug-XXX` — spec do bug específico

Combine com `--grep` para alvo.

## Diretrizes (do não-negociável)

1. **1 spec = 1 bug** — sem `describe` que cubra múltiplos bugs.
2. **Nome do arquivo começa com `BUG-XXX-`** — auto-evidence depende disso pra
   inferir a pasta de destino.
3. **Helpers > duplicação** — reuse `helpers/{evidence,axe,http}.ts` antes de
   re-implementar.
4. **Não mascarar com `test.skip` permanente** — `skip` é pra runtime
   (sem dados disponíveis). `fixme` é pra revalidação documentada.
5. **Status do `.md` em harmonia com o spec** — spec verde → `.md` Status
   vira `Closed`. Divergência é code-smell.
