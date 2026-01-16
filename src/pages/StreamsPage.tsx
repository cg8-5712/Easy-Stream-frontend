import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Radio,
  Eye,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  StopCircle,
  Filter,
  Play,
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Button, Input, StatusBadge, Modal } from '@/components/ui'
import { streamService } from '@/services'
import { formatDate } from '@/lib/utils'
import type { Stream, CreateStreamRequest, StreamStatus } from '@/types'

type TimeRange = 'all' | 'past' | 'current' | 'future'

export function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StreamStatus | 'all'>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMenu, setShowMenu] = useState<number | null>(null)

  const fetchStreams = async () => {
    try {
      const params: Record<string, string | number> = { pageSize: 100 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (timeRange !== 'all') params.time_range = timeRange

      const data = await streamService.getStreams(params)
      setStreams(data.streams)
    } catch (error) {
      console.error('Failed to fetch streams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreams()
  }, [statusFilter, timeRange])

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.streamer_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!selectedStream) return
    try {
      await streamService.deleteStream(selectedStream.stream_key)
      setShowDeleteModal(false)
      setSelectedStream(null)
      fetchStreams()
    } catch (error) {
      console.error('Failed to delete stream:', error)
    }
  }

  const handleKick = async (stream: Stream) => {
    try {
      await streamService.kickStream(stream.stream_key)
      fetchStreams()
    } catch (error) {
      console.error('Failed to kick stream:', error)
    }
  }

  const copyStreamKey = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pushing', label: '直播中' },
    { value: 'idle', label: '待开始' },
    { value: 'ended', label: '已结束' },
  ]

  const timeOptions = [
    { value: 'all', label: '全部时间' },
    { value: 'current', label: '正在进行' },
    { value: 'future', label: '即将开始' },
    { value: 'past', label: '已结束' },
  ]

  return (
    <div className="min-h-screen">
      <Header title="直播管理" subtitle="管理所有直播流" />

      <div className="p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="搜索直播名称或主播..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StreamStatus | 'all')}
              className="input-dark py-2.5 pr-8 appearance-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="input-dark py-2.5 pr-8 appearance-none cursor-pointer"
            >
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建直播
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Radio className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark-100">
                  {streams.filter((s) => s.status === 'pushing').length}
                </p>
                <p className="text-sm text-dark-500">直播中</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                <Clock className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark-100">
                  {streams.filter((s) => s.status === 'idle').length}
                </p>
                <p className="text-sm text-dark-500">待开始</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-dark-700/50 border border-dark-600">
                <Filter className="w-4 h-4 text-dark-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark-100">
                  {filteredStreams.length}
                </p>
                <p className="text-sm text-dark-500">筛选结果</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Streams Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-500 mb-4">暂无直播数据</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建第一个直播
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>直播信息</th>
                    <th>状态</th>
                    <th>推流码</th>
                    <th>观看数据</th>
                    <th>时间</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStreams.map((stream) => (
                    <tr key={stream.id}>
                      <td>
                        <div>
                          <p className="font-medium text-dark-100">{stream.name}</p>
                          <p className="text-sm text-dark-500">{stream.streamer_name}</p>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={stream.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-dark-800 px-2 py-1 rounded text-dark-300">
                            {stream.stream_key.slice(0, 8)}...
                          </code>
                          <button
                            onClick={() => copyStreamKey(stream.stream_key)}
                            className="p-1 text-dark-500 hover:text-gold-400 transition-colors"
                            title="复制推流码"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-dark-400">
                            <Eye className="w-3.5 h-3.5" />
                            {stream.current_viewers}
                          </span>
                          <span className="text-dark-600">|</span>
                          <span className="text-dark-500">
                            累计 {stream.total_viewers}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <p className="text-dark-300">{formatDate(stream.scheduled_start_time)}</p>
                          {stream.actual_start_time && (
                            <p className="text-dark-500 text-xs">
                              实际: {formatDate(stream.actual_start_time)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {stream.status === 'pushing' && (
                            <Link to={`/live/${stream.stream_key}`}>
                              <Button variant="ghost" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMenu(showMenu === stream.id ? null : stream.id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showMenu === stream.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 glass-card p-1 z-10">
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800 rounded-lg transition-colors"
                                  onClick={() => {
                                    copyStreamKey(stream.stream_key)
                                    setShowMenu(null)
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                  复制推流码
                                </button>
                                {stream.status === 'pushing' && (
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-dark-800 rounded-lg transition-colors"
                                    onClick={() => {
                                      handleKick(stream)
                                      setShowMenu(null)
                                    }}
                                  >
                                    <StopCircle className="w-4 h-4" />
                                    强制断流
                                  </button>
                                )}
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-800 rounded-lg transition-colors"
                                  onClick={() => {
                                    setSelectedStream(stream)
                                    setShowDeleteModal(true)
                                    setShowMenu(null)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  删除
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      <CreateStreamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          fetchStreams()
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-300 mb-6">
          确定要删除直播 <span className="text-gold-400">{selectedStream?.name}</span> 吗？此操作不可撤销。
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Create Stream Modal Component
function CreateStreamModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateStreamRequest>({
    name: '',
    description: '',
    visibility: 'public',
    streamer_name: '',
    streamer_contact: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    record_enabled: false,
    auto_kick_delay: 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await streamService.createStream({
        ...formData,
        scheduled_start_time: new Date(formData.scheduled_start_time).toISOString(),
        scheduled_end_time: new Date(formData.scheduled_end_time).toISOString(),
      })
      onSuccess()
      // Reset form
      setFormData({
        name: '',
        description: '',
        visibility: 'public',
        streamer_name: '',
        streamer_contact: '',
        scheduled_start_time: '',
        scheduled_end_time: '',
        record_enabled: false,
        auto_kick_delay: 30,
      })
    } catch (error) {
      console.error('Failed to create stream:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建直播" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="直播名称"
            placeholder="输入直播名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="主播姓名"
            placeholder="输入主播姓名"
            value={formData.streamer_name}
            onChange={(e) => setFormData({ ...formData, streamer_name: e.target.value })}
            required
          />
        </div>

        <Input
          label="直播描述"
          placeholder="输入直播描述（可选）"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="联系方式"
            placeholder="输入联系方式（可选）"
            value={formData.streamer_contact}
            onChange={(e) => setFormData({ ...formData, streamer_contact: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              可见性
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
              className="input-dark"
            >
              <option value="public">公开</option>
              <option value="private">私有</option>
            </select>
          </div>
        </div>

        {formData.visibility === 'private' && (
          <Input
            label="访问密码"
            type="password"
            placeholder="设置访问密码"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="预计开始时间"
            type="datetime-local"
            value={formData.scheduled_start_time}
            onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
            required
          />
          <Input
            label="预计结束时间"
            type="datetime-local"
            value={formData.scheduled_end_time}
            onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.record_enabled}
              onChange={(e) => setFormData({ ...formData, record_enabled: e.target.checked })}
              className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-gold-500 focus:ring-gold-500/30"
            />
            <span className="text-sm text-dark-300">开启录制</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-400">超时断流延迟:</span>
            <input
              type="number"
              value={formData.auto_kick_delay}
              onChange={(e) => setFormData({ ...formData, auto_kick_delay: parseInt(e.target.value) })}
              className="w-20 input-dark py-1.5 text-center"
              min={0}
            />
            <span className="text-sm text-dark-500">分钟</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" loading={loading}>
            创建直播
          </Button>
        </div>
      </form>
    </Modal>
  )
}
