// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  PAGE,
  SITE_FILES,
  VERSION_PLACEHOLDER,
  buildSite,
  injectVersion,
} from '../scripts/build-site.js';

function fakeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'site-'));
  for (const dir of ['js', 'data', 'img', 'tests']) mkdirSync(join(root, dir));
  mkdirSync(join(root, 'img', 'heads'));
  writeFileSync(join(root, 'index.html'), `accueil ${VERSION_PLACEHOLDER}`);
  writeFileSync(join(root, 'style.css'), 'css');
  writeFileSync(join(root, 'js', 'main.js'), 'js');
  writeFileSync(join(root, 'data', 'heads.json'), '{}');
  writeFileSync(join(root, 'img', 'heads', 'a.png'), 'png');
  writeFileSync(join(root, 'tests', 'x.test.js'), 'test');
  writeFileSync(join(root, 'package.json'), '{}');
  return root;
}

describe('SITE_FILES', () => {
  it('liste les fichiers publiés', () => {
    expect(SITE_FILES).toEqual(['index.html', 'style.css', 'js', 'data', 'img']);
    expect(PAGE).toBe('index.html');
  });
});

describe('injectVersion', () => {
  it('remplace le marqueur par le numéro de version', () => {
    expect(injectVersion(`a ${VERSION_PLACEHOLDER} b`, 'v2.0.1')).toBe(
      'a <span class="app-version">v2.0.1</span> b',
    );
  });

  it('laisse intact un texte sans marqueur', () => {
    expect(injectVersion('rien', 'v2.0.1')).toBe('rien');
  });
});

describe('buildSite', () => {
  let root;
  let out;

  beforeEach(() => {
    root = fakeRepo();
    out = join(root, '_site');
  });

  it('copie le site et y écrit la version', () => {
    buildSite({ root, out, version: 'v1.2.3' });
    expect(readFileSync(join(out, 'index.html'), 'utf8')).toBe(
      'accueil <span class="app-version">v1.2.3</span>',
    );
    expect(readFileSync(join(out, 'style.css'), 'utf8')).toBe('css');
    expect(readFileSync(join(out, 'js', 'main.js'), 'utf8')).toBe('js');
    expect(readFileSync(join(out, 'data', 'heads.json'), 'utf8')).toBe('{}');
    expect(readFileSync(join(out, 'img', 'heads', 'a.png'), 'utf8')).toBe('png');
    expect(existsSync(join(out, 'tests'))).toBe(false);
    expect(existsSync(join(out, 'package.json'))).toBe(false);
    expect(readFileSync(join(root, 'index.html'), 'utf8')).toBe(
      `accueil ${VERSION_PLACEHOLDER}`,
    );
  });

  it('vide le dossier de sortie avant de construire', () => {
    mkdirSync(join(out, 'ancien'), { recursive: true });
    buildSite({ root, out, version: 'v1.0.0' });
    expect(existsSync(join(out, 'ancien'))).toBe(false);
  });

  it('place une sortie relative dans la racine', () => {
    buildSite({ root, out: 'sortie', version: 'v1.0.0' });
    expect(existsSync(join(root, 'sortie', 'index.html'))).toBe(true);
  });

  it('crée les dossiers parents de la sortie', () => {
    out = join(root, 'a', 'b');
    buildSite({ root, out, version: 'v1.0.0' });
    expect(existsSync(join(out, 'index.html'))).toBe(true);
  });
});
