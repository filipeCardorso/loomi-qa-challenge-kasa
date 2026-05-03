/**
 * Bug-regression fixture — extends do `@fixtures/index` adicionando o slot
 * `bugFindings` que cada spec preenche antes de assertar. Em falha, o slot é
 * anexado ao testInfo como `bug-findings.json` e consumido pelo reporter
 * `_reporter.ts`, que faz o dump em
 * `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/`.
 *
 * Cada spec da pasta `bugs/` deve usar `import { test, expect } from '@bugs/_fixtures'`
 * em vez de `@playwright/test` ou `@fixtures/index` direto.
 */

import { test as baseTest } from '@fixtures/index';
import type { BugFindings } from '@bugs/helpers/evidence';

interface BugFindingsSlot {
  current: BugFindings | null;
  set(f: BugFindings): void;
}

type BugFixtures = {
  bugFindings: BugFindingsSlot;
};

export const test = baseTest.extend<BugFixtures>({
  bugFindings: async ({}, use, testInfo) => {
    const slot: BugFindingsSlot = {
      current: null,
      set(f) {
        this.current = f;
      },
    };
    await use(slot);
    if (slot.current) {
      await testInfo.attach('bug-findings.json', {
        body: JSON.stringify({ ...slot.current, capturedAt: new Date().toISOString() }, null, 2),
        contentType: 'application/json',
      });
    }
  },
});

export { expect } from '@fixtures/index';
