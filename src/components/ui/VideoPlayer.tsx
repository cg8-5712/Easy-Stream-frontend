import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // 当 src 改变时，重新加载视频
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [src])

  return (
    <div className={className}>
      {title && (
        <div className="mb-3 text-dark-200 font-medium">
          {title}
        </div>
      )}
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        className="w-full rounded-lg bg-dark-900"
        preload="metadata"
        playsInline
      >
        <source src={src} type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
    </div>
  )
}
