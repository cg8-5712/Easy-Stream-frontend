import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tv, User, Lock, Eye, EyeOff, Shield, Database, Server, Zap, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { authService, type InitializeAdminRequest } from '@/services'

type Step = 'admin' | 'database' | 'redis' | 'zlm' | 'server'

export function InitializePage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<InitializeAdminRequest>({
    // 管理员配置
    username: 'admin',
    password: '',
    real_name: '',
    email: '',
    // 数据库配置
    database_type: 'sqlite',
    database_filepath: './easy_stream.db',
    database_host: 'localhost',
    database_port: '5432',
    database_user: 'postgres',
    database_password: '',
    database_name: 'easy_stream',
    database_sslmode: 'disable',
    // Redis 配置
    redis_host: 'localhost',
    redis_port: '6379',
    redis_password: '',
    redis_db: 0,
    // ZLMediaKit 配置
    zlm_host: 'localhost',
    zlm_port: '80',
    zlm_secret: '',
    zlm_hook_base_url: '',
    // JWT 配置
    jwt_secret: '',
    // 服务器配置
    server_host: '0.0.0.0',
    server_port: '8080',
  })

  const [confirmPassword, setConfirmPassword] = useState('')

  const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: 'admin', title: '管理员账号', icon: <User className="w-5 h-5" /> },
    { id: 'database', title: '数据库配置', icon: <Database className="w-5 h-5" /> },
    { id: 'redis', title: 'Redis 配置', icon: <Server className="w-5 h-5" /> },
    { id: 'zlm', title: 'ZLMediaKit', icon: <Zap className="w-5 h-5" /> },
    { id: 'server', title: '服务器配置', icon: <Shield className="w-5 h-5" /> },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const validateCurrentStep = (): boolean => {
    setError('')

    switch (currentStep) {
      case 'admin':
        // 验证管理员信息
        if (!formData.username || formData.username.length < 3) {
          setError('用户名至少需要 3 个字符')
          return false
        }
        if (!formData.real_name) {
          setError('请输入真实姓名')
          return false
        }
        if (!formData.email) {
          setError('请输入邮箱地址')
          return false
        }
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError('邮箱格式不正确')
          return false
        }
        if (!formData.password || formData.password.length < 6) {
          setError('密码长度至少为 6 个字符')
          return false
        }
        if (formData.password !== confirmPassword) {
          setError('两次输入的密码不一致')
          return false
        }
        break

      case 'database':
        // 验证数据库配置
        if (!formData.database_type) {
          setError('请选择数据库类型')
          return false
        }
        if (formData.database_type === 'sqlite') {
          if (!formData.database_filepath) {
            setError('请输入数据库文件路径')
            return false
          }
        } else {
          if (!formData.database_host) {
            setError('请输入数据库主机地址')
            return false
          }
          if (!formData.database_port) {
            setError('请输入数据库端口')
            return false
          }
          if (!formData.database_user) {
            setError('请输入数据库用户名')
            return false
          }
          if (!formData.database_name) {
            setError('请输入数据库名称')
            return false
          }
        }
        break

      case 'redis':
        // 验证 Redis 配置
        if (!formData.redis_host) {
          setError('请输入 Redis 主机地址')
          return false
        }
        if (!formData.redis_port) {
          setError('请输入 Redis 端口')
          return false
        }
        break

      case 'zlm':
        // 验证 ZLMediaKit 配置
        if (!formData.zlm_host) {
          setError('请输入 ZLMediaKit 主机地址')
          return false
        }
        if (!formData.zlm_port) {
          setError('请输入 ZLMediaKit 端口')
          return false
        }
        break

      case 'server':
        // 验证服务器配置
        if (!formData.server_port) {
          setError('请输入服务器端口')
          return false
        }
        break
    }

    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id)
      setError('')
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 最后一步也需要验证
    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)

    try {
      await authService.initializeAdmin(formData)
      // 初始化成功后跳转到登录页
      navigate('/login', {
        state: { message: '系统初始化成功！配置已保存，请重启服务器后登录。' }
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || '初始化失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'admin':
        return (
          <div className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入管理员用户名"
              icon={<User className="w-4 h-4" />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
              maxLength={50}
            />

            <Input
              label="真实姓名"
              placeholder="请输入真实姓名"
              icon={<User className="w-4 h-4" />}
              value={formData.real_name}
              onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
              required
            />

            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              icon={<User className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码（至少 6 个字符）"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="确认密码"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="请再次输入密码"
                icon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">数据库类型</label>
              <select
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:border-gold-500"
                value={formData.database_type}
                onChange={(e) => setFormData({ ...formData, database_type: e.target.value as 'sqlite' | 'postgres' | 'mysql' })}
              >
                <option value="sqlite">SQLite（推荐）</option>
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>

            {formData.database_type === 'sqlite' ? (
              <Input
                label="数据库文件路径"
                placeholder="./easy_stream.db"
                value={formData.database_filepath}
                onChange={(e) => setFormData({ ...formData, database_filepath: e.target.value })}
              />
            ) : (
              <>
                <Input
                  label="主机地址"
                  placeholder="localhost"
                  value={formData.database_host}
                  onChange={(e) => setFormData({ ...formData, database_host: e.target.value })}
                  required
                />
                <Input
                  label="端口"
                  placeholder={formData.database_type === 'postgres' ? '5432' : '3306'}
                  value={formData.database_port}
                  onChange={(e) => setFormData({ ...formData, database_port: e.target.value })}
                  required
                />
                <Input
                  label="用户名"
                  placeholder="postgres"
                  value={formData.database_user}
                  onChange={(e) => setFormData({ ...formData, database_user: e.target.value })}
                  required
                />
                <Input
                  label="密码"
                  type="password"
                  placeholder="数据库密码"
                  value={formData.database_password}
                  onChange={(e) => setFormData({ ...formData, database_password: e.target.value })}
                />
                <Input
                  label="数据库名"
                  placeholder="easy_stream"
                  value={formData.database_name}
                  onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                  required
                />
                {formData.database_type === 'postgres' && (
                  <Input
                    label="SSL 模式"
                    placeholder="disable"
                    value={formData.database_sslmode}
                    onChange={(e) => setFormData({ ...formData, database_sslmode: e.target.value })}
                  />
                )}
              </>
            )}
          </div>
        )

      case 'redis':
        return (
          <div className="space-y-4">
            <Input
              label="主机地址"
              placeholder="localhost"
              value={formData.redis_host}
              onChange={(e) => setFormData({ ...formData, redis_host: e.target.value })}
              required
            />
            <Input
              label="端口"
              placeholder="6379"
              value={formData.redis_port}
              onChange={(e) => setFormData({ ...formData, redis_port: e.target.value })}
              required
            />
            <Input
              label="密码（可选）"
              type="password"
              placeholder="Redis 密码"
              value={formData.redis_password}
              onChange={(e) => setFormData({ ...formData, redis_password: e.target.value })}
            />
            <Input
              label="数据库编号"
              type="number"
              placeholder="0"
              value={formData.redis_db.toString()}
              onChange={(e) => setFormData({ ...formData, redis_db: parseInt(e.target.value) || 0 })}
            />
          </div>
        )

      case 'zlm':
        return (
          <div className="space-y-4">
            <Input
              label="主机地址"
              placeholder="localhost"
              value={formData.zlm_host}
              onChange={(e) => setFormData({ ...formData, zlm_host: e.target.value })}
              required
            />
            <Input
              label="端口"
              placeholder="80"
              value={formData.zlm_port}
              onChange={(e) => setFormData({ ...formData, zlm_port: e.target.value })}
              required
            />
            <Input
              label="Secret（可选）"
              placeholder="ZLMediaKit API Secret"
              value={formData.zlm_secret}
              onChange={(e) => setFormData({ ...formData, zlm_secret: e.target.value })}
            />
            <Input
              label="Hook 回调地址（可选）"
              placeholder="http://localhost:8080/api/v1/hooks"
              value={formData.zlm_hook_base_url}
              onChange={(e) => setFormData({ ...formData, zlm_hook_base_url: e.target.value })}
            />
          </div>
        )

      case 'server':
        return (
          <div className="space-y-4">
            <Input
              label="监听地址"
              placeholder="0.0.0.0"
              value={formData.server_host}
              onChange={(e) => setFormData({ ...formData, server_host: e.target.value })}
            />
            <Input
              label="监听端口"
              placeholder="8080"
              value={formData.server_port}
              onChange={(e) => setFormData({ ...formData, server_port: e.target.value })}
              required
            />
            <Input
              label="JWT Secret（可选，留空自动生成）"
              placeholder="自动生成安全密钥"
              value={formData.jwt_secret}
              onChange={(e) => setFormData({ ...formData, jwt_secret: e.target.value })}
            />
            <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm">
              <p className="font-medium mb-1">提示</p>
              <p>JWT Secret 用于生成访问令牌，留空将自动生成安全密钥。</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left side - Progress */}
      <div className="hidden lg:flex lg:w-1/3 relative overflow-hidden border-r border-dark-800">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950" />

        <div className="relative z-10 flex flex-col p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
              <Tv className="w-6 h-6 text-dark-950" />
            </div>
            <span className="text-xl font-serif font-semibold text-gold-gradient">
              Easy Stream
            </span>
          </div>

          <h2 className="text-2xl font-light text-dark-200 mb-8">
            系统初始化向导
          </h2>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  currentStep === step.id
                    ? 'bg-gold-500/10 border border-gold-500/30'
                    : index < currentStepIndex
                    ? 'bg-dark-800/50 border border-dark-700'
                    : 'bg-dark-900/30 border border-dark-800'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.id
                      ? 'bg-gold-500 text-dark-950'
                      : index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-800 text-dark-500'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : step.icon}
                </div>
                <div>
                  <div className="text-sm text-dark-500">步骤 {index + 1}</div>
                  <div
                    className={`font-medium ${
                      currentStep === step.id
                        ? 'text-gold-400'
                        : index < currentStepIndex
                        ? 'text-green-400'
                        : 'text-dark-400'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
              <Tv className="w-6 h-6 text-dark-950" />
            </div>
            <span className="text-2xl font-serif font-semibold text-gold-gradient">
              Easy Stream
            </span>
          </div>

          <div className="glass-card p-8 border-gold-glow">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-dark-100 mb-2">
                {steps[currentStepIndex].title}
              </h2>
              <p className="text-dark-500">
                步骤 {currentStepIndex + 1} / {steps.length}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6 max-h-[400px] overflow-y-auto pr-2">
                {renderStepContent()}
              </div>

              <div className="flex gap-3">
                {currentStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                )}

                {currentStepIndex < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    下一步
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={loading}
                  >
                    完成初始化
                  </Button>
                )}
              </div>
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
