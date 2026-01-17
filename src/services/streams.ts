import api from './api'
import type {
  Stream,
  StreamView,
  StreamListResponse,
  StreamViewListResponse,
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
  access_token?: string
}

export const streamService = {
  // 管理员获取直播列表
  async getStreams(params?: StreamListParams): Promise<StreamListResponse> {
    const response = await api.get<StreamListResponse>('/streams', { params })
    return response.data
  },

  // 游客获取直播列表（带 access_token）
  async getStreamsForGuest(accessToken?: string, params?: Omit<StreamListParams, 'access_token'>): Promise<StreamViewListResponse> {
    const queryParams = { ...params, access_token: accessToken }
    const response = await api.get<StreamViewListResponse>('/streams', { params: queryParams })
    return response.data
  },

  // 管理员通过 ID 获取直播
  async getStreamById(id: number): Promise<Stream> {
    const response = await api.get<Stream>(`/streams/id/${id}`)
    return response.data
  },

  // 游客通过 ID 获取直播详情（不含 stream_key）
  async getStreamViewById(id: number, accessToken?: string): Promise<StreamView> {
    const params = accessToken ? { access_token: accessToken } : undefined
    const response = await api.get<StreamView>(`/streams/view/${id}`, { params })
    return response.data
  },

  // 管理员通过 key 获取直播
  async getStreamByKey(key: string): Promise<Stream> {
    const response = await api.get<Stream>(`/streams/${key}`)
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
