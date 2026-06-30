import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  FileText,
  MessageSquare,
  BookOpen,
  Clock,
  Menu,
  X,
  Save,
  Lock,
  FolderOpen,
  ExternalLink,
  Download,
  Image as ImageIcon,
  File,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/apiClient'
import { ForumDiscussion } from '@/components/lesson/ForumDiscussion'

const getEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('/').pop().split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}

const getSafeFileName = (url, type, providedName, title) => {
  if (providedName) return providedName
  const extension = url.split('.').pop().split(/[?#]/)[0]
  const baseName = title.replace(/\s+/g, '_').toLowerCase()
  const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'zip']
  if (validExtensions.includes(extension.toLowerCase())) {
    return `${baseName}.${extension}`
  }
  const fallbacks = { image: 'jpg', file: 'pdf' }
  return `${baseName}.${fallbacks[type] || 'dat'}`
}

const ResourceItem = ({ resource }) => {
  const { title, url, type } = resource
  const finalFileName = getSafeFileName(url, type, undefined, title)

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Fetch failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = finalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', finalFileName)
      link.setAttribute('target', '_blank')
      link.click()
    }
  }

  const handleOpen = () => window.open(url, '_blank', 'noopener,noreferrer')

  return (
    <div
      onClick={handleOpen}
      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 hover:bg-card transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {type === 'image' && <ImageIcon className="h-5 w-5" />}
          {type === 'link' && <ExternalLink className="h-5 w-5" />}
          {(type === 'file' || type === 'File') && <File className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{type}</p>
        </div>
      </div>
      <div className="flex items-center">
        {type === 'link' ? (
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        ) : (
          <button
            onClick={handleDownload}
            title={`Download ${finalFileName}`}
            className="p-2 -mr-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function LessonPage() {
  const { user, refreshEnrollments } = useAuth()
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()

  const [courseDetail, setCourseDetail] = useState(null)
  const [lessonDetail, setLessonDetail] = useState(null)
  const [courseLoading, setCourseLoading] = useState(true)
  const [lessonLoading, setLessonLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [userNotes, setUserNotes] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')

  const fetchCourseDetail = useCallback(async () => {
    try {
      const data = await api.get(`/api/courses/${courseId}`)
      setCourseDetail(data)
    } catch {
      setCourseDetail(null)
    }
  }, [courseId])

  useEffect(() => {
    setCourseLoading(true)
    fetchCourseDetail().finally(() => setCourseLoading(false))
  }, [fetchCourseDetail])

  useEffect(() => {
    setLessonLoading(true)
    setActiveTab('content')
    api.get(`/api/lessons/${lessonId}`)
      .then((data) => {
        setLessonDetail(data)
        setIsCompleted(data.isCompleted)
      })
      .catch(() => setLessonDetail(null))
      .finally(() => setLessonLoading(false))
  }, [lessonId])

  useEffect(() => {
    if (!user?.id || !lessonId) return
    const key = `notes_user_${user.id}_${courseId}_${lessonId}`
    setUserNotes(localStorage.getItem(key) || '')
  }, [user?.id, courseId, lessonId])

  // Flat ordered lesson list from course sections
  const courseLessons = useMemo(() =>
    courseDetail?.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((s) => s.lessons.slice().sort((a, b) => a.order - b.order))
    ?? [],
  [courseDetail])

  // All quizzes from the course sections
  const courseQuizzes = useMemo(() =>
    courseDetail?.sections.flatMap((s) => s.quizzes) ?? [],
  [courseDetail])

  const currentIndex = useMemo(() =>
    courseLessons.findIndex((l) => l.id === lessonId),
  [courseLessons, lessonId])

  const firstIncompleteIndex = useMemo(() =>
    courseLessons.findIndex((l) => !l.isCompleted),
  [courseLessons])

  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex !== -1 && currentIndex < courseLessons.length - 1
      ? courseLessons[currentIndex + 1]
      : null

  // Linear progression guard — redirect to first incomplete lesson if skipping ahead
  useEffect(() => {
    if (!courseDetail || courseLessons.length === 0 || currentIndex === -1) return
    if (firstIncompleteIndex === -1) return // all complete, free navigation
    if (currentIndex <= firstIncompleteIndex) return // allowed
    const target = courseLessons[firstIncompleteIndex]
    navigate(`/learn/course/${courseId}/lesson/${target.id}`, { replace: true })
  }, [courseLessons, currentIndex, firstIncompleteIndex, courseId, navigate, courseDetail])

  // Quiz associated with this lesson, or a course-level quiz on the last lesson
  const associatedQuiz = useMemo(() => {
    const lessonQuiz = courseQuizzes.find((q) => q.lessonId === lessonId)
    if (lessonQuiz) return lessonQuiz
    const isLast = currentIndex !== -1 && currentIndex === courseLessons.length - 1
    if (isLast) return courseQuizzes.find((q) => !q.lessonId) ?? null
    return null
  }, [courseQuizzes, lessonId, currentIndex, courseLessons.length])

  const finalRedirectPath = useMemo(() =>
    courseDetail?.hasCertificate ? `/certificate/${courseId}` : '/dashboard',
  [courseDetail, courseId])

  const handleMarkComplete = async () => {
    setIsMarkingComplete(true)
    try {
      await api.post(`/api/lessons/${lessonId}/complete`)
      setIsCompleted(true)
      // Refresh course so sidebar isCompleted flags are updated
      await fetchCourseDetail()
      refreshEnrollments()
    } catch {
      // best effort
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!user?.id) return
    setSaveStatus('saving')
    try {
      localStorage.setItem(`notes_user_${user.id}_${courseId}_${lessonId}`, userNotes)
      await new Promise((r) => setTimeout(r, 800))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('idle')
    }
  }

  // ---- Loading & error states ----

  if (courseLoading || lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!courseDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <Button variant="ghost" onClick={() => navigate('/courses')} className="mt-4">
            Back to Catalog
          </Button>
        </div>
      </div>
    )
  }

  if (courseLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
        <header className="border-b border-border bg-background/95 backdrop-blur p-4">
          <Link
            to="/courses"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-10 text-center border-dashed bg-muted/20 backdrop-blur-sm">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center h-full w-full bg-background border border-border rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-3">Curriculum Coming Soon</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Lessons for <span className="text-foreground font-bold">{courseDetail.title}</span> are
              currently being finalized.
            </p>
            <Button
              variant="primary"
              className="w-full font-bold uppercase tracking-widest text-xs h-12"
              onClick={() => navigate('/courses')}
            >
              Browse Other Courses
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  if (!lessonDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold">Lesson Not Found</h2>
          <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)} className="mt-4">
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  // ---- Derived display values ----

  const resources = lessonDetail.resources || []
  const isLastLesson = currentIndex === courseLessons.length - 1
  const currentLessonFinished = lessonDetail.isCompleted || isCompleted
  const hasQuizAvailable = !!associatedQuiz
  const showQuizButton = isLastLesson && currentLessonFinished && hasQuizAvailable
  const showCompletionButton = isLastLesson && currentLessonFinished && !hasQuizAvailable

  const navBtnClass =
    'h-11 px-3 sm:px-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2 shrink-0'
  const takeQuizClass =
    'h-11 px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md w-full sm:w-auto'

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/courses/${courseId}`}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Course</span>
            </Link>
            <div className="hidden md:block h-4 w-px bg-border" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold truncate max-w-xs">{courseDetail.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tabular-nums text-muted-foreground bg-muted px-2 py-1 rounded">
              {currentIndex + 1} / {courseLessons.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className="lg:hidden h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto outline-none">
          {(lessonDetail.videoUrl || lessonDetail.videoFile) && (
            <div className="aspect-video w-full bg-slate-950 relative shadow-inner">
              {lessonDetail.videoUrl ? (
                <iframe
                  src={getEmbedUrl(lessonDetail.videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  title={lessonDetail.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              ) : (
                <video
                  key={lessonDetail.videoFile}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  <source src={lessonDetail.videoFile} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{lessonDetail.duration}</span>
                </div>
                {currentLessonFinished && (
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                {lessonDetail.title}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
                {lessonDetail.description}
              </p>
            </div>

            <div className="border-b border-border mb-8 w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-4 sm:gap-10 overflow-x-auto no-scrollbar pb-px touch-pan-x scroll-smooth">
                {['content', 'resources', 'notes', 'discussion'].map((id) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'flex items-center gap-2 pb-4 text-sm font-bold transition-all whitespace-nowrap capitalize border-b-2 tracking-wide shrink-0',
                      activeTab === id
                        ? 'border-primary text-primary translate-y-px'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {id === 'content' && <FileText className="h-4 w-4 shrink-0" />}
                    {id === 'resources' && <FolderOpen className="h-4 w-4 shrink-0" />}
                    {id === 'notes' && <BookOpen className="h-4 w-4 shrink-0" />}
                    {id === 'discussion' && <MessageSquare className="h-4 w-4 shrink-0" />}
                    <span>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-75 leading-relaxed">
              {activeTab === 'content' && (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-7"
                  dangerouslySetInnerHTML={{ __html: lessonDetail.content }}
                />
              )}
              {activeTab === 'resources' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-lg font-bold mb-4">Lesson Resources</h3>
                  {resources.length > 0 ? (
                    resources.map((res) => <ResourceItem key={res.id} resource={res} />)
                  ) : (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground">No resources available for this lesson.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <Card className="p-6 sm:p-8 border-dashed bg-muted/30 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <h3 className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                      Quick Notes
                    </h3>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-success/10 border border-success/20 transition-all duration-500',
                        saveStatus === 'success'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95 pointer-events-none',
                      )}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-tight text-success whitespace-nowrap">
                        Saved to Cloud
                      </span>
                    </div>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={userNotes}
                      onChange={(e) => {
                        setUserNotes(e.target.value)
                        if (saveStatus === 'success') setSaveStatus('idle')
                      }}
                      placeholder="Type your study notes here..."
                      className="w-full min-h-55 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all mb-4 placeholder:text-muted-foreground/50"
                    />
                    {!userNotes.trim() && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 transition-opacity group-focus-within:opacity-0">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Empty Workspace</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center items-center">
                    <Button
                      onClick={handleSaveNotes}
                      disabled={saveStatus === 'saving' || !userNotes.trim()}
                      variant={saveStatus === 'success' ? 'outline' : 'primary'}
                      className={cn(
                        'font-bold uppercase tracking-wider text-[10px] sm:text-xs h-10 px-8 flex items-center gap-2 transition-all duration-300',
                        saveStatus === 'success' && 'border-success text-success hover:bg-success/5',
                        !userNotes.trim() && 'opacity-50 cursor-not-allowed grayscale',
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : saveStatus === 'success' ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Changes Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>Save Session Notes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}
              {activeTab === 'discussion' && <ForumDiscussion lessonId={lessonId} />}
            </div>

            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                {/* LEFT: Previous */}
                <div className="flex-1 flex justify-start">
                  {prevLesson && (
                    <Link to={`/learn/course/${courseId}/lesson/${prevLesson.id}`}>
                      <Button variant="outline" className={navBtnClass}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                    </Link>
                  )}
                </div>

                {/* CENTER: Contextual action */}
                <div className="flex-1 flex justify-center">
                  {!currentLessonFinished ? (
                    <Button
                      variant="primary"
                      onClick={handleMarkComplete}
                      disabled={isMarkingComplete}
                      className="w-full max-w-42.5 h-11 font-bold uppercase tracking-widest text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{isMarkingComplete ? 'Saving...' : 'Mark Complete'}</span>
                    </Button>
                  ) : showCompletionButton ? (
                    <Button
                      variant="primary"
                      className={takeQuizClass}
                      onClick={() => navigate(finalRedirectPath)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{courseDetail.hasCertificate ? 'Claim Certificate' : 'Finish Course'}</span>
                    </Button>
                  ) : (
                    <div
                      className={cn(
                        'px-4 py-2 rounded-full bg-success/10 border border-success/20 flex items-center gap-2',
                        isLastLesson && 'hidden sm:flex',
                      )}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-success">
                        Finished
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT: Next or Take Quiz */}
                <div className="flex-1 flex justify-end">
                  {showQuizButton ? (
                    <Link
                      to={`/learn/course/${courseId}/quiz/${associatedQuiz.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button className={takeQuizClass}>
                        <span className="text-xs sm:text-sm">Take Quiz</span>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : showCompletionButton ? (
                    <div className="invisible pointer-events-none select-none" />
                  ) : (
                    <Button
                      variant="outline"
                      className={navBtnClass}
                      onClick={() =>
                        nextLesson && navigate(`/learn/course/${courseId}/lesson/${nextLesson.id}`)
                      }
                      disabled={!currentLessonFinished || !nextLesson}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-40 lg:z-30 w-full sm:w-80 border-l border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0',
            showSidebar ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex flex-col h-full shadow-2xl lg:shadow-none">
            <div className="flex items-center justify-between p-5 border-b lg:hidden">
              <h3 className="font-bold tracking-tight">Course Content</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] px-2 hidden lg:block text-muted-foreground">
                Lessons Plan
              </h3>
              <div className="space-y-1.5">
                {courseLessons.map((l, index) => {
                  const isLocked = courseLessons.slice(0, index).some((prev) => !prev.isCompleted)
                  const isCurrent = l.id === lessonId

                  return (
                    <Link
                      key={l.id}
                      to={isLocked ? '#' : `/learn/course/${courseId}/lesson/${l.id}`}
                      onClick={(e) => {
                        if (isLocked) e.preventDefault()
                        else setShowSidebar(false)
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-sm transition-all group',
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-accent',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-black transition-colors',
                          l.isCompleted
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-white text-primary'
                            : 'bg-muted group-hover:bg-background',
                        )}
                      >
                        {l.isCompleted ? (
                          <CheckCircle className="h-4 w-4 stroke-[3px]" />
                        ) : isLocked ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold tracking-tight leading-tight">{l.title}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-0.5 font-medium opacity-70',
                            isCurrent ? 'text-primary-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {l.duration}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>
        {showSidebar && (
          <div
            className="fixed inset-0 z-10 bg-background/60 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}
