// Exploração profunda PÓS-LOGIN: Favoritos, Calendário, detalhe de partida, fluxo de favoritar.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_PATH = path.resolve('.auth-state.json');
const OUT = path.resolve('docs/site-snapshots/exploration');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
  storageState: STORAGE_PATH,
});
const page = await ctx.newPage();

const apiCalls = [];
page.on('request', (r) => {
  if (r.url().includes('kasa-live.api') || r.url().includes('kasa.live/api')) {
    apiCalls.push({ method: r.method(), url: r.url(), postData: r.postData() });
  }
});

async function snap(label) {
  await page.screenshot({ path: path.join(OUT, `${label}.png`), fullPage: true });
}

async function probe(label) {
  const data = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: b.textContent?.trim().slice(0, 80),
      aria: b.getAttribute('aria-label'),
    }));
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({ href: a.href, text: a.textContent?.trim().slice(0, 80) }))
      .slice(0, 30);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => ({
      level: h.tagName,
      text: h.textContent?.trim().slice(0, 100),
    }));
    const inputs = Array.from(document.querySelectorAll('input,textarea,select')).map((i) => ({
      type: i.type || i.tagName.toLowerCase(),
      placeholder: i.placeholder,
      ariaLabel: i.getAttribute('aria-label'),
      name: i.name,
    }));
    const iframes = Array.from(document.querySelectorAll('iframe')).map((f) => ({
      src: f.src,
      title: f.title,
    }));
    const videos = Array.from(document.querySelectorAll('video')).map((v) => ({
      src: v.currentSrc || v.src,
      poster: v.poster,
    }));
    const ariaLabels = Array.from(document.querySelectorAll('[aria-label]'))
      .map((e) => e.getAttribute('aria-label'))
      .filter((v, i, a) => a.indexOf(v) === i);
    const allText = document.body.innerText;
    return {
      url: location.href,
      title: document.title,
      headings,
      buttonsCount: buttons.length,
      buttonsSample: buttons.slice(0, 50),
      linksSample: links,
      inputs,
      iframes,
      videos,
      ariaLabels,
      hints: {
        favoritar: /favorit/i.test(allText),
        calendar: /google calendar|adicionar.*calend/i.test(allText),
        compartilhar: /compartilh|share/i.test(allText),
        notificar: /notific/i.test(allText),
        sair: /sair|logout/i.test(allText),
        perfil: /meu perfil|conta/i.test(allText),
      },
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
  await writeFile(path.join(OUT, `${label}.json`), JSON.stringify(data, null, 2));
  await snap(label);
  return data;
}

// 1. Home logada
console.log('\n\n##### HOME LOGADA #####');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2500);
await probe('home-logged-deep');

// 2. Tab Favoritos
console.log('\n\n##### TAB FAVORITOS #####');
try {
  await page
    .getByRole('link', { name: /favoritos/i })
    .first()
    .click();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log('URL após Favoritos:', page.url());
  await probe('favoritos-logged');
} catch (e) {
  console.log('Erro tab Favoritos:', e.message);
}

// 3. Tab Calendário
console.log('\n\n##### TAB CALENDÁRIO #####');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page
    .getByRole('link', { name: /calend/i })
    .first()
    .click();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log('URL após Calendário:', page.url());
  await probe('calendario-logged');
} catch (e) {
  console.log('Erro tab Calendário:', e.message);
}

// 4. Clicar primeira partida (card)
console.log('\n\n##### DETALHE PARTIDA (primeiro card) #####');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2500);

  // Cards têm texto "Finalizada" e setinha →. Clica na seta.
  // Estratégia: selecionar primeiro elemento ancestral com role/clickable que contém "Finalizada"
  const arrow = page.locator('button, a').filter({ hasText: /^$/ }).nth(0);
  // Melhor: pega o elemento <a> ou <button> dentro do card "MLS Minnesota Utd."
  const firstCardClickTarget = page
    .locator('div, article')
    .filter({ has: page.locator('text=Finalizada') })
    .first()
    .locator('a, button')
    .last(); // a setinha → costuma ser o último controle do card
  const count = await firstCardClickTarget.count();
  console.log('Targets encontrados:', count);

  if (count > 0) {
    const beforeUrl = page.url();
    await firstCardClickTarget.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const afterUrl = page.url();
    console.log(`URL antes: ${beforeUrl}\nURL depois: ${afterUrl}`);

    if (afterUrl !== beforeUrl) {
      await probe('match-detail-clicked');
    } else {
      // talvez tenha aberto modal — capturar mesmo assim
      console.log('URL não mudou — possivelmente abriu modal');
      await probe('match-modal-maybe');
    }
  }
} catch (e) {
  console.log('Erro clicar card:', e.message);
}

// 5. Tentar o ícone de câmera no card (provavelmente vai pro vídeo do highlight)
console.log('\n\n##### CÂMERA/HIGHLIGHT NO CARD #####');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2500);
  // O ícone câmera é o penúltimo controle do card (antes da seta)
  // Vamos tentar pelo aria-label ou pelo SVG
  const cameraIcon = page
    .locator('div, article')
    .filter({ has: page.locator('text=Finalizada') })
    .first()
    .locator('button, a')
    .first();
  if ((await cameraIcon.count()) > 0) {
    await cameraIcon.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);
    console.log('URL após câmera:', page.url());
    await probe('camera-icon-clicked');
  }
} catch (e) {
  console.log('Erro câmera:', e.message);
}

// 6. Notification bell
console.log('\n\n##### SINO DE NOTIFICAÇÕES #####');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.getByLabel(/notificações/i).click({ timeout: 5000 });
  await page.waitForTimeout(1500);
  await probe('notifications-open');
} catch (e) {
  console.log('Erro sino:', e.message);
}

// 7. Avatar / menu de perfil
console.log('\n\n##### AVATAR/PERFIL #####');
try {
  await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  // Avatar geralmente é botão sem texto, último do header. Tentamos por svg ou por posição
  const avatar = page.locator('header button, header [role="button"]').last();
  await avatar.click({ timeout: 5000 });
  await page.waitForTimeout(1500);
  await probe('avatar-menu-open');
} catch (e) {
  console.log('Erro avatar:', e.message);
}

// Salvar todas API calls registradas
await writeFile(path.join(OUT, '__api-calls-logged.json'), JSON.stringify(apiCalls, null, 2));
console.log(`\n📡 ${apiCalls.length} chamadas API capturadas. Salvas em __api-calls-logged.json`);

await browser.close();
console.log('\n✅ Done.');
