import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  Eye,
  Clock,
  Lock,
  Play,
  Users,
  ArrowRight,
  Search,
} from 'lucide-react'
import { Card, Button, Input, Modal } from '@/components/ui'
import { streamService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import type { Stream } from '@/types'

export function GuestHomePage() {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [streamKey, setStreamKey] = useState('')
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [verifiedStream, setVerifiedStream] = useState<Stream | null>(null)

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        // 获取正在直播的公开直播
        const data = await streamService.getStreams({
          status: 'pushing',
          visibility: 'public',
        })
        setLiveStreams(data.streams)
      } catch (error) {
        console.error('Failed to fetch live streams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveStreams()
    const interval = setInterval(fetchLiveStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleVerifyPassword = async () => {
    if (!streamKey.trim() || !password.trim()) {
      setVerifyError('请输入直播密钥和密码')
      return
    }

    setVerifying(true)
    setVerifyError('')

    try {
      const result = await streamService.verifyPassword(streamKey.trim(), { password })
      // 验证成功，获取直播信息
      const stream = await streamService.getStreamByKey(streamKey.trim(), result.token)
      setVerifiedStream(stream)
      // 保存 token 到 sessionStorage
      sessionStorage.setItem(`stream_token_${streamKey.trim()}`, result.token)
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 401) {
        setVerifyError('密码错误')
      } else if (err.response?.status === 404) {
        setVerifyError('直播不存在')
      } else {
        setVerifyError('验证失败，请稍后重试')
      }
    } finally {
      setVerifying(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setStreamKey('')
    setPassword('')
    setVerifyError('')
    setVerifiedStream(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800/50 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
                <Radio className="w-5 h-5 text-dark-900" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gold-gradient">Easy Stream</h1>
                <p className="text-xs text-dark-500">直播平台</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                私有直播
              </Button>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  管理员登录
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-100 mb-4">
            正在直播
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            观看精彩的直播内容，或使用密码访问私有直播
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-lg font-medium text-dark-200">{liveStreams.length}</span>
            <span>个直播进行中</span>
          </div>
          <div className="flex items-center gap-2 text-dark-400">
            <Users className="w-4 h-4" />
            <span className="text-lg font-medium text-dark-200">
              {formatNumber(liveStreams.reduce((sum, s) => sum + s.current_viewers, 0))}
            </span>
            <span>人正在观看</span>
          </div>
        </div>

        {/* Live Streams Grid */}
        {liveStreams.length === 0 ? (
          <Card className="text-center py-16">
            <Radio className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-dark-300 mb-2">暂无直播</h3>
            <p className="text-dark-500 mb-6">当前没有正在进行的公开直播</p>
            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
              <Lock className="w-4 h-4 mr-2" />
              访问私有直播
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <Link
                key={stream.id}
                to={`/live/${stream.stream_key}`}
                className="group"
              >
                <Card hover className="h-full transition-all duration-300 group-hover:border-gold-500/50">
                  {/* Thumbnail placeholder */}
                  <div className="relative aspect-video bg-dark-800 rounded-lg mb-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                        <Play className="w-8 h-8 text-dark-400 group-hover:text-gold-400 transition-colors" />
                      </div>
                    </div>
                    {/* Live badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/90 text-white text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      直播中
                    </div>
                    {/* Viewers */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-dark-900/80 text-dark-200 text-xs">
                      <Eye className="w-3 h-3" />
                      {formatNumber(stream.current_viewers)}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-medium text-dark-100 mb-1 line-clamp-2 group-hover:text-gold-400 transition-colors">
                      {stream.name}
                    </h3>
                    <p className="text-sm text-dark-500 mb-3">{stream.streamer_name}</p>
                    <div className="flex items-center gap-4 text-xs text-dark-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(stream.actual_start_time)}
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-dark-500">点击观看</span>
                    <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between text-sm text-dark-500">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-gold-500" />
              <span>Easy Stream</span>
            </div>
            <p>Powered by Easy Stream Platform</p>
          </div>
        </div>
      </footer>

      {/* Password Verification Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="访问私有直播"
        size="sm"
      >
        {verifiedStream ? (
          // 验证成功，显示直播信息
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm mb-2">验证成功</p>
              <h3 className="font-medium text-dark-100">{verifiedStream.name}</h3>
              <p className="text-sm text-dark-400 mt-1">{verifiedStream.streamer_name}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">状态</span>
                <span className={verifiedStream.status === 'pushing' ? 'text-red-400' : 'text-dark-400'}>
                  {verifiedStream.status === 'pushing' ? '直播中' : verifiedStream.status === 'idle' ? '待开始' : '已结束'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">预计开始</span>
                <span className="text-dark-300">{formatDate(verifiedStream.scheduled_start_time)}</span>
              </div>
              {verifiedStream.description && (
                <div className="pt-2 border-t border-dark-700">
                  <p className="text-dark-500 mb-1">简介</p>
                  <p className="text-dark-300">{verifiedStream.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={closePasswordModal} className="flex-1">
                关闭
              </Button>
              <Link to={`/live/${verifiedStream.stream_key}`} className="flex-1">
                <Button variant="gold" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  {verifiedStream.status === 'pushing' ? '观看直播' : '进入直播间'}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // 输入密钥和密码
          <div className="space-y-4">
            <p className="text-sm text-dark-400">
              输入直播密钥和密码以访问私有直播
            </p>

            <Input
              label="直播密钥"
              placeholder="请输入直播密钥"
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />

            <Input
              label="访问密码"
              type="password"
              placeholder="请输入访问密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={verifyError}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={closePasswordModal} className="flex-1">
                取消
              </Button>
              <Button
                variant="gold"
                onClick={handleVerifyPassword}
                loading={verifying}
                className="flex-1"
              >
                验证
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
