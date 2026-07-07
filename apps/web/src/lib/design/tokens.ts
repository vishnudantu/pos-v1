export const tokens = {
  colors: {
    background: '#09090b',
    surface: '#0f0f11',
    elevated: '#18181b',
    hover: 'rgba(255,255,255,0.04)',
    active: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text: '#fafafa',
    muted: '#a1a1aa',
    placeholder: '#71717a',
    accent: '#22d3ee',
    accentSoft: 'rgba(34,211,238,0.12)',
    success: '#10b981',
    successSoft: 'rgba(16,185,129,0.12)',
    warning: '#f59e0b',
    warningSoft: 'rgba(245,158,11,0.12)',
    error: '#f43f5e',
    errorSoft: 'rgba(244,63,94,0.12)',
    info: '#60a5fa',
  },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, full: 9999 },
  font: {
    family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace",
    size: { xs: 11, sm: 12, md: 14, lg: 16, xl: 20, '2xl': 24, '3xl': 30 },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.4)',
    lg: '0 10px 15px rgba(0,0,0,0.5)',
    glow: '0 8px 32px rgba(34,211,238,0.25)',
  },
  transition: { fast: 'all 0.15s ease', normal: 'all 0.2s ease', slow: 'all 0.35s ease' },
};

export function c(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
