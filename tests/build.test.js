// @vitest-environment node
import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SITE_FILES } from '../scripts/build-site.js';

vi.mock('../.github/scripts/app-version.mjs', () => ({
  appVersion: () => 'v9.9.9',
}));

const repoRoot = process.cwd();
let log;

// Copie du dépôt dans un dossier temporaire, pour ne rien écrire ici.
function fakeCheckout() {
  const dir = mkdtempSync(join(tmpdir(), 'build-'));
  for (const file of SITE_FILES) {
    cpSync(join(repoRoot, file), join(dir, file), { recursive: true });
  }
  return dir;
}

beforeEach(() => {
  vi.resetModules();
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it('construit le site dans _site par défaut, avec la version', async () => {
  const dir = fakeCheckout();
  vi.spyOn(process, 'cwd').mockReturnValue(dir);
  vi.stubEnv('SITE_OUT', undefined);
  await import('../scripts/build.js');
  const page = readFileSync(join(dir, '_site', 'index.html'), 'utf8');
  expect(page).toContain('<span class="app-version">v9.9.9</span>');
  expect(existsSync(join(dir, '_site', 'data', 'heads.json'))).toBe(true);
  expect(log).toHaveBeenCalledWith('Site construit');
});

it('construit le site dans SITE_OUT', async () => {
  const dir = fakeCheckout();
  vi.spyOn(process, 'cwd').mockReturnValue(dir);
  vi.stubEnv('SITE_OUT', 'ailleurs');
  await import('../scripts/build.js');
  expect(existsSync(join(dir, 'ailleurs', 'index.html'))).toBe(true);
  expect(existsSync(join(dir, '_site'))).toBe(false);
});
