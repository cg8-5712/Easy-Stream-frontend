import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Search,
  Filter,
  Calendar,
  Clock,
  Film,
  Download,
  Trash2,
  User,
  Eye,
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Button, Input, Select, Badge, Modal } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { streamService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import type { Stream } from '@/types'

interface RecordingFile {
  stream: Stream
  recordingIndex: number
  fileName: string
  filePath: string
}

export function RecordingsPage() {
  const navigate = useNavigate()
  const [streams, setStreams] = useState<Stream[]>([])
  const [recordings, setRecordings] = useState<RecordingFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStream, setSelectedStream] = useState<string>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<RecordingFile | null>(null)

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      // 获取所有有录制文件的直播
      const data = await streamService.getStreams({ pageSize: 1000 })
      const streamsWithRecordings = data.streams.filter(
        (s) => s.record_files && s.record_files.length > 0
      )
      setStreams(streamsWithRecordings)

      // 展平所有录制文件
      const allRecordings: RecordingFile[] = []
      streamsWithRecordings.forEach((stream) => {
        stream.record_files?.forEach((filePath, index) => {
          const fileName = filePath.split('/').pop() || filePath
          allRecordings.push({
            stream,
            recordingIndex: index,
            fileName,
            filePath,
          })
        })
      })
      setRecordings(allRecordings)
    } catch (error) {
      console.error('Failed to fetch recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecordings = recordings.filter((rec) => {
    const matchesSearch =
      rec.stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.stream.streamer_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStream =
      selectedStream === 'all' || rec.stream.stream_key === selectedStream
    return matchesSearch && matchesStream
  })

  const handlePlayRecording = (recording: RecordingFile) => {
    // 跳转到播放页面（新建一个回放播放器页面或在 LiveViewerPage 中添加回放模式）
    navigate(`/admin/recordings/play/${recording.stream.id}/${recording.recordingIndex}`)
  }

  const handleDeleteRecording = () => {
    // TODO: 实现删除录制文件的API
    console.log('Delete recording:', selectedRecording)
    setShowDeleteModal(false)
  }

  const streamOptions: SelectOption[] = [
    { value: 'all', label: '全部直播' },
    ...streams.map((s) => ({
      value: s.stream_key,
      label: s.name,
    })),
  ]

  return (
    <div className="min-h-screen">
      <Header title="回放管理" subtitle="查看和管理直播录制文件" />

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
            <Select
              value={selectedStream}
              onChange={(value) => setSelectedStream(value)}
              options={streamOptions}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                <Film className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark-100">{recordings.length}</p>
                <p className="text-sm text-dark-500">录制文件</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Play className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark-100">{streams.length}</p>
                <p className="text-sm text-dark-500">已录制直播</p>
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
                  {filteredRecordings.length}
                </p>
                <p className="text-sm text-dark-500">筛选结果</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recordings Grid */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-500 mb-4">暂无录制文件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredRecordings.map((recording, idx) => (
                <Card
                  key={`${recording.stream.id}-${recording.recordingIndex}`}
                  hover
                  className="group cursor-pointer"
                  onClick={() => handlePlayRecording(recording)}
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className="relative aspect-video bg-dark-800 rounded-lg mb-3 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                        <Play className="w-8 h-8 text-dark-400 group-hover:text-gold-400 transition-colors" />
                      </div>
                    </div>
                    {/* Recording badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-dark-900/80 text-dark-200 text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        录制 {recording.recordingIndex + 1}
                      </span>
                    </div>
                    {/* Duration placeholder */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-dark-900/90 text-white text-xs">
                      --:--
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-dark-100 line-clamp-1 group-hover:text-gold-400 transition-colors">
                      {recording.stream.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <User className="w-3 h-3" />
                      <span>{recording.stream.streamer_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {recording.stream.actual_start_time
                          ? formatDate(recording.stream.actual_start_time)
                          : formatDate(recording.stream.scheduled_start_time)}
                      </span>
                    </div>

                    {recording.stream.current_viewers > 0 && (
                      <div className="flex items-center gap-2 text-xs text-dark-500">
                        <Eye className="w-3 h-3" />
                        <span>峰值 {formatNumber(recording.stream.peak_viewers)} 观看</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      className="flex items-center gap-2 pt-2 border-t border-dark-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePlayRecording(recording)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        播放
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="下载"
                        onClick={() => {
                          // TODO: 实现下载功能
                          console.log('Download:', recording.filePath)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        title="删除"
                        onClick={() => {
                          setSelectedRecording(recording)
                          setShowDeleteModal(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-300 mb-6">
          确定要删除录制文件{' '}
          <span className="text-gold-400">
            {selectedRecording?.stream.name} - 录制{' '}
            {(selectedRecording?.recordingIndex ?? 0) + 1}
          </span>{' '}
          吗？此操作不可撤销。
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteRecording}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  )
}
