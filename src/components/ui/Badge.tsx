import { cn } from '@/lib/utils'
import type { StreamStatus } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'live' | 'idle' | 'ended' | 'success' | 'warning'
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = 'default', className, dot = false }: BadgeProps) {
  const variants = {
    default: 'bg-dark-700/50 text-dark-300 border-dark-600',
    live: 'badge-live',
    idle: 'badge-idle',
    ended: 'badge-ended',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'live' && 'bg-red-400 animate-pulse',
            variant === 'idle' && 'bg-dark-400',
            variant === 'ended' && 'bg-dark-500',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'default' && 'bg-dark-400'
          )}
        />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: StreamStatus }) {
  const statusConfig = {
    pushing: { label: '直播中', variant: 'live' as const },
    idle: { label: '待开始', variant: 'idle' as const },
    ended: { label: '已结束', variant: 'ended' as const },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  )
}
