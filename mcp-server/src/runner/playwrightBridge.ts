import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath compat com Node 20.0+ (import.meta.dirname só em 20.11+)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

/** Hard cap em 10 minutos por execução de Playwright via MCP. */
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

export interface RunOptions {
  grep: string;
  browser?: string;
  headed?: boolean;
  /**
   * Quando `true`, propaga `CI=true` ao processo `npx playwright test`
   * (forca retries=2 e workers=4 conforme `playwright.config.ts`). Default
   * `false` — respeita o env real do shell em vez de hardcodar (anteriormente
   * sempre era `true`, mascarando flake local).
   */
  ciMode?: boolean;
  /**
   * Timeout absoluto da execução em milissegundos. Se a Playwright não
   * terminar nesse intervalo, o processo é morto (SIGTERM → SIGKILL) e a
   * Promise resolve com `exitCode: -1` e mensagem em stderr explicando o
   * timeout. Default: 10 minutos. Ver ADR-006.
   */
  timeoutMs?: number;
}

export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
}

export async function runPlaywright(opts: RunOptions): Promise<RunResult> {
  const args = ['playwright', 'test', `--grep=${opts.grep}`, '--reporter=json'];
  if (opts.browser) args.push(`--project=${opts.browser}`);
  if (opts.headed) args.push('--headed');

  const env = opts.ciMode ? { ...process.env, CI: 'true' } : process.env;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolve) => {
    const proc = spawn('npx', args, { cwd: REPO_ROOT, env });
    let stdout = '';
    let stderr = '';
    let settled = false;

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    const timer = setTimeout(() => {
      if (settled) return;
      stderr += `\n[mcp:playwrightBridge] Timeout after ${timeoutMs}ms — sending SIGTERM. SIGKILL em 5s se não responder.\n`;
      proc.kill('SIGTERM');
      // Backup: força morte se SIGTERM não foi suficiente
      setTimeout(() => {
        if (!settled) proc.kill('SIGKILL');
      }, 5_000);
      settled = true;
      resolve({ exitCode: -1, stdout, stderr, timedOut: true });
    }, timeoutMs);

    proc.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    proc.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ exitCode: 1, stdout, stderr: stderr + `\n${err.message}`, timedOut: false });
    });
  });
}
