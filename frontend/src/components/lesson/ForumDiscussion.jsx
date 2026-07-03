import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, ChevronLeft, Send, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input, Textarea } from '@/components/common/Input'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/apiClient'

function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(isoDate).toLocaleDateString()
}

function Avatar({ name }) {
  const initial = name?.trim()?.[0]?.toUpperCase() || '?'
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
      {initial}
    </div>
  )
}

export function ForumDiscussion({ lessonId }) {
  const { user, refreshBadges } = useAuth()
  const [threads, setThreads] = useState([])
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [selectedThread, setSelectedThread] = useState(null)
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const canModerate = useCallback((ownerId) => {
    if (!user) return false
    return user.id === ownerId || user.role === 'admin' || user.role === 'superadmin'
  }, [user])

  const loadThreads = useCallback(() => {
    setIsLoadingThreads(true)
    api.get(`/api/lessons/${lessonId}/forum/threads`)
      .then(setThreads)
      .catch(() => setError('Could not load the discussion threads.'))
      .finally(() => setIsLoadingThreads(false))
  }, [lessonId])

  useEffect(() => {
    if (lessonId) loadThreads()
  }, [lessonId, loadThreads])

  const openThread = (threadId) => {
    setIsLoadingThread(true)
    setError('')
    api.get(`/api/forum/threads/${threadId}`)
      .then(setSelectedThread)
      .catch(() => setError('Could not load this discussion.'))
      .finally(() => setIsLoadingThread(false))
  }

  const handleCreateThread = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return
    setIsPosting(true)
    setError('')
    try {
      const thread = await api.post(`/api/lessons/${lessonId}/forum/threads`, {
        title: newTitle.trim(),
        body: newBody.trim(),
      })
      setNewTitle('')
      setNewBody('')
      setShowNewThread(false)
      loadThreads()
      setSelectedThread(thread)
      refreshBadges()
    } catch {
      setError('Could not post your question. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyBody.trim() || !selectedThread) return
    setIsReplying(true)
    setError('')
    try {
      const reply = await api.post(`/api/forum/threads/${selectedThread.id}/replies`, {
        body: replyBody.trim(),
      })
      setSelectedThread((prev) => ({ ...prev, replies: [...prev.replies, reply] }))
      setReplyBody('')
      refreshBadges()
    } catch {
      setError('Could not post your reply. Please try again.')
    } finally {
      setIsReplying(false)
    }
  }

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Delete this discussion? This cannot be undone.')) return
    setIsDeleting(true)
    setError('')
    try {
      await api.delete(`/api/forum/threads/${threadId}`)
      setSelectedThread(null)
      loadThreads()
    } catch {
      setError('Could not delete this discussion. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply? This cannot be undone.')) return
    setIsDeleting(true)
    setError('')
    try {
      await api.delete(`/api/forum/replies/${replyId}`)
      setSelectedThread((prev) => ({ ...prev, replies: prev.replies.filter((r) => r.id !== replyId) }))
    } catch {
      setError('Could not delete this reply. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // ===== Thread detail view =====
  if (selectedThread || isLoadingThread) {
    return (
      <Card className="p-5 sm:p-6 space-y-5">
        <button
          onClick={() => setSelectedThread(null)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to discussions
        </button>

        {isLoadingThread || !selectedThread ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <Avatar name={selectedThread.userName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base leading-snug">{selectedThread.title}</h3>
                  {canModerate(selectedThread.userId) && (
                    <button
                      onClick={() => handleDeleteThread(selectedThread.id)}
                      disabled={isDeleting}
                      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      aria-label="Delete discussion"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selectedThread.userName} &middot; {timeAgo(selectedThread.createdAt)}
                </p>
                <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">{selectedThread.body}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/60">
              {selectedThread.replies.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No replies yet. Be the first to respond.</p>
              ) : (
                selectedThread.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <Avatar name={reply.userName} />
                    <div className="min-w-0 flex-1 bg-muted/30 rounded-lg px-3.5 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold text-foreground">
                          {reply.userName}{' '}
                          <span className="font-normal text-muted-foreground">&middot; {timeAgo(reply.createdAt)}</span>
                        </p>
                        {canModerate(reply.userId) && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            disabled={isDeleting}
                            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            aria-label="Delete reply"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{reply.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReply} className="flex items-start gap-3 pt-3 border-t border-border/60">
              <Avatar name={user?.name} />
              <div className="flex-1 space-y-2">
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[70px] text-sm"
                />
                <div className="flex justify-center sm:justify-end">
                  <Button type="submit" size="sm" disabled={isReplying || !replyBody.trim()} className="gap-1.5 w-full sm:w-auto">
                    {isReplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Reply
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}
      </Card>
    )
  }

  // ===== New thread composer =====
  if (showNewThread) {
    return (
      <Card className="p-5 sm:p-6 space-y-4">
        <button
          onClick={() => setShowNewThread(false)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to discussions
        </button>
        <h3 className="font-bold text-base">Ask a question</h3>
        <form onSubmit={handleCreateThread} className="space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Question title"
            maxLength={150}
          />
          <Textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Describe what you're stuck on..."
            className="min-h-[100px] text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-center sm:justify-end">
            <Button type="submit" size="sm" disabled={isPosting || !newTitle.trim() || !newBody.trim()} className="gap-1.5 w-full sm:w-auto">
              {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Post Question
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  // ===== Thread list view =====
  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-base flex items-center gap-2 whitespace-nowrap">
          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
          Community Discussion
        </h3>
        <Button size="sm" onClick={() => setShowNewThread(true)} className="gap-1.5 shrink-0 px-2.5 sm:px-3">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>

      {isLoadingThreads ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-lg bg-muted/20">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No discussions yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-xs mx-auto">
            Have a question about this lesson? Start the conversation.
          </p>
          <Button size="sm" onClick={() => setShowNewThread(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Ask a Question
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => openThread(thread.id)}
              className="w-full text-left flex items-start gap-3 p-3.5 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/30 transition-colors"
            >
              <Avatar name={thread.userName} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{thread.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {thread.userName} &middot; {timeAgo(thread.createdAt)}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {thread.replyCount}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </Card>
  )
}
