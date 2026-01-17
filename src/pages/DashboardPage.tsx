import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  Users,
  Activity,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Button, StatusBadge } from '@/components/ui'
import { streamService, systemService } from '@/services'
import { formatDate, formatNumber } from '@/lib/utils'
import type { Stream, SystemStats, HealthResponse } from '@/types'

export function DashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, healthData, streamsData] = await Promise.all([
          systemService.getStats(),
          systemService.getHealth(),
          streamService.getStreams({ status: 'pushing', pageSize: 5 }),
        ])
        setStats(statsData)
        setHealth(healthData)
        setLiveStreams(streamsData.streams)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: '正在直播',
      value: stats?.online_streams ?? 0,
      icon: Radio,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: '总直播数',
      value: stats?.total_streams ?? 0,
      icon: Activity,
      color: 'text-gold-400',
      bgColor: 'bg-gold-500/10',
      borderColor: 'border-gold-500/20',
    },
    {
      title: '当前观众',
      value: liveStreams.reduce((sum, s) => sum + s.current_viewers, 0),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: '峰值观众',
      value: liveStreams.reduce((sum, s) => sum + s.peak_viewers, 0),
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="仪表盘" subtitle="实时监控直播状态" />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} hover className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-dark-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-semibold text-dark-100">
                    {formatNumber(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              {/* Decorative gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${stat.bgColor} to-transparent opacity-50`} />
            </Card>
          ))}
        </div>

        {/* Live Streams Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Streams List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Radio className="w-4 h-4 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-dark-100">正在直播</h2>
                </div>
                <Link to="/admin/streams">
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {liveStreams.length === 0 ? (
                <div className="text-center py-12">
                  <Radio className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-500">暂无正在进行的直播</p>
                  <Link to="/admin/streams">
                    <Button variant="outline" size="sm" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      创建直播
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveStreams.map((stream) => (
                    <Link
                      key={stream.id}
                      to={`/admin/streams/${stream.id}`}
                      className="block p-4 rounded-xl bg-dark-800/30 border border-dark-700/50 hover:border-gold-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-dark-100 mb-1">
                            {stream.name}
                          </h3>
                          <p className="text-sm text-dark-500">
                            {stream.streamer_name}
                          </p>
                        </div>
                        <StatusBadge status={stream.status} />
                      </div>

                      <div className="flex items-center gap-6 text-sm text-dark-400">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(stream.current_viewers)} 观看</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(stream.actual_start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          <span>{stream.bitrate} kbps</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-dark-100 mb-4">快捷操作</h2>
              <div className="space-y-3">
                <Link to="/admin/streams" className="block">
                  <Button variant="gold" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    创建新直播
                  </Button>
                </Link>
                <Link to="/admin/streams" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Radio className="w-4 h-4 mr-2" />
                    管理直播
                  </Button>
                </Link>
              </div>
            </Card>

            {/* System Status */}
            <Card>
              <h2 className="text-lg font-semibold text-dark-100 mb-4">系统状态</h2>
              {health ? (
                <>
                  <div className="mb-4 pb-4 border-b border-dark-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-400">系统状态</span>
                      <span className={`text-sm font-medium ${
                        health.status === 'healthy' ? 'text-green-400' :
                        health.status === 'degraded' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {health.status === 'healthy' ? '健康' :
                         health.status === 'degraded' ? '降级' :
                         '异常'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-dark-500">
                      <span>运行时间: {health.uptime}</span>
                      <span>版本: {health.version}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">PostgreSQL</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-500">{health.services.postgresql.latency}</span>
                        <span className={`flex items-center gap-2 ${
                          health.services.postgresql.status === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            health.services.postgresql.status === 'up' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                          }`} />
                          {health.services.postgresql.status === 'up' ? '正常' : '异常'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">Redis</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-500">{health.services.redis.latency}</span>
                        <span className={`flex items-center gap-2 ${
                          health.services.redis.status === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            health.services.redis.status === 'up' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                          }`} />
                          {health.services.redis.status === 'up' ? '正常' : '异常'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">ZLMediaKit</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-500">{health.services.zlmediakit.latency}</span>
                        <span className={`flex items-center gap-2 ${
                          health.services.zlmediakit.status === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            health.services.zlmediakit.status === 'up' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                          }`} />
                          {health.services.zlmediakit.status === 'up' ? '正常' : '异常'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400">API 服务</span>
                    <span className="flex items-center gap-2 text-dark-500">
                      <span className="w-2 h-2 rounded-full bg-dark-600" />
                      加载中...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400">流媒体服务</span>
                    <span className="flex items-center gap-2 text-dark-500">
                      <span className="w-2 h-2 rounded-full bg-dark-600" />
                      加载中...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400">数据库</span>
                    <span className="flex items-center gap-2 text-dark-500">
                      <span className="w-2 h-2 rounded-full bg-dark-600" />
                      加载中...
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
