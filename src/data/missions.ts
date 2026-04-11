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
    title: 'Urban Gardeners',
    description: 'Find these common backyard visitors: Blue Jay, Northern Cardinal, and American Goldfinch.',
    icon: '🎯',
    requiredBirdIds: ['b1', 'b2', 'b3'],
    xpReward: 1000,
  },
  {
    id: 'raptor_hunter',
    title: 'Raptor Hunter',
    description: 'Spot a majestic bird of prey.',
    icon: '🦅',
    requiredBirdIds: ['b4'], // Bald Eagle
    xpReward: 2500,
  },
  {
    id: 'arctic_expedition',
    title: 'Arctic Expedition',
    description: 'A true challenge: find the rare Snowy Owl.',
    icon: '❄️',
    requiredBirdIds: ['b5'], // Snowy Owl
    xpReward: 5000,
  }
];
