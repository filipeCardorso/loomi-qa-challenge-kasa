// Exploração v3: estratégias múltiplas pra cada interação que falhou na v2.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const STORAGE = path.resolve('.auth-state.json');
const OUT = path.resolve('docs/site-snapshots/exploration');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
  storageState: STORAGE,
});
const page = await ctx.newPage();

const apiCalls = [];
page.on('request', (r) => {
  if (r.url().includes('kasa-live.api') || r.url().includes('kasa.live/api')) {
    apiCalls.push({
      method: r.method(),
      url: r.url(),
      postData: r.postData()?.slice(0, 500),
    });
  }
});

async function snap(label) {
  const file = path.join(OUT, `${label}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  console.log(`   📸 ${file}`);
}

async function dumpDom(label) {
  const data = await page.evaluate(() => {
    const sample = (sel, max = 30) => Array.from(document.querySelectorAll(sel)).slice(0, max);
    return {
      url: location.href,
      title: document.title,
      headings: sample('h1,h2,h3,h4').map((h) => ({ tag: h.tagName, text: h.textContent?.trim() })),
      buttons: sample('button', 80).map((b) => ({
        text: b.textContent?.trim().slice(0, 60),
        aria: b.getAttribute('aria-label'),
        type: b.type,
      })),
      links: sample('a[href]', 80).map((a) => ({
        href: a.href,
        text: a.textContent?.trim().slice(0, 60),
      })),
      inputs: sample('input,select,textarea').map((i) => ({
        tag: i.tagName,
        type: i.type,
        placeholder: i.placeholder,
        aria: i.getAttribute('aria-label'),
        name: i.name,
      })),
      iframes: sample('iframe').map((f) => ({ src: f.src, title: f.title })),
      videos: sample('video').map((v) => ({ src: v.currentSrc || v.src })),
      ariaLabels: Array.from(document.querySelectorAll('[aria-label]'))
        .map((e) => e.getAttribute('aria-label'))
        .filter((v, i, a) => a.indexOf(v) === i),
      dialogs: sample(
        '[role="dialog"], [role="alertdialog"], [class*="modal"], [class*="Modal"]',
      ).map((d) => ({
        role: d.getAttribute('role'),
        text: d.textContent?.trim().slice(0, 200),
      })),
      hints: {
        favoritar: /favorit/i.test(document.body.innerText),
        calendar: /google calendar|adicionar ao calend|sincroniz.*calend/i.test(
          document.body.innerText,
        ),
        compartilhar: /compartilh|share/i.test(document.body.innerText),
        notificar: /notific/i.test(document.body.innerText),
        sair: /sair|logout/i.test(document.body.innerText),
        perfil: /meu perfil|minha conta|configura/i.test(document.body.innerText),
      },
    };
  });
  await writeFile(path.join(OUT, `${label}.json`), JSON.stringify(data, null, 2));
  console.log(
    `   💾 ${label}.json — buttons:${data.buttons.length} links:${data.links.length} hints:`,
    data.hints,
  );
  return data;
}

async function safeGoto() {
  await page
    .goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(2000);
}

console.log('\n=== 1. HOME LOGADA — todos botões/links ===');
await safeGoto();
const homeData = await dumpDom('v3-home-logged');
await snap('v3-home-logged');

// Identificar tabs por TEXTO (não por role) já que falhamos antes com role link
console.log('\n=== 2. TABS NAV (estratégia múltipla) ===');
const tabs = ['Favoritos', 'Calendário', 'Melhores momentos', 'Partidas'];
for (const tabName of tabs) {
  await safeGoto();
  console.log(`\n  → Tab: ${tabName}`);
  let clicked = false;
  for (const strategy of [
    () =>
      page
        .getByRole('tab', { name: new RegExp(tabName, 'i') })
        .first()
        .click({ timeout: 3000 }),
    () =>
      page
        .getByRole('link', { name: new RegExp(tabName, 'i') })
        .first()
        .click({ timeout: 3000 }),
    () =>
      page
        .getByRole('button', { name: new RegExp(tabName, 'i') })
        .first()
        .click({ timeout: 3000 }),
    () => page.locator(`text="${tabName}"`).first().click({ timeout: 3000 }),
  ]) {
    try {
      await strategy();
      clicked = true;
      break;
    } catch {}
  }
  if (clicked) {
    await page.waitForTimeout(2500);
    console.log(`    ✓ clicou. URL agora: ${page.url()}`);
    await dumpDom(`v3-tab-${tabName.toLowerCase().replace(/[^a-z]/g, '')}`);
    await snap(`v3-tab-${tabName.toLowerCase().replace(/[^a-z]/g, '')}`);
  } else {
    console.log(`    ✗ não conseguiu clicar`);
  }
}

console.log('\n=== 3. CARD CLICK — múltiplas estratégias ===');
await safeGoto();

// Inspecionar estrutura DOM de cards primeiro
const cardStructure = await page.evaluate(() => {
  // Procura blocos contendo "Finalizada" e mostra o ancestral clicável
  const finalizada = Array.from(document.querySelectorAll('*')).filter(
    (e) => e.textContent?.trim() === 'Finalizada' && e.children.length === 0,
  );
  const inspect = finalizada.slice(0, 3).map((node) => {
    let cur = node;
    const ancestors = [];
    while (cur && ancestors.length < 8) {
      ancestors.push({
        tag: cur.tagName,
        role: cur.getAttribute('role'),
        href: cur.href,
        className: cur.className?.slice(0, 80),
        cursor: getComputedStyle(cur).cursor,
        onclick: !!cur.onclick,
        dataAttrs: Object.keys(cur.dataset || {}),
      });
      cur = cur.parentElement;
    }
    return ancestors;
  });
  return inspect;
});
console.log('  Estrutura ancestral dos cards (primeiros 3):');
console.log(JSON.stringify(cardStructure, null, 2));

// Tentar clicar em diferentes níveis
for (const tryClick of [
  {
    name: 'role-link com texto MLS',
    fn: () => page.getByRole('link').filter({ hasText: 'MLS' }).first(),
  },
  {
    name: 'role-button com texto MLS',
    fn: () => page.getByRole('button').filter({ hasText: 'MLS' }).first(),
  },
  {
    name: 'css cursor-pointer com Finalizada',
    fn: () => page.locator('[style*="cursor: pointer"]').filter({ hasText: 'Finalizada' }).first(),
  },
  { name: 'a[href*="/match"]', fn: () => page.locator('a[href*="/match"]').first() },
  { name: 'a[href*="/partida"]', fn: () => page.locator('a[href*="/partida"]').first() },
  { name: 'text=Minnesota Utd', fn: () => page.locator('text=Minnesota Utd').first() },
]) {
  await safeGoto();
  console.log(`\n  → Estratégia: ${tryClick.name}`);
  try {
    const loc = tryClick.fn();
    const count = await loc.count();
    console.log(`    count=${count}`);
    if (count === 0) continue;
    const beforeUrl = page.url();
    await loc.click({ timeout: 3000 });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const afterUrl = page.url();
    console.log(`    URL: ${beforeUrl} → ${afterUrl}`);
    if (afterUrl !== beforeUrl || (await page.locator('[role="dialog"]').count()) > 0) {
      const label = `v3-card-via-${tryClick.name.replace(/\W/g, '_').slice(0, 30)}`;
      await dumpDom(label);
      await snap(label);
      console.log(`    ✓ ALGO MUDOU - dump em ${label}`);
      break; // sucesso
    } else {
      console.log(`    ✗ nada mudou`);
    }
  } catch (e) {
    console.log(`    ✗ erro: ${e.message.slice(0, 80)}`);
  }
}

console.log('\n=== 4. CARD HOVER — talvez favoritar/calendar aparece em hover ===');
await safeGoto();
try {
  const card = page.locator('text=Minnesota Utd').first();
  await card.hover({ timeout: 5000 });
  await page.waitForTimeout(1500);
  await snap('v3-card-hover');
  await dumpDom('v3-card-hover');
} catch (e) {
  console.log('  hover failed:', e.message);
}

console.log('\n=== 5. CARD RIGHT-CLICK ou ARROW key navigation? ===');
// Não vou implementar — desnecessário pra MVP

console.log('\n=== 6. AVATAR MENU (estratégias múltiplas) ===');
await safeGoto();
for (const tryAvatar of [
  () =>
    page
      .locator('header img[alt*="avatar"], header img[alt*="user"]')
      .first()
      .click({ timeout: 3000 }),
  () => page.locator('header [role="button"]').last().click({ timeout: 3000 }),
  () => page.locator('header button').last().click({ timeout: 3000 }),
  () =>
    page
      .locator('header [class*="avatar"], header [class*="Avatar"]')
      .first()
      .click({ timeout: 3000 }),
]) {
  try {
    await tryAvatar();
    await page.waitForTimeout(1500);
    const before = await page.locator('[role="menu"], [role="dialog"]').count();
    if (before > 0) {
      console.log('  ✓ menu/dialog aberto');
      await snap('v3-avatar-menu');
      await dumpDom('v3-avatar-menu');
      break;
    }
  } catch {}
}

console.log('\n=== 7. SINO de notificações ===');
await safeGoto();
try {
  // Use first() pra evitar strict-mode violation
  await page
    .getByLabel(/notificações/i)
    .first()
    .click({ timeout: 3000 });
  await page.waitForTimeout(1500);
  await snap('v3-notifications');
  await dumpDom('v3-notifications');
} catch (e) {
  console.log('  sino failed:', e.message.slice(0, 100));
}

console.log('\n=== 8. /melhores-momentos LOGADO — capturar player se existir ===');
await page.goto('https://www.kasa.live/melhores-momentos', {
  waitUntil: 'networkidle',
  timeout: 15000,
});
await page.waitForTimeout(3000);
await snap('v3-highlights-logged');
await dumpDom('v3-highlights-logged');

// Tentar clicar no primeiro vídeo de highlight
console.log('\n=== 9. CLICAR primeiro highlight ===');
for (const tryHL of [
  () => page.locator('a[href*="youtube"]').first().click({ timeout: 3000 }),
  () => page.locator('iframe[src*="youtube"]').first(),
  () => page.locator('img[src*="ytimg"]').first().click({ timeout: 3000 }),
  () =>
    page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
      .click({ timeout: 3000 }),
]) {
  try {
    const r = tryHL();
    if (r && typeof r.click !== 'function' && (await r.count?.()) > 0) {
      console.log('  iframe encontrado, src:', await r.getAttribute('src'));
      break;
    } else {
      await r;
    }
    await page.waitForTimeout(2500);
    await snap('v3-highlight-clicked');
    await dumpDom('v3-highlight-clicked');
    break;
  } catch {}
}

await writeFile(path.join(OUT, 'v3-api-calls.json'), JSON.stringify(apiCalls, null, 2));
console.log(`\n📡 ${apiCalls.length} API calls capturadas`);

await browser.close();
console.log('\n✅ Done.');
