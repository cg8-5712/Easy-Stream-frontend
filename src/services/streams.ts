import api from './api'
import type {
  Stream,
  StreamListResponse,
  CreateStreamRequest,
  UpdateStreamRequest,
  VerifyShareCodeRequest,
  VerifyShareCodeResponse,
  ShareCodeRequest,
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

  // 验证分享码 (游客)
  async verifyShareCode(data: VerifyShareCodeRequest): Promise<VerifyShareCodeResponse> {
    const response = await api.post<VerifyShareCodeResponse>('/shares/verify-code', data)
    return response.data
  },

  // 添加分享码 (管理员)
  async addShareCode(key: string, data?: ShareCodeRequest): Promise<Stream> {
    const response = await api.post<Stream>(`/streams/${key}/share-code`, data)
    return response.data
  },

  // 重新生成分享码 (管理员)
  async regenerateShareCode(key: string, data?: ShareCodeRequest): Promise<Stream> {
    const response = await api.put<Stream>(`/streams/${key}/share-code`, data)
    return response.data
  },

  // 更新分享码使用次数 (管理员)
  async updateShareCodeMaxUses(key: string, maxUses: number): Promise<Stream> {
    const response = await api.patch<Stream>(`/streams/${key}/share-code`, { max_uses: maxUses })
    return response.data
  },

  // 删除分享码 (管理员)
  async deleteShareCode(key: string): Promise<void> {
    await api.delete(`/streams/${key}/share-code`)
  },
}
