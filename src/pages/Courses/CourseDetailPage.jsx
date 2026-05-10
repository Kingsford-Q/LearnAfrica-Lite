import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Play, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { CourseCard } from '@/components/course/CourseCard'
import { courses, lessons } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function CourseDetailPage() {
  const { courseId } = useParams()
  const [expandedSection, setExpandedSection] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const course = courses.find(c => String(c.id) === String(courseId));
  if (!course) {
  return <div className="container py-20 text-center">Course not found</div>;
  }

  const courseLessons = lessons.filter(l => l.courseId === course.id)
  const relatedCourses = courses.filter(c => c.id !== course.id && c.category === course.category).slice(0, 3)

  const completedLessons = courseLessons.filter(l => l.isCompleted).length
  const progress = Math.round((completedLessons / courseLessons.length) * 100) || 0

  const handleEnroll = () => {
    setIsEnrolled(true)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant={course.difficulty === 'Beginner' ? 'success' : course.difficulty === 'Intermediate' ? 'warning' : 'destructive'}>
                  {course.difficulty}
                </Badge>
                {course.isFree && <Badge variant="success">Free</Badge>}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({course.enrollments.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {course.lessons} lessons
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  English
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                  <img src={course.instructorAvatar} alt={course.instructor} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:row-start-1">
              <Card className="sticky top-24 overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-7 w-7 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {isEnrolled ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <Link to={`/learn/course/${course.id}/lesson/${courseLessons[0]?.id || '1'}`}>
                        <Button className="w-full" size="lg">
                          Continue Learning
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        {course.isFree ? (
                          <span className="text-3xl font-bold">Free</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold">${course.price}</span>
                            <span className="text-lg text-muted-foreground line-through">${(course.price * 1.5).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <Button className="w-full" size="lg" onClick={handleEnroll}>
                        {course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                      </Button>
                    </>
                  )}

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold">This course includes:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-primary" />
                        {course.lessons} video lessons
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Certificate of completion
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Lifetime access
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">What you&apos;ll learn</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Build modern responsive websites from scratch',
                  'Master HTML5 semantic elements and best practices',
                  'Style with CSS including Flexbox and Grid',
                  'Add interactivity with JavaScript fundamentals',
                  'Understand web development workflows',
                  'Deploy your projects to the web'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                <span className="text-sm text-muted-foreground">
                  {courseLessons.length} lessons • {completedLessons} completed
                </span>
              </div>

              <Card>
                <button
                  onClick={() => setExpandedSection(!expandedSection)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Section 1: Getting Started</p>
                      <p className="text-sm text-muted-foreground">
                        {courseLessons.length} lessons
                      </p>
                    </div>
                  </div>
                  {expandedSection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {expandedSection && (
                  <div className="border-t">
                    {courseLessons.map((lesson, index) => (
                      <Link
                        key={lesson.id}
                        to={isEnrolled ? `/lessons/${lesson.id}` : '#'}
                        className={cn(
                          'flex items-center gap-4 p-4 border-b last:border-b-0 transition-colors',
                          isEnrolled ? 'hover:bg-accent/50' : 'opacity-75 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                          lesson.isCompleted ? 'bg-success text-primary-foreground' : 'bg-muted'
                        )}>
                          {lesson.isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{lesson.title}</p>
                          <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                        </div>
                        {!isEnrolled && <Play className="h-4 w-4 text-muted-foreground" />}
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Instructor */}
            <Card className="p-5 md:p-8">
  <h2 className="text-lg md:text-xl font-bold mb-6 text-center md:text-left">Your Instructor</h2>
  
  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
    {/* Avatar - Centered on mobile, left-aligned on desktop */}
    <div className="shrink-0">
      <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-primary/10 overflow-hidden ring-4 ring-background shadow-md">
        <img 
          src={course.instructorAvatar} 
          alt={course.instructor} 
          className="h-full w-full object-cover" 
        />
      </div>
    </div>

    {/* Info Content - Center text on mobile for better balance */}
    <div className="flex-1 space-y-4 text-center md:text-left">
      <div>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight">{course.instructor}</h3>
        <p className="text-primary font-medium text-sm md:text-base">Senior Software Engineer & Educator</p>
      </div>

      {/* Stats - Grid on mobile, Flex on desktop */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-xs md:text-sm font-semibold">4.9 Rating</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs md:text-sm font-semibold">12k+ Students</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent col-span-2 sm:col-span-1">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs md:text-sm font-semibold">8 Courses</span>
        </div>
      </div>
    </div>
  </div>

  {/* Bio - Better spacing for touch targets */}
  <div className="mt-6 pt-6 border-t border-border">
    <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
      Experienced software engineer with over 10 years in the industry. 
      Passionate about teaching and helping others achieve their goals in tech.
    </p>
  </div>
</Card>
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Related Courses</h2>
              <div className="space-y-4">
                {relatedCourses.map(relatedCourse => (
                  <CourseCard key={relatedCourse.id} course={relatedCourse} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
