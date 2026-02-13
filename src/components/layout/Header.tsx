interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-dark-800 bg-dark-950/50 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-dark-100">{title}</h1>
        {subtitle && (
          <p className="text-sm text-dark-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
