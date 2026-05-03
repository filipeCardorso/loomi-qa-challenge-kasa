import { test, expect } from '@playwright/test';

/**
 * @security XSS reflected — filtros da home
 *
 * Estratégia: digitar um payload XSS clássico no input "Qual time?" e
 * verificar que (a) nenhum dialog `alert()` é disparado e (b) o payload
 * não aparece no DOM como HTML cru (apenas como text node escapado).
 *
 * Esperamos que React/Next escapem por padrão — este teste é uma trava de
 * regressão caso alguém introduza `dangerouslySetInnerHTML` num futuro filtro.
 */
test.describe('XSS reflected — filtros da home', () => {
  test('@security XSS payload no filtro "Qual time?" não executa', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss().catch(() => undefined);
    });

    await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    const xss = '<img src=x onerror=alert(1)>';
    const input = page.getByPlaceholder(/qual time/i);
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill(xss);
    await page.keyboard.press('Enter');

    // janela de espera proposital — XSS via onerror dispara em ms,
    // mas damos folga pra qualquer hidratação tardia
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2000);

    expect(alertFired, `XSS payload "${xss}" disparou alert() — vulnerável!`).toBe(false);

    // Bonus: confirma que o payload está como text-node, não como HTML cru no body
    const rawHtmlOccurrences = await page
      .locator('body')
      .evaluate((el) => Array.from(el.querySelectorAll('img[src="x"]')).length);
    expect(
      rawHtmlOccurrences,
      `payload XSS foi parseado como elemento DOM (encontrado img[src=x] injetado)`,
    ).toBe(0);
  });

  test('@security XSS payload em "Qual campeonato?" não executa', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async (dialog) => {
      alertFired = true;
      await dialog.dismiss().catch(() => undefined);
    });

    await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    const payload = '"><svg/onload=alert(2)>';
    const input = page.getByPlaceholder(/qual campeonato/i);
    await input.waitFor({ state: 'visible', timeout: 10_000 });
    await input.fill(payload);
    await page.keyboard.press('Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1500);
    expect(alertFired, `payload "${payload}" no campeonato disparou alert()`).toBe(false);
  });
});
