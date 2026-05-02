// Login local (email/senha) no kasa.live + exploração detalhe partida + favoritar + Calendar.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

const EMAIL = process.env.KASA_USER_EMAIL;
const PASSWORD = process.env.KASA_USER_PASSWORD;
const STORAGE_PATH = path.resolve('.auth-state.json');
const OUT_DIR = path.resolve('docs/site-snapshots/exploration');
await mkdir(OUT_DIR, { recursive: true });

if (!EMAIL || !PASSWORD) {
  console.error('❌ KASA_USER_EMAIL/PASSWORD ausentes em .env.local');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const ctxOpts = {
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
};
if (existsSync(STORAGE_PATH)) ctxOpts.storageState = STORAGE_PATH;
const context = await browser.newContext(ctxOpts);
const page = await context.newPage();

async function isLoggedIn() {
  const entrarBtn = page.getByRole('button', { name: /^Entrar$/i }).first();
  return !(await entrarBtn.isVisible().catch(() => false));
}

console.log('1. Indo pra home...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2000);

if (await isLoggedIn()) {
  console.log('✅ Já logado (storage state válido)');
} else {
  console.log('2. Clicando Entrar...');
  await page
    .getByRole('button', { name: /^Entrar$/i })
    .first()
    .click();
  await page.waitForTimeout(1500);

  console.log('3. Preenchendo email/senha local (não Google OAuth)...');
  // O modal tem dois inputs: E-mail e Senha. Pegando por placeholder real.
  await page.getByPlaceholder(/digite seu e-mail/i).fill(EMAIL);
  await page.getByPlaceholder(/digite sua senha/i).fill(PASSWORD);

  console.log('4. Clicando Entrar (modal)...');
  // Há 2 botões "Entrar" (header + modal). Pegar o do modal — usar locator.last() pois é o último renderizado.
  await page
    .getByRole('button', { name: /^Entrar$/i })
    .last()
    .click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  await page.screenshot({ path: path.join(OUT_DIR, 'post-login.png'), fullPage: true });

  if (await isLoggedIn()) {
    console.log('✅ Login bem-sucedido');
    await context.storageState({ path: STORAGE_PATH });
    console.log(`   Storage state salvo em ${STORAGE_PATH}`);
  } else {
    console.error('❌ Login falhou — checar docs/site-snapshots/exploration/post-login.png');
    // Capturar mensagem de erro do modal se houver
    const err = await page
      .locator('[role="alert"], .chakra-alert, [class*="error"]')
      .first()
      .textContent()
      .catch(() => null);
    if (err) console.error('   Erro visível:', err);
    await browser.close();
    process.exit(2);
  }
}

console.log('\n5. Capturando home logada...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(OUT_DIR, 'home-logged-in.png'), fullPage: true });

const homeLogged = await page.evaluate(() => {
  const allText = document.body.innerText;
  const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
    text: b.textContent?.trim().slice(0, 80),
    aria: b.getAttribute('aria-label'),
  }));
  const matchCardLinks = Array.from(document.querySelectorAll('a[href]'))
    .filter((a) => /\/(match|partida|jogo)/i.test(a.href))
    .map((a) => ({ href: a.href, text: a.textContent?.trim().slice(0, 100) }))
    .slice(0, 10);
  // Tentar pegar cards de partida (cards Chakra geralmente são divs com classes específicas)
  const cards = Array.from(
    document.querySelectorAll('article, [role="article"], [class*="card"], [class*="Card"]'),
  )
    .slice(0, 6)
    .map((c) => ({
      tag: c.tagName,
      role: c.getAttribute('role'),
      text: c.textContent?.trim().slice(0, 200),
      href: c.querySelector('a')?.href,
    }));
  return {
    title: document.title,
    isLoggedHints: {
      hasEntrar: /^Entrar$/i.test(allText),
      hasMeuPerfil: /perfil|conta|profile/i.test(allText),
      hasFavoritar: /favorit/i.test(allText),
      hasNotificacao: /notific/i.test(allText),
      hasSair: /sair|logout/i.test(allText),
    },
    buttonsSample: buttons.slice(0, 30),
    matchCardLinks,
    cardsSample: cards,
  };
});
console.log('Home logada:', JSON.stringify(homeLogged, null, 2));

