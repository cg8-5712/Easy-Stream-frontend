import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recordingService } from '@/services'
import { Button, Card } from '@/components/ui'
import type { Recording } from '@/types'

export function RecordingsPage() {
  const queryClient = useQueryClient()
  const [selectedStreamKey, setSelectedStreamKey] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['recordings', selectedStreamKey],
    queryFn: () => recordingService.getRecordings(
      selectedStreamKey ? { stream_key: selectedStreamKey } : undefined
    ),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recordingService.deleteRecording(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] })
    },
  })

  const handleDownload = (id: number, fileName: string) => {
    const url = recordingService.getDownloadUrl(id)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-dark-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-50 mb-4">录像管理</h1>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="按直播流 Key 筛选..."
            value={selectedStreamKey}
            onChange={(e) => setSelectedStreamKey(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-50 focus:outline-none focus:border-primary-500"
          />
          {selectedStreamKey && (
            <Button
              variant="outline"
              onClick={() => setSelectedStreamKey('')}
            >
              清除筛选
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {data?.recordings.length === 0 ? (
          <Card className="p-8 text-center text-dark-400">
            暂无录像记录
          </Card>
        ) : (
          data?.recordings.map((recording: Recording) => (
            <Card key={recording.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-dark-50">
                      {recording.stream?.name || recording.stream_key}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-dark-400">
                    <div>
                      <span className="text-dark-500">文件大小:</span>{' '}
                      {formatFileSize(recording.file_size)}
                    </div>
                    <div>
                      <span className="text-dark-500">时长:</span>{' '}
                      {formatDuration(recording.duration)}
                    </div>
                    <div>
                      <span className="text-dark-500">开始时间:</span>{' '}
                      {new Date(recording.start_time).toLocaleString('zh-CN')}
                    </div>
                    <div>
                      <span className="text-dark-500">结束时间:</span>{' '}
                      {new Date(recording.end_time).toLocaleString('zh-CN')}
                    </div>
                    <div className="col-span-2">
                      <span className="text-dark-500">文件路径:</span>{' '}
                      {recording.file_path}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(recording.id, recording.file_path.split('/').pop() || 'recording.mp4')}
                  >
                    下载
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('确定要删除这个录像吗？此操作不可恢复。')) {
                        deleteMutation.mutate(recording.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {data && data.total > 0 && (
        <div className="mt-6 text-center text-dark-400">
          共 {data.total} 条录像记录
        </div>
      )}
    </div>
  )
}
