import { test, expect } from '@fixtures/index';

/**
 * @smoke @core
 * Preencher "Qual time?" → site faz typeahead no endpoint `/team/?name=...`.
 *
 * Descoberta empírica: o filtro NÃO dispara busca de partidas (`/match/`)
 * sozinho — ele dispara um lookup de times no endpoint `/team/`. A busca de
 * partidas só ocorre depois que o usuário SELECIONA um time da lista.
 * Validamos aqui o comportamento real do typeahead.
 */
test.describe('Busca por time — typeahead', () => {
  test('@smoke @core preencher filtro time dispara request /team/?name=', async ({
    homePage,
    page,
  }) => {
    await homePage.open();

    // garante que requests iniciais já passaram
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);

    // Há uma chamada inicial de /team/?name= (vazia) no carregamento; queremos
    // a chamada com termo de busca real (`name=Inter`).
    const teamLookupPromise = page.waitForRequest(
      (req) => /\/team\/\?[^ ]*name=Inter/i.test(req.url()),
      { timeout: 15_000 },
    );

    await homePage.filtroQualTime.fill('Inter');

    const req = await teamLookupPromise;
    expect(req.url(), 'request deve atingir endpoint /team/?name=Inter').toMatch(
      /\/team\/\?[^ ]*name=Inter/i,
    );
  });
});
