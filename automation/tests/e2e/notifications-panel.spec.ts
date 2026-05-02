import { test, expect } from '@fixtures/index';
import { NotificationsPanel } from '@pages/components/NotificationsPanel';

/**
 * @core
 * Sino do header — empty state padrão.
 *
 * Estado inicial conta nova (exploration-notes §15.5):
 *   "Você não tem notificações no momento."
 *
 * Validamos com usuário LOGADO porque o popover do anônimo mostra um CTA
 * diferente ("Favorite suas partidas...").
 */
const hasCreds = !!(process.env.KASA_USER_EMAIL && process.env.KASA_USER_PASSWORD);

test.describe('Notifications panel — sino', () => {
  // Login fixture pode estourar o default 30s sob contenção; subimos pra 90s.
  test.describe.configure({ timeout: 90_000 });
  test.skip(!hasCreds, 'precisa de KASA_USER_EMAIL/PASSWORD em .env.local');

  test('@core Sino abre painel de notificações com mensagem padrão', async ({ loggedInPage }) => {
    const panel = new NotificationsPanel(loggedInPage);
    await panel.open();

    expect(await panel.isOpen(), 'painel de notificações deve abrir após click no sino').toBe(true);

    // Empty state esperado: "Você não tem notificações no momento."
    await expect(
      panel.root.getByText(/você não tem notificações no momento/i),
      'mensagem padrão de empty state deve estar visível no painel',
    ).toBeVisible({ timeout: 10_000 });

    // Sanity: lista de itens deve estar vazia (sem <li>/listitem)
    const messages = await panel.getMessages();
    expect(
      messages,
      `painel deveria estar vazio, mas encontrou itens: ${JSON.stringify(messages)}`,
    ).toEqual([]);
  });
});
