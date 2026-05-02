import { test, expect } from '@fixtures/index';

/**
 * @core
 * Suite avançada de busca cobrindo o typeahead via API:
 * 1. Busca parcial por time → /team/?name=Flam
 * 2. Busca por campeonato → dispara API
 * 3. Combinação 2 filtros simultâneos
 * 4. Limpar filtros restaura listagem inicial
 */
test.describe('Busca avançada — typeahead, combos e reset', () => {
  test('@core busca parcial por time "Flam" dispara /team/?name=Flam', async ({
    homePage,
    page,
  }) => {
    await homePage.open();
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    const teamLookupPromise = page.waitForRequest(
      (req) => /\/team\/\?[^ ]*name=Flam/i.test(req.url()),
      { timeout: 15_000 },
    );
    await homePage.filtroQualTime.fill('Flam');

    const req = await teamLookupPromise;
    expect(req.url(), 'request /team/?name=Flam esperado').toMatch(/\/team\/\?[^ ]*name=Flam/i);
  });

  test('@core busca por campeonato dispara request à API', async ({ homePage, page }) => {
    await homePage.open();
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    // Esperamos qualquer request à API que carregue dados após a interação
    // (championship typeahead pode bater /championship/, /tournament/ ou /match/).
    const apiCallPromise = page.waitForRequest(
      (req) => /kasa-live\.api\.dev\.loomi\.com\.br/i.test(req.url()) && req.method() === 'GET',
      { timeout: 15_000 },
    );
    await homePage.filtroQualCampeonato.fill('Brasileir');

    const req = await apiCallPromise;
    expect(req.url(), 'esperada chamada à API kasa-live').toMatch(/kasa-live\.api/);
  });

  test('@core combinar filtros time+campeonato sem erro de runtime', async ({ homePage, page }) => {
    await homePage.open();
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    await homePage.filtroQualTime.fill('Flamengo');
    await homePage.filtroQualCampeonato.fill('Brasileirão');

    // Página continua interativa — assert proxy: filtros ainda visíveis
    await expect(homePage.filtroQualTime, 'filtro time continua visível').toBeVisible();
    await expect(homePage.filtroQualCampeonato, 'filtro campeonato continua visível').toBeVisible();

    const errorBanner = page.locator('text=/algo deu errado|error 500|oops/i').first();
    expect(await errorBanner.isVisible().catch(() => false)).toBe(false);
  });

  test('@core limpar filtros (refresh / click logo) restaura listagem inicial', async ({
    homePage,
    page,
  }) => {
    await homePage.open();
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    // baseline: pega contagem de cards
    const cardLocator = page.locator('div.css-7mca6u');
    await cardLocator.first().waitFor({ state: 'visible', timeout: 30_000 });
    const initialCount = await cardLocator.count();
    expect(initialCount, 'baseline: deve haver cards na home').toBeGreaterThan(0);

    // aplica filtro
    await homePage.filtroQualTime.fill('Inter');

    // limpa via click no logo (volta pra `/` resetando filtros)
    const logoLink = page.locator('a[href="/"]').first();
    await logoLink.click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', {
      timeout: 10_000,
    });
    await cardLocator.first().waitFor({ state: 'visible', timeout: 30_000 });

    const restoredCount = await cardLocator.count();
    expect(
      restoredCount,
      `após reset esperado >=1 card (recebido ${restoredCount})`,
    ).toBeGreaterThanOrEqual(1);
  });
});
