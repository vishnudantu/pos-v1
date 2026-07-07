import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, PanelLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getNavigation } from './navigation'
import { getFounderNavigation } from './founderNavigation'
import { Role } from './types'

interface SidebarProps {
  role: Role
  activePolitician?: { full_name?: string; display_name?: string; color_primary?: string | null } | null
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  opsMode?: boolean
  onEnterOpsMode?: (politicianId: string) => void
  onExitOpsMode?: () => void
  onNavigate?: () => void
}

export function Sidebar({
  role,
  activePolitician,
  collapsed,
  setCollapsed,
  opsMode = false,
  onEnterOpsMode,
  onExitOpsMode,
  onNavigate,
}: SidebarProps) {
  const location = useLocation()
  const isFounder = role === 'founder' || role === 'super_admin'

  // In ops mode, show operational nav. For founder admin mode, show founder nav.
  // Non-founders always use their role-based nav.
  const groups = isFounder && !opsMode
    ? getFounderNavigation()
    : getNavigation(role === 'field_worker' ? 'field_worker' : 'politician_admin')

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-card transition-[width] duration-300 ease-in-out h-screen sticky top-0 z-30',
        collapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold text-white"
            style={{ background: activePolitician?.color_primary || 'hsl(var(--primary))' }}
          >
            N
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-semibold tracking-tight">
                  {isFounder && !opsMode ? 'NETHRA · GOD MODE' : 'NETHRA'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5 px-3">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge ? (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t p-3">
        {isFounder && !opsMode && !collapsed && onEnterOpsMode && (
          <div className="space-y-2">
            <p className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">Operations View</p>
            <select
              onChange={(e) => e.target.value && onEnterOpsMode(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              defaultValue=""
            >
              <option value="">View as politician...</option>
              {activePolitician && <option value={activePolitician.id}>{activePolitician.display_name || activePolitician.full_name}</option>}
            </select>
          </div>
        )}

        {isFounder && opsMode && !collapsed && onExitOpsMode && (
          <button
            onClick={onExitOpsMode}
            className="flex w-full items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs font-medium text-warning hover:bg-warning/20"
          >
            <EyeOff className="h-3.5 w-3.5" /> Exit Operations View
          </button>
        )}

        {!collapsed && activePolitician && !isFounder && (
          <div className="rounded-md border bg-background/50 p-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Politician</p>
            <p className="truncate text-xs font-medium">
              {activePolitician.display_name || activePolitician.full_name || 'None selected'}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
