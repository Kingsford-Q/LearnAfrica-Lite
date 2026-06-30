import { useEffect, useState } from 'react'
import { Star, Loader2, MessageSquare } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { api } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

export function InstructorReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      setIsLoading(true)
      try {
        const courses = await api.get('/api/courses/mine')
        const reviewLists = await Promise.all(
          courses.map((c) => api.get(`/api/courses/${c.id}/reviews`).then((rs) => rs.map((r) => ({ ...r, courseTitle: c.title }))))
        )
        const all = reviewLists.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setReviews(all)
      } catch (err) {
        setError(err.message || 'Failed to load reviews')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Feedback from students across all of your courses.</p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-xl">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="font-bold text-sm">{avgRating}</span>
            <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary/60" /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews yet" description="Reviews from your students will appear here once they start rating your courses." />
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5 border-border/60 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold shrink-0 overflow-hidden">
                    {review.userAvatar ? <img src={review.userAvatar} alt={review.userName} className="h-full w-full object-cover" /> : getInitials(review.userName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{review.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{review.courseTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn('h-3.5 w-3.5', i <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30')} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{review.comment}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
