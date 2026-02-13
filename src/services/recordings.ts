import api from './api'
import type {
  RecordingListResponse,
  RecordingListParams,
  StreamRecordingResponse,
} from '@/types'

export const recordingService = {
  // 获取所有录制文件列表（管理员）
  async getRecordings(params?: RecordingListParams): Promise<RecordingListResponse> {
    const response = await api.get<RecordingListResponse>('/records', { params })
    return response.data
  },

  // 获取指定直播的录制文件（管理员）
  async getRecordingsByKey(streamKey: string): Promise<StreamRecordingResponse> {
    const response = await api.get<StreamRecordingResponse>(`/records/${streamKey}`)
    return response.data
  },

  // 删除录制文件（管理员）
  async deleteRecording(streamKey: string, fileName: string): Promise<void> {
    await api.delete(`/records/${streamKey}/delete/${encodeURIComponent(fileName)}`)
  },

  // 获取录制文件下载URL
  getDownloadUrl(streamKey: string, fileName: string): string {
    return `${api.defaults.baseURL}/records/${streamKey}/download/${encodeURIComponent(fileName)}`
  },

  // 下载录制文件（支持公开和私有直播）
  async downloadRecording(streamKey: string, fileName: string, token?: string): Promise<void> {
    const url = this.getDownloadUrl(streamKey, fileName)

    if (token) {
      // 私有直播需要 token
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.redirected) {
        // 远程模式：重定向到对象存储
        window.location.href = response.url
      } else {
        // 本地模式：直接下载
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } else {
      // 公开直播直接跳转
      window.location.href = url
    }
  },
}
