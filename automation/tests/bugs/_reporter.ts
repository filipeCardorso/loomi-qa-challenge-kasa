/**
 * BugEvidenceReporter — Playwright reporter que copia trace/screenshot/video/
 * findings.json pra `bug-reports/evidence/BUG-XXX/auto-runs/<timestamp>/` em
 * cada falha de spec da pasta `automation/tests/bugs/`.
 *
 * Roda em `onTestEnd`, garantindo que o teardown do `page` já populou
 * todos os anexos automáticos (trace.zip, screenshot.png, video.webm).
 *
 * Execuções verdes não geram artefato — pasta `auto-runs/` só cresce em
 * regressão.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import { extractBugId, safeTimestamp } from './helpers/evidence';

// Playwright reporters são loaded via require(); usar process.cwd() (sempre =
// repo root quando rodado via `npm test`) é mais confiável que __dirname em
// CJS/ESM mixed loaders.
const REPO_ROOT = process.cwd();
const EVIDENCE_BASE = path.join(REPO_ROOT, 'bug-reports', 'evidence');

export default class BugEvidenceReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;
    const bugId = extractBugId(test.location.file);
    if (!bugId) return;

    const targetDir = path.join(EVIDENCE_BASE, bugId, 'auto-runs', safeTimestamp());
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch {
      return;
    }

    let findingsPayload: unknown = null;

    for (const att of result.attachments) {
      // findings JSON: bytes em att.body — escreve direto
      if (att.name === 'bug-findings.json' && att.body) {
        const buf = Buffer.isBuffer(att.body) ? att.body : Buffer.from(att.body);
        try {
          findingsPayload = JSON.parse(buf.toString('utf-8'));
        } catch {
          // ignora parse error — ainda salva o blob
        }
        try {
          fs.writeFileSync(path.join(targetDir, 'findings.json'), buf);
        } catch {
          /* noop */
        }
        continue;
      }

      // Anexos automáticos do Playwright (trace, screenshot, video) usam path
      if (!att.path || !fs.existsSync(att.path)) continue;
      const ext = path.extname(att.path);
      const safeName = att.name.replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
      const dest = path.join(targetDir, `${safeName}${ext}`);
      try {
        fs.copyFileSync(att.path, dest);
      } catch {
        /* noop */
      }
    }

    // Resumo da falha — facilita varredura sem abrir trace
    const summary = {
      bugId,
      capturedAt: new Date().toISOString(),
      testTitle: test.title,
      file: path.relative(REPO_ROOT, test.location.file),
      status: result.status,
      duration: result.duration,
      error: result.error?.message?.replace(/\[[0-9;]*m/g, '') ?? null,
      findings: findingsPayload,
    };
    try {
      fs.writeFileSync(path.join(targetDir, 'summary.json'), JSON.stringify(summary, null, 2));
    } catch {
      /* noop */
    }
  }
}
