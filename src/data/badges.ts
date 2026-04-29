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
    description: 'Scanned a bird late at night (10 PM - 4 AM).',
    icon: '🦉',
  },
  {
    id: 'rare_find',
    title: 'Rare Find',
    description: 'Found a bird with "Rare" rarity level.',
    icon: '✨',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Scanned a bird in the early morning (5 AM - 8 AM).',
    icon: '🌅',
  },
  {
    id: 'apex_predator',
    title: 'Apex Predator',
    description: 'Identified a high-level bird of prey.',
    icon: '🦅',
  },
  {
    id: 'songbird_serenade',
    title: 'Songbird Fan',
    description: 'Identified 5 different songbirds.',
    icon: '🎶',
  },
  {
    id: 'legendary_hunter',
    title: 'Mythic Watcher',
    description: 'Captured a Legendary rarity bird.',
    icon: '💎',
  },
  {
    id: 'seven_streak',
    title: 'Week Master',
    description: 'Maintained a 7-day scanning streak.',
    icon: '🏅',
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Birds captured on both Saturday and Sunday.',
    icon: '⚔️',
  },
  {
    id: 'water_watcher',
    title: 'Waterfront Expert',
    description: 'Identified 3 water-based birds.',
    icon: '🌊',
  },
  {
    id: 'collector_20',
    title: 'Centurion',
    description: 'Identified 20 unique birds.',
    icon: '🛡️',
  },
  {
    id: 'fast_reflexes',
    title: 'Quick Eyes',
    description: 'Lightning-fast identification.',
    icon: '⚡',
  },
  {
    id: 'expert_observer',
    title: 'Expert Observer',
    description: 'Reach Level 10.',
    icon: '🧐',
  },
  {
    id: 'master_birder',
    title: 'Master Birder',
    description: 'Reach Level 25.',
    icon: '👑',
  }
];
