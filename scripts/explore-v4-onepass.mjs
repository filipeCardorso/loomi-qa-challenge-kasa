// ÚNICO PASSO: login + exploração tudo no mesmo browser, sem dependência de storage state.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

const EMAIL = process.env.KASA_USER_EMAIL;
const PASSWORD = process.env.KASA_USER_PASSWORD;
const OUT = path.resolve('docs/site-snapshots/exploration');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
const page = await ctx.newPage();

const apiCalls = [];
page.on('request', (r) => {
  if (r.url().includes('kasa-live.api') || r.url().includes('kasa.live/api')) {
    apiCalls.push({
      method: r.method(),
      url: r.url(),
      postData: r.postData()?.slice(0, 500),
      headers: r.headers().authorization ? { auth: 'present' } : undefined,
    });
  }
});

async function snap(label) {
  await page.screenshot({ path: path.join(OUT, `v4-${label}.png`), fullPage: true });
  console.log(`   📸 v4-${label}.png`);
}
async function dumpDom(label) {
  const data = await page.evaluate(() => {
    const sample = (sel, max = 100) => Array.from(document.querySelectorAll(sel)).slice(0, max);
    return {
      url: location.href,
      title: document.title,
      navItems: sample('nav a, nav button, [role="tablist"] *').map((e) => ({
        tag: e.tagName,
        role: e.getAttribute('role'),
        text: e.textContent?.trim().slice(0, 60),
        href: e.href,
      })),
      headings: sample('h1,h2,h3,h4').map((h) => ({ tag: h.tagName, text: h.textContent?.trim() })),
      buttonsCount: document.querySelectorAll('button').length,
      buttonsSample: sample('button', 100).map((b) => ({
        text: b.textContent?.trim().slice(0, 60),
        aria: b.getAttribute('aria-label'),
      })),
      links: sample('a[href]', 100).map((a) => ({
        href: a.href,
        text: a.textContent?.trim().slice(0, 60),
      })),
      inputs: sample('input,select,textarea').map((i) => ({
        type: i.type,
        placeholder: i.placeholder,
        aria: i.getAttribute('aria-label'),
      })),
      iframes: sample('iframe').map((f) => ({ src: f.src, title: f.title })),
      images: sample('img', 30).map((i) => ({ alt: i.alt, src: i.src?.slice(0, 100) })),
      hints: {
        favoritar: /favorit/i.test(document.body.innerText),
        calendar: /google calendar|adicionar.*calend|sincroniz/i.test(document.body.innerText),
        compartilhar: /compartilh/i.test(document.body.innerText),
        sair: /sair|logout/i.test(document.body.innerText),
        meusFavoritos: /meus favoritos|meus times/i.test(document.body.innerText),
        meuPerfil: /meu perfil|minha conta/i.test(document.body.innerText),
      },
    };
  });
  await writeFile(path.join(OUT, `v4-${label}.json`), JSON.stringify(data, null, 2));
  console.log(`   💾 v4-${label}.json — buttons:${data.buttonsCount} hints:`, data.hints);
  return data;
}

console.log('\n=== STEP 1: home anônima → login ===');
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
await snap('00-just-logged');
const justLogged = await dumpDom('00-just-logged');
console.log('   nav items pós-login:', JSON.stringify(justLogged.navItems, null, 2));

console.log('\n=== STEP 2: voltar pra home (mesma sessão) ===');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2500);
await snap('01-home-after-login-nav');
const homeNav = await dumpDom('01-home-after-login-nav');
console.log('   nav items home:', JSON.stringify(homeNav.navItems, null, 2));

console.log('\n=== STEP 3: clicar primeiro card via texto MLS (estratégia que funcionou) ===');
const beforeClickUrl = page.url();
try {
  // O DIV onclick=true tem className "css-7mca6u". Vou usar a tática de clicar no texto e ir subindo até achar o ancestor clickable
  await page.evaluate(() => {
    // procura DIV com onclick TRUE que contenha texto "Finalizada"
    const all = Array.from(document.querySelectorAll('div'));
    const target = all.find((d) => d.onclick && d.textContent?.includes('Finalizada'));
    if (target) {
      console.log('Found clickable div with onclick');
      target.click();
    }
  });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(3000);
  console.log(`   URL: ${beforeClickUrl} → ${page.url()}`);
  // detecta modal aberto
  const dialogCount = await page.locator('[role="dialog"]').count();
  console.log(`   role="dialog" elementos: ${dialogCount}`);
  await snap('02-after-card-click');
  await dumpDom('02-after-card-click');
} catch (e) {
  console.log('   erro click:', e.message);
}

console.log('\n=== STEP 4: avatar/perfil (pelo seletor css real) ===');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2500);
try {
  // Avatar é o último botão do header. Mas pode ser uma div com role=button.
  // Pegar todos elementos do header que sejam clicáveis
  const headerElements = await page.evaluate(() => {
    const header =
      document.querySelector('header') ||
      document.querySelector('[role="banner"]') ||
      document.body.firstElementChild;
    if (!header) return [];
    return Array.from(header.querySelectorAll('button, [role="button"], a, [tabindex]')).map(
      (e, i) => ({
        idx: i,
        tag: e.tagName,
        role: e.getAttribute('role'),
        text: e.textContent?.trim().slice(0, 30),
        aria: e.getAttribute('aria-label'),
        href: e.href,
        hasImg: !!e.querySelector('img'),
        hasSvg: !!e.querySelector('svg'),
      }),
    );
  });
  console.log('   header clickables:', JSON.stringify(headerElements, null, 2));

  // Tentar pegar o que tem img (avatar) ou último com role=button
  const avatarCandidate = headerElements.find((e) => e.hasImg && !e.text);
  if (avatarCandidate) {
    console.log(`   avatar candidate idx=${avatarCandidate.idx}`);
    const headerLocator = page
      .locator('header button, header [role="button"], header a')
      .nth(avatarCandidate.idx);
    await headerLocator.click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    await snap('03-avatar-menu');
    await dumpDom('03-avatar-menu');
  }
} catch (e) {
  console.log('   erro avatar:', e.message);
}

console.log('\n=== STEP 5: sino notificações ===');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2500);
try {
  await page
    .getByLabel(/notificações/i)
    .first()
    .click({ timeout: 5000 });
  await page.waitForTimeout(2000);
  await snap('04-notifications');
  await dumpDom('04-notifications');
} catch (e) {
  console.log('   erro sino:', e.message.slice(0, 100));
}

console.log('\n=== STEP 6: melhores momentos LOGADO ===');
await page.goto('https://www.kasa.live/melhores-momentos', {
  waitUntil: 'networkidle',
  timeout: 15000,
});
await page.waitForTimeout(3000);
await snap('05-highlights-logged');
const highlights = await dumpDom('05-highlights-logged');
console.log('   highlights iframes:', highlights.iframes);

await writeFile(path.join(OUT, 'v4-api-calls.json'), JSON.stringify(apiCalls, null, 2));
console.log(`\n📡 ${apiCalls.length} API calls`);

await browser.close();
console.log('\n✅ Done');
