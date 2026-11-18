import { describe, expect, it } from 'vitest';
import { nextAscending, sortEntries } from '../js/sort.js';
import { HEADS } from './fixtures.js';

const [bee, blaze, camel, rabbit, zombie] = HEADS;
const entry = (head, owned = false) => ({ head, owned });
const ids = (entries) => entries.map(({ head }) => head.id);

const entries = [
  entry(rabbit, true),
  entry(zombie),
  entry(bee),
  entry(camel, true),
  entry(blaze),
];

describe('sortEntries', () => {
  it('trie par nom du mob puis de la tête', () => {
    expect(ids(sortEntries(entries, 'name', true))).toEqual([
      'bee-angry-bee-head',
      'blaze-blaze-head',
      'camel-camel-head',
      'rabbit-toast-rabbit-head',
      'zombie',
    ]);
  });

  it('trie par taux de base, sans taux en premier', () => {
    expect(ids(sortEntries(entries, 'rate', true))).toEqual([
      'zombie',
      'blaze-blaze-head',
      'rabbit-toast-rabbit-head',
      'bee-angry-bee-head',
      'camel-camel-head',
    ]);
  });

  it('trie par lieu', () => {
    expect(ids(sortEntries(entries, 'where', true))).toEqual([
      'rabbit-toast-rabbit-head',
      'blaze-blaze-head',
      'bee-angry-bee-head',
      'zombie',
      'camel-camel-head',
    ]);
  });

  it('trie par case cochée, ordre d’origine à égalité', () => {
    expect(ids(sortEntries(entries, 'owned', true))).toEqual([
      'zombie',
      'bee-angry-bee-head',
      'blaze-blaze-head',
      'rabbit-toast-rabbit-head',
      'camel-camel-head',
    ]);
  });

  it('inverse le sens, en gardant l’ordre d’origine à égalité', () => {
    expect(ids(sortEntries(entries, 'owned', false))).toEqual([
      'rabbit-toast-rabbit-head',
      'camel-camel-head',
      'zombie',
      'bee-angry-bee-head',
      'blaze-blaze-head',
    ]);
    expect(ids(sortEntries(entries, 'rate', false))).toEqual([
      'camel-camel-head',
      'bee-angry-bee-head',
      'rabbit-toast-rabbit-head',
      'blaze-blaze-head',
      'zombie',
    ]);
  });

  it('range les accents comme le français (é près de e, pas après z)', () => {
    const accents = [
      entry({ ...bee, id: 'z', mob: 'Zèbre', head: 'A' }),
      entry({ ...bee, id: 'e', mob: 'Élan', head: 'A' }),
      entry({ ...bee, id: 'f', mob: 'Faucon', head: 'A' }),
    ];
    expect(ids(sortEntries(accents, 'name', true))).toEqual(['e', 'f', 'z']);
  });

  it('sépare le mob et la tête par une espace (« a c » avant « ab x »)', () => {
    const spaced = [
      entry({ ...bee, id: 'ab', mob: 'Ab', head: 'X' }),
      entry({ ...bee, id: 'a', mob: 'A', head: 'C' }),
    ];
    expect(ids(sortEntries(spaced, 'name', true))).toEqual(['a', 'ab']);
  });

  it('ne modifie pas le tableau reçu', () => {
    const copy = [...entries];
    sortEntries(entries, 'name', true);
    expect(entries).toEqual(copy);
  });
});

describe('nextAscending', () => {
  it('inverse le sens de la colonne déjà triée, sinon commence croissant', () => {
    expect(nextAscending(null)).toBe(true);
    expect(nextAscending('descending')).toBe(true);
    expect(nextAscending('ascending')).toBe(false);
  });
});
