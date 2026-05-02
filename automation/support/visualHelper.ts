import type { Page, Locator } from '@playwright/test';

/**
 * Retorna a lista de Locators que devem ser mascarados em screenshots
 * de regressão visual para evitar diff flakey:
 * - timestamps relativos / data atual em destaque
 * - players de vídeo (frame muda entre runs)
 * - iframes do GTM/analytics (carregam com timing variável)
 * - dia atual destacado no calendar (cor verde rotativa)
 *
 * Usar via:
 *   await expect(page).toHaveScreenshot('home.png', { mask: await maskDynamic(page) });
 */
export async function maskDynamic(page: Page): Promise<Locator[]> {
  return [
    page.locator('time, [data-dynamic="timestamp"]'),
    page.locator('video, .video-player'),
    page.locator('iframe[src*="googletagmanager"]'),
    // calendar dia atual destacado em verde — pode mudar entre runs
    page.locator('button[aria-current="date"], button[aria-selected="true"]'),
    // Imagens de escudos podem fazer diff por pixel — só mascarar se flakey nos primeiros runs
  ];
}
