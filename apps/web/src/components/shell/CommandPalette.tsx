import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Command, Search, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getNavigation } from './navigation'
import { Role } from './types'

interface CommandPaletteProps {
  open: boolean
  setOpen: (v: boolean) => void
  role: Role
}

export function CommandPalette({ open, setOpen, role }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const groups = getNavigation(role)

  const items = useMemo(() => {
    const flat = groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
    if (!query.trim()) return flat
    return flat.filter(
      (i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.group.toLowerCase().includes(query.toLowerCase())
    )
  }, [groups, query])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const run = (to: string) => {
    navigate(to)
    setOpen(false)
    setQuery('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[20%] z-50 w-[90vw] max-w-xl -translate-x-1/2 rounded-lg border bg-card p-0 shadow-2xl outline-none">
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, pages, actions..."
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Command className="h-3 w-3" />K
            </div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {items.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No results found.</div>
            )}
            {items.map((item) => (
              <button
                key={item.to}
                onClick={() => run(item.to)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
