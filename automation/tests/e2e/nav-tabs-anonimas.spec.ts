import { test, expect } from '@fixtures/index';

/**
 * @smoke @core
 * Sem login: tabs Partidas e Melhores momentos navegam corretamente.
 * (Logado terá 4 tabs — coberto por outro teste.)
 */
test.describe('Nav anônima — 2 tabs', () => {
  test('@smoke @core tab "Melhores momentos" navega para /melhores-momentos', async ({
    homePage,
    page,
  }) => {
    await homePage.open();

    await homePage.tabMelhoresMomentos.first().click();
    await page.waitForURL(/\/melhores-momentos/i, { timeout: 10_000 });
    expect(page.url(), 'URL deve conter /melhores-momentos').toMatch(/\/melhores-momentos/);

    // h2 esperado da página
    await expect(
      page.getByRole('heading', { name: /melhores momentos das partidas finalizadas/i }),
      'heading principal de melhores momentos deve estar visível',
    ).toBeVisible({ timeout: 10_000 });
  });

  test('@smoke @core tab "Partidas" volta para home /', async ({ homePage, page }) => {
    await homePage.open();
    await page.goto('/melhores-momentos');
    await page.waitForLoadState('domcontentloaded');

    await homePage.tabPartidas.first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', {
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname, 'pathname deve ser /').toBe('/');
  });
});
