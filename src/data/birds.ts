export interface Bird {
  id: string;
  name: string;
  scientificName: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  description: string;
  length: string;
  weight: string;
  imageUrl: string;
}

export const BIRD_DATABASE: Bird[] = [
  {
    id: 'b1',
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    rarity: 'Common',
    description: 'The Blue Jay is a songbird commonly found in North America. Known for its distinct blue and white plumage.',
    length: '22-30 cm',
    weight: '70-100 g',
    imageUrl: 'https://images.unsplash.com/photo-1614704388656-654ced3b3206?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b2',
    name: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    rarity: 'Common',
    description: 'The Northern Cardinal is a vibrant red bird famous for its beautiful song and prominent crest.',
    length: '21-23 cm',
    weight: '42-48 g',
    imageUrl: 'https://images.unsplash.com/photo-1549479901-ec069f257a07?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b3',
    name: 'American Goldfinch',
    scientificName: 'Spinus tristis',
    rarity: 'Uncommon',
    description: 'A small North American finch known for its striking bright yellow summer plumage.',
    length: '11-14 cm',
    weight: '11-20 g',
    imageUrl: 'https://images.unsplash.com/photo-1596704179374-32c943187c93?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b4',
    name: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    rarity: 'Rare',
    description: 'The majestic sea eagle characterized by its white head and brown body.',
    length: '70-102 cm',
    weight: '3-6.3 kg',
    imageUrl: 'https://images.unsplash.com/photo-1611082522728-6878b30d3215?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b5',
    name: 'Snowy Owl',
    scientificName: 'Bubo scandiacus',
    rarity: 'Legendary',
    description: 'A large white owl of the high Arctic tundra. Stunning white plumage.',
    length: '52-71 cm',
    weight: '1.6-3 kg',
    imageUrl: 'https://images.unsplash.com/photo-1518334460341-15fe2b7ae1ea?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b6',
    name: 'Peregrine Falcon',
    scientificName: 'Falco peregrinus',
    rarity: 'Legendary',
    description: 'The fastest bird in the world, capable of reaching speeds over 240 mph.',
    length: '34-58 cm',
    weight: '0.7-1.5 kg',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b7',
    name: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    rarity: 'Rare',
    description: 'One of the largest hawks in North America, identified by its red tail.',
    length: '45-65 cm',
    weight: '0.7-1.6 kg',
    imageUrl: 'https://images.unsplash.com/photo-1506244856291-8172782b1eff?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b8',
    name: 'Ruby-throated Hummingbird',
    scientificName: 'Archilochus colubris',
    rarity: 'Uncommon',
    description: 'A tiny bird known for its iridescent red throat in males.',
    length: '7-9 cm',
    weight: '2-6 g',
    imageUrl: 'https://images.unsplash.com/photo-1512411931351-40b99147517c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b9',
    name: 'American Robin',
    scientificName: 'Turdus migratorius',
    rarity: 'Common',
    description: 'Famous for its reddish-orange breast and beautiful song.',
    length: '23-28 cm',
    weight: '77-85 g',
    imageUrl: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b10',
    name: 'Pileated Woodpecker',
    scientificName: 'Dryocopus pileatus',
    rarity: 'Rare',
    description: 'A large, crow-sized woodpecker with a prominent red crest.',
    length: '40-49 cm',
    weight: '250-400 g',
    imageUrl: 'https://images.unsplash.com/photo-1549479901-ec069f257a07?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b11',
    name: 'Mallard Duck',
    scientificName: 'Anas platyrhynchos',
    rarity: 'Common',
    description: 'A dabbling duck that is probably the most widely recognized of all ducks.',
    length: '50-65 cm',
    weight: '0.7-1.6 kg',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b12',
    name: 'Great Blue Heron',
    scientificName: 'Ardea herodias',
    rarity: 'Uncommon',
    description: 'A large wading bird in the heron family. Found throughout most of North America.',
    length: '91-137 cm',
    weight: '2.1-2.5 kg',
    imageUrl: 'https://images.unsplash.com/photo-1611082522728-6878b30d3215?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b13',
    name: 'Barn Swallow',
    scientificName: 'Hirundo rustica',
    rarity: 'Common',
    description: 'The most widespread species of swallow in the world, with a distinctive forked tail.',
    length: '17-19 cm',
    weight: '16-22 g',
    imageUrl: 'https://images.unsplash.com/photo-1506244856291-8172782b1eff?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b14',
    name: 'Osprey',
    scientificName: 'Pandion haliaetus',
    rarity: 'Rare',
    description: 'A large fish-eating bird of prey with a cosmopolitan range.',
    length: '50-66 cm',
    weight: '0.9-2.1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1518334460341-15fe2b7ae1ea?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b15',
    name: 'Black-capped Chickadee',
    scientificName: 'Poecile atricapillus',
    rarity: 'Common',
    description: 'A small North American songbird with a short neck and large head.',
    length: '12-15 cm',
    weight: '9-14 g',
    imageUrl: 'https://images.unsplash.com/photo-1596704179374-32c943187c93?auto=format&fit=crop&q=80&w=800',
  }
];

export const getRandomBird = (): Bird => {
  const index = Math.floor(Math.random() * BIRD_DATABASE.length);
  return BIRD_DATABASE[index];
};

export const getBirdById = (id: string): Bird | undefined => {
  return BIRD_DATABASE.find(bird => bird.id === id);
};
