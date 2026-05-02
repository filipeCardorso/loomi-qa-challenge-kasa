import { test, expect } from '@fixtures/index';
import { ProfilePopover } from '@pages/components/ProfilePopover';

/**
 * @core
 * Avatar popover — só visível para usuário LOGADO.
 *
 * Items esperados (exploration-notes §15.4):
 * - E-mail (read-only)
 * - Botão "Editar perfil"
 * - Botão "Excluir conta"
 * - Switch `#switch-google-calendar` "Conectar com seu Google Calendar"
 * - Botão "Sair"
 *
 * NOTA: NÃO clicamos em "Sair" nem em "Excluir conta" — efeitos colaterais
 * destrutivos. Apenas validamos presença na UI.
 */
const hasCreds = !!(process.env.KASA_USER_EMAIL && process.env.KASA_USER_PASSWORD);

test.describe('Profile popover (avatar logado)', () => {
  // Login fixture pode estourar o default 30s sob contenção; subimos pra 90s.
  test.describe.configure({ timeout: 90_000 });
  test.skip(!hasCreds, 'precisa de KASA_USER_EMAIL/PASSWORD em .env.local');

  test('@core Avatar click abre popover com 4 ações (Editar, Excluir, Sair, Switch Google Calendar)', async ({
    loggedInPage,
  }) => {
    const popover = new ProfilePopover(loggedInPage);
    await popover.open();

    expect(await popover.isOpen(), 'popover deve estar aberto após click no avatar').toBe(true);

    // Os 3 botões de ação visíveis no popover
    await expect(
      popover.root.getByRole('button', { name: /editar perfil/i }),
      'botão "Editar perfil" deve estar visível',
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      popover.root.getByRole('button', { name: /excluir conta/i }),
      'botão "Excluir conta" (destrutivo) deve estar visível',
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      popover.root.getByRole('button', { name: /^sair$/i }),
      'botão "Sair" deve estar visível',
    ).toBeVisible({ timeout: 5_000 });

    // Switch Google Calendar (input hidden + label clicável)
    await expect(
      loggedInPage.locator('input#switch-google-calendar'),
      'switch Google Calendar deve existir no popover (input#switch-google-calendar)',
    ).toHaveCount(1);
  });

  test('@core Switch Google Calendar existe no popover do perfil', async ({ loggedInPage }) => {
    const popover = new ProfilePopover(loggedInPage);
    await popover.open();

    expect(await popover.isOpen(), 'popover precisa estar aberto antes de checar o switch').toBe(
      true,
    );

    const switchInput = loggedInPage.locator('input#switch-google-calendar');
    await expect(
      switchInput,
      'input#switch-google-calendar deve estar presente no DOM',
    ).toHaveCount(1);

    // O texto label "Conectar com seu Google Calendar" precisa estar visível
    // dentro do popover. O DOM real renderiza um <div>/<p> com o texto + um
    // <input type="checkbox"> Chakra (não <label for=...>).
    const switchLabel = popover.root.getByText(/conectar com seu google calendar/i).first();
    await expect(
      switchLabel,
      'texto "Conectar com seu Google Calendar" deve estar visível no popover',
    ).toBeVisible({ timeout: 5_000 });
  });
});
