import { test, expect } from '@playwright/test';

// Placeholder @smoke test ate Fase 3 substituir com smokes reais.
// Existe pra que CI tenha algo a rodar e fique verde desde o primeiro push.
test('@smoke bootstrap — runner saudável', async () => {
  expect(typeof process.versions.node).toBe('string');
  // aceita Node >= 20 (CI usa lts/iron via .nvmrc; dev pode ter versao mais nova)
  const major = Number(process.versions.node.split('.')[0]);
  expect(major).toBeGreaterThanOrEqual(20);
});
