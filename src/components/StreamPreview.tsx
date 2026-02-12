import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import Hls from 'hls.js'

interface StreamPreviewProps {
  streamId: number
  streamName: string
  isLive: boolean
  className?: string
}

export function StreamPreview({ streamId, streamName, isLive, className = '' }: StreamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hlsUrl, setHlsUrl] = useState<string | null>(null)

  // 获取HLS播放地址
  useEffect(() => {
    if (!isLive) return

    // 从环境变量或API获取播放地址
    // 这里暂时使用简单的URL构建，实际应该调用API获取
    const baseUrl = import.meta.env.VITE_MEDIA_SERVER_URL || 'http://localhost:80'
    // 注意：由于游客看不到stream_key，这里需要后端提供一个通过ID获取播放地址的接口
    // 暂时使用占位符，实际需要调用 API
    setHlsUrl(`${baseUrl}/live/stream_${streamId}/hls.m3u8`)
  }, [streamId, isLive])

  useEffect(() => {
    if (!isHovered || !isLive || !videoRef.current || !hlsUrl) {
      return
    }

    const video = videoRef.current

    setIsLoading(true)
    setHasError(false)

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })

      hlsRef.current = hls

      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        video.play().catch((err) => {
          console.error('Failed to play video:', err)
          setHasError(true)
        })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          setHasError(true)
          setIsLoading(false)
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = hlsUrl
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        video.play().catch((err) => {
          console.error('Failed to play video:', err)
          setHasError(true)
        })
      })
    } else {
      setHasError(true)
      setIsLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [isHovered, isLive, hlsUrl])

  const handleMouseEnter = () => {
    if (isLive) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // 停止播放但保留最后一帧
    if (videoRef.current) {
      videoRef.current.pause()
    }
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }

  return (
    <div
      className={`relative aspect-video bg-gradient-to-br from-dark-800 to-dark-900 rounded-lg overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        style={{ display: isHovered && !hasError ? 'block' : 'none' }}
      />

      {/* 占位图 - 显示在未悬浮或加载失败时 */}
      {(!isHovered || hasError) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-blue-500/5 animate-gradient" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-dark-700/80 backdrop-blur-sm border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/30 group-hover:border-gold-400/50 transition-all">
                <Play className="w-8 h-8 text-gold-400 group-hover:scale-110 transition-transform" fill="currentColor" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 错误提示 */}
      {hasError && (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-red-400 bg-dark-900/80 px-2 py-1 rounded">
          预览加载失败
        </div>
      )}
    </div>
  )
}
