import { forwardRef } from 'react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: React.ReactNode; }

export default forwardRef<HTMLInputElement, PremiumInputProps>(function PremiumInput({ label, error, icon, className = '', style, ...props }, ref) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: '#8899bb', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">{icon}</div>}
        <input ref={ref} className={`w-full nethra-focus-ring ${icon ? 'pl-10' : 'px-4'} py-3 rounded-nethra-sm bg-white/[0.06] border border-white/10 text-content placeholder:text-content-tertiary text-sm`} style={{ outline: 'none', ...style }} {...props} />
      </div>
      {error && <div className="text-nethra-red text-xs mt-1.5">{error}</div>}
    </div>
  );
});
