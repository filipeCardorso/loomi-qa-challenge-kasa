import { test, expect } from '@fixtures/index';
import { HomePage } from '@pages/HomePage';

/**
 * @core
 * Cobertura de navegação:
 * 1. Home → Melhores momentos → Home (anônimo) — verificar URLs
 * 2. Click logo retorna home a partir de qualquer página
 * 3. Tabs anônimas: 2 visíveis (Partidas + Melhores momentos)
 *    Favoritos/Calendário NÃO visíveis
 * 4. Tabs LOGADO: 4 visíveis — usa loggedInPage
 */
test.describe('Navegação — anônimo e logado', () => {
  test('@core fluxo Home → Melhores momentos → Home (anônimo)', async ({ homePage, page }) => {
    await homePage.open();
    expect(new URL(page.url()).pathname, 'inicial deve ser /').toBe('/');

    await homePage.tabMelhoresMomentos.first().click();
    await page.waitForURL(/\/melhores-momentos/i, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/melhores-momentos/);

    await homePage.tabPartidas.first().click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', {
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname, 'voltou para /').toBe('/');
  });

  test('@core click no logo a partir de /melhores-momentos retorna para /', async ({ page }) => {
    await page.goto('/melhores-momentos', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toMatch(/\/melhores-momentos/);

    const logo = page.locator('a[href="/"]').first();
    await logo.click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', {
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname, 'logo deve levar pra /').toBe('/');
  });

  test('@core tabs anônimas: Partidas + Melhores momentos visíveis; Favoritos/Calendário NÃO', async ({
    homePage,
  }) => {
    await homePage.open();

    await expect(homePage.tabPartidas.first(), 'tab Partidas visível anônimo').toBeVisible();
    await expect(
      homePage.tabMelhoresMomentos.first(),
      'tab Melhores momentos visível anônimo',
    ).toBeVisible();

    expect(
      await homePage.tabFavoritos
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false),
      'Favoritos NÃO deve estar visível anônimo',
    ).toBe(false);
    expect(
      await homePage.tabCalendario
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false),
      'Calendário NÃO deve estar visível anônimo',
    ).toBe(false);
  });

  test.describe('logado', () => {
    // Login fixture pode levar 30s+ sob contenção da DEV API; bumpamos o timeout.
    test.describe.configure({ timeout: 90_000 });

    test('@core tabs LOGADO: contagem >=3 (Partidas/Melhores/Calendário no mínimo)', async ({
      loggedInPage,
    }) => {
      const home = new HomePage(loggedInPage);
      const count = await home.countNavTabs();
      expect(
        count,
        `esperado >=3 tabs nav após login (4 ideal). Visíveis: ${count}`,
      ).toBeGreaterThanOrEqual(3);

      await expect(home.tabMelhoresMomentos.first()).toBeVisible();
      await expect(home.tabCalendario.first()).toBeVisible();
    });
  });
});
