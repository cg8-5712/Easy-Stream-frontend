import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Link as LinkIcon,
  Plus,
  Trash2,
  Eye,
  Users,
  Clock,
  Radio,
  Lock,
  Settings,
  Share2,
  Check,
  ExternalLink,
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Button, Input, StatusBadge, Badge, Modal } from '@/components/ui'
import { streamService, shareLinkService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import type { Stream, ShareLink } from '@/types'

export function StreamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stream, setStream] = useState<Stream | null>(null)
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  // Modal states
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false)
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false)
  const [showMaxUsesModal, setShowMaxUsesModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null)

  // Form states
  const [newLinkMaxUses, setNewLinkMaxUses] = useState(0)
  const [shareCodeMaxUses, setShareCodeMaxUses] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStream = async () => {
    if (!id) return
    try {
      const data = await streamService.getStreamById(parseInt(id))
      setStream(data)
      setShareCodeMaxUses(data.share_code_max_uses || 0)
    } catch (error) {
      console.error('Failed to fetch stream:', error)
    }
  }

  const fetchShareLinks = async (streamKey: string) => {
    try {
      const data = await shareLinkService.getShareLinks(streamKey)
      setShareLinks(data.share_links || [])
    } catch (error) {
      console.error('Failed to fetch share links:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const streamData = await streamService.getStreamById(parseInt(id))
        setStream(streamData)
        setShareCodeMaxUses(streamData.share_code_max_uses || 0)
        if (streamData.visibility === 'private') {
          await fetchShareLinks(streamData.stream_key)
        }
      } catch (error) {
        console.error('Failed to fetch stream:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRegenerateShareCode = async () => {
    if (!stream) return
    setActionLoading(true)
    try {
      await streamService.regenerateShareCode(stream.stream_key)
      await fetchStream()
      setShowRegenerateModal(false)
    } catch (error) {
      console.error('Failed to regenerate share code:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateMaxUses = async () => {
    if (!stream) return
    setActionLoading(true)
    try {
      await streamService.updateShareCodeMaxUses(stream.stream_key, shareCodeMaxUses)
      await fetchStream()
      setShowMaxUsesModal(false)
    } catch (error) {
      console.error('Failed to update max uses:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateShareLink = async () => {
    if (!stream) return
    setActionLoading(true)
    try {
      await shareLinkService.createShareLink(stream.stream_key, {
        max_uses: newLinkMaxUses,
      })
      await fetchShareLinks(stream.stream_key)
      setShowCreateLinkModal(false)
      setNewLinkMaxUses(0)
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteShareLink = async () => {
    if (!selectedLink || !stream) return
    setActionLoading(true)
    try {
      await shareLinkService.deleteShareLink(selectedLink.id)
      await fetchShareLinks(stream.stream_key)
      setShowDeleteLinkModal(false)
      setSelectedLink(null)
    } catch (error) {
      console.error('Failed to delete share link:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getShareLinkUrl = (token: string) => {
    return `${window.location.origin}/?share_token=${token}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-200 mb-2">直播不存在</h2>
          <Button variant="outline" onClick={() => navigate('/admin/streams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title={stream.name}
        subtitle="直播详情与分享管理"
        action={
          <Button variant="ghost" onClick={() => navigate('/admin/streams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stream Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-dark-100 mb-2">{stream.name}</h2>
                  <p className="text-dark-400">{stream.description || '暂无描述'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={stream.status} />
                  {stream.visibility === 'private' && (
                    <Badge variant="warning">
                      <Lock className="w-3 h-3 mr-1" />
                      私有
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <div className="flex items-center gap-2 text-dark-500 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">当前观看</span>
                  </div>
                  <p className="text-xl font-semibold text-dark-100">
                    {formatNumber(stream.current_viewers)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <div className="flex items-center gap-2 text-dark-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">累计观看</span>
                  </div>
                  <p className="text-xl font-semibold text-dark-100">
                    {formatNumber(stream.total_viewers)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <div className="flex items-center gap-2 text-dark-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">预计开始</span>
                  </div>
                  <p className="text-sm font-medium text-dark-200">
                    {formatDate(stream.scheduled_start_time)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <div className="flex items-center gap-2 text-dark-500 mb-1">
                    <Radio className="w-4 h-4" />
                    <span className="text-xs">主播</span>
                  </div>
                  <p className="text-sm font-medium text-dark-200">
                    {stream.streamer_name}
                  </p>
                </div>
              </div>
            </Card>

            {/* Stream Key */}
            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">推流信息</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-dark-500 mb-1 block">推流码</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-200 font-mono text-sm">
                      {stream.stream_key}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(stream.stream_key, 'stream_key')}
                    >
                      {copied === 'stream_key' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-500 mb-1 block">RTMP 推流地址</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-200 font-mono text-sm truncate">
                      rtmp://localhost:1935/live/{stream.stream_key}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`rtmp://localhost:1935/live/${stream.stream_key}`, 'rtmp')}
                    >
                      {copied === 'rtmp' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Share Links - Only for private streams */}
            {stream.visibility === 'private' && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark-100">分享链接</h3>
                  <Button size="sm" onClick={() => setShowCreateLinkModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建链接
                  </Button>
                </div>

                {shareLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500 mb-4">暂无分享链接</p>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateLinkModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      创建第一个链接
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shareLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs text-dark-400 truncate">
                              {link.token.slice(0, 16)}...
                            </code>
                            <Badge variant="default" className="text-xs">
                              {link.max_uses === 0 ? '无限制' : `${link.used_count}/${link.max_uses}`}
                            </Badge>
                          </div>
                          <p className="text-xs text-dark-500">
                            创建于 {formatDate(link.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getShareLinkUrl(link.token), `link_${link.id}`)}
                            title="复制链接"
                          >
                            {copied === `link_${link.id}` ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getShareLinkUrl(link.token), '_blank')}
                            title="打开链接"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLink(link)
                              setShowDeleteLinkModal(true)
                            }}
                            title="删除链接"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Share Code Management */}
          <div className="space-y-6">
            {/* Share Code - Only for private streams */}
            {stream.visibility === 'private' && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5 text-gold-400" />
                  <h3 className="text-lg font-semibold text-dark-100">分享码</h3>
                </div>

                {stream.share_code ? (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-dark-500 mb-2 block">8 位分享码</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-4 py-3 rounded-lg bg-dark-800 border border-dark-700 text-2xl font-mono text-gold-400 text-center tracking-widest">
                          {stream.share_code}
                        </code>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(stream.share_code!, 'share_code')}
                        >
                          {copied === 'share_code' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500">已使用次数</span>
                        <span className="text-dark-200 font-medium">
                          {stream.share_code_used_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-500">最大使用次数</span>
                        <span className="text-dark-200 font-medium">
                          {stream.share_code_max_uses === 0 ? '无限制' : stream.share_code_max_uses}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowMaxUsesModal(true)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        设置使用次数
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-yellow-400 hover:text-yellow-300"
                        onClick={() => setShowRegenerateModal(true)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新生成分享码
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-dark-500">分享码未生成</p>
                  </div>
                )}
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">快捷操作</h3>
              <div className="space-y-2">
                {stream.status === 'pushing' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`/live/${stream.stream_key}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    观看直播
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/admin/streams')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </div>
            </Card>

            {/* Public Stream Notice */}
            {stream.visibility === 'public' && (
              <Card className="border-blue-500/20 bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400 mb-1">公开直播</h4>
                    <p className="text-sm text-dark-400">
                      此直播为公开直播，任何人都可以直接观看，无需分享码或分享链接。
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Share Code Modal */}
      <Modal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        title="重新生成分享码"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-400">
              重新生成分享码后，旧的分享码将立即失效，已获得访问权限的用户不受影响。
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowRegenerateModal(false)}>
              取消
            </Button>
            <Button onClick={handleRegenerateShareCode} loading={actionLoading}>
              确认重新生成
            </Button>
          </div>
        </div>
      </Modal>

      {/* Set Max Uses Modal */}
      <Modal
        isOpen={showMaxUsesModal}
        onClose={() => setShowMaxUsesModal(false)}
        title="设置分享码使用次数"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="最大使用次数"
            type="number"
            value={shareCodeMaxUses}
            onChange={(e) => setShareCodeMaxUses(parseInt(e.target.value) || 0)}
            min={0}
            placeholder="0 表示不限制"
          />
          <p className="text-sm text-dark-500">
            设置为 0 表示不限制使用次数。当前已使用 {stream.share_code_used_count || 0} 次。
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowMaxUsesModal(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateMaxUses} loading={actionLoading}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Share Link Modal */}
      <Modal
        isOpen={showCreateLinkModal}
        onClose={() => setShowCreateLinkModal(false)}
        title="创建分享链接"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="最大使用次数"
            type="number"
            value={newLinkMaxUses}
            onChange={(e) => setNewLinkMaxUses(parseInt(e.target.value) || 0)}
            min={0}
            placeholder="0 表示不限制"
          />
          <p className="text-sm text-dark-500">
            设置为 0 表示不限制使用次数。每个分享链接可以独立设置使用次数限制。
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateLinkModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateShareLink} loading={actionLoading}>
              创建
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Share Link Modal */}
      <Modal
        isOpen={showDeleteLinkModal}
        onClose={() => setShowDeleteLinkModal(false)}
        title="删除分享链接"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            确定要删除此分享链接吗？删除后，使用此链接的用户将无法访问直播。
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteLinkModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDeleteShareLink} loading={actionLoading}>
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
