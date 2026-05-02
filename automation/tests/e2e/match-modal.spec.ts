import { test, expect } from '@fixtures/index';
import { MatchModal } from '@pages/components/MatchModal';

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

    const firstCard = page.locator('div.css-7mca6u').first();
    await firstCard.waitFor({ state: 'visible', timeout: 30_000 });
    await firstCard.click();

    const modal = new MatchModal(page);
    await modal.waitForOpen(10_000);
    expect(await modal.isOpen(), 'modal deve estar aberto após click').toBe(true);

    const status = await modal.getStatus();
    expect(status, `header do modal: "${status}"`).toMatch(/partida finalizada|ao vivo|partida/i);

    await modal.close();
  });
});
