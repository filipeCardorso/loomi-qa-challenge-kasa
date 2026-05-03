/**
 * BUG-022 — Cookie de auth sem flags Secure/HttpOnly.
 *
 * O cookie `next-leap_access` é setado durante o login mas falta as flags
 * Secure (vulnerável a MITM) e HttpOnly (vulnerável a XSS), o que
 * caracteriza session hijacking trivial.
 *
 * Ver: bug-reports/bugs/BUG-022-cookie-auth-sem-secure-nem-httponly.md
 */

import { test, expect } from '@bugs/_fixtures';

test.describe.configure({ timeout: 90_000 });

test('@bug @bug-022 cookie de auth tem Secure + HttpOnly', async ({
  loggedInPage,
  bugFindings,
}) => {
  const cookies = await loggedInPage.context().cookies('https://www.kasa.live');
  const authCookie = cookies.find((c) =>
    /auth|session|token|next-leap|next-auth|jwt/i.test(c.name),
  );

  bugFindings.set({
    bugId: 'BUG-022',
    testTitle: 'cookie auth Secure+HttpOnly',
    url: 'https://www.kasa.live/',
    expected: 'cookie auth com secure=true && httpOnly=true && sameSite!=None',
    actual: {
      cookieName: authCookie?.name ?? null,
      secure: authCookie?.secure ?? null,
      httpOnly: authCookie?.httpOnly ?? null,
      sameSite: authCookie?.sameSite ?? null,
      allCookies: cookies.map((c) => c.name),
    },
  });

  expect(authCookie, 'nenhum cookie de auth detectado após login').toBeTruthy();
  if (!authCookie) return;

  const flagsFindings: string[] = [];
  if (!authCookie.secure) flagsFindings.push(`${authCookie.name}: faltando Secure`);
  if (!authCookie.httpOnly) flagsFindings.push(`${authCookie.name}: faltando HttpOnly`);
  if (authCookie.sameSite === 'None') flagsFindings.push(`${authCookie.name}: SameSite=None`);

  expect(
    flagsFindings,
    `cookie de auth com flags inseguras:\n  - ${flagsFindings.join('\n  - ')}`,
  ).toEqual([]);
});
