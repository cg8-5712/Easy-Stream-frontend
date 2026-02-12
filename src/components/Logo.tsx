interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  animated?: boolean
}

const sizeMap = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 40, text: 'text-base' },
  lg: { icon: 48, text: 'text-lg' },
  xl: { icon: 64, text: 'text-xl' },
}

export function Logo({ size = 'md', className = '', showText = true, animated = true }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FBBF24' }} />
              <stop offset="100%" style={{ stopColor: '#D97706' }} />
            </linearGradient>
            <linearGradient id="logoWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle cx="256" cy="256" r="240" fill="url(#logoGoldGradient)" />

          {/* Inner Dark Circle */}
          <circle cx="256" cy="256" r="200" fill="#0f0f0f" />

          {/* Signal Waves */}
          {animated && (
            <g fill="none" stroke="url(#logoWaveGradient)" strokeWidth="8" strokeLinecap="round">
              <path d="M 120 256 Q 120 180, 180 140" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 100 256 Q 100 160, 160 100" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin="0.3s" repeatCount="indefinite" />
              </path>

              <path d="M 392 256 Q 392 180, 332 140" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 412 256 Q 412 160, 352 100" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin="0.3s" repeatCount="indefinite" />
              </path>

              <path d="M 120 256 Q 120 332, 180 372" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 100 256 Q 100 352, 160 412" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin="0.3s" repeatCount="indefinite" />
              </path>

              <path d="M 392 256 Q 392 332, 332 372" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 412 256 Q 412 352, 352 412" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin="0.3s" repeatCount="indefinite" />
              </path>
            </g>
          )}

          {/* Play Button Triangle */}
          <polygon points="220,176 220,336 340,256" fill="url(#logoGoldGradient)">
            {animated && (
              <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
            )}
          </polygon>

          {/* Glow Effect */}
          {animated && (
            <circle cx="256" cy="256" r="60" fill="none" stroke="url(#logoGoldGradient)" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="60;70;60" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div>
          <h1 className={`font-semibold text-gold-gradient ${textSize}`}>Easy Stream</h1>
          <p className="text-xs text-dark-500">直播平台</p>
        </div>
      )}
    </div>
  )
}
