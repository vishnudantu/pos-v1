import * as React from 'react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  trend?: string | number
  trendLabel?: string
  trendType?: 'up' | 'down' | 'neutral'
  className?: string
  color?: string
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, trendType = 'neutral', className, color }: StatCardProps) {
  const trendColor = trendType === 'up' ? 'text-success' : trendType === 'down' ? 'text-danger' : 'text-muted-foreground'

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:bg-card',
      className
    )}>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {(trend !== undefined || trendLabel) && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cn('text-xs font-semibold', trendColor)}>{trend !== undefined && `${trend}`}</span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: color ? `${color}15` : 'hsl(var(--primary) / 0.1)', color: color || 'hsl(var(--primary))' }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}
