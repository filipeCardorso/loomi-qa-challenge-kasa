import { test, expect } from '@fixtures/index';

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

test('@security cookie de auth tem flags Secure + HttpOnly + SameSite (logado)', async ({
  loggedInPage,
}) => {
  const cookies = await loggedInPage.context().cookies('https://www.kasa.live');
  const authCookie = cookies.find((c) => /auth|session|token|next-leap|next|jwt/i.test(c.name));

  if (!authCookie) {
    test.skip(
      true,
      `Cookie de auth não detectado — login pode ter falhado ou usar outro mecanismo (vistos: ${cookies
        .map((c) => c.name)
        .join(', ')})`,
    );
    return;
  }

  expect
    .soft(authCookie.secure, `Cookie ${authCookie.name} sem flag Secure (vulnerável a MITM)`)
    .toBe(true);
  expect
    .soft(authCookie.httpOnly, `Cookie ${authCookie.name} sem flag HttpOnly (vulnerável a XSS)`)
    .toBe(true);
  expect
    .soft(authCookie.sameSite, `Cookie ${authCookie.name} sem SameSite (vulnerável a CSRF)`)
    .not.toBe('None');
});
