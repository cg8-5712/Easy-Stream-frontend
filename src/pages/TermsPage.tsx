import { useNavigate, Link } from 'react-router-dom'
import { Radio, ArrowLeft, Shield } from 'lucide-react'
import { Card } from '@/components/ui'

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800/50 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-3 group">
              <ArrowLeft className="w-5 h-5 text-dark-500 group-hover:text-gold-400 transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
                  <Radio className="w-5 h-5 text-dark-900" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gold-gradient">Easy Stream</h1>
                  <p className="text-xs text-dark-500">服务条款</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-gold-400" />
            <h1 className="text-3xl font-bold text-dark-100">服务条款</h1>
          </div>
          <p className="text-dark-400">最后更新：2026年2月</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">1. 接受条款</h2>
            <p className="text-dark-300 leading-relaxed">
              欢迎使用 Easy Stream。通过访问或使用我们的服务，您同意受本服务条款的约束。如果您不同意这些条款，请不要使用我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">2. 服务说明</h2>
            <p className="text-dark-300 leading-relaxed mb-3">
              Easy Stream 是一个开源的直播平台，提供以下服务：
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-300 ml-4">
              <li>多协议直播推流支持（RTMP、RTSP、SRT、WebRTC）</li>
              <li>低延迟直播播放（WebRTC、HLS、FLV）</li>
              <li>直播录制和回放功能</li>
              <li>私有直播和分享功能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">3. 用户责任</h2>
            <p className="text-dark-300 leading-relaxed mb-3">
              使用本服务时，您同意：
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-300 ml-4">
              <li>不上传、传输或分享任何非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</li>
              <li>不侵犯他人的知识产权、隐私权或其他权利</li>
              <li>不干扰或破坏服务或与服务相连的服务器和网络</li>
              <li>遵守所有适用的法律法规</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">4. 内容所有权</h2>
            <p className="text-dark-300 leading-relaxed">
              您保留对您上传到 Easy Stream 的所有内容的所有权。通过上传内容，您授予我们在提供服务所必需的范围内使用、存储和传输您的内容的非独占许可。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">5. 隐私</h2>
            <p className="text-dark-300 leading-relaxed">
              我们重视您的隐私。有关我们如何收集、使用和保护您的个人信息的详细信息，请参阅我们的{' '}
              <Link to="/privacy" className="text-gold-400 hover:text-gold-300 transition-colors">
                隐私政策
              </Link>
              。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">6. 免责声明</h2>
            <p className="text-dark-300 leading-relaxed">
              本服务按"现状"和"可用"基础提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、及时、安全或无错误。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">7. 责任限制</h2>
            <p className="text-dark-300 leading-relaxed">
              在法律允许的最大范围内，Easy Stream 及其开发者不对任何间接、偶然、特殊、后果性或惩罚性损害承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">8. 条款变更</h2>
            <p className="text-dark-300 leading-relaxed">
              我们保留随时修改这些条款的权利。我们将通过在网站上发布新条款来通知您任何更改。继续使用服务即表示您接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">9. 联系我们</h2>
            <p className="text-dark-300 leading-relaxed">
              如果您对这些条款有任何疑问，请通过 GitHub 与我们联系：
            </p>
            <a
              href="https://github.com/cg8-5712/Easy-Stream/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-gold-400 hover:text-gold-300 transition-colors"
            >
              https://github.com/cg8-5712/Easy-Stream/issues
            </a>
          </section>
        </Card>
      </main>
    </div>
  )
}
