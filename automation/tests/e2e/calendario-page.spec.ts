import { test, expect } from '@fixtures/index';
import { CalendarPage } from '@pages/CalendarPage';
import { TIMEOUTS } from '@support/timeouts';

/**
 * @core
 * Página `/calendario` — só acessível logado (rota real, não SPA-state).
 *
 * Layout real (validado em 2026-05-02):
 * - Header da agenda: botão "Hoje" + setas "Semana anterior"/"Proxima semana"
 *   + label do mês ("maio de 2026").
 * - Sub-header: botão "<DD de mês>" (data ativa) + botão "Times e campeonatos"
 *   (abre painel com filtros — onde mora "Partidas favoritas").
 * - Grade semanal abaixo (botões "01 sex", "02 sáb", ...).
 *
 * Diferença vs §15.3 das exploration-notes: os collapses "Times" e
 * "Campeonatos" foram unificados num único trigger "Times e campeonatos"
 * (provavelmente um modal ou drawer). O switch "Partidas favoritas" continua
 * existindo no DOM mas só fica VISÍVEL após abrir esse painel.
 */
const hasCreds = !!(process.env.KASA_USER_EMAIL && process.env.KASA_USER_PASSWORD);

test.describe('/calendario — página dedicada (logado)', () => {
  // Login fixture pode estourar o default 30s sob contenção; subimos pra 90s.
  test.describe.configure({ timeout: TIMEOUTS.login });
  test.skip(!hasCreds, 'precisa de KASA_USER_EMAIL/PASSWORD em .env.local');

  test('@core /calendario carrega para usuário logado, mostra side panel + grade semanal', async ({
    loggedInPage,
  }) => {
    const calendar = new CalendarPage(loggedInPage);
    await calendar.open();

    await loggedInPage.waitForURL(/\/calendario/i, { timeout: TIMEOUTS.network });
    expect(loggedInPage.url(), 'URL deve conter /calendario').toMatch(/\/calendario/);

    // Header da agenda: botão "Hoje" sempre presente
    await expect(
      calendar.hojeButton.first(),
      'botão "Hoje" do painel principal deve estar visível',
    ).toBeVisible({ timeout: TIMEOUTS.network });

    // Header da agenda: label do mês ("maio de 2026")
    await expect(
      calendar.monthLabel,
      'label do mês ("<Mês> de <ano>") deve estar visível no header da grade',
    ).toBeVisible({ timeout: TIMEOUTS.normal });

    // Trigger do painel de filtros (Times+Campeonatos unificados)
    await expect(
      loggedInPage.getByRole('button', { name: /times e campeonatos/i }).first(),
      'botão "Times e campeonatos" (acesso aos filtros) deve estar visível',
    ).toBeVisible({ timeout: TIMEOUTS.normal });

    // Grade semanal renderizou pelo menos um dia (formato "01 sex" / "02 sáb"...)
    const weekDayBtn = loggedInPage
      .getByRole('button', { name: /^\d{2}\s(seg|ter|qua|qui|sex|s[áa]b|dom)$/i })
      .first();
    await expect(
      weekDayBtn,
      'pelo menos um botão de dia da semana ("DD <abrev>") deve estar visível na grade',
    ).toBeVisible({ timeout: TIMEOUTS.normal });
  });

  test('@core /calendario tem switch "Partidas favoritas"', async ({ loggedInPage }) => {
    const calendar = new CalendarPage(loggedInPage);
    await calendar.open();

    await loggedInPage.waitForURL(/\/calendario/i, { timeout: TIMEOUTS.network });

    // O texto "Partidas favoritas" EXISTE no DOM da página (collapse fechado),
    // mas pode estar com display:none até abrir "Times e campeonatos".
    // Verificamos a EXISTÊNCIA via toHaveCount — sem interagir com persistência.
    const switchLabel = loggedInPage.getByText(/partidas favoritas/i).first();
    await expect(
      switchLabel,
      'label "Partidas favoritas" deve existir no DOM da página /calendario',
    ).toHaveCount(1, { timeout: TIMEOUTS.normal });
  });
});
