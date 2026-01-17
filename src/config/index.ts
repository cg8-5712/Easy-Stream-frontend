// 应用配置

// ZLMediaKit 流媒体服务器配置
export const zlmConfig = {
  // 服务器地址，默认使用当前页面的主机名
  host: import.meta.env.VITE_ZLM_HOST || window.location.hostname,
  // HTTP API 端口
  port: Number(import.meta.env.VITE_ZLM_PORT) || 8080,
  // 应用名称
  app: import.meta.env.VITE_ZLM_APP || 'live',
  // 是否使用 HTTPS
  useSSL: import.meta.env.VITE_ZLM_USE_SSL === 'true',
}

// API 配置
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
}

// 获取 ZLM WebRTC API 地址
export function getZLMWebRTCUrl(streamKey: string): string {
  const protocol = zlmConfig.useSSL ? 'https' : 'http'
  return `${protocol}://${zlmConfig.host}:${zlmConfig.port}/index/api/webrtc?app=${zlmConfig.app}&stream=${streamKey}&type=play`
}
