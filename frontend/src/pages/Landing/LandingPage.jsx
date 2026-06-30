import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  ShieldCheck,
  Search
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { useAuth } from '@/context/AuthContext'
import { useMemo, useState, lazy, Suspense } from 'react'
import { CourseCardSkeleton } from '@/components/common/LoadingSkeleton'

// Lazy load the CourseCard component
const CourseCard = lazy(() => import('@/components/course/CourseCard'))

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience and proven teaching methods.'
  },
  {
    icon: Zap,
    title: 'Learn at Your Pace',
    description: 'Access courses anytime, anywhere. Study on your schedule with lifetime access.'
  },
  {
    icon: Target,
    title: 'Practical Projects',
    description: 'Apply your knowledge with hands-on projects that build your portfolio.'
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Get recognized certificates upon completion to boost your career prospects.'
  }
]

const steps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up for free and set up your learning profile in minutes.'
  },
  {
    step: '02',
    title: 'Browse Courses',
    description: 'Explore our catalog and find courses that match your goals.'
  },
  {
    step: '03',
    title: 'Start Learning',
    description: 'Watch lessons, complete quizzes, and track your progress.'
  },
  {
    step: '04',
    title: 'Get Certified',
    description: 'Complete courses and earn certificates to showcase your skills.'
  }
]

const stats = [
  { value: '50,000+', label: 'Active Learners' },
  { value: '200+', label: 'Expert Courses' },
  { value: '100+', label: 'Instructors' },
  { value: '95%', label: 'Success Rate' }
]

export function LandingPage() {
const { user, courses = [], testimonials = [], isLoading } = useAuth()
  const navigate = useNavigate()
  const [verifyCode, setVerifyCode] = useState('')

  const handleVerifySubmit = (e) => {
    e.preventDefault()
    if (!verifyCode.trim()) return
    navigate(`/verify/${encodeURIComponent(verifyCode.trim())}`)
  }

  const displayCourses = useMemo(() => {
    if (!user) return courses.slice(0, 3);

    const enrolledIds = user.enrolledCourses || [];

    return courses
      .filter((course) => {
        const isEnrolled = enrolledIds.some(id => id == course.id);
        const hasProgress = (course.progress || 0) > 0;
        return !isEnrolled && !hasProgress;
      })
      .slice(0, 3);
  }, [user, courses]);

  const displayTestimonials = useMemo(() => {
    return Array.isArray(testimonials) ? testimonials.slice(0, 3) : [];
  }, [testimonials]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                New courses added weekly
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                Unlock Your Potential with{' '}
                <span className="text-primary">World-Class</span> Education
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                Join thousands of learners across Africa gaining new skills, advancing their careers, and achieving their dreams with our expert-led online courses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Play className="h-5 w-5" />
                    Browse Courses
                  </Button>
                </Link>
              </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-4 justify-center md:justify-start">                <div className="flex -space-x-3">
                {[
                  "/images/student1.jpg",
                  "/images/student2.jpg",
                  "/images/student3.jpg",
                  "/images/student4.jpg",
                  "/images/student5.jpg"
                ].map((src, i) => (
                  <div 
                    key={i} 
                    className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden"
                  >
                    <img 
                      src={src} 
                      alt={`Student ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover" 
                    />
                  </div>
                ))}
                </div>
                <div className = "flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Trusted by 50,000+ learners</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8 border border-border/50">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-3xl text-foreground">85%</p>
                      <p className="text-sm font-medium text-muted-foreground">Career Growth</p>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-3xl text-foreground">50K+</p>
                      <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-3xl text-foreground">200+</p>
                      <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                    </div>
                  </Card>

                  <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-3xl text-foreground">500+</p>
                      <p className="text-sm font-medium text-muted-foreground">Lessons</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Why Choose LearnAfrica?
            </h2>
            <p className="text-muted-foreground text-lg">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map(feature => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl mb-2 text-foreground">
                Popular Courses
              </h2>
              <p className="text-muted-foreground">
                Explore our most enrolled courses
              </p>
            </div>
            
            <Link to="/courses" className="w-fit">
              <Button variant="outline" className="gap-2">
                View All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Suspense 
              fallback={
                <>
                  {/* Providing unique keys to skeletons prevents the 'removeChild' DOM exception */}
                  {[1, 2, 3].map((id) => (
                    <CourseCardSkeleton key={`skeleton-${id}`} />
                  ))}
                </>
              }
            >
              {displayCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Start your learning journey in four simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="flex flex-col items-center text-center relative">
                <div className="text-6xl font-bold text-primary/50 mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 h-6 w-6 text-primary/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              What Our Learners Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied learners transforming their careers
            </p>
          </div>

          {/* Dynamic state checks for async context safety */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-6 h-48 bg-card border animate-pulse flex flex-col justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-5/6 bg-muted rounded" />
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-2.5 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : displayTestimonials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {displayTestimonials.map(testimonial => (
                <Card key={testimonial.id || testimonial.name} className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(Number(testimonial.rating || 5))].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 flex-grow text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <div className="h-10 w-10 rounded-full bg-muted border border-border overflow-hidden shrink-0">
                      <img
                        src={testimonial.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`}
                        alt={testimonial.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`;
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {testimonial.role} {testimonial.company ? `at ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Fallback UI State if the remote testimonials dataset returns empty
            <div className="text-center p-8 bg-card border border-dashed border-border rounded-2xl max-w-md mx-auto">
              <p className="text-sm text-muted-foreground font-medium">
                Be among the first to share your experience with LearnAfrica!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Verify Credential Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Verify a Credential</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Enter an official certificate or badge ID below to verify its regulatory authenticity.
            </p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="e.g. LA-CERT-ABCD-1A2B"
                className="h-14 text-center text-base rounded-2xl shadow-sm"
              />
              <Button type="submit" size="lg" disabled={!verifyCode.trim()} className="w-full sm:w-auto gap-2 px-10 h-12 rounded-xl font-semibold">
                <Search className="h-4 w-4" />
                Verify Credential
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden bg-primary p-8 md:p-12 lg:p-16">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl text-primary-foreground mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Join our community of learners today and take the first step towards achieving your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="w-full font-semibold sm:w-auto border-primary-foreground/30 text-primary hover:bg-primary-foreground/10">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-foreground/10" />
            <div className="absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-accent/20" />
          </Card>
        </div>
      </section>
    </div>
  )
}