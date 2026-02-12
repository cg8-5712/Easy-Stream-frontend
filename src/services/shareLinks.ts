import api from './api'
import type {
  ShareLink,
  ShareLinkListResponse,
  CreateShareLinkRequest,
  VerifyShareLinkResponse,
} from '@/types'

export const shareLinkService = {
  // 获取分享链接列表 (管理员)
  async getShareLinks(): Promise<ShareLinkListResponse> {
    const response = await api.get<ShareLinkListResponse>('/shares/links')
    return response.data
  },

  // 创建分享链接 (管理员)
  async createShareLink(streamKey: string, data?: CreateShareLinkRequest): Promise<ShareLink> {
    const response = await api.post<ShareLink>(`/shares/links/${streamKey}`, data)
    return response.data
  },

  // 删除分享链接 (管理员)
  async deleteShareLink(token: string): Promise<void> {
    await api.delete(`/shares/links/${token}`)
  },

  // 验证分享链接 (游客)
  async verifyShareLink(token: string): Promise<VerifyShareLinkResponse> {
    const response = await api.post<VerifyShareLinkResponse>('/shares/verify-link', { token })
    return response.data
  },
}
