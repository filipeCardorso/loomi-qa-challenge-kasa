// Modal de partida FUTURA (deve ter favoritar + adicionar ao calendar).
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

const EMAIL = process.env.KASA_USER_EMAIL;
const PASSWORD = process.env.KASA_USER_PASSWORD;
const OUT = path.resolve('docs/site-snapshots/exploration');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
const page = await ctx.newPage();

// Login
console.log('Login...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2000);
await page
  .getByRole('button', { name: /^Entrar$/i })
  .first()
  .click();
await page.waitForTimeout(1500);
await page.getByPlaceholder(/digite seu e-mail/i).fill(EMAIL);
await page.getByPlaceholder(/digite sua senha/i).fill(PASSWORD);
await page
  .getByRole('button', { name: /^Entrar$/i })
  .last()
  .click();
await page.waitForTimeout(4000);
await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

// Volta home — clicar tab Calendário se existir
console.log('\nIndo home logada...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2500);

// Clicar tab "Calendário" (renderiza partidas futuras provavelmente)
console.log('\nClicar tab Calendário...');
let onCalendar = false;
for (const strat of [
  () => page.getByRole('button', { name: /calend/i }).first(),
  () => page.getByRole('link', { name: /calend/i }).first(),
  () => page.getByText('Calendário', { exact: true }).first(),
  () => page.locator('text=Calendário').first(),
]) {
  try {
    const loc = strat();
    if ((await loc.count()) > 0) {
      await loc.click({ timeout: 3000 });
      await page.waitForTimeout(2500);
      onCalendar = true;
      console.log('  ✓ clicou via', strat.toString().slice(0, 80));
      break;
    }
  } catch {}
}
console.log('  URL agora:', page.url());
await page.screenshot({ path: path.join(OUT, 'v6-calendario-tab.png'), fullPage: true });

// Buscar cards visíveis (qualquer status agora)
console.log('\nProcurando cards de partida...');
const matches = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('div.css-7mca6u'));
  return all.slice(0, 8).map((d) => ({
    text: d.textContent?.trim().slice(0, 150),
    rect: d.getBoundingClientRect(),
  }));
});
console.log(`Cards encontrados: ${matches.length}`);
matches.forEach((m, i) => console.log(`  [${i}] ${m.text}`));

// Tentar clicar cards procurando por algum NÃO-finalizado (em vez de "Finalizada", procura "Não iniciada", "Ao vivo", horário)
const futureCardIdx = matches.findIndex((m) => !m.text.includes('Finalizada'));
console.log(`\nCard futuro encontrado idx=${futureCardIdx}`);

if (futureCardIdx >= 0) {
  const card = matches[futureCardIdx];
  const cx = card.rect.left + card.rect.width / 2;
  const cy = card.rect.top + card.rect.height / 2;
  console.log(`Clicando em (${cx}, ${cy})...`);
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, 'v6-future-match-modal.png'), fullPage: true });

  const modalData = await page.evaluate(() => {
    const visibleDialogs = Array.from(document.querySelectorAll('[role="dialog"]'))
      .filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 100 && r.height > 100;
      })
      .map((d) => ({
        ariaLabelledBy: d.getAttribute('aria-labelledby'),
        text: d.textContent?.trim().slice(0, 800),
        buttons: Array.from(d.querySelectorAll('button')).map((b) => ({
          text: b.textContent?.trim().slice(0, 60),
          aria: b.getAttribute('aria-label'),
        })),
        links: Array.from(d.querySelectorAll('a[href]')).map((a) => ({
          href: a.href,
          text: a.textContent?.trim(),
        })),
        iframes: Array.from(d.querySelectorAll('iframe')).map((f) => f.src),
      }));
    return { count: visibleDialogs.length, dialogs: visibleDialogs };
  });
  console.log('\n=== MODAL DA PARTIDA FUTURA ===');
  console.log(JSON.stringify(modalData, null, 2));
  await writeFile(path.join(OUT, 'v6-future-match-modal.json'), JSON.stringify(modalData, null, 2));
}

// Clicar botão "Conectar com seu Google Calendar" no popover do perfil pra mapear OAuth flow
console.log('\nVerificando flow Connect Google Calendar...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2500);
try {
  // Avatar = última img clicável do header
  const avatar = page.locator('header a, header [role="button"], header button').last();
  await avatar.click({ timeout: 5000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'v6-avatar-popover.png'), fullPage: true });

  // Clicar "Conectar com seu Google Calendar"
  const calBtn = page.getByText(/conectar.*google calendar/i).first();
  if ((await calBtn.count()) > 0) {
    const popupP = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await calBtn.click();
    const popup = await popupP;
    if (popup) {
      console.log(`OAuth popup URL: ${popup.url()}`);
      await popup.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      console.log(`OAuth popup URL pós-load: ${popup.url()}`);
      await popup.screenshot({ path: path.join(OUT, 'v6-google-oauth-popup.png'), fullPage: true });
      await popup.close();
    } else {
      // sem popup — pode ter redirecionado same-tab
      console.log(`URL pós-click: ${page.url()}`);
      await page.screenshot({
        path: path.join(OUT, 'v6-google-oauth-sametab.png'),
        fullPage: true,
      });
    }
  } else {
    console.log('Botão Conectar Google Calendar não encontrado no popover');
  }
} catch (e) {
  console.log('erro avatar/calendar:', e.message);
}

await browser.close();
console.log('Done.');
