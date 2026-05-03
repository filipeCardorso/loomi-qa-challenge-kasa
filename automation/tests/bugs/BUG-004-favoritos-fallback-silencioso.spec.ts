/**
 * BUG-004 — `/favoritos` em sessão anônima cai na home sem aviso.
 *
 * Acessar `/favoritos` (ou `/calendario`) sem login deve dar sinal explícito
 * ao usuário — ou modal de login aberto, ou heading "Favoritos" com empty
 * state, ou rota dedicada `/login`. Hoje o site redireciona silenciosamente
 * pra home sem qualquer indicação de que a feature exige autenticação.
 *
 * Asserção (ANY-OF):
 *   - URL final é `/login` (rota dedicada existe).
 *   - Modal de login está visível (CTA explícito).
 *   - Página tem heading "Favoritos" (rota dedicada renderizada).
 *
 * Caso contrário, é fallback silencioso → falha.
 *
 * Ver: bug-reports/bugs/BUG-004-favoritos-calendario-fallback-silencioso.md
 */

import { test, expect } from '@bugs/_fixtures';
import { SELECTORS } from '@support/selectors';

test('@bug @bug-004 /favoritos anônimo dá sinal explícito (login OU heading próprio)', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/favoritos', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const finalUrl = page.url();
  const showsLoginModal = await page
    .locator(SELECTORS.loginModal)
    .first()
    .isVisible({ timeout: 1_500 })
    .catch(() => false);
  const showsFavoritesHeading =
    (await page
      .getByRole('heading')
      .filter({ hasText: /favorit/i })
      .count()
      .catch(() => 0)) > 0;
  const onLoginRoute = /\/(login|entrar)\b/i.test(finalUrl);

  const hasExplicitSignal = showsLoginModal || showsFavoritesHeading || onLoginRoute;

  bugFindings.set({
    bugId: 'BUG-004',
    testTitle: '/favoritos sinal explícito',
    url: 'https://www.kasa.live/favoritos',
    expected: 'login modal OU heading Favoritos OU rota /login',
    actual: { finalUrl, showsLoginModal, showsFavoritesHeading, onLoginRoute },
  });

  expect(
    hasExplicitSignal,
    `/favoritos anônimo terminou em ${finalUrl} sem login modal nem heading dedicado — fallback silencioso`,
  ).toBe(true);
});
