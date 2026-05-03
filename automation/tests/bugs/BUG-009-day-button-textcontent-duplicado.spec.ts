/**
 * BUG-009 — Botões do calendário têm `textContent` duplicado.
 *
 * Padrão react-day-picker monta dois spans no botão (`aria-hidden` com o
 * número visível + `.rdp-vhidden` com o label completo). Resultado:
 * `el.textContent` concatena os dois → "11º maio (sexta-feira)" pra dia 1.
 *
 * Comportamento esperado: nenhum botão deve ter textContent começando
 * com pattern de dígito repetido (ex.: "11", "1111", "33", "55").
 *
 * Ver: bug-reports/bugs/BUG-009-calendar-numero-duplicado.md
 */

import { test, expect } from '@bugs/_fixtures';

test('@bug @bug-009 datepicker da home não expõe textContent duplicado', async ({
  page,
  bugFindings,
}) => {
  await page.goto('https://www.kasa.live/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);

  const trigger = page.locator('div[aria-haspopup="dialog"]').nth(1);
  if (await trigger.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await trigger.click({ force: true });
    await page
      .locator('.rdp-day, [role="gridcell"]')
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
  }

  const findings = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.rdp-day, [role="gridcell"] button')];
    const duplicates: Array<{ index: number; text: string }> = [];
    buttons.forEach((b, i) => {
      const text = (b.textContent || '').trim();
      // pattern: prefixo numérico que se repete (ex.: "11º maio", "1111", "22")
      if (/^(\d+)\1\D|^(\d+)\2$/.test(text)) {
        duplicates.push({ index: i, text: text.slice(0, 60) });
      }
    });
    return { buttonCount: buttons.length, duplicates };
  });

  bugFindings.set({
    bugId: 'BUG-009',
    testTitle: 'textContent sem duplicação',
    url: 'https://www.kasa.live/',
    expected: 'duplicates.length === 0',
    actual: findings,
  });

  expect(
    findings.duplicates,
    `${findings.duplicates.length} botões com textContent duplicado:\n${JSON.stringify(findings.duplicates, null, 2)}`,
  ).toEqual([]);
});
