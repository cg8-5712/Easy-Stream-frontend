import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
  requireAuth?: boolean
}

export function VideoPlayer({ src, title, className, requireAuth = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!requireAuth) {
      // 不需要认证，直接使用原始 URL
      return
    }

    // 需要认证，使用 fetch 获取视频并创建 Blob URL
    const fetchVideo = async () => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem('access_token')
        console.log('VideoPlayer - Token:', token ? 'exists' : 'missing')
        console.log('VideoPlayer - URL:', src)

        const response = await fetch(src, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        console.log('VideoPlayer - Response status:', response.status)

        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        console.error('Video load error:', err)
        setError('视频加载失败: ' + err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()

    // Cleanup
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [src, requireAuth])

  const videoSrc = requireAuth ? blobUrl : src

  return (
    <div className={className}>
      {title && (
        <div className="mb-3 text-dark-200 font-medium">
          {title}
        </div>
      )}
      {loading && (
        <div className="w-full aspect-video rounded-lg bg-dark-900 flex items-center justify-center">
          <div className="text-dark-400">加载中...</div>
        </div>
      )}
      {error && (
        <div className="w-full aspect-video rounded-lg bg-dark-900 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      )}
      {!loading && !error && videoSrc && (
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          className="w-full rounded-lg bg-dark-900"
          preload="metadata"
          playsInline
          src={videoSrc}
        >
          您的浏览器不支持视频播放。
        </video>
      )}
    </div>
  )
}
