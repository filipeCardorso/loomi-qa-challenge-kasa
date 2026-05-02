import { test, expect } from '@fixtures/index';

/**
 * @smoke @core
 * Home carrega: title contém "Kasa" + sem console errors críticos.
 */
test.describe('Home page — carregamento básico', () => {
  test('@smoke @core home carrega com title correto e sem erros críticos no console', async ({
    homePage,
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // ignora ruído conhecido (analytics 3rd party, fontes, etc)
        if (!/google-analytics|gtag|fonts\.googleapis|favicon/i.test(text)) {
          consoleErrors.push(text);
        }
      }
    });

    await homePage.open();

    const title = await page.title();
    expect(title, 'title da home deve conter "Kasa"').toMatch(/kasa/i);

    expect(
      consoleErrors,
      `console errors críticos detectados: ${consoleErrors.join('\n')}`,
    ).toEqual([]);
  });
});
