import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dataDirectory = process.env.CAREERY_E2E_DATA_DIR ??= mkdtempSync(join(tmpdir(), 'careery-e2e-'));
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command: 'CAREERY_BUILD_DIR=.next-build pnpm start --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    env: { CAREERY_DATA_DIR: dataDirectory },
  },
});
