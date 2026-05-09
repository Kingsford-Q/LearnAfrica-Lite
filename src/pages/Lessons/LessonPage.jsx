import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  X
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { lessons, courses } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function LessonPage() {
  const { courseId, lessonId } = useParams()
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  // ID comparison normalization
  const lesson = lessons.find(l => String(l.id) === String(lessonId)) || lessons[0]
  const courseLessons = lessons.filter(l => String(l.courseId) === String(courseId))
  const course = courses.find(c => String(c.id) === String(courseId))
  const currentIndex = courseLessons.findIndex(l => String(l.id) === String(lesson.id))
  
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null

  const handleMarkComplete = () => {
    setIsCompleted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar - Z-index set to 30 to stay below mobile sidebar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/courses/${courseId}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Course</span>
            </Link>
            <div className="hidden md:block">
              <p className="text-sm font-medium truncate max-w-xs">{course?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1} / {courseLessons.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Video Player */}
          <div className="aspect-video bg-foreground relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-background">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-background/20 backdrop-blur mb-4">
                  <Play className="h-10 w-10 ml-1 text-background" />
                </div>
                <p className="text-lg font-medium">Video Lesson</p>
                <p className="text-sm opacity-80">{lesson.duration}</p>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration}</span>
                {(lesson.isCompleted || isCompleted) && (
                  <span className="flex items-center gap-1 text-success ml-4">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <div className="flex gap-6">
                {[
                  { id: 'content', label: 'Content', icon: FileText },
                  { id: 'notes', label: 'Notes', icon: BookOpen },
                  { id: 'discussion', label: 'Discussion', icon: MessageSquare }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'content' && (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            )}

            {activeTab === 'notes' && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Your Notes</h3>
                <textarea
                  placeholder="Take notes for this lesson..."
                  className="w-full min-h-[200px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button className="mt-4" size="sm">Save Notes</Button>
              </Card>
            )}

            {activeTab === 'discussion' && (
              <Card className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Join the Discussion</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask questions and engage with other learners
                </p>
                <Button variant="outline">Start a Discussion</Button>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t">
              {prevLesson ? (
                <Link to={`/learn/course/${courseId}/lesson/${prevLesson.id}`}>
                  <Button variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : <div />}

              {!lesson.isCompleted && !isCompleted ? (
                <Button onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </Button>
              ) : nextLesson ? (
                <Link to={`/learn/course/${courseId}/lesson/${nextLesson.id}`}>
                  <Button>
                    Next Lesson
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/learn/course/${courseId}/quiz/${lessonId}`}>
                  <Button>
                    Take Quiz
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar - Higher Z-index (50) to prevent overlap from image_7495fb.png */}
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-50 w-full sm:w-80 border-l border-border bg-card transition-transform duration-300 lg:static lg:z-30 lg:translate-x-0',
            showSidebar ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header (Visible only on mobile/medium) */}
            <div className="flex items-center justify-between p-4 border-b lg:hidden">
              <h3 className="font-semibold">Course Content</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold mb-4 hidden lg:block">Course Content</h3>
              <div className="space-y-1">
                {courseLessons.map((l, index) => (
                  <Link
                    key={l.id}
                    to={`/learn/course/${courseId}/lesson/${l.id}`}
                    onClick={() => setShowSidebar(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-3 text-sm transition-colors',
                      String(l.id) === String(lesson.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-medium',
                        l.isCompleted || (String(l.id) === String(lesson.id) && isCompleted)
                          ? 'bg-success text-primary-foreground'
                          : String(l.id) === String(lesson.id)
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-muted'
                      )}
                    >
                      {l.isCompleted || (String(l.id) === String(lesson.id) && isCompleted) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{l.title}</p>
                      <p className={cn(
                        'text-xs',
                        String(l.id) === String(lesson.id) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {l.duration}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}