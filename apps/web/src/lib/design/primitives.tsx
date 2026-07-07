import React from 'react';
import { tokens } from './tokens';

const { colors, radius, font, space } = tokens;

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={className} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.lg, ...style }}>{children}</div>
);

export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={className} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.xl, padding: space[6], ...style }}>{children}</div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: space[3] }}>{children}</div>
);

export const Button: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; style?: React.CSSProperties } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, variant = 'secondary', style, ...props }) => {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space[2], borderRadius: radius.md, padding: `${space[3]}px ${space[4]}px`, fontSize: font.size.sm, fontWeight: font.weight.medium, fontFamily: font.family, cursor: 'pointer', transition: tokens.transition.normal, border: 'none' };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: colors.accent, color: '#000', ...style },
    secondary: { background: colors.elevated, color: colors.text, border: `1px solid ${colors.border}`, ...style },
    ghost: { background: 'transparent', color: colors.muted, ...style },
  };
  return <button {...props} style={{ ...base, ...variants[variant] }}>{children}</button>;
};

export const Badge: React.FC<{ children: React.ReactNode; tone?: 'accent' | 'success' | 'warning' | 'error' | 'muted'; style?: React.CSSProperties }> = ({ children, tone = 'muted', style }) => {
  const map = { accent: [colors.accent, colors.accentSoft], success: [colors.success, colors.successSoft], warning: [colors.warning, colors.warningSoft], error: [colors.error, colors.errorSoft], muted: [colors.muted, colors.hover] };
  const [color, bg] = map[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: space[1], padding: `${space[1]}px ${space[3]}px`, borderRadius: radius.sm, fontSize: font.size.xs, fontWeight: font.weight.semibold, color, background: bg, ...style }}>{children}</span>;
};
