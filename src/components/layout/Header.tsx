import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-dark-800 bg-dark-950/50 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-dark-100">{title}</h1>
        {subtitle && (
          <p className="text-sm text-dark-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Input
            placeholder="搜索..."
            className="py-2 text-sm"
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-dark-400 hover:text-gold-400 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
