import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '../primitives/Button'
import { useTheme } from '../../lib/theme'
import { MobileDrawer } from './MobileDrawer'
import { CommandPalette } from './CommandPalette'
import { Role } from './types'

interface HeaderProps {
  role: Role
  user?: { display_name?: string; email?: string; role?: string } | null
  activePolitician?: { full_name?: string; display_name?: string; color_primary?: string | null } | null
  notifications?: number
  onMenuClick?: () => void
}

export function Header({ role, user, activePolitician, notifications = 0, onMenuClick }: HeaderProps) {
  const { resolved, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick || (() => setMobileOpen(true))}
            className="mr-1 rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCmdOpen(true)}
            className="hidden items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-2 rounded border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            )}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-md p-1.5 text-sm font-medium hover:bg-accent">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: activePolitician?.color_primary || 'hsl(var(--primary))' }}
                >
                  {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden max-w-[120px] truncate md:inline">{user?.display_name || user?.email}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:inline" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              >
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email}</div>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                >
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                  className="cursor-pointer rounded-sm px-2 py-1.5 text-sm text-danger outline-none hover:bg-danger/10"
                >
                  <LogOut className="mr-2 inline h-3.5 w-3.5" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} setOpen={setMobileOpen} role={role} activePolitician={activePolitician} />
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} role={role} />
    </>
  )
}
