import api from './api'
import type { SystemStats, HealthResponse } from '@/types'

export const systemService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/system/health')
    return response.data
  },

  async getStats(): Promise<SystemStats> {
    const response = await api.get<SystemStats>('/system/stats')
    return response.data
  },
}
