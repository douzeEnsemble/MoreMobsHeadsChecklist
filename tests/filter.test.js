import { describe, expect, it } from 'vitest';
import { matches, parseTerms, viewAllows } from '../js/filter.js';
import { HEADS } from './fixtures.js';

const [bee, , , , zombie] = HEADS;

describe('parseTerms', () => {
  it('découpe sur la virgule et le point-virgule, en minuscules, sans blancs', () => {
    expect(parseTerms(' Wolf, CAT;panda ')).toEqual(['wolf', 'cat', 'panda']);
  });

  it('ignore les termes vides', () => {
    expect(parseTerms(',; , ')).toEqual([]);
    expect(parseTerms('')).toEqual([]);
  });
});

describe('matches', () => {
  it('accepte tout sans terme, même en mode exact', () => {
    expect(matches(bee, [], false)).toBe(true);
    expect(matches(bee, [], true)).toBe(true);
  });

  it('cherche dans le mob, la tête, la condition et le lieu', () => {
    expect(matches(bee, ['bee'], false)).toBe(true);
    expect(matches(bee, ['angry'], false)).toBe(true);
    expect(matches(bee, ['sans nectar'], false)).toBe(true);
    expect(matches(bee, ['prairies'], false)).toBe(true);
    expect(matches(bee, ['cat'], false)).toBe(false);
  });

  it('cherche à travers les séparateurs entre champs', () => {
    expect(matches(bee, ['bee angry bee head énervée'], false)).toBe(true);
    expect(matches(bee, ['head énervée, sans nectar nids'], false)).toBe(true);
    expect(matches(bee, ['beeangry'], false)).toBe(false);
  });

  it('accepte une ligne sans tête ni condition', () => {
    expect(matches(HEADS[1], ['blaze'], false)).toBe(true);
    expect(matches(HEADS[1], ['undefined'], false)).toBe(false);
    expect(matches(zombie, ['zombie  creeper'], false)).toBe(true);
    expect(matches(zombie, ['null'], false)).toBe(false);
  });

  it('accepte si un seul des termes correspond', () => {
    expect(matches(bee, ['cat', 'bee'], false)).toBe(true);
  });

  it('en mode exact, compare au nom entier du mob ou de la tête', () => {
    expect(matches(bee, ['bee'], true)).toBe(true);
    expect(matches(bee, ['angry bee head'], true)).toBe(true);
    expect(matches(bee, ['angry'], true)).toBe(false);
    expect(matches(bee, ['prairies'], true)).toBe(false);
  });

  it('en mode exact, un seul terme qui correspond suffit', () => {
    expect(matches(bee, ['bee', 'zzz'], true)).toBe(true);
    expect(matches(bee, ['zzz', 'angry bee head'], true)).toBe(true);
  });

  it('en mode exact, une ligne sans tête ne correspond que par son mob', () => {
    expect(matches(zombie, ['zombie'], true)).toBe(true);
    expect(matches(zombie, ['null'], true)).toBe(false);
    expect(matches(zombie, ['undefined'], true)).toBe(false);
  });
});

describe('viewAllows', () => {
  it('filtre selon la vue', () => {
    expect(viewAllows('all', true)).toBe(true);
    expect(viewAllows('all', false)).toBe(true);
    expect(viewAllows('owned', true)).toBe(true);
    expect(viewAllows('owned', false)).toBe(false);
    expect(viewAllows('missing', true)).toBe(false);
    expect(viewAllows('missing', false)).toBe(true);
  });
});
