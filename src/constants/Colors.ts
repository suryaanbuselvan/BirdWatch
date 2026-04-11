export type ThemeColors = {
  background: string;
  surface: string;
  surfaceGlass: string;
  glassStroke: string;
  primary: string;
  primaryGradient: [string, string];
  accentTeal: string;
  glowPurple: string;
  text: string;
  textMuted: string;
  border: string;
  cardShadow: string;
  success: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  error: string;
};

export const Colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.65)',
    glassStroke: 'rgba(255, 255, 255, 0.3)',
    primary: '#059669',
    primaryGradient: ['#10B981', '#059669'] as [string, string],
    accentTeal: '#0EA5E9',
    glowPurple: '#A855F7',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    cardShadow: 'rgba(5, 150, 105, 0.1)',
    success: '#10B981',
    tabBar: '#FFFFFF',
    tabBarActive: '#059669',
    tabBarInactive: '#94A3B8',
    error: '#EF4444',
  } as ThemeColors,
  
  dark: {
    background: '#020617',
    surface: '#0F172A',
    surfaceGlass: 'rgba(15, 23, 42, 0.4)',
    glassStroke: 'rgba(255, 255, 255, 0.1)',
    primary: '#10B981',
    primaryGradient: ['#34D399', '#059669'] as [string, string],
    accentTeal: '#38BDF8',
    glowPurple: '#C084FC',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#1E293B',
    cardShadow: 'rgba(16, 185, 129, 0.4)',
    success: '#10B981',
    tabBar: '#020617',
    tabBarActive: '#10B981',
    tabBarInactive: '#475569',
    error: '#F87171',
  } as ThemeColors,
};
