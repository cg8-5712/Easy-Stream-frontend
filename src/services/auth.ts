import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  User,
} from '@/types'

export interface InitStatusResponse {
  initialized: boolean
}

export interface InitializeAdminRequest {
  username: string
  password: string
  // 数据库配置
  database_type: 'sqlite' | 'postgres' | 'mysql'
  database_filepath: string
  database_host: string
  database_port: string
  database_user: string
  database_password: string
  database_name: string
  database_sslmode: string
  // Redis 配置
  redis_host: string
  redis_port: string
  redis_password: string
  redis_db: number
  // ZLMediaKit 配置
  zlm_host: string
  zlm_port: string
  zlm_secret: string
  zlm_hook_base_url: string
  // JWT 配置
  jwt_secret: string
  // 服务器配置
  server_host: string
  server_port: string
}


export const authService = {
  async checkInitStatus(): Promise<InitStatusResponse> {
    const response = await api.get<InitStatusResponse>('/auth/init-status')
    return response.data
  },

  async initializeAdmin(data: InitializeAdminRequest): Promise<void> {
    await api.post('/auth/initialize', data)
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async refresh(data: RefreshRequest): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>('/auth/refresh', data)
    return response.data
  },

  async logout(refreshToken?: string): Promise<void> {
    await api.post('/auth/logout', { refresh_token: refreshToken })
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },
}
