import { useNavigate } from 'react-router-dom'
import { Radio, ArrowLeft, Shield } from 'lucide-react'
import { Card } from '@/components/ui'

export function PrivacyPage() {
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
                  <p className="text-xs text-dark-500">隐私政策</p>
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
            <h1 className="text-3xl font-bold text-dark-100">隐私政策</h1>
          </div>
          <p className="text-dark-400">最后更新：2026年2月</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">1. 引言</h2>
            <p className="text-dark-300 leading-relaxed">
              Easy Stream 重视您的隐私。本隐私政策说明了我们如何收集、使用、披露和保护您的个人信息。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">2. 我们收集的信息</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-dark-200 mb-2">2.1 账户信息</h3>
                <p className="text-dark-300 leading-relaxed">
                  当您注册管理员账户时，我们会收集您的用户名、邮箱、电话号码和真实姓名。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-dark-200 mb-2">2.2 使用数据</h3>
                <p className="text-dark-300 leading-relaxed">
                  我们会收集有关您如何使用服务的信息，包括访问时间、浏览的页面、IP 地址和设备信息。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-dark-200 mb-2">2.3 直播内容</h3>
                <p className="text-dark-300 leading-relaxed">
                  当您创建直播时，我们会存储直播的元数据（名称、描述、时间等）。如果启用录制功能，我们会存储直播的视频内容。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">3. 我们如何使用您的信息</h2>
            <p className="text-dark-300 leading-relaxed mb-3">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-300 ml-4">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>向您发送技术通知、更新和安全警报</li>
              <li>监控和分析使用趋势和活动</li>
              <li>检测、预防和解决技术问题</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">4. 信息共享</h2>
            <p className="text-dark-300 leading-relaxed mb-3">
              我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-300 ml-4">
              <li>经您同意</li>
              <li>遵守法律义务</li>
              <li>保护我们的权利和安全</li>
              <li>与服务提供商（如云存储服务）共享，以提供服务</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">5. 数据安全</h2>
            <p className="text-dark-300 leading-relaxed">
              我们采取合理的技术和组织措施来保护您的个人信息免遭未经授权的访问、使用或披露。这包括使用加密、访问控制和安全的服务器。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">6. 数据保留</h2>
            <p className="text-dark-300 leading-relaxed">
              我们会在提供服务所需的时间内保留您的个人信息。当您删除账户或直播时，相关数据将被永久删除。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">7. 您的权利</h2>
            <p className="text-dark-300 leading-relaxed mb-3">
              您对您的个人信息拥有以下权利：
            </p>
            <ul className="list-disc list-inside space-y-2 text-dark-300 ml-4">
              <li>访问和获取您的个人信息副本</li>
              <li>更正不准确的个人信息</li>
              <li>删除您的个人信息</li>
              <li>反对或限制某些处理活动</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">8. Cookies</h2>
            <p className="text-dark-300 leading-relaxed">
              我们使用 Cookies 和类似技术来维护会话状态和改善用户体验。您可以通过浏览器设置控制 Cookies 的使用。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">9. 第三方服务</h2>
            <p className="text-dark-300 leading-relaxed">
              我们的服务可能包含指向第三方网站的链接。我们不对这些第三方网站的隐私做法负责。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">10. 儿童隐私</h2>
            <p className="text-dark-300 leading-relaxed">
              我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">11. 政策变更</h2>
            <p className="text-dark-300 leading-relaxed">
              我们可能会不时更新本隐私政策。我们将通过在网站上发布新政策来通知您任何更改。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-4">12. 联系我们</h2>
            <p className="text-dark-300 leading-relaxed">
              如果您对本隐私政策有任何疑问，请通过 GitHub 与我们联系：
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
