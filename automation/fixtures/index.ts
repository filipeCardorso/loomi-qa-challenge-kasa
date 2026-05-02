import { test as base, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

import { HomePage } from '@pages/HomePage';
import { HighlightsPage } from '@pages/HighlightsPage';
import { CalendarPage } from '@pages/CalendarPage';
import { LoginModal } from '@pages/components/LoginModal';
import { ProfilePopover } from '@pages/components/ProfilePopover';
import { NotificationsPanel } from '@pages/components/NotificationsPanel';
import { TestDataFactory, testDataFactory } from '@support/testDataFactory';

/** Path do storageState persistido entre runs. Gitignored. */
const AUTH_STATE_PATH = path.resolve(process.cwd(), '.auth-state.json');

type Fixtures = {
  homePage: HomePage;
  highlightsPage: HighlightsPage;
  calendarPage: CalendarPage;
  loginModal: LoginModal;
  profilePopover: ProfilePopover;
  notificationsPanel: NotificationsPanel;
  testDataFactory: TestDataFactory;
  axeBuilder: AxeBuilder;
  /** Page já autenticada (storageState válido OU login fresco se necessário). */
  loggedInPage: Page;
};

/**
 * Verifica se a page está logada.
 *
 * Heurística robusta: espera até que UMA das duas condições estabilize:
 *   - botão "Entrar" no header → anônimo (return false)
 *   - tab "Calendário" presente OU outro indicador logado → logged in (return true)
 *
 * Isso evita falso-positivo quando a page ainda não renderizou o header.
 */
async function isLoggedIn(page: Page): Promise<boolean> {
  // Espera o header carregar (logo "home" sempre presente)
  await page
    .locator('a[href="/"]')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => undefined);

  const entrarHeader = page.getByRole('button', { name: /^entrar$/i }).first();
  const calendarTab = page.locator('a[title="Calendário"], a[title="Calendario"]').first();

  // dá tempo do React montar UM dos dois
  await Promise.race([
    entrarHeader.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined),
    calendarTab.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined),
  ]);

  const entrarVisible = await entrarHeader.isVisible().catch(() => false);
  return !entrarVisible;
}

/**
 * Faz login programático via UI (modal email/senha).
 * Persiste storageState em AUTH_STATE_PATH no fim.
 */
async function performLogin(page: Page, email: string, password: string): Promise<void> {
  // garante que estamos na home
  if (!page.url().includes('kasa.live')) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  const headerEntrar = page.getByRole('button', { name: /^entrar$/i }).first();
  await headerEntrar.click();

  const emailInput = page.getByPlaceholder(/digite seu e-?mail/i);
  await emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  await emailInput.fill(email);
  await page.getByPlaceholder(/digite sua senha/i).fill(password);

  // Submit pelo botão Entrar do MODAL (.last() — header tem o outro)
  await page
    .getByRole('button', { name: /^entrar$/i })
    .last()
    .click();

  // Aguarda modal sumir + network idle (Firebase auth pode demorar)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page
    .getByPlaceholder(/digite seu e-?mail/i)
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => undefined);

  // Persiste storage state pra próximas runs
  await page.context().storageState({ path: AUTH_STATE_PATH });
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  highlightsPage: async ({ page }, use) => {
    await use(new HighlightsPage(page));
  },
  calendarPage: async ({ page }, use) => {
    await use(new CalendarPage(page));
  },
  loginModal: async ({ page }, use) => {
    await use(new LoginModal(page));
  },
  profilePopover: async ({ page }, use) => {
    await use(new ProfilePopover(page));
  },
  notificationsPanel: async ({ page }, use) => {
    await use(new NotificationsPanel(page));
  },
  testDataFactory: async ({}, use) => {
    await use(testDataFactory);
  },
  axeBuilder: async ({ page }, use) => {
    await use(new AxeBuilder({ page }));
  },

  /**
   * loggedInPage — garante que a page retornada está autenticada.
   *
   * Estratégia (exploration-notes §13.8 e §14):
   * 1. Cria contexto novo. Se `.auth-state.json` existir, injeta como storageState.
   * 2. Vai pra home, checa se está logado.
   * 3. Se NÃO logado → faz login fresco via UI usando .env.local (KASA_USER_EMAIL/PASSWORD)
   *    e re-salva o storageState.
   * 4. Skip elegante se vars de ambiente faltarem.
   */
  loggedInPage: async ({ browser }, use) => {
    const email = process.env.KASA_USER_EMAIL;
    const password = process.env.KASA_USER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        'KASA_USER_EMAIL/PASSWORD não definidos em .env.local — fixture loggedInPage requer credenciais.',
      );
    }

    const hasStoredState = fs.existsSync(AUTH_STATE_PATH);
    const context = await browser.newContext(
      hasStoredState ? { storageState: AUTH_STATE_PATH } : {},
    );
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    if (!(await isLoggedIn(page))) {
      await performLogin(page, email, password);
    }

    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
