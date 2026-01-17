import { useState } from 'react'
import { Button, Input, Modal } from '@/components/ui'
import { streamService } from '@/services'
import type { CreateStreamRequest } from '@/types'

interface CreateStreamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateStreamModal({ isOpen, onClose, onSuccess }: CreateStreamModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateStreamRequest>({
    name: '',
    description: '',
    visibility: 'public',
    streamer_name: '',
    streamer_contact: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    record_enabled: false,
    auto_kick_delay: 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await streamService.createStream({
        ...formData,
        scheduled_start_time: new Date(formData.scheduled_start_time).toISOString(),
        scheduled_end_time: new Date(formData.scheduled_end_time).toISOString(),
      })
      onSuccess()
      // Reset form
      setFormData({
        name: '',
        description: '',
        visibility: 'public',
        streamer_name: '',
        streamer_contact: '',
        scheduled_start_time: '',
        scheduled_end_time: '',
        record_enabled: false,
        auto_kick_delay: 30,
      })
    } catch (error) {
      console.error('Failed to create stream:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建直播" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="直播名称"
            placeholder="输入直播名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="主播姓名"
            placeholder="输入主播姓名"
            value={formData.streamer_name}
            onChange={(e) => setFormData({ ...formData, streamer_name: e.target.value })}
            required
          />
        </div>

        <Input
          label="直播描述"
          placeholder="输入直播描述（可选）"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="联系方式"
            placeholder="输入联系方式（可选）"
            value={formData.streamer_contact}
            onChange={(e) => setFormData({ ...formData, streamer_contact: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              可见性
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
              className="input-dark"
            >
              <option value="public">公开</option>
              <option value="private">私有</option>
            </select>
          </div>
        </div>

        {formData.visibility === 'private' && (
          <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/20">
            <p className="text-sm text-gold-400">
              私有直播创建后将自动生成 8 位分享码，可在直播详情页查看和管理
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="预计开始时间"
            type="datetime-local"
            value={formData.scheduled_start_time}
            onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
            required
          />
          <Input
            label="预计结束时间"
            type="datetime-local"
            value={formData.scheduled_end_time}
            onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.record_enabled}
              onChange={(e) => setFormData({ ...formData, record_enabled: e.target.checked })}
              className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-gold-500 focus:ring-gold-500/30"
            />
            <span className="text-sm text-dark-300">开启录制</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-400">超时断流延迟:</span>
            <input
              type="number"
              value={formData.auto_kick_delay}
              onChange={(e) => setFormData({ ...formData, auto_kick_delay: parseInt(e.target.value) })}
              className="w-20 input-dark py-1.5 text-center"
              min={0}
            />
            <span className="text-sm text-dark-500">分钟</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" loading={loading}>
            创建直播
          </Button>
        </div>
      </form>
    </Modal>
  )
}
