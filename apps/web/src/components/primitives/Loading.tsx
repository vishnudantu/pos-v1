import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Loading({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-muted-foreground', className)}>
      <Loader2 className="mb-2 h-8 w-8 animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}
