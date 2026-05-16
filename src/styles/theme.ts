export const Theme = {
  colors: {
    primary: '#6366F1', // Indigo
    secondary: '#10B981', // Emerald
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceLight: '#334155', // Slate 700
    text: '#F8FAFC', // Slate 50
    textMuted: '#94A3B8', // Slate 400
    border: '#334155',
    error: '#EF4444',
    success: '#10B981',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    gold: '#D4AF37',
    goldGradient: ['#F9F295', '#E0AA3E', '#B88A44', '#D4AF37'] as const,
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
