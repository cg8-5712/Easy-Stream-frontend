import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tv, User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services'
import { useAuthStore } from '@/stores'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  // 从 location state 获取消息
  const successMessage = (location.state as { message?: string })?.message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(formData)
      setAuth(response.user, response.access_token, response.refresh_token)
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950" />

        {/* Gold accent circles */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-lg">
              <Tv className="w-8 h-8 text-dark-950" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-gold-gradient">
              Easy Stream
            </h1>
          </div>

          <h2 className="text-3xl font-light text-dark-200 mb-4">
            内网低延迟直播系统
          </h2>

          <p className="text-dark-400 text-lg leading-relaxed max-w-md">
            基于 WebRTC 技术，支持多协议推流，实现毫秒级延迟的企业级直播解决方案。
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              '低延迟 WebRTC 分发，延迟 < 200ms',
              '支持 RTMP / RTSP / SRT 多协议推流',
              '实时监控与录制回放',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                <span className="text-dark-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
              <Tv className="w-6 h-6 text-dark-950" />
            </div>
            <span className="text-2xl font-serif font-semibold text-gold-gradient">
              Easy Stream
            </span>
          </div>

          <div className="glass-card p-8 border-gold-glow">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-dark-100 mb-2">
                欢迎回来
              </h2>
              <p className="text-dark-500">
                请登录您的管理员账户
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="用户名"
                placeholder="请输入用户名"
                icon={<User className="w-4 h-4" />}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />

              <div className="relative">
                <Input
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  icon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
              >
                登录
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-dark-600">
            Easy Stream v1.0 · 内网低延迟直播系统
          </p>
        </div>
      </div>
    </div>
  )
}
