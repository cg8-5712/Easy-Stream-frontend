import { Radio, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-dark-800/50 bg-dark-950/50 backdrop-blur-sm">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between text-sm text-dark-500">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-gold-500" />
            <span>Easy Stream</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/cg8-5712/Easy-Stream-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
                title="前端项目"
              >
                <Github className="w-4 h-4" />
                <span>Frontend</span>
              </a>
              <span className="text-dark-700">|</span>
              <a
                href="https://github.com/cg8-5712/Easy-Stream"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
                title="后端项目"
              >
                <Github className="w-4 h-4" />
                <span>Backend</span>
              </a>
            </div>
            <span className="text-dark-700">|</span>
            <a
                href="http://github.com/cg8-5712"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
                title="前端项目"
            >
              <p>Powered by Easy Stream</p>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