console.log('\n6. Tentando navegar pra detalhe de uma partida...');
let detailUrl = null;
if (homeLogged.matchCardLinks.length > 0) {
  detailUrl = homeLogged.matchCardLinks[0].href;
  console.log('   Via match link:', detailUrl);
} else {
  // Procurar setinha → ou ícone câmera dentro de cards e clicar
  console.log(
    '   Sem links /match — tentando clicar primeiro card visível com texto Finalizada...',
  );
  const candidates = page.locator('text=Finalizada, text=MLS, text=Premier');
  const count = await candidates.count();
  console.log(`   Candidatos com Finalizada/MLS/Premier: ${count}`);
  if (count > 0) {
    // tenta clicar no card pai
    try {
      await candidates.first().click({ timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      detailUrl = page.url();
      console.log(`   URL após clique: ${detailUrl}`);
    } catch (e) {
      console.log('   Erro click:', e.message);
    }
  }
}

if (detailUrl && detailUrl !== 'https://www.kasa.live/') {
  console.log(`\n7. Capturando detalhe de partida: ${detailUrl}`);
  await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'match-detail-logged.png'), fullPage: true });

  const detail = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => ({
      level: h.tagName,
      text: h.textContent?.trim().slice(0, 100),
    })),
    buttons: Array.from(document.querySelectorAll('button'))
      .map((b) => ({
        text: b.textContent?.trim().slice(0, 80),
        aria: b.getAttribute('aria-label'),
      }))
      .filter((b) => b.text || b.aria),
    iframes: Array.from(document.querySelectorAll('iframe')).map((f) => f.src),
    videos: Array.from(document.querySelectorAll('video')).map((v) => ({
      currentSrc: v.currentSrc,
      src: v.src,
      poster: v.poster,
    })),
    hints: {
      hasFavoritar: /favorit/i.test(document.body.innerText),
      hasCalendar: /calend|google calendar|adicionar.*calendário/i.test(document.body.innerText),
      hasShare: /compartilh|share/i.test(document.body.innerText),
      hasNotificar: /notific/i.test(document.body.innerText),
    },
  }));
  console.log('Detalhe partida:', JSON.stringify(detail, null, 2));
  await writeFile(path.join(OUT_DIR, 'match-detail-logged.json'), JSON.stringify(detail, null, 2));
} else {
  console.log('\n⚠️ Não consegui chegar no detalhe da partida');
}

console.log('\n8. Tentando explorar /melhores-momentos logado...');
await page.goto('https://www.kasa.live/melhores-momentos', {
  waitUntil: 'networkidle',
  timeout: 15000,
});
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(OUT_DIR, 'highlights-logged.png'), fullPage: true });

const highlights = await page.evaluate(() => ({
  iframes: Array.from(document.querySelectorAll('iframe')).map((f) => ({
    src: f.src,
    title: f.title,
  })),
  videos: Array.from(document.querySelectorAll('video')).map((v) => ({
    currentSrc: v.currentSrc,
    src: v.src,
  })),
  videoLinks: Array.from(
    document.querySelectorAll('a[href*="youtube"], a[href*="vimeo"], a[href*="watch"]'),
  ).map((a) => a.href),
  buttonsCount: document.querySelectorAll('button').length,
  hints: {
    hasFavoritar: /favorit/i.test(document.body.innerText),
    hasYouTube: /youtube/i.test(document.body.innerHTML),
    hasVideoPlayer: /<video/i.test(document.body.innerHTML),
  },
}));
console.log('Highlights logado:', JSON.stringify(highlights, null, 2));

await browser.close();
console.log('\n✅ Done. Screenshots e JSONs em', OUT_DIR);
