import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Fichiers publiés sur GitHub Pages.
export const SITE_FILES = ['index.html', 'style.css', 'js', 'data', 'img'];

// Le pied de page porte VERSION_PLACEHOLDER, remplacé à la construction par le dernier tag v* (VER-09).
export const PAGE = 'index.html';
export const VERSION_PLACEHOLDER = '<span class="app-version">dev</span>';

export function injectVersion(html, version) {
  return html.replace(
    VERSION_PLACEHOLDER,
    `<span class="app-version">${version}</span>`,
  );
}

// Copie le site dans `output` (relatif à `root`) et y écrit le numéro de version.
export function buildSite({ root, out: output, version }) {
  const out = resolve(root, output);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const file of SITE_FILES) {
    cpSync(join(root, file), join(out, file), { recursive: true });
  }
  const page = join(out, PAGE);
  writeFileSync(page, injectVersion(String(readFileSync(page)), version));
}
