import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Clock,
  Activity,
  Radio,
  Lock,
  Eye,
  TrendingUp,
  Calendar,
  User,
  Phone,
  ExternalLink,
} from 'lucide-react'
import { Button, Card, Input, StatusBadge, Badge, Modal } from '@/components/ui'
import { streamService, shareLinkService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import type { StreamView } from '@/types'

export function LiveViewerPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [stream, setStream] = useState<StreamView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareCodeModal, setShowShareCodeModal] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const fetchStream = async (token?: string) => {
    if (!id) return

    try {
      const data = await streamService.getStreamViewById(parseInt(id), token || accessToken || undefined)
      setStream(data)
      setError(null)
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } }
      if (error.response?.status === 403) {
        setShowShareCodeModal(true)
        setError('此直播需要分享码访问')
      } else if (error.response?.status === 404) {
        setError('直播不存在')
      } else {
        setError('加载失败')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle share link token from URL or access_token
  useEffect(() => {
    const shareToken = searchParams.get('share_token')
    const urlAccessToken = searchParams.get('access_token')

    if (urlAccessToken) {
      // Use access_token from URL directly
      setAccessToken(urlAccessToken)
      fetchStream(urlAccessToken)
    } else if (shareToken) {
      // Verify share link and get access token
      shareLinkService.verifyShareLink(shareToken)
        .then((result) => {
          setAccessToken(result.access_token)
          fetchStream(result.access_token)
        })
        .catch(() => {
          setError('分享链接无效或已过期')
          setLoading(false)
        })
    } else {
      fetchStream()
    }
  }, [id, searchParams])

  // Refresh stream data periodically
  useEffect(() => {
    if (!accessToken && !searchParams.get('share_token')) return
    const interval = setInterval(() => fetchStream(), 10000)
    return () => clearInterval(interval)
  }, [id, accessToken])

  const handleShareCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareCode.trim()) return

    try {
      const result = await streamService.verifyShareCode({ share_code: shareCode.trim() })
      setAccessToken(result.access_token)
      setShowShareCodeModal(false)
      setShareCode('')
      setError(null)
      // Navigate to the stream with access token
      navigate(`/live/view/${result.stream_id}?access_token=${result.access_token}`)
    } catch {
      setError('分享码无效')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (error && !showShareCodeModal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-200 mb-2">{error}</h2>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-dark-100">
              {stream?.name || '直播'}
            </h1>
            <p className="text-sm text-dark-500">{stream?.streamer_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {stream && <StatusBadge status={stream.status} />}
          {stream?.visibility === 'private' && (
            <Badge variant="warning">
              <Lock className="w-3 h-3 mr-1" />
              私有
            </Badge>
          )}
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden p-0">
              <div className="aspect-video bg-dark-900 relative">
                {stream?.status === 'pushing' ? (
                  <>
                    {/* WebRTC Player placeholder - integrate with actual player */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Radio className="w-16 h-16 text-gold-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-dark-300 mb-2">直播进行中</p>
                        <p className="text-sm text-dark-500">
                          请使用播放器观看直播
                        </p>
                      </div>
                    </div>

                    {/* Live indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    {/* Viewer count */}
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-dark-900/80 text-dark-200 backdrop-blur-sm">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(stream?.current_viewers || 0)}
                      </span>
                    </div>
                  </>
                ) : stream?.status === 'idle' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                      <p className="text-xl text-dark-200 mb-2">直播即将开始</p>
                      <p className="text-dark-500">
                        预计开始时间: {formatDate(stream.scheduled_start_time)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Radio className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                      <p className="text-xl text-dark-400 mb-2">直播已结束</p>
                      {stream?.record_files && stream.record_files.length > 0 && (
                        <Button variant="outline" size="sm" className="mt-4">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          查看回放
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Stream info bar */}
              <div className="p-4 border-t border-dark-800 bg-dark-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-dark-400">
                    {stream?.protocol && (
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        {stream.protocol.toUpperCase()}
                      </span>
                    )}
                    {stream?.bitrate ? (
                      <span>{stream.bitrate} kbps</span>
                    ) : null}
                    {stream?.fps ? (
                      <span>{stream.fps} fps</span>
                    ) : null}
                  </div>

                  {stream?.record_enabled && (
                    <Badge variant="success" dot>
                      录制中
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            {stream?.description && (
              <Card className="mt-6">
                <h3 className="text-sm font-medium text-dark-400 mb-2">直播简介</h3>
                <p className="text-dark-200">{stream.description}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">观看数据</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-dark-400">
                    <Eye className="w-4 h-4" />
                    当前观看
                  </span>
                  <span className="text-xl font-semibold text-dark-100">
                    {formatNumber(stream?.current_viewers || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-dark-400">
                    <Users className="w-4 h-4" />
                    累计观看
                  </span>
                  <span className="text-xl font-semibold text-dark-100">
                    {formatNumber(stream?.total_viewers || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-dark-400">
                    <TrendingUp className="w-4 h-4" />
                    峰值观看
                  </span>
                  <span className="text-xl font-semibold text-dark-100">
                    {formatNumber(stream?.peak_viewers || 0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stream Info */}
            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">直播信息</h3>
              <div className="space-y-4">
                <div>
                  <span className="flex items-center gap-2 text-sm text-dark-500 mb-1">
                    <User className="w-4 h-4" />
                    主播
                  </span>
                  <p className="text-dark-200">{stream?.streamer_name}</p>
                </div>
                {stream?.streamer_contact && (
                  <div>
                    <span className="flex items-center gap-2 text-sm text-dark-500 mb-1">
                      <Phone className="w-4 h-4" />
                      联系方式
                    </span>
                    <p className="text-dark-200">{stream.streamer_contact}</p>
                  </div>
                )}
                <div>
                  <span className="flex items-center gap-2 text-sm text-dark-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    预计时间
                  </span>
                  <p className="text-dark-200 text-sm">
                    {formatDate(stream?.scheduled_start_time)} - {formatDate(stream?.scheduled_end_time)}
                  </p>
                </div>
                {stream?.actual_start_time && (
                  <div>
                    <span className="flex items-center gap-2 text-sm text-dark-500 mb-1">
                      <Clock className="w-4 h-4" />
                      实际开始
                    </span>
                    <p className="text-dark-200 text-sm">
                      {formatDate(stream.actual_start_time)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recording files */}
            {stream?.record_files && stream.record_files.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-dark-100 mb-4">录制文件</h3>
                <div className="space-y-2">
                  {stream.record_files.map((_file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700"
                    >
                      <span className="text-sm text-dark-300 truncate flex-1">
                        录制 {index + 1}
                      </span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Share Code Modal */}
      <Modal
        isOpen={showShareCodeModal}
        onClose={() => navigate('/')}
        title="私有直播"
        size="sm"
      >
        <form onSubmit={handleShareCodeSubmit}>
          <p className="text-dark-400 mb-4">
            此直播为私有直播，请输入 8 位分享码
          </p>
          <Input
            type="text"
            placeholder="请输入分享码"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            error={error === '分享码无效' ? error : undefined}
            maxLength={8}
          />
          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              取消
            </Button>
            <Button type="submit">
              确认
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
