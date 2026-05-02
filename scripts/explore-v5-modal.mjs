// Foco final: clicar no card (Chakra css-7mca6u tem onclick) + capturar modal real
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

// Volta home
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2500);

// Listar todas classes css- de elementos clicáveis com onclick (sem precisar inferir)
const clickables = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('div'));
  return all
    .filter((d) => d.onclick && d.textContent?.includes('Finalizada'))
    .slice(0, 5)
    .map((d) => ({
      class: d.className,
      text: d.textContent?.trim().slice(0, 100),
      rect: d.getBoundingClientRect(),
    }));
});
console.log('clickables com onclick + Finalizada:');
console.log(JSON.stringify(clickables, null, 2));

// Pega primeiro clickable com classe css-XXX (ignora body que aparece com class vazia)
const card = clickables.find((c) => c.class && c.class.includes('css-'));
if (card) {
  const klass = card.class.split(' ').find((c) => c.startsWith('css-'));
  console.log('Click via .' + klass + ' OU via rect center');
  try {
    // Tentar locator primeiro
    let clicked = false;
    try {
      await page.locator(`.${klass}`).first().click({ timeout: 5000 });
      clicked = true;
    } catch (e) {
      console.log('locator falhou, vou tentar mouse.click no centro do rect');
      const cx = card.rect.left + card.rect.width / 2;
      const cy = card.rect.top + card.rect.height / 2;
      await page.mouse.click(cx, cy);
      clicked = true;
    }
    if (clicked) {
      await page.waitForTimeout(3000);

      // Capturar tudo que apareceu de novo
      const afterClick = await page.evaluate(() => {
        const visibleDialogs = Array.from(document.querySelectorAll('[role="dialog"]'))
          .filter((d) => {
            const r = d.getBoundingClientRect();
            return r.width > 50 && r.height > 50; // visible
          })
          .map((d) => ({
            role: d.getAttribute('role'),
            ariaLabel: d.getAttribute('aria-label'),
            ariaLabelledBy: d.getAttribute('aria-labelledby'),
            headings: Array.from(d.querySelectorAll('h1,h2,h3,h4')).map((h) =>
              h.textContent?.trim(),
            ),
            buttons: Array.from(d.querySelectorAll('button')).map((b) => ({
              text: b.textContent?.trim().slice(0, 60),
              aria: b.getAttribute('aria-label'),
            })),
            links: Array.from(d.querySelectorAll('a[href]')).map((a) => ({
              href: a.href,
              text: a.textContent?.trim(),
            })),
            textPreview: d.textContent?.trim().slice(0, 500),
            rect: d.getBoundingClientRect(),
          }));
        return {
          url: location.href,
          visibleDialogsCount: visibleDialogs.length,
          visibleDialogs,
        };
      });
      console.log('\n=== APÓS CLICK NO CARD ===');
      console.log(JSON.stringify(afterClick, null, 2));
      await page.screenshot({ path: path.join(OUT, 'v5-modal-opened.png'), fullPage: true });
      await writeFile(path.join(OUT, 'v5-modal-opened.json'), JSON.stringify(afterClick, null, 2));

      // Se há modal visível, dump TUDO dele
      if (afterClick.visibleDialogsCount > 0) {
        console.log(`\n${afterClick.visibleDialogsCount} dialog(s) visíveis encontrados`);
      }
    } // close inner if(clicked)
  } catch (e) {
    console.log('erro click:', e.message);
  }
}

await browser.close();
console.log('Done.');
