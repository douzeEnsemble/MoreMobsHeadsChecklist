import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { DATA } from './fixtures.js';

describe('main', () => {
  it('démarre l’application sur la page avec fetch et localStorage', async () => {
    document.documentElement.innerHTML = readFileSync('index.html', 'utf8');
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => DATA });
    vi.stubGlobal('fetch', fetchSpy);
    HTMLDialogElement.prototype.showModal = vi.fn();
    await import('../js/main.js');
    await vi.waitFor(() =>
      expect(document.querySelectorAll('#rows tr')).toHaveLength(5),
    );
    expect(fetchSpy).toHaveBeenCalledWith('data/heads.json');
    document.getElementById('theme').click();
    expect(localStorage.getItem('mmh-theme')).toBe('light');
  });
});
