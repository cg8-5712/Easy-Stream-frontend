import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  User,
} from '@/types'

export const authService = {
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
