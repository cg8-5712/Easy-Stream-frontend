import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Github, Code, Users, Shield, FileText, ArrowLeft, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui'

interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  html_url: string
}

export function AboutPage() {
  const [developers, setDevelopers] = useState<GitHubUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从 GitHub API 获取开发者信息
    const fetchDevelopers = async () => {
      try {
        const response = await fetch('https://api.github.com/users/cg8-5712')
        if (response.ok) {
          const user: GitHubUser = await response.json()
          setDevelopers([user])
        }
      } catch (error) {
        console.error('Failed to fetch GitHub user:', error)
        // 降级显示
        setDevelopers([{
          login: 'cg8-5712',
          name: 'cg8-5712',
          avatar_url: '',
          bio: '全栈开发',
          html_url: 'https://github.com/cg8-5712',
        }])
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopers()
  }, [])

  const techStack = [
    {
      category: '前端',
      items: [
        { name: 'React 18', url: 'https://react.dev/' },
        { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
        { name: 'Vite', url: 'https://cn.vitejs.dev/' },
        { name: 'TailwindCSS', url: 'https://tailwindcss.com/' },
        { name: 'Zustand', url: 'https://awesomedevin.github.io/zustand-vue/' },
        { name: 'HLS.js', url: 'https://hlsjs.video-dev.org/' },
      ]
    },
    {
      category: '后端',
      items: [
        { name: 'Go', url: 'https://go.dev/' },
        { name: 'Gin', url: 'https://gin-gonic.com/' },
        { name: 'PostgreSQL', url: 'https://www.postgresql.org/' },
        { name: 'Redis', url: 'https://redis.io/' },
        { name: 'JWT', url: 'https://jwt.io/' },
      ]
    },
    {
      category: '流媒体',
      items: [
        { name: 'ZLMediaKit', url: 'https://docs.zlmediakit.com/zh/' },
        { name: 'WebRTC', url: 'https://webrtc.org/' },
        { name: 'HLS', url: 'https://developer.apple.com/streaming/' },
        { name: 'RTMP', url: 'https://rtmp.veriskope.com/' },
        { name: 'HTTP-FLV', url: 'https://github.com/Bilibili/flv.js' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800/50 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <ArrowLeft className="w-5 h-5 text-dark-500 group-hover:text-gold-400 transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
                  <Radio className="w-5 h-5 text-dark-900" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gold-gradient">Easy Stream</h1>
                  <p className="text-xs text-dark-500">关于我们</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold mx-auto mb-6">
            <Radio className="w-10 h-10 text-dark-900" />
          </div>
          <h1 className="text-4xl font-bold text-gold-gradient mb-4">Easy Stream</h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            开源的现代化直播平台，支持多协议推流和低延迟播放
          </p>
        </div>

        {/* GitHub Repositories */}
        <Card className="mb-8 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Github className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-semibold text-dark-100">开源项目</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://github.com/cg8-5712/Easy-Stream-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-lg border border-dark-700 hover:border-gold-500/50 bg-dark-800/30 hover:bg-dark-800/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-medium text-dark-100 group-hover:text-gold-400 transition-colors">
                  Frontend
                </h3>
              </div>
              <p className="text-sm text-dark-400 mb-3">
                基于 React + TypeScript 的现代化前端应用
              </p>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Github className="w-4 h-4" />
                <span>cg8-5712/Easy-Stream-frontend</span>
              </div>
            </a>

            <a
              href="https://github.com/cg8-5712/Easy-Stream"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-lg border border-dark-700 hover:border-gold-500/50 bg-dark-800/30 hover:bg-dark-800/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-medium text-dark-100 group-hover:text-gold-400 transition-colors">
                  Backend
                </h3>
              </div>
              <p className="text-sm text-dark-400 mb-3">
                基于 Go + Gin 的高性能后端服务
              </p>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Github className="w-4 h-4" />
                <span>cg8-5712/Easy-Stream</span>
              </div>
            </a>
          </div>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-8 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-semibold text-dark-100">技术栈</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {techStack.map((stack) => (
              <div key={stack.category}>
                <h3 className="text-lg font-medium text-dark-200 mb-3">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                        <span className="flex-1">{item.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Developers */}
        <Card className="mb-8 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-semibold text-dark-100">开发团队</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {developers.map((dev) => (
                <a
                  key={dev.login}
                  href={dev.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-lg border border-dark-700 hover:border-gold-500/50 bg-dark-800/30 hover:bg-dark-800/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {dev.avatar_url ? (
                        <img
                          src={dev.avatar_url}
                          alt={dev.name || dev.login}
                          className="w-16 h-16 rounded-full border-2 border-dark-600 group-hover:border-gold-500/50 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                          <Github className="w-8 h-8 text-dark-900" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-dark-100 group-hover:text-gold-400 transition-colors">
                        {dev.name || dev.login}
                      </h3>
                      <p className="text-sm text-dark-500 mb-2">@{dev.login}</p>
                      {dev.bio && (
                        <p className="text-sm text-dark-400 line-clamp-2">{dev.bio}</p>
                      )}
                    </div>
                    {/* GitHub Icon */}
                    <Github className="w-5 h-5 text-dark-500 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>

        {/* Legal Links */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-semibold text-dark-100">法律信息</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/terms"
              className="group p-6 rounded-lg border border-dark-700 hover:border-gold-500/50 bg-dark-800/30 hover:bg-dark-800/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-medium text-dark-100 group-hover:text-gold-400 transition-colors">
                  服务条款
                </h3>
              </div>
              <p className="text-sm text-dark-400">
                了解使用 Easy Stream 的条款和条件
              </p>
            </Link>

            <Link
              to="/privacy"
              className="group p-6 rounded-lg border border-dark-700 hover:border-gold-500/50 bg-dark-800/30 hover:bg-dark-800/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-medium text-dark-100 group-hover:text-gold-400 transition-colors">
                  隐私政策
                </h3>
              </div>
              <p className="text-sm text-dark-400">
                了解我们如何保护您的隐私和数据
              </p>
            </Link>
          </div>
        </Card>

        {/* License */}
        <div className="mt-8 text-center text-sm text-dark-500">
          <p>
            本项目基于{' '}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              GNU GPL v3
            </a>{' '}
            开源协议发布
          </p>
          <p className="mt-2">© 2026 Easy Stream. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}
