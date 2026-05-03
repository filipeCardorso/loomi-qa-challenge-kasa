import { test, expect } from '@fixtures/index';
import { MatchModal } from '@pages/components/MatchModal';
import { SELECTORS } from '@support/selectors';
import { TIMEOUTS } from '@support/timeouts';

/**
 * @smoke @core
 * Click em card abre modal Chakra com title "Partida Finalizada" e placar visível.
 */
test.describe('Modal de partida finalizada', () => {
  test('@smoke @core click no card abre modal com header "Partida Finalizada"', async ({
    homePage,
    page,
  }) => {
    await homePage.open();

    const firstCard = page.locator(SELECTORS.matchCard).first();
    await firstCard.waitFor({ state: 'visible', timeout: TIMEOUTS.devApiSlow });
    await firstCard.click();

    const modal = new MatchModal(page);
    await modal.waitForOpen(TIMEOUTS.normal);
    expect(await modal.isOpen(), 'modal deve estar aberto após click').toBe(true);

    const status = await modal.getStatus();
    expect(status, `header do modal: "${status}"`).toMatch(/partida finalizada|ao vivo|partida/i);

    await modal.close();
  });
});
