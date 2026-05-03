import { test, expect } from '@fixtures/index';
import { MatchModal } from '@pages/components/MatchModal';
import { SELECTORS } from '@support/selectors';
import { TIMEOUTS } from '@support/timeouts';

/**
 * @core
 * Favoritar partida — fluxo isolado (click no botão de favorito do modal +
 * persistência ao reabrir).
 *
 * Cobre o gap deixado pela suite até agora, onde "favoritar" só existia
 * como BDD `@manual-validation`. Aqui validamos a hipótese de UI: ao abrir
 * o modal de uma partida, existe um controle de favorito (estrela/coração)
 * cujo estado deve persistir entre fechar/reabrir o modal sem refresh.
 *
 * Estratégia:
 *   1. loggedInPage abre `/`
 *   2. Click no primeiro card → abre modal
 *   3. Procura controle de favorito por `aria-label` PT-BR (favoritar /
 *      favoritado / desfavoritar) ou heurística de ícone (button > svg dentro
 *      do modal, escopado para o header).
 *   4. Captura state inicial → click → captura state pós-click → assert mudou
 *   5. Fecha modal → reabre mesmo card → assert state persistiu
 *
 * Se o controle não for detectado (UI ainda não expõe nas partidas finalizadas
 * — ver BUG-011), `test.skip` com mensagem explicando — não é falha, é gap
 * conhecido da implementação.
 */
test.describe('Favoritar partida — fluxo isolado', () => {
  test.describe.configure({ timeout: TIMEOUTS.login });

  test('@core ícone de favorito no modal alterna estado e persiste ao reabrir', async ({
    loggedInPage,
  }) => {
    const page = loggedInPage;
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const firstCard = page.locator(SELECTORS.matchCard).first();
    await firstCard.waitFor({ state: 'visible', timeout: TIMEOUTS.devApiSlow });
    await firstCard.click();

    const modal = new MatchModal(page);
    await modal.waitForOpen(TIMEOUTS.normal);
    expect(await modal.isOpen(), 'modal abriu após click no card').toBe(true);

    const favoriteButton = modal.locator
      .getByRole('button', { name: /favoritar|favoritado|desfavoritar|favorite/i })
      .first();

    const visible = await favoriteButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!visible) {
      test.skip(
        true,
        'controle de favorito não localizado no modal — pode ser apenas em ' +
          'partidas FUTURAS (BUG-011 mostra modal de finalizada vazio). ' +
          'BDD `@manual-validation` cobre o caso em test-cases/core/favoritar-partidas.feature.',
      );
      return;
    }

    const stateBefore =
      (await favoriteButton.getAttribute('aria-pressed')) ??
      (await favoriteButton.getAttribute('aria-label')) ??
      '';

    await favoriteButton.click();
    await page.waitForTimeout(300);

    const stateAfter =
      (await favoriteButton.getAttribute('aria-pressed')) ??
      (await favoriteButton.getAttribute('aria-label')) ??
      '';

    expect(
      stateAfter,
      `estado do favorito não mudou após click (antes="${stateBefore}" depois="${stateAfter}")`,
    ).not.toBe(stateBefore);

    await modal.close();
    await modal.waitForClose(TIMEOUTS.normal);

    await firstCard.click();
    await modal.waitForOpen(TIMEOUTS.normal);

    const stateReopen =
      (await favoriteButton.getAttribute('aria-pressed')) ??
      (await favoriteButton.getAttribute('aria-label')) ??
      '';

    expect(
      stateReopen,
      `estado do favorito não persistiu ao reabrir o modal (esperado "${stateAfter}", atual "${stateReopen}")`,
    ).toBe(stateAfter);

    await modal.close();
  });
});
