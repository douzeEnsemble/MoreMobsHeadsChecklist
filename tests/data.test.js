import { describe, expect, it, vi } from 'vitest';
import { loadData } from '../js/data.js';

describe('loadData', () => {
  it('charge data/heads.json', async () => {
    const data = { heads: [] };
    const fetchFn = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => data });
    await expect(loadData(fetchFn)).resolves.toBe(data);
    expect(fetchFn).toHaveBeenCalledWith('data/heads.json');
  });

  it('échoue avec le code HTTP quand le serveur répond une erreur', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(loadData(fetchFn)).rejects.toThrow(
      'Chargement impossible (404)',
    );
  });
});
