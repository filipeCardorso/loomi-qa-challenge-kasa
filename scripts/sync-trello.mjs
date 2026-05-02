// Sincroniza 18 bugs + 10 melhorias com Trello via API.
// Requer TRELLO_API_KEY + TRELLO_TOKEN em .env.local.
// Cria cards nas listas "Bugs reportados" e "Melhorias sugeridas",
// aplica labels, e atualiza "Trello card: TBD" nos .md com URL real.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

const KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;
const BOARD_SHORT = 'jL2scQSj'; // do URL público

if (!KEY || !TOKEN) {
  console.error('❌ TRELLO_API_KEY ou TRELLO_TOKEN ausente em .env.local');
  process.exit(1);
}

const AUTH = `key=${KEY}&token=${TOKEN}`;
const API = 'https://api.trello.com/1';

async function trello(method, endpoint, body) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${API}${endpoint}${sep}${AUTH}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`${method} ${endpoint} → ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json();
}

console.log('1. Buscando board + listas + labels...');
const board = await trello('GET', `/boards/${BOARD_SHORT}?fields=id,name`);
console.log(`   Board: ${board.name} (${board.id})`);

const lists = await trello('GET', `/boards/${board.id}/lists?fields=id,name`);
console.log(
  `   Listas:`,
  lists.map((l) => l.name),
);

const bugList =
  lists.find((l) => /bugs.*reportados/i.test(l.name)) || lists.find((l) => /bug/i.test(l.name));
const impList =
  lists.find((l) => /melhorias.*sugeridas/i.test(l.name)) ||
  lists.find((l) => /melhoria/i.test(l.name));
if (!bugList) throw new Error('Lista "Bugs reportados" não encontrada');
if (!impList) throw new Error('Lista "Melhorias sugeridas" não encontrada');
console.log(`   → Bugs: ${bugList.name} (${bugList.id})`);
console.log(`   → Melhorias: ${impList.name} (${impList.id})`);

const labels = await trello('GET', `/boards/${board.id}/labels?fields=id,name,color`);
console.log(`   Labels disponíveis: ${labels.length}`);

function findLabelId(...candidates) {
  for (const cand of candidates) {
    const re = new RegExp(cand, 'i');
    const found = labels.find((l) => re.test(l.name || ''));
    if (found) return found.id;
  }
  return null;
}

// Mapeamento severidade/impacto → label
function getLabelIdsForBug(severity, categoria) {
  const ids = [];
  const sevId = findLabelId(`^${severity}$`, severity);
  if (sevId) ids.push(sevId);
  const catId = findLabelId(categoria);
  if (catId) ids.push(catId);
  const trilhaId = findLabelId('trilha-A', 'trilha A');
  if (trilhaId) ids.push(trilhaId);
  const tarefaId = findLabelId('tarefa-3-bugs', 'tarefa 3');
  if (tarefaId) ids.push(tarefaId);
  return ids;
}

function parseHeader(content) {
  // primeiro h1 = título
  const titleM = content.match(/^#\s+(.+)$/m);
  const title = titleM ? titleM[1].trim() : 'Sem título';

  // metadata bold lines
  const get = (label) => {
    const m = content.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n*]+)`, 'i'));
    return m ? m[1].trim() : null;
  };

  return {
    title,
    severity: get('Severidade'),
    impact: get('Impacto'),
    categoria: get('Categoria') || 'Geral',
    status: get('Status'),
  };
}

async function processFile(filePath, listId, isBug) {
  const filename = path.basename(filePath);
  const content = await readFile(filePath, 'utf-8');

  // skip se já tem URL Trello (não é TBD)
  const trelloLineMatch = content.match(/\*\*Trello card:\*\*\s*(.+)/);
  const existingTrello = trelloLineMatch ? trelloLineMatch[1].trim() : 'TBD';
  if (existingTrello !== 'TBD' && existingTrello.startsWith('http')) {
    console.log(`   ⏭  ${filename} — já tem card (${existingTrello.slice(0, 50)}...)`);
    return null;
  }

  const meta = parseHeader(content);
  const sevOrImp = isBug ? meta.severity : meta.impact;
  const idLabels = getLabelIdsForBug(sevOrImp || 'Medium', meta.categoria);

  // descrição = corpo abaixo da primeira linha vazia após o h1
  const desc = content.length > 4000 ? content.slice(0, 4000) + '\n\n…[truncado]' : content;

  const card = await trello('POST', '/cards', {
    name: meta.title,
    desc,
    idList: listId,
    idLabels,
    pos: 'bottom',
  });

  console.log(`   ✓ ${filename} → ${card.shortUrl}`);

  // Atualizar o .md com a URL
  const newContent = content.replace(
    /\*\*Trello card:\*\*\s*TBD/i,
    `**Trello card:** ${card.shortUrl}`,
  );
  if (newContent !== content) {
    await writeFile(filePath, newContent, 'utf-8');
  }

  return card.shortUrl;
}

console.log('\n2. Processando bug-reports/bugs/...');
const bugsDir = path.resolve('bug-reports/bugs');
const bugFiles = (await readdir(bugsDir)).filter((f) => /^BUG-\d+.*\.md$/.test(f)).sort();
console.log(`   ${bugFiles.length} arquivos`);
for (const f of bugFiles) {
  try {
    await processFile(path.join(bugsDir, f), bugList.id, true);
    await new Promise((r) => setTimeout(r, 350)); // rate limit
  } catch (e) {
    console.error(`   ✗ ${f}: ${e.message}`);
  }
}

console.log('\n3. Processando bug-reports/improvements/...');
const impDir = path.resolve('bug-reports/improvements');
const impFiles = (await readdir(impDir)).filter((f) => /^IMP-\d+.*\.md$/.test(f)).sort();
console.log(`   ${impFiles.length} arquivos`);
for (const f of impFiles) {
  try {
    await processFile(path.join(impDir, f), impList.id, false);
    await new Promise((r) => setTimeout(r, 350));
  } catch (e) {
    console.error(`   ✗ ${f}: ${e.message}`);
  }
}

console.log('\n✅ Done. Total: 18 bugs + 10 melhorias = 28 cards.');
