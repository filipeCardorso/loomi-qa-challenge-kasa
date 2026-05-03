import { test, expect } from '@playwright/test';

/**
 * @security Auth bypass — rotas que requerem login
 *
 * `/calendario` e `/favoritos` mostram dados pessoais quando logado.
 * Acessar essas rotas sem auth deveria:
 *   - Redirecionar pra `/` (ou abrir modal de login), OU
 *   - Mostrar empty state explicando que precisa logar.
 *
 * Bug candidato: rota mostra dados em cache de outro usuário, ou expõe
 * estrutura/IDs reais sem auth (already documentado em BUG-004 como fallback
 * silencioso, mas aqui validamos do ângulo de segurança/leak).
 */

const PROTECTED_ROUTES = ['/calendario', '/favoritos', '/perfil'];

for (const path of PROTECTED_ROUTES) {
  test(`@security ${path} sem auth não vaza dados pessoais`, async ({ page }) => {
    await page.goto(`https://www.kasa.live${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    const url = page.url();
    const bodyText = (await page.textContent('body').catch(() => '')) ?? '';

    // Critério 1: rotas inexistentes (BUG-003) retornam o título "Kasa"
    // padrão. Aqui queremos que (a) URL mude pra /, OU (b) algum CTA de login
    // apareça, OU (c) empty state explicite "faça login".
    const redirected = !url.endsWith(path);
    const hasLoginCta = await page
      .getByRole('button', { name: /^entrar$/i })
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState =
      /faça login|fazer login|entrar para ver|sem favoritos|nenhum favorito/i.test(bodyText);

    const safe = redirected || hasLoginCta || hasEmptyState;
    expect(
      safe,
      `${path} anônimo: URL=${url}, login CTA=${hasLoginCta}, empty state=${hasEmptyState}. ` +
        `Esperado redirect, modal de login ou empty state explícito.`,
    ).toBe(true);

    // Critério 2: corpo NÃO deve conter emails, IDs de usuário ou tokens
    const leakRegexes = [
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // emails
      /Bearer\s+[A-Za-z0-9._-]{20,}/, // bearer tokens
      /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT
    ];
    const leaks = leakRegexes.filter((re) => re.test(bodyText));
    expect(
      leaks,
      `${path} anônimo vazou padrões sensíveis no DOM (regex match): ${leaks.length}`,
    ).toEqual([]);
  });
}
