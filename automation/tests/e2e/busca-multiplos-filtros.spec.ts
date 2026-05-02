import { test, expect } from '@fixtures/index';

/**
 * @core
 * Combinar 2 filtros (time + campeonato) sem erro de runtime.
 * Não validamos resultado específico (depende dos dados reais do site DEV).
 */
test.describe('Busca com múltiplos filtros', () => {
  test('@core combinar filtros time + campeonato sem erro', async ({ homePage, page }) => {
    await homePage.open();

    await homePage.filtroQualTime.fill('Inter');
    await homePage.filtroQualCampeonato.fill('MLS');
    await homePage.filtroQualCampeonato.press('Enter');

    // não deve haver erro 500 visível na UI
    const errorBanner = page.locator('text=/algo deu errado|error|oops/i').first();
    expect(
      await errorBanner.isVisible().catch(() => false),
      'não deve aparecer banner de erro após combinar filtros',
    ).toBe(false);

    // página continua responsiva (input ainda interage)
    await expect(homePage.filtroQualTime, 'filtro time continua editável').toBeVisible();
  });
});
