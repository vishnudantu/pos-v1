import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../lib/auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'
import { Role } from './types'

export function AppShell() {
  const { user, activePolitician } = useAuth() as any
  const role = (user?.role || 'staff') as Role
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        role={role}
        activePolitician={activePolitician}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex flex-1 flex-col">
        <Header
          role={role}
          user={user}
          activePolitician={activePolitician}
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
