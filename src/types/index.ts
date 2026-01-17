// User types
export interface User {
  id: number
  username: string
  email: string
  phone: string
  real_name: string
  avatar: string
  last_login_at: string
  created_at: string
  updated_at: string
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

// Stream types
export type StreamStatus = 'idle' | 'pushing' | 'ended'
export type StreamVisibility = 'public' | 'private'

export interface Stream {
  id: number
  stream_key: string
  name: string
  description: string
  device_id: string
  status: StreamStatus
  visibility: StreamVisibility
  share_code?: string
  share_code_max_uses?: number
  share_code_used_count?: number
  record_enabled: boolean
  record_files: string[]
  protocol: string
  bitrate: number
  fps: number
  streamer_name: string
  streamer_contact: string
  scheduled_start_time: string
  scheduled_end_time: string
  auto_kick_delay: number
  actual_start_time: string | null
  actual_end_time: string | null
  last_frame_at: string | null
  current_viewers: number
  total_viewers: number
  peak_viewers: number
  created_by: number
  created_at: string
  updated_at: string
}

export interface StreamListResponse {
  total: number
  streams: Stream[]
}

// StreamView - 游客看到的直播信息（不含 stream_key）
export interface StreamView {
  id: number
  name: string
  description: string
  device_id: string
  status: StreamStatus
  visibility: StreamVisibility
  record_enabled: boolean
  record_files: string[]
  protocol: string
  bitrate: number
  fps: number
  streamer_name: string
  streamer_contact: string
  scheduled_start_time: string
  scheduled_end_time: string
  auto_kick_delay: number
  actual_start_time: string | null
  actual_end_time: string | null
  last_frame_at: string | null
  current_viewers: number
  total_viewers: number
  peak_viewers: number
  created_by: number
  created_at: string
  updated_at: string
}

export interface StreamViewListResponse {
  total: number
  streams: StreamView[]
}

export interface CreateStreamRequest {
  name: string
  description?: string
  device_id?: string
  visibility: StreamVisibility
  record_enabled?: boolean
  streamer_name: string
  streamer_contact?: string
  scheduled_start_time: string
  scheduled_end_time: string
  auto_kick_delay?: number
}

export interface UpdateStreamRequest {
  name?: string
  description?: string
  device_id?: string
  visibility?: StreamVisibility
  share_code_max_uses?: number
  record_enabled?: boolean
  streamer_name?: string
  streamer_contact?: string
  scheduled_start_time?: string
  scheduled_end_time?: string
  auto_kick_delay?: number
}

// Share code verification types
export interface VerifyShareCodeRequest {
  share_code: string
}

export interface VerifyShareCodeResponse {
  stream_id: number
  access_token: string
  expires_at: string
}

// Share link types
export interface ShareLink {
  id: number
  stream_key: string
  token: string
  max_uses: number
  used_count: number
  created_by: number
  created_at: string
  stream?: Stream
}

export interface ShareLinkListResponse {
  total: number
  links: ShareLink[]
}

export interface CreateShareLinkRequest {
  max_uses?: number
}

export interface VerifyShareLinkResponse {
  stream_id: number
  access_token: string
  expires_at: string
}

export interface ShareCodeRequest {
  max_uses?: number
}

// System types
export interface SystemStats {
  online_streams: number
  total_streams: number
}

export interface HealthResponse {
  status: string
}

// API Error
export interface ApiError {
  error: string
}
