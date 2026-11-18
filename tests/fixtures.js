// Jeu de données minimal, qui couvre chaque forme de ligne du tableau.
export const HEADS = [
  {
    id: 'bee-angry-bee-head',
    mob: 'Bee',
    head: 'Angry Bee Head',
    image: 'img/heads/bee-angry-bee-head.png',
    condition: { kind: 'variant', text: 'énervée, sans nectar' },
    rate: { base: 0.2, looting: 0.26 },
    places: {
      dimensions: ['overworld', 'end'],
      text: 'Nids naturels : prairies, forêts',
    },
    mating: { possible: true, text: 'Fleurs' },
  },
  {
    id: 'blaze-blaze-head',
    mob: 'Blaze',
    head: 'Blaze Head',
    image: 'img/heads/blaze-blaze-head.png',
    rate: { base: 0.005, looting: 0.0065 },
    places: { dimensions: ['nether'], text: 'Forteresses du Nether' },
  },
  {
    id: 'camel-camel-head',
    mob: 'Camel',
    head: 'Camel Head',
    image: 'img/heads/camel-camel-head.png',
    rate: { base: 1 },
    places: { dimensions: [], text: 'Villages du désert' },
    mating: { possible: false, text: 'Stérile' },
  },
  {
    id: 'rabbit-toast-rabbit-head',
    mob: 'Rabbit',
    head: 'Toast Rabbit Head',
    image: 'img/heads/rabbit-toast-rabbit-head.png',
    condition: { kind: 'name', text: 'lapin nommé « Toast »' },
    rate: { base: 0.05, looting: 0.08 },
    places: { dimensions: ['overworld'], text: 'Déserts, forêts' },
  },
  {
    id: 'zombie',
    mob: 'Zombie',
    head: null,
    condition: { kind: 'charged', text: 'creeper chargé' },
    rate: null,
    places: { dimensions: ['overworld'], text: 'Surface la nuit' },
  },
];

export const DATA = {
  datapack: {
    name: 'More Mob Heads',
    version: '2.20.1',
    minecraft: '26.3',
    overlay: '107.1',
  },
  heads: HEADS,
};
