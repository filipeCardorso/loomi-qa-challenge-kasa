import { test, expect } from '@fixtures/index';

/**
 * @security Session fixation — cookie de sessão deve ser rotacionado no login
 *
 * Ataque: atacante força a vítima a usar uma sessão pré-existente (ex: via
 * cookie já setado), e quando ela autentica, herda a sessão autenticada.
 *
 * Defesa: ao logar, o backend DEVE invalidar/rotacionar o cookie de sessão
 * (Set-Cookie com novo valor diferente do pré-login). Se o valor permanecer
 * idêntico, ataque é viável.
 *
 * Estratégia:
 *   1. Visita anônima → captura cookies "session-like" pré-login
 *   2. Login via UI (LoginModal)
 *   3. Captura cookies pós-login
 *   4. Compara: pelo menos 1 cookie de auth deve ter mudado (ou um novo deve
 *      ter sido adicionado em vez do pré-existente).
 */

test.describe.configure({ timeout: 90_000 });

const SESSION_COOKIE_PATTERN = /auth|session|token|sid|next-auth|next-leap|jwt/i;

test('@security cookie de sessão é rotacionado/criado após login', async ({
  page,
  context,
  loginModal,
}) => {
  const email = process.env.KASA_USER_EMAIL;
  const password = process.env.KASA_USER_PASSWORD;
  if (!email || !password) {
    test.skip(true, 'KASA_USER_EMAIL/PASSWORD não configurados — skip session-fixation');
    return;
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const preCookies = await context.cookies('https://www.kasa.live');
  const preSession = preCookies.filter((c) => SESSION_COOKIE_PATTERN.test(c.name));
  const preMap = new Map(preSession.map((c) => [c.name, c.value]));

  await page
    .getByRole('button', { name: /^entrar$/i })
    .first()
    .click();
  await loginModal.fillCredentials(email, password);
  await loginModal.submitEntrar();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

  const postCookies = await context.cookies('https://www.kasa.live');
  const postSession = postCookies.filter((c) => SESSION_COOKIE_PATTERN.test(c.name));

  const rotated = postSession.some((c) => {
    const before = preMap.get(c.name);
    return before === undefined || before !== c.value;
  });

  console.warn(
    `[security] session cookies pre=${preSession.length} post=${postSession.length} rotated=${rotated}`,
  );

  expect(
    rotated,
    `nenhum cookie de sessão foi criado/rotacionado pós-login. ` +
      `pre=${JSON.stringify(preSession.map((c) => c.name))} ` +
      `post=${JSON.stringify(postSession.map((c) => c.name))} — ` +
      `vulnerável a session fixation`,
  ).toBe(true);
});
