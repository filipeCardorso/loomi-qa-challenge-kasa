// Recaptura BUG-011 — modal "Melhores momentos" sempre vazio.
//
// Estratégia: navegar até a home, encontrar até 3 cards de partidas
// FINALIZADAS distintas (com placar/times visíveis), abrir o modal de cada
// uma, capturar screenshot do modal completo e nomeá-lo pelos times. Hashes
// MD5 devem ser DIFERENTES (cada modal é de uma partida diferente).
//
// Saída: bug-reports/evidence/BUG-011/manual-recapture-2026-05-03/
//   ├── card-N-{home_vs_visitante}-{score}.png  (screenshot do card)
//   ├── modal-N-{home_vs_visitante}-{score}.png (screenshot do modal aberto)
//   └── findings.json                            (metadata das 3 partidas)

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('bug-reports/evidence/BUG-011/manual-recapture-2026-05-03');
await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
});
const page = await ctx.newPage();

console.log('Navegando pra home...');
await page.goto('https://www.kasa.live/', { waitUntil: 'networkidle', timeout: 30_000 });
await page.waitForTimeout(2_500);

// Localiza cards de partidas finalizadas (badge "Finalizada")
const finalizedCards = page.locator('div.css-7mca6u').filter({ hasText: /finalizad/i });
const total = await finalizedCards.count();
console.log(`Cards finalizados encontrados: ${total}`);

if (total === 0) {
  console.error('Nenhuma partida finalizada visível. Abortando.');
  await browser.close();
  process.exit(1);
}

const findings = {
  capturedAt: new Date().toISOString(),
  url: 'https://www.kasa.live/',
  cardsFound: total,
  attempted: 0,
  successful: 0,
  attempts: [],
};

const sanitize = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);

const seenSignatures = new Set();
const targetCount = Math.min(3, total);

for (let i = 0; i < total && findings.successful < targetCount; i++) {
  const card = finalizedCards.nth(i);
  await card.scrollIntoViewIfNeeded();

  // Extrair info do card pra naming
  const text = (await card.innerText().catch(() => '')) || `card-${i}`;
  const teamMatch = text.match(
    /([A-ZÀ-Úa-zà-ú][\w\s.\-]+?)\s+\d+[\s\S]*?\d+\s+([A-ZÀ-Úa-zà-ú][\w\s.\-]+?)$/m,
  );
  const summary = text.split('\n').slice(0, 4).join(' | ').slice(0, 120);
  const signature = createHash('md5').update(text.slice(0, 200)).digest('hex').slice(0, 8);

  if (seenSignatures.has(signature)) {
    console.log(`[card ${i}] duplicado (signature ${signature}), pulando`);
    continue;
  }
  seenSignatures.add(signature);

  findings.attempted++;
  const slug = sanitize(summary || `card-${i}`);
  console.log(`\n[attempt ${findings.attempted}] card ${i} → ${summary}`);

  const cardPath = path.join(OUT_DIR, `card-${findings.attempted}-${signature}-${slug}.png`);
  await card
    .screenshot({ path: cardPath })
    .catch((e) => console.log(`  card screenshot falhou: ${e.message}`));

  // Abrir modal
  const opened = await card.click({ trial: false }).then(
    () => true,
    (e) => {
      console.log(`  click falhou: ${e.message}`);
      return false;
    },
  );
  if (!opened) continue;

  const modal = page.locator('[role="dialog"][aria-labelledby^="chakra-modal--header"]').first();
  const visible = await modal.waitFor({ state: 'visible', timeout: 6_000 }).then(
    () => true,
    () => false,
  );

  if (!visible) {
    console.log(`  modal não abriu`);
    continue;
  }

  const modalText = (await modal.innerText().catch(() => '')) || '';
  const isEmpty = /nada por aqui|n[ãa]o temos os melhores momentos/i.test(modalText);
  const modalPath = path.join(OUT_DIR, `modal-${findings.attempted}-${signature}-${slug}.png`);
  await modal.screenshot({ path: modalPath });

  findings.attempts.push({
    index: i,
    cardSummary: summary,
    cardSignature: signature,
    cardScreenshot: path.basename(cardPath),
    modalScreenshot: path.basename(modalPath),
    modalBodyExcerpt: modalText.slice(0, 200),
    modalIsEmpty: isEmpty,
  });
  findings.successful++;
  console.log(`  modal: ${isEmpty ? 'VAZIO' : 'COM CONTEÚDO'} → ${modalPath}`);

  // Fecha modal
  await page.keyboard.press('Escape').catch(() => undefined);
  await modal.waitFor({ state: 'hidden', timeout: 4_000 }).catch(() => undefined);
  await page.waitForTimeout(400);
}

await writeFile(path.join(OUT_DIR, 'findings.json'), JSON.stringify(findings, null, 2));

await browser.close();

console.log(`\n✅ Captura concluída.`);
console.log(`Modais capturados: ${findings.successful}/${targetCount}`);
console.log(`Vazios: ${findings.attempts.filter((a) => a.modalIsEmpty).length}`);

// Imprime MD5 dos PNGs gerados pra confirmar que NÃO são idênticos
console.log('\nMD5 dos modais (devem ser TODOS diferentes):');
for (const a of findings.attempts) {
  const buf = fs.readFileSync(path.join(OUT_DIR, a.modalScreenshot));
  const md5 = createHash('md5').update(buf).digest('hex');
  console.log(`  ${a.modalScreenshot}: ${md5}`);
}
