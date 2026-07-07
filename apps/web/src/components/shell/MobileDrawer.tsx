import { Link, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { getNavigation } from './navigation'
import { Role } from './types'

interface MobileDrawerProps {
  open: boolean
  setOpen: (v: boolean) => void
  role: Role
  activePolitician?: { full_name?: string; display_name?: string } | null
}

export function MobileDrawer({ open, setOpen, role, activePolitician }: MobileDrawerProps) {
  const location = useLocation()
  const groups = getNavigation(role)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[280px] bg-card shadow-2xl outline-none">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="font-semibold tracking-tight">NETHRA</span>
            <Dialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="h-[calc(100vh-3.5rem)] overflow-y-auto py-4">
            {groups.map((group) => (
              <div key={group.label} className="mb-5 px-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = location.pathname === item.to
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                            active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
            {activePolitician && (
              <div className="mx-4 rounded-md border bg-background p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Active Politician</p>
                <p className="truncate text-xs font-medium">{activePolitician.display_name || activePolitician.full_name}</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
