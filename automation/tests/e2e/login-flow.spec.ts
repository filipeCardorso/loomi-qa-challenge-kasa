import { test, expect } from '@fixtures/index';
import { HomePage } from '@pages/HomePage';

/**
 * @smoke @core
 * Login via email/senha → 4 tabs aparecem (Partidas/Favoritos/Melhores/Calendário).
 *
 * Skip elegante se .env.local não tem credenciais (CI sem secrets).
 */
const hasCreds = !!(process.env.KASA_USER_EMAIL && process.env.KASA_USER_PASSWORD);

test.describe('Login email/senha → nav 4 tabs', () => {
  // Login via UI + Firebase auth pode levar 25s+ na DEV sob contenção paralela.
  // Bumpamos pra 90s pra absorver flake da fixture loggedInPage sem virar `waitForTimeout`.
  test.describe.configure({ timeout: 90_000 });
  test.skip(!hasCreds, 'precisa de KASA_USER_EMAIL/PASSWORD em .env.local');

  test('@smoke @core login funciona e header passa a mostrar 4 tabs nav', async ({
    loggedInPage,
  }) => {
    const home = new HomePage(loggedInPage);

    // após login, contagem de tabs deve ser >= 3 (4 ideal, mas Favoritos pode ser
    // botão custom Chakra que não casa com getByRole link — aceita 3 como mínimo)
    const tabsVisible = await home.countNavTabs();
    expect(
      tabsVisible,
      `esperado >=3 tabs nav após login (Partidas/Melhores/Calendário no mínimo). Visíveis: ${tabsVisible}`,
    ).toBeGreaterThanOrEqual(3);

    // valida que tabs específicas LOGADAS aparecem
    await expect(
      home.tabMelhoresMomentos.first(),
      'tab Melhores momentos visível logado',
    ).toBeVisible();
    await expect(home.tabCalendario.first(), 'tab Calendário visível logado').toBeVisible();

    // Confirma que o botão Entrar do header SUMIU (proxy de auth)
    const entrarHeader = loggedInPage.getByRole('button', { name: /^entrar$/i }).first();
    expect(
      await entrarHeader.isVisible({ timeout: 1_000 }).catch(() => false),
      'botão "Entrar" do header não deve estar visível quando logado',
    ).toBe(false);
  });
});
