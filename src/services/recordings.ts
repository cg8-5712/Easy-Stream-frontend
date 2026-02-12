import api from './api'
import type {
  Recording,
  RecordingListResponse,
  RecordingListParams,
} from '@/types'

export const recordingService = {
  // 获取录像列表
  async getRecordings(params?: RecordingListParams): Promise<RecordingListResponse> {
    const response = await api.get<RecordingListResponse>('/recordings', { params })
    return response.data
  },

  // 获取录像详情
  async getRecordingById(id: number): Promise<Recording> {
    const response = await api.get<Recording>(`/recordings/${id}`)
    return response.data
  },

  // 删除录像
  async deleteRecording(id: number): Promise<void> {
    await api.delete(`/recordings/${id}`)
  },

  // 获取录像下载URL
  getDownloadUrl(id: number): string {
    return `${api.defaults.baseURL}/recordings/${id}/download`
  },
}
