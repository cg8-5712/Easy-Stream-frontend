import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recordingService } from '@/services'
import { Button, Card, Modal, VideoPlayer } from '@/components/ui'
import type { StreamWithRecords, RecordFile } from '@/types'

export function RecordingsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [playingVideo, setPlayingVideo] = useState<{
    url: string
    title: string
  } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['recordings', page, pageSize],
    queryFn: () => recordingService.getRecordings({ page, pageSize }),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ streamKey, fileName }: { streamKey: string; fileName: string }) =>
      recordingService.deleteRecording(streamKey, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] })
    },
  })

  const handleDownload = (streamKey: string, fileName: string) => {
    // 使用简单的直接跳转方式（适用于公开直播）
    // 如果是私有直播，需要传入 token
    const url = recordingService.getDownloadUrl(streamKey, fileName)
    window.location.href = url
  }

  const handlePlay = (streamKey: string, fileName: string, streamName: string) => {
    const url = recordingService.getDownloadUrl(streamKey, fileName)
    setPlayingVideo({
      url,
      title: `${streamName} - ${fileName}`,
    })
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
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN')
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
      </div>

      <div className="space-y-6">
        {data?.streams.length === 0 ? (
          <Card className="p-8 text-center text-dark-400">
            暂无录像记录
          </Card>
        ) : (
          data?.streams.map((stream: StreamWithRecords) => (
            <Card key={stream.id} className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-dark-50 mb-2">
                  {stream.name}
                </h2>
                <div className="text-sm text-dark-500">
                  Stream Key: {stream.stream_key}
                </div>
              </div>

              {stream.record_files.length === 0 ? (
                <div className="text-center text-dark-500 py-4">
                  该直播暂无录制文件
                </div>
              ) : (
                <div className="space-y-3">
                  {stream.record_files.map((file: RecordFile, index: number) => (
                    <div
                      key={index}
                      className="bg-dark-800 rounded-lg p-4 border border-dark-700 hover:border-primary-500 cursor-pointer transition-colors"
                      onClick={() => handlePlay(stream.stream_key, file.file_name, stream.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-dark-50 font-medium mb-2">
                            {file.file_name}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm text-dark-400">
                            <div>
                              <span className="text-dark-500">文件大小:</span>{' '}
                              {formatFileSize(file.file_size)}
                            </div>
                            <div>
                              <span className="text-dark-500">时长:</span>{' '}
                              {formatDuration(file.duration)}
                            </div>
                            <div>
                              <span className="text-dark-500">开始时间:</span>{' '}
                              {formatTimestamp(file.start_time)}
                            </div>
                            <div>
                              <span className="text-dark-500">创建时间:</span>{' '}
                              {new Date(file.created_at).toLocaleString('zh-CN')}
                            </div>
                          </div>

                          {(file.urls.s3 || file.urls.cos || file.urls.oss) && (
                            <div className="mt-2 text-xs text-dark-500">
                              存储位置:
                              {file.urls.s3 && ' S3'}
                              {file.urls.cos && ' COS'}
                              {file.urls.oss && ' OSS'}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            onClick={() => handleDownload(stream.stream_key, file.file_name)}
                          >
                            下载
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              if (confirm('确定要删除这个录像吗？此操作不可恢复。')) {
                                deleteMutation.mutate({
                                  streamKey: stream.stream_key,
                                  fileName: file.file_name,
                                })
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {data && data.total > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-dark-400">
            共 {data.total} 个直播流
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <div className="px-4 py-2 text-dark-400">
              第 {page} 页
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={data.streams.length < pageSize}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 视频播放模态框 */}
      <Modal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        title="播放录像"
        size="xl"
        className="max-w-4xl"
      >
        {playingVideo && (
          <VideoPlayer
            src={playingVideo.url}
            title={playingVideo.title}
          />
        )}
      </Modal>
    </div>
  )
}
