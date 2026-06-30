import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2, Plus, Users, Star, Eye, EyeOff, Trash2, BookOpen, MoreVertical
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { api, fileUrl } from '@/lib/apiClient'

export function MyCoursesPage() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get('/api/courses/mine')
      setCourses(data)
    } catch (err) {
      setError(err.message || 'Failed to load your courses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const togglePublish = async (course) => {
    setBusyId(course.id)
    setMenuOpenId(null)
    try {
      const action = course.status === 'Published' ? 'unpublish' : 'publish'
      const updated = await api.post(`/api/courses/${course.id}/${action}`)
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, status: updated.status } : c)))
    } catch (err) {
      setError(err.message || 'Failed to update course')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      await api.delete(`/api/courses/${deleteTarget.id}`)
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to delete course')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage, publish, and track all the courses you've created.</p>
        </div>
        <Link to="/instructor/courses/create">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Create New Course</Button>
        </Link>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary/60" /></div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Start building your first course — add lessons, quizzes, and resources for your students."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-border/60 shadow-sm group">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={fileUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <BookOpen className="h-10 w-10 text-primary/40" />
                  </div>
                )}
                <Badge
                  variant={course.status === 'Published' ? 'success' : 'secondary'}
                  className="absolute top-3 left-3"
                >
                  {course.status}
                </Badge>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === course.id ? null : course.id)}
                    className="h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-background"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpenId === course.id && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-10">
                      <button
                        disabled={busyId === course.id}
                        onClick={() => togglePublish(course)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted text-left"
                      >
                        {course.status === 'Published' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {course.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(course); setMenuOpenId(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive text-left"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{course.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollments}</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {course.rating || '—'}</span>
                  <span>{course.isFree ? 'Free' : `$${course.price}`}</span>
                </div>
                <Link to={`/instructor/courses/${course.id}/students`}>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <Users className="h-3.5 w-3.5" /> View Students
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Delete "{deleteTarget?.title}"?</h2>
          <p className="text-sm text-muted-foreground">This permanently removes the course, its curriculum, and all enrollment data. This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={busyId === deleteTarget?.id} onClick={handleDelete}>Delete Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
