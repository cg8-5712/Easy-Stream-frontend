import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  Home,
  LogOut,
  Tv,
  Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores'

const navigation = [
  { name: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '直播管理', href: '/admin/streams', icon: Radio },
  { name: '回放管理', href: '/admin/recordings', icon: Film },
  { name: '返回首页', href: '/', icon: Home },
]

export function Sidebar() {
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900/50 backdrop-blur-xl border-r border-dark-800 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-dark-800">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
            <Tv className="w-5 h-5 text-dark-950" />
          </div>
          <span className="text-xl font-serif font-semibold text-gold-gradient">
            Easy Stream
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-gold-400')} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 flex items-center justify-center">
            <span className="text-gold-400 font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-200 truncate">
              {user?.real_name || user?.username || '管理员'}
            </p>
            <p className="text-xs text-dark-500 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-dark-500 hover:text-red-400 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
