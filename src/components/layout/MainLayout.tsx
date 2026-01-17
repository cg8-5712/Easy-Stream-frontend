import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
