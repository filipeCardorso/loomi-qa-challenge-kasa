import { test, expect } from '@fixtures/index';

/**
 * @smoke @core
 * Lista "Partidas finalizadas" renderiza ≥1 card.
 */
test.describe('Lista de partidas finalizadas', () => {
  test('@smoke @core renderiza pelo menos 1 card de partida', async ({ homePage, page }) => {
    await homePage.open();

    // espera primeiro card aparecer (network call /match/?status=ENDED)
    const cardLocator = page.locator('div.css-7mca6u').first();
    await cardLocator.waitFor({ state: 'visible', timeout: 15_000 });

    const cards = await homePage.getMatchCards();
    expect(cards.length, 'esperado ao menos 1 card de partida finalizada').toBeGreaterThanOrEqual(
      1,
    );
  });
});
