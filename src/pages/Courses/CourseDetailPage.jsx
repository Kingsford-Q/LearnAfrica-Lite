import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  Calendar,
  AlertCircle,
  XCircle,
  Lock,
  Loader2 
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import  CourseCard  from '@/components/course/CourseCard'
import { useAuth } from '@/context/AuthContext' // Updated path to your context
import { cn } from '@/lib/utils'

export function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState(true)
  
  // --- AUTH-DRIVEN DATA FETCHING ---
  const { user, courses, lessons, enrollInCourse } = useAuth() 
  const [isLocalLoading, setIsLocalLoading] = useState(true)

  // Memoize course and related lessons for performance
  const course = useMemo(() => 
    courses.find(c => String(c.id) === String(courseId)), 
  [courseId, courses]);

  const courseLessons = useMemo(() => 
    lessons.filter(l => String(l.courseId) === String(courseId)),
  [courseId, lessons]);

  const isEnrolled = useMemo(() => 
    user?.enrolledCourses?.includes(Number(courseId)),
  [user, courseId]);

  useEffect(() => {
    // Briefly simulate check to align with your loading state UI
    if (course) {
      const timer = setTimeout(() => setIsLocalLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="container py-20 text-center font-bold">
        Course not found
      </div>
    );
  }

  const relatedCourses = courses.filter(c => 
    String(c.id) !== String(courseId) && c.category === course.category
  ).slice(0, 3)

  // --- PROGRESS & NAVIGATION LOGIC ---
  const completedLessonsCount = courseLessons.filter(l => l.isCompleted).length
  const progress = Math.round((completedLessonsCount / courseLessons.length) * 100) || 0

  const totalResources = useMemo(() => {
    return courseLessons.reduce((acc, lesson) => acc + (lesson.resources?.length || 0), 0);
  }, [courseLessons]);

  const isCourseCompleted = progress === 100;

  // Find the correct lesson to resume
  const nextToCompleteLesson = courseLessons.find(l => !l.isCompleted);
  const resumeLessonId = isCourseCompleted 
    ? courseLessons[0]?.id 
    : (nextToCompleteLesson?.id || courseLessons[0]?.id);

  const buttonText = isCourseCompleted ? "Review Course" : "Continue Learning";

  // Strict linear locking logic
  const isLessonLocked = (index) => {
    if (!isEnrolled) return true; 
    if (isCourseCompleted) return false; 
    if (index === 0) return false; 
    return !courseLessons[index - 1]?.isCompleted;
  };

  const handleEnroll = async () => {
    try {
      if (course.isFree) {
        await enrollInCourse(course.id);
      } else if (course.paymentLink) {
        window.location.href = course.paymentLink;
      }
    } catch (error) {
      console.error("Enrollment failed", error);
    }
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
                  {courseLessons.length} lessons
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  English
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border">
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
              <Card className="sticky top-24 overflow-hidden border-2">
                <div className="aspect-video bg-muted relative">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-7 w-7 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {isLocalLoading ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Checking enrollment...</p>
                    </div>
                  ) : isEnrolled ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Your Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <Link to={`/learn/course/${course.id}/lesson/${resumeLessonId}`}>
                        <Button className="w-full" size="lg">
                          {buttonText}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        {course.isFree ? (
                          <span className="text-xl md:text-2xl font-bold">Free</span>
                        ) : (
                          <>
                            <span className="text-xl md:text-2xl font-bold">${course.price}</span>
                            <span className="text-lg text-muted-foreground line-through">${(course.price * 1.5).toFixed(2)}</span>
                          </>
                        )}
                      </div>

                      {!course.isFree && !course.paymentLink ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p>Direct enrollment is currently unavailable.</p>
                          </div>
                          <Button className="w-full" variant="primary" onClick={() => navigate('/courses')}>
                            Browse Other Courses
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" size="lg" onClick={handleEnroll}>
                          {course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                        </Button>
                      )}
                    </>
                  )}

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold">This course includes:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      
                      <li className={cn("flex items-center gap-2", courseLessons.length === 0 && "opacity-50")}>
                        <Play className="h-4 w-4 text-primary" />
                        {courseLessons.length > 0 ? `${courseLessons.length} lessons` : 'No lessons available'}
                      </li>


                      <li className={cn("flex items-center gap-2", !course.hasResources && "opacity-50")}>
                        <BookOpen className="h-4 w-4 text-primary" />
                        {totalResources > 0 ? (totalResources === 1 ? `${totalResources} resource` : `${totalResources} resources`) : 'No additional resources'}
                      </li>

                      <li className={cn("flex items-center gap-2", !course.hasCertificate && "opacity-50")}>
                        <Award className="h-4 w-4 text-primary" />
                        {course.hasCertificate ? "Has Certificate of completion" : "No certificate included"}
                      </li>
                      <li className={cn("flex items-center gap-2", !course.hasLifetimeAccess && "opacity-50")}>
                        <Calendar className="h-4 w-4 text-primary" />
                        {course.hasLifetimeAccess ? "Unlimited Lifetime access" : "Limited time access"}
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
            <Card className="p-6 border-muted/20 bg-card/50">
              <h2 className="text-lg md:text-xl font-bold mb-4">What you&apos;ll learn</h2>
              {course.learningOutcomes?.length > 0 ? (
                /* Changed grid-cols-2 to a simple flex-col or a single-column grid */
                <div className="grid gap-4"> 
                  {course.learningOutcomes.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 group">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                      <span className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-4 rounded-xl border border-dashed border-muted">
                  <AlertCircle className="h-5 w-5 text-primary/60" />
                  <p className="text-sm italic">Learning objectives have not been listed yet.</p>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-4">
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Course Curriculum</h2>
                <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-muted-foreground">
                  <span>{courseLessons.length} lessons</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span>{completedLessonsCount} completed</span>
                </div>
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
                    {courseLessons.map((lesson, index) => {
                      const locked = isLessonLocked(index);
                      
                      return (
                        <Link
                          key={lesson.id}
                          to={!locked ? `/learn/course/${course.id}/lesson/${lesson.id}` : '#'}
                          className={cn(
                            'flex items-center gap-4 p-4 border-b last:border-b-0 transition-colors',
                            locked ? 'opacity-50 cursor-not-allowed bg-muted/20' : 'hover:bg-accent/50'
                          )}
                          onClick={(e) => locked && e.preventDefault()}
                        >
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                            lesson.isCompleted ? 'bg-success text-primary-foreground' : 'bg-muted'
                          )}>
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium truncate", locked && "text-muted-foreground")}>
                              {lesson.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                          </div>
                          {locked && <Lock className="h-4 w-4 text-muted-foreground/50" />}
                          {!locked && !lesson.isCompleted && <Play className="h-4 w-4 text-primary animate-pulse" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-5 md:p-8">
              <h2 className="text-lg md:text-xl font-bold mb-6 text-center md:text-left">Your Instructor</h2>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="shrink-0">
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-primary/10 overflow-hidden ring-4 ring-background shadow-md">
                    <img src={course.instructorAvatar} alt={course.instructor} className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">{course.instructor}</h3>
                    <p className="text-primary font-medium text-sm md:text-base">Senior Software Engineer & Educator</p>
                  </div>
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
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                  Experienced software engineer with over 10 years in the industry. 
                  Passionate about teaching and helping others achieve their goals in tech.
                </p>
              </div>
            </Card>
          </div>

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