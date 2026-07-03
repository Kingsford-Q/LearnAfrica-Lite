import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Users, FileQuestion } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { api, fileUrl, ApiError } from '@/lib/apiClient'

export function CourseStudentsPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    (async () => {
      setIsLoading(true)
      setNotFound(false)
      setError('')
      try {
        const [studentsData, courseData] = await Promise.all([
          api.get(`/api/courses/${courseId}/students`),
          api.get(`/api/courses/${courseId}`),
        ])
        setStudents(studentsData)
        setCourse(courseData)
      } catch (err) {
        // A course referenced by an older link (e.g. a notification) can
        // legitimately no longer exist if it was since deleted — that's a
        // normal state to handle gracefully, not just an error banner.
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err.message || 'Failed to load students')
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [courseId])

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  if (!isLoading && notFound) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Courses
        </Link>
        <EmptyState
          icon={FileQuestion}
          title="This course no longer exists"
          description="It may have been deleted since this link was created."
          action={() => navigate('/instructor/courses')}
          actionLabel="Back to My Courses"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Courses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{course?.title || 'Students'}</h1>
        <p className="text-sm text-muted-foreground mt-1">{students.length} enrolled student{students.length === 1 ? '' : 's'}</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary/60" /></div>
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" description="Once learners enroll in this course, they'll show up here with their progress." />
      ) : (
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border/50">
              <tr>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Student</th>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Enrolled</th>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {students.map((s) => (
                <tr key={s.userId} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-secondary-foreground shrink-0 overflow-hidden">
                        {s.avatar ? <img src={fileUrl(s.avatar)} alt={s.name} className="h-full w-full object-cover" /> : getInitials(s.name)}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{new Date(s.enrolledAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary/70" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">{s.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
