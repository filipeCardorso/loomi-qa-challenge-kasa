/**
 * Auto-evidence — utilitários compartilhados entre a fixture `bugFindings`
 * (anexa o payload do spec ao testInfo) e o reporter `_reporter.ts` (copia
 * trace/screenshot/video pra `bug-reports/evidence/BUG-XXX/auto-runs/<ts>/`).
 *
 * Por que reporter e não fixture? O `testInfo.attachments` automático do
 * Playwright (trace/video/screenshot) só termina de ser populado após o
 * teardown do `page` — que roda DEPOIS do teardown da fixture. Logo, copiar
 * em fixture afterEach pega `attachments` ainda incompletos. Reporter roda
 * em `onTestEnd`, garantia post-teardown.
 */

import path from 'node:path';

/** Extrai `BUG-001` (ou `IMP-011`) do filename do spec. */
export function extractBugId(file: string): string | null {
  const m = path.basename(file).match(/^(BUG|IMP)-\d{3}/);
  return m ? m[0] : null;
}

/** Timestamp em formato ISO seguro pra filesystem (sem `:`). */
export function safeTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/** Payload que cada spec preenche via `bugFindings.set(...)` antes do assert. */
export interface BugFindings {
  bugId: string;
  testTitle: string;
  url?: string;
  expected: string;
  actual: unknown;
  notes?: string[];
}
