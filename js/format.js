const percentFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

// Espace insécable avant le « % » (typographie française) : le taux ne se coupe jamais en fin de ligne.
export const NBSP = ' ';

export function formatPercent(fraction) {
  return `${percentFormat.format(fraction * 100)}${NBSP}%`;
}

// Palier d'un taux, qui pilote la couleur ; le chiffre reste toujours affiché
// (la couleur ne porte jamais l'information seule, A11Y-05).
export function tier(fraction) {
  if (fraction >= 1) return 'sure';
  if (fraction >= 0.2) return 'high';
  if (fraction >= 0.05) return 'mid';
  return 'low';
}

// Phrase de sous-titre : les décomptes se déduisent des données, jamais écrits à la main.
export function summary({ datapack, heads }) {
  const managed = heads.filter((head) => head.rate);
  const mobs = new Set(managed.map((head) => head.mob));
  const unmanaged = heads.length - managed.length;
  return (
    `${managed.length} têtes sur ${mobs.size} mobs gérés, plus ${unmanaged} mobs non gérés par le pack (taux n/a)` +
    ` · données lues dans le datapack ${datapack.name} v${datapack.version}` +
    ` (MC ${datapack.minecraft}, overlay ${datapack.overlay} inclus)`
  );
}
