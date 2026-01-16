import api from './api'
import type {
  ShareLink,
  ShareLinkListResponse,
  CreateShareLinkRequest,
  VerifyShareLinkResponse,
} from '@/types'

export const shareLinkService = {
  // 获取分享链接列表 (管理员)
  async getShareLinks(streamKey: string): Promise<ShareLinkListResponse> {
    const response = await api.get<ShareLinkListResponse>(`/streams/${streamKey}/share-links`)
    return response.data
  },

  // 创建分享链接 (管理员)
  async createShareLink(streamKey: string, data?: CreateShareLinkRequest): Promise<ShareLink> {
    const response = await api.post<ShareLink>(`/streams/${streamKey}/share-links`, data)
    return response.data
  },

  // 更新分享链接使用次数 (管理员)
  async updateShareLinkMaxUses(id: number, maxUses: number): Promise<ShareLink> {
    const response = await api.patch<ShareLink>(`/streams/share-links/${id}`, { max_uses: maxUses })
    return response.data
  },

  // 删除分享链接 (管理员)
  async deleteShareLink(id: number): Promise<void> {
    await api.delete(`/streams/share-links/${id}`)
  },

  // 验证分享链接 (游客)
  async verifyShareLink(token: string): Promise<VerifyShareLinkResponse> {
    const response = await api.get<VerifyShareLinkResponse>(`/shares/link/${token}`)
    return response.data
  },
}
