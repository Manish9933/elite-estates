export const Theme = {
  colors: {
    primary: '#D4AF37', // Gold
    secondary: '#B88A44', // Bronze/Dark Gold
    background: '#050505', // Deep Black
    surface: '#0D0D0D', // Near Black
    surfaceLight: '#1A1A1A', // Dark Gray
    text: '#FFFFFF', 
    textMuted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.08)',
    error: '#EF4444',
    success: '#10B981',
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    gold: '#D4AF37',
    goldGradient: ['#D4AF37', '#B88A44', '#E0AA3E', '#D4AF37'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  }
};
