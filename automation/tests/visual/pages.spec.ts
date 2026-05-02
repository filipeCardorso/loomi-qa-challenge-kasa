import { test, expect } from '@fixtures/index';
import { maskDynamic } from '@support/visualHelper';

/**
 * Visual regression — 5 baselines cobrindo páginas-chave anônimas + logada + modal.
 * Threshold global em playwright.config.ts (`maxDiffPixelRatio: 0.02`).
 *
 * Geração inicial dos baselines:
 *   npx playwright test automation/tests/visual --project=chromium --update-snapshots
 *
 * Re-runs subsequentes apenas comparam.
 */

test.describe('Visual regression', () => {
  // Fullpage screenshots em DEV API podem demorar — timeout generoso por teste.
  test.setTimeout(90_000);

  test('@visual home anônima', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Espera UI principal — primeiro card finalizado ou heading qualquer (proxy de readiness)
    await page
      .locator('div.css-7mca6u, h1, h2')
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => undefined);
    // Pequena espera para fontes/imagens estabilizarem
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      mask: await maskDynamic(page),
    });
  });

  test('@visual melhores-momentos anônima', async ({ page }) => {
    await page.goto('/melhores-momentos', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('heading', { name: /melhores momentos/i })
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(page).toHaveScreenshot('melhores-momentos.png', {
      fullPage: true,
      mask: await maskDynamic(page),
    });
  });

  test('@visual termos-de-uso (estável)', async ({ page }) => {
    await page.goto('/termos-de-uso', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(page).toHaveScreenshot('termos-de-uso.png', {
      fullPage: true,
      mask: await maskDynamic(page),
    });
  });

  test('@visual modal de partida finalizada', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const firstCard = page.locator('div.css-7mca6u').first();
    await firstCard.waitFor({ state: 'visible', timeout: 30_000 });
    await firstCard.click();

    const modal = page.locator('[role="dialog"][aria-labelledby^="chakra-modal--header"]').first();
    await modal.waitFor({ state: 'visible', timeout: 10_000 });
    // toHaveScreenshot já tem retry interno até o frame estabilizar — não precisa sleep extra

    await expect(modal).toHaveScreenshot('match-modal.png', {
      mask: await maskDynamic(page),
    });
  });

  test('@visual home logada (4 tabs)', async ({ loggedInPage }) => {
    await loggedInPage.goto('/', { waitUntil: 'domcontentloaded' });
    await loggedInPage
      .locator('a[title="Calendário"], a[title="Calendario"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
    await loggedInPage.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await expect(loggedInPage).toHaveScreenshot('home-logged.png', {
      fullPage: true,
      mask: await maskDynamic(loggedInPage),
    });
  });
});
