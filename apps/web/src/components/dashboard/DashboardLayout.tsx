import { ReactNode } from 'react'
import { Loading } from '../primitives/Loading'

interface DashboardLayoutProps {
  title: string
  subtitle: string
  badge?: string
  actions?: ReactNode
  stats?: ReactNode
  children: ReactNode
  loading?: boolean
}

export function DashboardLayout({ title, subtitle, badge, actions, stats, children, loading }: DashboardLayoutProps) {
  if (loading) return <Loading text="Loading command center..." />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {badge && <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{badge}</span>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {children}
      </div>
    </div>
  )
}
