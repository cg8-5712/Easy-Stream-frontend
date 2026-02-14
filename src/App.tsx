import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout'
import {
  LoginPage,
  InitializePage,
  DashboardPage,
  StreamsPage,
  StreamDetailPage,
  LiveViewerPage,
  GuestHomePage,
  RecordingsPage,
  AboutPage,
  TermsPage,
  PrivacyPage
} from '@/pages'
import { useAuthStore } from '@/stores'
import { authService } from '@/services'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const [initialized, setInitialized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查是否已初始化
    const checkInitStatus = async () => {
      try {
        const status = await authService.checkInitStatus()
        setInitialized(status.initialized)
      } catch (error) {
        console.error('Failed to check init status:', error)
        setInitialized(true) // 出错时假设已初始化，避免阻塞
      } finally {
        setLoading(false)
      }
    }

    checkInitStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-dark-400">加载中...</div>
      </div>
    )
  }

  // 如果未初始化，重定向到初始化页面
  if (initialized === false) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/initialize" element={<InitializePage />} />
            <Route path="*" element={<Navigate to="/initialize" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<GuestHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/live/view/:id" element={<LiveViewerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected routes (Admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="streams" element={<StreamsPage />} />
            <Route path="streams/:id" element={<StreamDetailPage />} />
            <Route path="recordings" element={<RecordingsPage />} />
            <Route path="settings" element={<div className="p-8 text-dark-400">设置页面开发中...</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
