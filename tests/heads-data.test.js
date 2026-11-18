// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Contrôle d'intégrité de data/heads.json, la source des lignes du tableau : une erreur de
// saisie se voit ici, pas dans le navigateur. Aucun décompte n'est figé (ils se déduisent).
const data = JSON.parse(readFileSync('data/heads.json', 'utf8'));
const KINDS = ['variant', 'name', 'charged', 'other'];
const DIMENSIONS = ['overworld', 'nether', 'end'];

describe('data/heads.json', () => {
  it('décrit le datapack', () => {
    for (const key of ['name', 'version', 'minecraft', 'overlay']) {
      expect(data.datapack[key], key).toMatch(/\S/);
    }
  });

  it('a un identifiant unique par ligne, sûr dans un attribut HTML', () => {
    const ids = data.heads.map((head) => head.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(data.heads.map((head) => [head.id, head]))('%s : ligne valide', (_id, head) => {
    expect(head.mob).toMatch(/\S/);
    expect(head.head === null || /\S/.test(head.head)).toBe(true);
    if (head.image) {
      expect(head.image).toMatch(/^img\/heads\/[a-z0-9-]+\.png$/);
      expect(existsSync(head.image), head.image).toBe(true);
    }
    if (head.condition) {
      expect(KINDS).toContain(head.condition.kind);
      expect(head.condition.text).toMatch(/\S/);
    }
    if (head.rate !== null) {
      expect(head.rate.base).toBeGreaterThan(0);
      expect(head.rate.base).toBeLessThanOrEqual(1);
      if ('looting' in head.rate) {
        expect(head.rate.looting).toBeGreaterThanOrEqual(head.rate.base);
        expect(head.rate.looting).toBeLessThanOrEqual(1);
      }
    }
    for (const dimension of head.places.dimensions) {
      expect(DIMENSIONS).toContain(dimension);
    }
    expect(head.places.text).toMatch(/\S/);
    if (head.mating) {
      expect(typeof head.mating.possible).toBe('boolean');
      expect(head.mating.text).toMatch(/\S/);
    }
  });

  it('une tête sans taux n’a pas d’image : elle n’existe pas dans le pack', () => {
    for (const head of data.heads.filter((entry) => entry.rate === null)) {
      expect(head.image).toBeUndefined();
    }
  });
});
