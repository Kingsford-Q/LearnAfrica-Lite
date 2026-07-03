import { useState } from 'react'
import { Megaphone, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Input, Textarea, Label } from '@/components/common/Input'
import { api, ApiError } from '@/lib/apiClient'

const DURATION_OPTIONS = [
  { label: '1 day', value: '1' },
  { label: '3 days', value: '3' },
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: 'Never expires', value: '' },
]

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [durationDays, setDurationDays] = useState('7')
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', text }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    setIsSending(true)
    setStatus(null)
    try {
      const result = await api.post('/api/admin/announcements', {
        title: title.trim(),
        message: message.trim(),
        durationDays: durationDays ? Number(durationDays) : null,
      })
      setStatus({
        type: 'success',
        text: `Sent to ${result.recipientCount} learner${result.recipientCount === 1 ? '' : 's'} who have Product Updates notifications enabled.`,
      })
      setTitle('')
      setMessage('')
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to send announcement.' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send a platform-wide notification to every user who hasn't opted out of Product Updates.
        </p>
      </div>

      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
          status.type === 'success'
            ? 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400'
            : 'bg-destructive/5 border-destructive/20 text-destructive'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
          {status.text}
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">New Announcement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New badges just launched"
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write what you'd like learners to know..."
                className="min-h-[140px]"
                maxLength={2000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Active for</Label>
              <select
                id="duration"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="h-10 w-full sm:w-48 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                After this, the notification stops showing up for anyone who received it (it isn't deleted, just hidden).
              </p>
            </div>
            <Button type="submit" disabled={isSending || !title.trim() || !message.trim()} className="gap-2">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? 'Sending...' : 'Send to All Users'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
