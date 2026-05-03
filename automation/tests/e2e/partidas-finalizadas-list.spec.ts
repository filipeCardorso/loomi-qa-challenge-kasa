import { test, expect } from '@fixtures/index';
import { SELECTORS } from '@support/selectors';
import { TIMEOUTS } from '@support/timeouts';

/**
 * @smoke @core
 * Lista "Partidas finalizadas" renderiza ≥1 card.
 */
test.describe('Lista de partidas finalizadas', () => {
  test('@smoke @core renderiza pelo menos 1 card de partida', async ({ homePage, page }) => {
    await homePage.open();

    // espera primeiro card aparecer (network call /match/?status=ENDED).
    // API DEV pode ser lenta — damos 30s.
    const cardLocator = page.locator(SELECTORS.matchCard).first();
    await cardLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.devApiSlow });

    const cards = await homePage.getMatchCards();
    expect(cards.length, 'esperado ao menos 1 card de partida finalizada').toBeGreaterThanOrEqual(
      1,
    );
  });
});
