import { test, expect } from '@fixtures/index';
import { SELECTORS } from '@support/selectors';

/**
 * @core
 * Calendar mensal — popover do filtro de data na home.
 *
 * O popover (react-day-picker) só fica VISÍVEL após click no input de data
 * ("Hoje" / "Apr 30, 2026" etc). Selectors centralizados em
 * `support/selectors.ts` (ADR-002) — Chakra gera classes hash, react-day-picker
 * usa `rdp-*` estável.
 *
 * 1. Click "Go to next month" → heading muda
 * 2. Click em um dia clicável dispara mudança de state visual ou request à API
 */
test.describe('Calendar mensal — home widget', () => {
  test('@core click "Go to next month" altera o heading do mês visível', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    await page.locator(SELECTORS.calendar.dateInput).first().click({ force: true });

    const monthLabel = page.locator(SELECTORS.calendar.monthLabel).first();
    await monthLabel.waitFor({ state: 'visible', timeout: 10_000 });
    const before = (await monthLabel.textContent())?.trim() ?? '';
    expect(before.length, 'label do mês deve estar populado').toBeGreaterThan(0);

    await page
      .getByLabel(/go to next month/i)
      .first()
      .click();

    await expect
      .poll(async () => (await monthLabel.textContent())?.trim() ?? '', {
        timeout: 5_000,
        message: 'label do mês deve mudar após "next month"',
      })
      .not.toBe(before);
  });

  test('@core click em um dia clicável do calendar muda state visual', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    await page.locator(SELECTORS.calendar.dateInput).first().click({ force: true });

    const monthLabel = page.locator(SELECTORS.calendar.monthLabel).first();
    await monthLabel.waitFor({ state: 'visible', timeout: 10_000 });

    // Botão dia 15 — name PT acessível "15º maio (sexta-feira)"; bug S2:
    // 31 botões duplicados, primeiro é suficiente.
    const dayBtn = page.locator(SELECTORS.calendar.dayButton).filter({ hasText: /^15/ }).first();
    await dayBtn.waitFor({ state: 'visible', timeout: 5_000 });

    // Fail-fast: a UI DEVE reagir — request à API com date filter OU classe
    // selected no botão. Promise.any: se qualquer um resolver, ok; ambos
    // falhando lança AggregateError (Playwright captura como test failure).
    const apiSignal = page.waitForRequest(
      (req) =>
        /kasa-live\.api\.dev\.loomi\.com\.br\/api\/1\.0\/match\//i.test(req.url()) &&
        /date(_start)?=/i.test(req.url()),
      { timeout: 10_000 },
    );
    const visualSignal = page
      .locator(SELECTORS.calendar.daySelected)
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 });

    await dayBtn.click();
    await Promise.any([apiSignal, visualSignal]);
  });
});
