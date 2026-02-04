import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout'
import { LoginPage, DashboardPage, StreamsPage, StreamDetailPage, LiveViewerPage, GuestHomePage, RecordingsPage } from '@/pages'
import { useAuthStore } from '@/stores'

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<GuestHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/live/view/:id" element={<LiveViewerPage />} />

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
