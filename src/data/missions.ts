export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredBirdIds: string[];
  xpReward: number;
}

export const MISSIONS: Mission[] = [
  {
    id: 'urban_gardeners',
    title: 'Backyard Trio',
    description: 'Find these common visitors: Blue Jay, Northern Cardinal, and American Robin.',
    icon: '🏡',
    requiredBirdIds: ['b1', 'b2', 'b9'],
    xpReward: 800,
  },
  {
    id: 'raptor_hunter',
    title: 'Vanguard of the Skies',
    description: 'Spot three different birds of prey: Bald Eagle, Red-tailed Hawk, and Osprey.',
    icon: '🦅',
    requiredBirdIds: ['b4', 'b7', 'b14'],
    xpReward: 3000,
  },
  {
    id: 'arctic_expedition',
    title: 'Frostbound Seeker',
    description: 'Discover the legendary Snowy Owl.',
    icon: '❄️',
    requiredBirdIds: ['b5'],
    xpReward: 5000,
  },
  {
    id: 'water_watchers',
    title: 'Serenity Seekers',
    description: 'Find water-loving residents: Mallard Duck and Great Blue Heron.',
    icon: '🛶',
    requiredBirdIds: ['b11', 'b12'],
    xpReward: 1500,
  },
  {
    id: 'speed_demons',
    title: 'Mach Speed',
    description: 'Identify the lightning-fast Peregrine Falcon.',
    icon: '⚡',
    requiredBirdIds: ['b6'],
    xpReward: 6000,
  },
  {
    id: 'tiny_titans',
    title: 'Tiny Titans',
    description: 'Find our smallest friends: Ruby-throated Hummingbird and Black-capped Chickadee.',
    icon: '✨',
    requiredBirdIds: ['b8', 'b15'],
    xpReward: 2000,
  },
  {
    id: 'woodland_workers',
    title: 'Drummers of the Woods',
    description: 'Locate the elusive Pileated Woodpecker.',
    icon: '🪵',
    requiredBirdIds: ['b10'],
    xpReward: 2500,
  },
  {
    id: 'songbird_collection',
    title: 'The Choir',
    description: 'Gather a collection of songsters: Blue Jay, Cardinal, Robin, and Chickadee.',
    icon: '🎶',
    requiredBirdIds: ['b1', 'b2', 'b9', 'b15'],
    xpReward: 2500,
  }
];
