export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const BADGES: Badge[] = [
  {
    id: 'first_scan',
    title: 'First Discovery',
    description: 'Scanned your very first bird.',
    icon: '🐣',
  },
  {
    id: 'three_streak',
    title: 'On Fire!',
    description: 'Maintained a 3-day scanning streak.',
    icon: '🔥',
  },
  {
    id: 'collector_10',
    title: 'Avid Birder',
    description: 'Collected 10 unique birds.',
    icon: '🏆',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Scanned a bird late at night.',
    icon: '🦉',
  },
  {
    id: 'rare_find',
    title: 'Rare Find',
    description: 'Found a bird with "Rare" rarity level.',
    icon: '✨',
  }
];
