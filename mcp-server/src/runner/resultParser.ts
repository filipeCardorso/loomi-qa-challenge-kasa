import { randomUUID } from 'node:crypto';
import type { RunTestCaseOutput } from '../types/mcp.js';

interface PlaywrightJsonReport {
  suites: Array<{ specs: Array<{ tests: Array<{ results: Array<PlaywrightTestResult>; }>; title: string }>; }>;
  stats: { duration: number };
}
interface PlaywrightTestResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  errors?: Array<{ message: string; stack?: string; location?: { file: string; line: number } }>;
  attachments?: Array<{ name: string; path?: string; contentType: string }>;
}

export function parseResult(stdout: string): RunTestCaseOutput {
  const testId = randomUUID();
  let report: PlaywrightJsonReport;
  try {
    report = JSON.parse(stdout);
  } catch {
    return { status: 'failed', duration_ms: 0, errors: [{ message: 'Falha ao parsear output do Playwright' }], artifacts: {}, testId };
  }

  const firstResult = report.suites[0]?.specs[0]?.tests[0]?.results[0];
  if (!firstResult) {
    return { status: 'failed', duration_ms: 0, errors: [{ message: 'Nenhum teste encontrado' }], artifacts: {}, testId };
  }

  const status = firstResult.status === 'interrupted' ? 'failed' : firstResult.status;
  const artifacts: RunTestCaseOutput['artifacts'] = {};
  for (const att of firstResult.attachments ?? []) {
    if (att.name === 'screenshot' && att.path) artifacts.screenshot = `loomi://artifacts/${testId}/screenshot.png`;
    if (att.name === 'video' && att.path) artifacts.video = `loomi://artifacts/${testId}/video.mp4`;
    if (att.name === 'trace' && att.path) artifacts.trace = `loomi://artifacts/${testId}/trace.zip`;
  }

  return {
    status,
    duration_ms: firstResult.duration,
    errors: (firstResult.errors ?? []).map(e => ({
      message: e.message,
      stack: e.stack,
      location: e.location ? `${e.location.file}:${e.location.line}` : undefined,
    })),
    artifacts,
    testId,
  };
}
