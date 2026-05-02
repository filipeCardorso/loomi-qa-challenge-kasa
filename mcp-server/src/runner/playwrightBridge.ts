import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath compat com Node 20.0+ (import.meta.dirname só em 20.11+)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

export interface RunOptions {
  grep: string;
  browser?: string;
  headed?: boolean;
}

export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runPlaywright(opts: RunOptions): Promise<RunResult> {
  const args = ['playwright', 'test', `--grep=${opts.grep}`, '--reporter=json'];
  if (opts.browser) args.push(`--project=${opts.browser}`);
  if (opts.headed) args.push('--headed');

  return new Promise((resolve) => {
    const proc = spawn('npx', args, { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' } });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });
}
