import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const page = await context.newPage();

console.log('1. Navegando para home...');
await page
  .goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 })
  .catch(() => {});
await page.waitForTimeout(2000);

// captura links que parecem ser partidas
const matchLinks = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('a[href]'));
  return all
    .filter((a) => /\/match|\/partida|\/jogo|\/game/i.test(a.href))
    .map((a) => ({ href: a.href, text: a.textContent?.trim().slice(0, 80) }))
    .slice(0, 5);
});
console.log('Match links encontrados:', JSON.stringify(matchLinks, null, 2));

// Tenta achar elementos clicáveis que pareçam cards de partida
const matchCards = await page.evaluate(() => {
  const candidates = Array.from(
    document.querySelectorAll('[role="link"], [role="button"], a, button, div[onclick], div[role]'),
  )
    .filter((el) => {
      const txt = el.textContent || '';
      // Cards de partidas geralmente têm "vs", " x ", placar, ou nomes de times
      return /vs|x\s|—|\d+\s*[xX]\s*\d+/.test(txt) && txt.length > 20 && txt.length < 200;
    })
    .slice(0, 10)
    .map((el) => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      text: el.textContent?.trim().slice(0, 150),
      href: el.href,
      classList: Array.from(el.classList).slice(0, 3),
    }));
  return candidates;
});
console.log('\nMatch card candidates:');
console.log(JSON.stringify(matchCards, null, 2));

// Tenta clicar no primeiro match-card-like se existe
if (matchCards.length > 0) {
  console.log('\n2. Tentando clicar primeiro match card...');
  const firstCard = page
    .locator('[role="link"], a, button, [role="button"]')
    .filter({ hasText: /\d+:\d+|\d+\s*[xX]\s*\d+|vs/ })
    .first();
  try {
    await firstCard.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    console.log('  URL após clique:', page.url());

    const detail = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
        .map((b) => ({
          text: b.textContent?.trim().slice(0, 80),
          aria: b.getAttribute('aria-label'),
        }))
        .filter((b) => b.text || b.aria);
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => ({ href: a.href, text: a.textContent?.trim().slice(0, 60) }))
        .slice(0, 20);
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => ({
        level: h.tagName,
        text: h.textContent?.trim().slice(0, 100),
      }));
      // procura textos relacionados a favoritar e calendar
      const allText = document.body.innerText;
      const hints = {
        hasFavoritar: /favorit/i.test(allText),
        hasCalendar: /calend|google calendar/i.test(allText),
        hasNotificar: /notific/i.test(allText),
        hasCompartilhar: /compartilh|share/i.test(allText),
      };
      return { url: location.href, title: document.title, buttons, links, headings, hints };
    });
    console.log('Detail page data:');
    console.log(JSON.stringify(detail, null, 2));

    await page.screenshot({
      path: '/Users/filipegabriel/loomi-qa-challenge-kasa/docs/site-snapshots/exploration/match-detail.png',
      fullPage: true,
    });
    await writeFile(
      '/Users/filipegabriel/loomi-qa-challenge-kasa/docs/site-snapshots/exploration/match-detail.json',
      JSON.stringify(detail, null, 2),
    );
  } catch (e) {
    console.log('  Erro ao clicar:', e.message);
  }
}

// captura modal de Entrar
console.log('\n3. Tentando abrir modal "Entrar"...');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page
    .getByRole('button', { name: /entrar/i })
    .first()
    .click({ timeout: 5000 });
  await page.waitForTimeout(1000);
  const loginModal = await page.evaluate(() => ({
    title: document.title,
    visibleText: document.body.innerText.slice(0, 1000),
    inputs: Array.from(document.querySelectorAll('input')).map((i) => ({
      type: i.type,
      placeholder: i.placeholder,
      name: i.name,
      ariaLabel: i.getAttribute('aria-label'),
    })),
    buttons: Array.from(document.querySelectorAll('button'))
      .map((b) => ({ text: b.textContent?.trim().slice(0, 60) }))
      .filter((b) => b.text),
    headings: Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => ({
      level: h.tagName,
      text: h.textContent?.trim().slice(0, 80),
    })),
  }));
  console.log('Modal Entrar:');
  console.log(JSON.stringify(loginModal, null, 2));
  await page.screenshot({
    path: '/Users/filipegabriel/loomi-qa-challenge-kasa/docs/site-snapshots/exploration/login-modal.png',
    fullPage: true,
  });
} catch (e) {
  console.log('  Erro modal Entrar:', e.message);
}

await browser.close();
