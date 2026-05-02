import { test, expect } from '@fixtures/index';

/**
 * @smoke @core
 * `/melhores-momentos` carrega com filtros + h2 esperado.
 */
test.describe('Página /melhores-momentos', () => {
  test('@smoke @core carrega filtros + heading "Melhores momentos das Partidas Finalizadas"', async ({
    highlightsPage,
  }) => {
    await highlightsPage.open();

    await expect(
      highlightsPage.headingPrincipal,
      'h2 "Melhores momentos das Partidas Finalizadas" deve estar visível',
    ).toBeVisible({ timeout: 10_000 });

    await expect(highlightsPage.filtroQualTime, 'filtro time deve estar visível').toBeVisible();
    await expect(
      highlightsPage.filtroQualCampeonato,
      'filtro campeonato deve estar visível',
    ).toBeVisible();
  });
});
