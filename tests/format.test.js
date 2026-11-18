import { describe, expect, it } from 'vitest';
import { NBSP, formatPercent, summary, tier } from '../js/format.js';
import { DATA } from './fixtures.js';

describe('formatPercent', () => {
  it('écrit un entier sans décimale, avec une espace insécable avant %', () => {
    expect(formatPercent(0.2)).toBe('20 %');
    expect(formatPercent(1)).toBe('100 %');
  });

  it('utilise la virgule française et garde deux décimales au plus', () => {
    expect(formatPercent(0.115)).toBe('11,5 %');
    expect(formatPercent(0.0053)).toBe('0,53 %');
    expect(formatPercent(0.212)).toBe('21,2 %');
    expect(formatPercent(0.12345)).toBe('12,35 %');
  });

  it("l'espace est insécable", () => {
    expect(NBSP).toBe(' ');
  });
});

describe('tier', () => {
  it('classe les taux par paliers', () => {
    expect(tier(1)).toBe('sure');
    expect(tier(0.999)).toBe('high');
    expect(tier(0.2)).toBe('high');
    expect(tier(0.199)).toBe('mid');
    expect(tier(0.05)).toBe('mid');
    expect(tier(0.049)).toBe('low');
    expect(tier(0)).toBe('low');
  });
});

describe('summary', () => {
  it('déduit les décomptes des données', () => {
    expect(summary(DATA)).toBe(
      '4 têtes sur 4 mobs gérés, plus 1 mobs non gérés par le pack (taux n/a)' +
        ' · données lues dans le datapack More Mob Heads v2.20.1' +
        ' (MC 26.3, overlay 107.1 inclus)',
    );
  });

  it('compte une fois un mob qui a plusieurs têtes', () => {
    const heads = [
      { mob: 'Bee', rate: { base: 1 } },
      { mob: 'Bee', rate: { base: 1 } },
      { mob: 'Cat', rate: { base: 1 } },
    ];
    expect(summary({ datapack: DATA.datapack, heads })).toContain(
      '3 têtes sur 2 mobs gérés, plus 0 mobs non gérés',
    );
  });
});
