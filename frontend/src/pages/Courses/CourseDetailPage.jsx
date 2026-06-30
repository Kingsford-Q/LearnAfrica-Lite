import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { api, fileUrl } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

export function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  // --- STATE DECLARATIONS ---
  const [expandedSection, setExpandedSection] = useState(true)
  const [reviewText, setReviewText] = useState('')
  const [selectedRating, setSelectedRating] = useState(0)
  const [visibleReviews, setVisibleReviews] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const [courseDetail, setCourseDetail] = useState(null)
  const [reviews, setReviews] = useState([])
  const [instructorProfile, setInstructorProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // --- AUTH-DRIVEN DATA CONTEXT ---
  const { user, courses, refreshCourses, refreshEnrollments } = useAuth()

  const fetchReviews = useCallback(async () => {
    try {
      setReviews(await api.get(`/api/courses/${courseId}/reviews`))
    } catch {
      setReviews([])
    }
  }, [courseId])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    let cancelled = false
    setIsLoading(true)
    setLoadError(false)

    api.get(`/api/courses/${courseId}`)
      .then(async (data) => {
        if (cancelled) return
        setCourseDetail(data)
        api.get(`/api/instructors/${data.instructorId}`).then((inst) => {
          if (!cancelled) setInstructorProfile(inst)
        }).catch(() => {})
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    fetchReviews()

    return () => { cancelled = true }
  }, [courseId, fetchReviews])

  // --- MEMOIZED DERIVED DATA ---
  const liveCourse = useMemo(() =>
    courses.find(c => String(c.id) === String(courseId)),
  [courseId, courses])

  const courseLessons = useMemo(() =>
    courseDetail ? courseDetail.sections.flatMap(s => s.lessons) : [],
  [courseDetail])

  const isEnrolled = !!liveCourse?.isEnrolled
  const progress = liveCourse?.progress ?? 0
  const isCourseCompleted = progress === 100

  const isInstructorOfCourse = useMemo(() =>
    user && courseDetail && String(user.id) === String(courseDetail.instructorId),
  [user, courseDetail])

  const avatar = fileUrl(instructorProfile?.avatar || courseDetail?.instructorAvatar) || '/default-avatar.png'
  const name = instructorProfile?.name || courseDetail?.instructorName || 'No name available.'
  const bio = instructorProfile?.bio || 'No biography available.'
  const title = instructorProfile?.title || 'Instructor'
  const rating = instructorProfile?.rating || 'No ratings yet'
  const totalStudents = instructorProfile?.totalStudents ?? 'No students yet'
  const instructorCourses = instructorProfile?.coursesCount || 0

  const relatedCourses = useMemo(() => {
    if (!courseDetail) return []
    return courses.filter(c =>
      String(c.id) !== String(courseId) && c.category === courseDetail.category
    ).slice(0, 3)
  }, [courses, courseDetail, courseId])

  // --- LOADING / ERROR GUARDS ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loadError || !courseDetail) {
    return (
      <div className="container py-20 text-center font-bold">
        Course not found
      </div>
    )
  }

  const course = courseDetail

  // Find the correct lesson to resume
  const nextToCompleteLesson = courseLessons.find(l => !l.isCompleted)
  const resumeLessonId = isCourseCompleted
    ? courseLessons[0]?.id
    : (nextToCompleteLesson?.id || courseLessons[0]?.id)

  const buttonText = (() => {
    if (!user) return "Sign in to Enroll"
    if (!isEnrolled) return course.isFree ? "Enroll for Free" : "Buy Now"
    return isCourseCompleted ? "Review Course" : "Continue Learning"
  })()

  // Strict linear locking logic
  const isLessonLocked = (index) => {
    if (!isEnrolled) return true
    if (isCourseCompleted) return false
    if (index === 0) return false
    return !courseLessons[index - 1]?.isCompleted
  }

  // --- EVENT HANDLERS ---
  const handleSubmitReview = async () => {
    if (!user) return alert("You must be logged in to submit a review!")
    if (isInstructorOfCourse) return alert("Instructors cannot review their own courses.")
    if (selectedRating === 0) return alert("Please select a rating!")
    if (!reviewText.trim()) return alert("Please add a comment!")

    setIsSubmitting(true)

    try {
      await api.post(`/api/courses/${course.id}/reviews`, {
        rating: selectedRating,
        comment: reviewText.trim(),
      })
      setReviewText('')
      setSelectedRating(0)
      await Promise.all([fetchReviews(), refreshCourses()])
    } catch (err) {
      console.error("Failed to post review", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setIsEnrolling(true)
    try {
      if (course.isFree) {
        await api.post(`/api/courses/${course.id}/enroll`)
        await Promise.all([refreshCourses(), refreshEnrollments()])
      } else if (course.paymentLink) {
        window.location.href = course.paymentLink
      }
    } catch (error) {
      console.error("Enrollment failed", error)
    } finally {
      setIsEnrolling(false)
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
                <Badge variant="success">{course.category}</Badge>
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
                  {courseLessons.length > 0 ? `${courseLessons.length} lessons` : 'No lessons available'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {course.language || 'N/A'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border">
                  <img src={avatar} alt={name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium">{name}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:row-start-1">
              <Card className="sticky top-24 overflow-hidden border-2">
                <div className="aspect-video bg-muted relative">
                  <img src={fileUrl(course.thumbnail)} alt={course.title} loading="lazy" className="h-full w-full object-cover" />
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
                        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
                          {isEnrolling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : !user ? 'Sign in to Enroll' : (course.isFree ? 'Enroll for Free' : 'Buy Now')}
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
                        {course.hasResources ? 'Downloadable resources' : 'No additional resources'}
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
        <div className="flex flex-col gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 border-muted/20 bg-card/50">
              <h2 className="text-lg md:text-xl font-bold mb-4">What you&apos;ll learn</h2>
              {course.learningOutcomes?.length > 0 ? (
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
                  <span>{courseLessons.filter(l => l.isCompleted).length} completed</span>
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
                    <img src={avatar} alt={name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">{name}</h3>
                    <p className="text-primary font-medium text-sm md:text-base">{title}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-xs md:text-sm font-semibold">{rating}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-semibold">{totalStudents}</span>
                    </div>
                    <div className="flex md:flex-row justify-center py-5 md:py-0 items-center gap-1.5 p-2 rounded-xl bg-muted/50 sm:bg-transparent col-span-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-semibold">{instructorCourses}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                  {bio}
                </p>
              </div>
            </Card>
          </div>

          {/* --- REVIEWS SECTION --- */}
          <section className="space-y-6 pt-12 border-t border-border/40">
  <div className="flex items-center justify-between">
    <h2 className="text-lg md:text-xl font-bold tracking-tight">Student Reviews</h2>
    <div className="flex items-center gap-2">
      <Star className="h-5 w-5 fill-warning text-warning" />
      <span className="font-bold text-md">{course.rating}</span>
      <span className="text-muted-foreground text-sm">
        ({reviews.length > 0
          ? (reviews.length === 1 ? `1 review` : `${reviews.length} reviews`)
          : 'No reviews yet'})
      </span>
    </div>
  </div>

  {/* Review Input Logic */}
  {!user ? (
    /* --- LOGGED OUT PROMPT --- */
    <Card className="p-6 border-dashed bg-muted/20 flex flex-col items-center text-center gap-3">
      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">Want to leave a review?</p>
        <p className="text-xs text-muted-foreground">Log in to your account to share your feedback with the community.</p>
      </div>
      <Button size="sm" onClick={() => window.location.href = '/login'}>
        Sign In to Review
      </Button>
    </Card>
  ) : isInstructorOfCourse ? (
    /* --- INSTRUCTOR BLOCK STATE (Premium Dark Visual Polish) --- */
    <Card className="p-6 border border-warning/20 bg-warning/5 flex flex-col items-center text-center gap-2">
      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center border border-warning/20 text-warning">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">Instructor Dashboard View</p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          You are viewing this course details page as its primary instructor. Reviews are reserved exclusively for enrolled students.
        </p>
      </div>
    </Card>
  ) : isEnrolled && (
    /* --- LOGGED IN & ENROLLED --- */
    <Card className="p-4 bg-primary/5 border-primary/20">
      <h3 className="font-semibold text-sm mb-3">Rate this course</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              disabled={isSubmitting}
              className="hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= selectedRating ? "fill-warning text-warning" : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          disabled={isSubmitting}
          placeholder="Share your experience with this course..."
          className="w-full p-3 rounded-md bg-background border border-border text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px] disabled:opacity-50"
        />
        <Button
          className="w-full md:w-fit mx-auto md:mx-0"
          size="sm"
          onClick={handleSubmitReview}
          disabled={isSubmitting || !selectedRating || !reviewText.trim()}
        >
          {isSubmitting ? "Posting..." : "Submit Review"}
        </Button>
      </div>
    </Card>
  )}

  {/* Reviews List */}
  <div className="space-y-4">
    {reviews.length > 0 ? (
      <>
        {reviews.slice(0, visibleReviews).map((review) => (
          <div key={review.id} className="p-4 rounded-xl border border-border/50 bg-card/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm">{review.userName}</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < review.rating ? "fill-warning text-warning" : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
          </div>
        ))}

        {/* Only show the button if there are more than the initial count of reviews */}
        {reviews.length > 3 && (
          <div className="flex justify-center pt-4 gap-3">
            {reviews.length > visibleReviews ? (
              <Button
                variant="outline"
                size="sm"
                className="group"
                onClick={() => setVisibleReviews(prev => prev + 3)}
              >
                Load More Reviews
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="group"
                onClick={() => setVisibleReviews(3)}
              >
                Show Less
              </Button>
            )}
          </div>
        )}
      </>
    ) : (
      /* --- EMPTY STATE UI --- */
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border-2 border-dashed border-muted/50 bg-muted/5">
        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">No reviews yet</p>
        <p className="text-xs text-muted-foreground/60">Be the first to share your thoughts on this course!</p>
      </div>
    )}
  </div>
</section>

          {/* Related Courses Follows Below... */}

          {relatedCourses.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Related Courses
                </h2>
                <Link
                  to="/courses"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((relatedCourse) => (
                  <div key={relatedCourse.id} className="flex">
                    <CourseCard
                      course={relatedCourse}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
