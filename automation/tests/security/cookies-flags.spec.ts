import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 60_000 });

/**
 * @security Cookies — flags Secure / HttpOnly / SameSite
 *
 * Coleta cookies vistos numa visita anônima à home. Pra qualquer cookie
 * candidato a "auth/session/token" verifica:
 *   - secure: true
 *   - httpOnly: true (protege de roubo via XSS)
 *   - sameSite: 'Lax' ou 'Strict' (não 'None')
 *
 * Não exige login — se o site setar cookies de tracking ou analytics, eles
 * também são auditados como soft-warning.
 */

test('@security cookies setados em visita anônima respeitam flags básicas', async ({
  context,
  page,
}) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

  const cookies = await context.cookies('https://www.kasa.live');
  const findings: string[] = [];
  const warnings: string[] = [];

  for (const c of cookies) {
    const looksSensitive = /auth|session|token|sid|next-auth|next-leap|jwt|csrf/i.test(c.name);
    const tagSensitive = looksSensitive ? '[SENSITIVE]' : '[other]';

    if (looksSensitive) {
      if (!c.secure) findings.push(`${tagSensitive} ${c.name}: faltando Secure`);
      if (!c.httpOnly)
        findings.push(`${tagSensitive} ${c.name}: faltando HttpOnly (vulnerável a XSS)`);
      if (c.sameSite === 'None') findings.push(`${tagSensitive} ${c.name}: SameSite=None`);
    } else if (!c.secure) {
      // não bloqueia, só registra
      warnings.push(`${tagSensitive} ${c.name}: faltando Secure`);
    }
  }

  if (warnings.length) {
    console.warn(
      `[security] cookies não-sensíveis sem Secure (warning):\n  - ${warnings.join('\n  - ')}`,
    );
  }

  expect(
    findings,
    `cookies sensíveis com flags inadequadas:\n  - ${findings.join('\n  - ')}`,
  ).toEqual([]);
});

test('@security cookie de auth (logado) tem Secure + HttpOnly + SameSite', async ({ browser }) => {
  const email = process.env.KASA_USER_EMAIL;
  const password = process.env.KASA_USER_PASSWORD;
  test.skip(
    !email || !password,
    'KASA_USER_EMAIL/PASSWORD não definidos em .env.local — teste de cookie de auth requer credenciais',
  );

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });

  // login via header
  const headerEntrar = page.getByRole('button', { name: /^entrar$/i }).first();
  await headerEntrar.click();
  await page.getByPlaceholder(/digite seu e-?mail/i).fill(email!);
  await page.getByPlaceholder(/digite sua senha/i).fill(password!);
  await page
    .getByRole('button', { name: /^entrar$/i })
    .last()
    .click();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

  const cookies = await context.cookies('https://www.kasa.live');
  const authCookie = cookies.find((c) => /auth|session|token|next|jwt/i.test(c.name));
  test.skip(
    !authCookie,
    `nenhum cookie de auth detectado (vistos: ${cookies.map((c) => c.name).join(', ')})`,
  );

  expect.soft(authCookie!.secure, `${authCookie!.name} sem Secure`).toBe(true);
  expect
    .soft(authCookie!.httpOnly, `${authCookie!.name} sem HttpOnly (vulnerável a XSS)`)
    .toBe(true);
  expect.soft(authCookie!.sameSite, `${authCookie!.name} com SameSite=None`).not.toBe('None');

  await context.close();
});
