import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'
import { Role } from './types'

export function AppShell() {
  const { user, allPoliticians, activePolitician, setActivePolitician } = useAuth() as any
  const role = (user?.role || 'staff') as Role
  const [collapsed, setCollapsed] = useState(false)
  const [opsMode, setOpsMode] = useState(false)
  const location = useLocation()

  // Super admin can toggle ops mode; normal users always in ops mode
  const isFounder = role === 'founder' || role === 'super_admin'
  const effectiveOpsMode = isFounder ? opsMode : true

  function enterOpsMode(politicianId: string) {
    const p = allPoliticians?.find((x: any) => String(x.id) === politicianId)
    if (p) setActivePolitician(p)
    setOpsMode(true)
  }

  function exitOpsMode() {
    setOpsMode(false)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        role={role}
        activePolitician={effectiveOpsMode ? activePolitician : undefined}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        opsMode={effectiveOpsMode}
        onEnterOpsMode={isFounder ? enterOpsMode : undefined}
        onExitOpsMode={isFounder ? exitOpsMode : undefined}
      />
      <div className="flex flex-1 flex-col">
        <Header
          role={role}
          user={user}
          activePolitician={effectiveOpsMode ? activePolitician : undefined}
          notifications={3}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="border-b px-6 py-3">
            <Breadcrumbs />
          </div>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
