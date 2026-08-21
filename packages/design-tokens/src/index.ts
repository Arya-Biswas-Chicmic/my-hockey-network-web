export const colors = {
  primary: '#1D61D1',
  heading: '#0F172A',
  muted: '#64748B',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  error: '#DC2626',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radii = { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, pill: 9999 } as const;

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  sizes: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 40 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;

export const shadows = {
  card: '0 4px 12px rgba(11, 102, 194, 0.15)',
  button: '0 4px 12px rgba(11, 102, 194, 0.2)',
  modal: '0 20px 40px rgba(0, 0, 0, 0.12)',
} as const;
