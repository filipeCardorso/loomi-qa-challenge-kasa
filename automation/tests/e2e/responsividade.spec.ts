import { test, expect } from '@fixtures/index';

/**
 * @core
 * Responsividade básica:
 * 1. Viewport mobile 375x667 — sem overflow horizontal, lista visível
 * 2. Viewport tablet 768x1024 — nav tabs ainda visíveis e clicáveis
 *
 * Não usamos o project `mobile-chrome` aqui (rodaria em outra suite).
 * Setamos viewport in-test pra cobrir o smoke responsivo no chromium default.
 */
test.describe('Responsividade — mobile e tablet viewports', () => {
  test('@core mobile 375x667: home renderiza, sem overflow horizontal, lista visível', async ({
    homePage,
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.open();

    // Aguarda lista carregar (network call /match/?status=ENDED pode demorar em DEV)
    const firstCard = page.locator('div.css-7mca6u').first();
    await firstCard.waitFor({ state: 'visible', timeout: 30_000 });

    // sem overflow horizontal: documentElement.scrollWidth ≈ window.innerWidth
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });
    expect(
      overflow.scrollWidth,
      `overflow horizontal detectado: scrollWidth=${overflow.scrollWidth} > innerWidth=${overflow.innerWidth}`,
    ).toBeLessThanOrEqual(overflow.innerWidth + 1);

    await expect(firstCard, 'primeiro card visível em mobile').toBeVisible();
  });

  test('@core tablet 768x1024: nav tabs visíveis e clicáveis', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await homePage.open();

    await expect(homePage.tabPartidas.first(), 'tab Partidas visível em tablet').toBeVisible();
    await expect(
      homePage.tabMelhoresMomentos.first(),
      'tab Melhores momentos visível em tablet',
    ).toBeVisible();

    // tabs devem ser clicáveis — naveguemos pra Melhores momentos
    await homePage.tabMelhoresMomentos.first().click();
    await page.waitForURL(/\/melhores-momentos/i, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/melhores-momentos/);
  });
});
