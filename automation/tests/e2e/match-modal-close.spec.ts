import { test, expect } from '@fixtures/index';
import { MatchModal } from '@pages/components/MatchModal';
import { SELECTORS } from '@support/selectors';

/**
 * @core
 * Click em card abre modal Chakra; clicar no Close (X) deve fechá-lo e
 * manter o usuário na home (`/`), sem navegar pra rota de partida.
 *
 * Selector raiz do modal:
 *   `[role="dialog"][aria-labelledby^="chakra-modal--header"]`
 * Botão close: Chakra usa `aria-label="Close"`.
 */
test.describe('Modal de partida — botão Close', () => {
  test('@core Botão Close (X) fecha modal de partida e volta pra home', async ({
    homePage,
    page,
  }) => {
    await homePage.open();

    // Espera o primeiro card de partida finalizada e abre o modal
    const firstCard = page.locator(SELECTORS.matchCard).first();
    await firstCard.waitFor({ state: 'visible', timeout: 30_000 });
    await firstCard.click();

    const modal = new MatchModal(page);
    await modal.waitForOpen(10_000);
    expect(await modal.isOpen(), 'modal deveria estar aberto após click no card').toBe(true);

    // Fecha via Close (X) — método encapsula o getByRole('button', { name: /close/i })
    await modal.close();

    // Modal precisa ter sumido
    await expect(modal.locator, 'modal deve estar oculto após click no Close (X)').toBeHidden({
      timeout: 5_000,
    });

    // E não devemos ter saído da home — pathname continua sendo "/"
    expect(
      new URL(page.url()).pathname,
      `pathname após fechar o modal deve ser "/", mas é "${new URL(page.url()).pathname}"`,
    ).toBe('/');
  });
});
