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

export const BURD_DATABASE: Bird[] = [
  {
    id: 'b1',
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    rarity: 'Common',
    description: 'The Blue Jay is a songbird commonly found in North America. Known for its distinct blue and white plumage and loud call, it is highly intelligent and adaptable.',
    length: '22-30 cm',
    weight: '70-100 g',
    imageUrl: 'https://images.unsplash.com/photo-1614704388656-654ced3b3206?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b2',
    name: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    rarity: 'Common',
    description: 'The Northern Cardinal is a vibrant red bird famous for its beautiful song and prominent crest. Males possess the bright red color while females are a softer reddish-brown.',
    length: '21-23 cm',
    weight: '42-48 g',
    imageUrl: 'https://images.unsplash.com/photo-1549479901-ec069f257a07?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b3',
    name: 'American Goldfinch',
    scientificName: 'Spinus tristis',
    rarity: 'Uncommon',
    description: 'A small North American finch known for its striking bright yellow summer plumage in males. They are strict vegetarians and often flock to bird feeders.',
    length: '11-14 cm',
    weight: '11-20 g',
    imageUrl: 'https://images.unsplash.com/photo-1596704179374-32c943187c93?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b4',
    name: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    rarity: 'Rare',
    description: 'The majestic national bird of the United States. A sea eagle characterized by its white head, brown body, and massive wingspan. They primarily feed on fish.',
    length: '70-102 cm',
    weight: '3-6.3 kg',
    imageUrl: 'https://images.unsplash.com/photo-1611082522728-6878b30d3215?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b5',
    name: 'Snowy Owl',
    scientificName: 'Bubo scandiacus',
    rarity: 'Legendary',
    description: 'A large, powerful owl of the high Arctic tundra. Unlike most owls, they are diurnal, meaning they hunt during the day. Their stunning white plumage provides excellent camouflage in the snow.',
    length: '52-71 cm',
    weight: '1.6-3 kg',
    imageUrl: 'https://images.unsplash.com/photo-1518334460341-15fe2b7ae1ea?auto=format&fit=crop&q=80&w=800',
  }
];

// Helper function to pick a random bird from the DB
export const getRandomBird = (): Bird => {
  const index = Math.floor(Math.random() * BURD_DATABASE.length);
  return BURD_DATABASE[index];
};

export const getBirdById = (id: string): Bird | undefined => {
  return BURD_DATABASE.find(bird => bird.id === id);
};
