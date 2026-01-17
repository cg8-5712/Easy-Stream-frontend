import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { zlmConfig, getZLMWebRTCUrl } from '@/config'

interface WebRTCPlayerProps {
  streamId: number
  streamKey?: string // 管理员有 streamKey
  className?: string
  autoPlay?: boolean
  muted?: boolean
}

type PlayerStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error'

export function WebRTCPlayer({
  streamId,
  streamKey,
  className = '',
  autoPlay = true,
  muted = true,
}: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(muted)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // 获取播放的 stream 标识（优先使用 streamKey，否则用 streamId）
  const getStreamName = useCallback(() => {
    return streamKey || `stream_${streamId}`
  }, [streamKey, streamId])

  // 创建 WebRTC 连接
  const startPlay = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setStatus('connecting')
      setError(null)

      // 关闭之前的连接
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }

      // 创建 PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
      pcRef.current = pc

      // 处理远端流
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0]
          setStatus('playing')
          setIsPlaying(true)
        }
      }

      // 连接状态变化
      pc.onconnectionstatechange = () => {
        console.log('WebRTC 连接状态:', pc.connectionState)
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setStatus('error')
          setError('连接断开')
        }
      }

      // ICE 连接状态
      pc.oniceconnectionstatechange = () => {
        console.log('ICE 连接状态:', pc.iceConnectionState)
      }

      // ICE 候选
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE 候选:', event.candidate)
        }
      }

      // 添加收发器
      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.addTransceiver('audio', { direction: 'recvonly' })

      // 创建 offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 等待 ICE 收集完成
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve()
        } else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              resolve()
            }
          }
        }
      })

      // 发送到 ZLMediaKit
      const streamName = getStreamName()
      const apiUrl = getZLMWebRTCUrl(streamName)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: pc.localDescription?.sdp,
      })

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')

      // ZLMediaKit 返回 JSON 格式
      if (contentType?.includes('application/json')) {
        const jsonResponse = await response.json()

        if (jsonResponse.code !== 0) {
          throw new Error(jsonResponse.msg || '获取流失败')
        }

        if (!jsonResponse.sdp) {
          throw new Error('服务器未返回 SDP')
        }

        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: jsonResponse.sdp,
        }))
      } else {
        // 纯 SDP 文本格式
        const answerSdp = await response.text()
        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: answerSdp,
        }))
      }

    } catch (err) {
      console.error('WebRTC 播放失败:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : '播放失败')
    }
  }, [getStreamName])

  // 停止播放
  const stopPlay = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('idle')
    setIsPlaying(false)
  }, [])

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (status === 'idle' || status === 'error') {
      startPlay()
    } else if (status === 'playing') {
      videoRef.current?.pause()
      setStatus('paused')
      setIsPlaying(false)
    } else if (status === 'paused') {
      videoRef.current?.play()
      setStatus('playing')
      setIsPlaying(true)
    }
  }, [status, startPlay])

  // 静音切换
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  // 全屏
  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }, [])

  // 重试
  const retry = useCallback(() => {
    stopPlay()
    setTimeout(startPlay, 500)
  }, [stopPlay, startPlay])

  // 自动播放
  useEffect(() => {
    if (autoPlay) {
      startPlay()
    }
    return () => {
      stopPlay()
    }
  }, [autoPlay, startPlay, stopPlay])

  // 更新静音状态
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  return (
    <div
      className={`relative bg-dark-900 ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted={isMuted}
      />

      {/* 加载/错误状态 */}
      {status === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-dark-300 text-sm">正在连接...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-dark-300 mb-1">播放失败</p>
            <p className="text-dark-500 text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80">
          <Button variant="ghost" size="lg" onClick={startPlay} className="rounded-full w-16 h-16">
            <Play className="w-8 h-8" />
          </Button>
        </div>
      )}

      {/* 控制栏 */}
      {(showControls || status === 'paused') && status !== 'error' && status !== 'idle' && status !== 'connecting' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900/90 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={retry} title="刷新">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
