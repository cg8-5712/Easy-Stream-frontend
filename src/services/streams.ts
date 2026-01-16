import api from './api'
import type {
  Stream,
  StreamListResponse,
  CreateStreamRequest,
  UpdateStreamRequest,
  VerifyPasswordRequest,
  VerifyPasswordResponse,
} from '@/types'

export interface StreamListParams {
  status?: string
  visibility?: string
  time_range?: string
  page?: number
  pageSize?: number
}

export const streamService = {
  async getStreams(params?: StreamListParams): Promise<StreamListResponse> {
    const response = await api.get<StreamListResponse>('/streams', { params })
    return response.data
  },

  async getStreamById(id: number): Promise<Stream> {
    const response = await api.get<Stream>(`/streams/id/${id}`)
    return response.data
  },

  async getStreamByKey(key: string, accessToken?: string): Promise<Stream> {
    const params = accessToken ? { access_token: accessToken } : undefined
    const response = await api.get<Stream>(`/streams/${key}`, { params })
    return response.data
  },

  async createStream(data: CreateStreamRequest): Promise<Stream> {
    const response = await api.post<Stream>('/streams', data)
    return response.data
  },

  async updateStream(key: string, data: UpdateStreamRequest): Promise<Stream> {
    const response = await api.put<Stream>(`/streams/${key}`, data)
    return response.data
  },

  async deleteStream(key: string): Promise<void> {
    await api.delete(`/streams/${key}`)
  },

  async kickStream(key: string): Promise<void> {
    await api.post(`/streams/${key}/kick`)
  },

  async verifyPassword(key: string, data: VerifyPasswordRequest): Promise<VerifyPasswordResponse> {
    const response = await api.post<VerifyPasswordResponse>(`/streams/${key}/verify`, data)
    return response.data
  },
}
