import { test, expect } from '@playwright/test';

test('@smoke fixture — health check', async () => {
  expect(true).toBe(true);
});

test('@core fixture — busca por time', async () => {
  expect(1 + 1).toBe(2);
});

test.skip('@regression fixture — favoritar (desativado)', async () => {
  expect(false).toBe(true);
});
