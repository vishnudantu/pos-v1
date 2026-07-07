import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from './Card'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  className?: string
}

export function StatCard({ label, value, delta, deltaLabel, icon: Icon, className }: StatCardProps) {
  const positive = delta !== undefined && delta >= 0
  const negative = delta !== undefined && delta < 0

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h4 className="mt-1 text-2xl font-semibold tracking-tight">{value}</h4>
            {delta !== undefined && (
              <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', positive ? 'text-success' : 'text-danger')}>
                {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>
                  {Math.abs(delta)}% {deltaLabel}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-md bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
