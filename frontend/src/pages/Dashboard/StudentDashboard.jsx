import { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Book, Award, Trophy, ArrowRight, ChevronDown, ChevronUp, Compass, GraduationCap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { StatsCardSkeleton, CourseCardSkeleton } from '@/components/common/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { api, fileUrl } from '@/lib/apiClient';

// Lazy loaded components for code splitting
const StatsCard = lazy(() => import('@/components/dashboard/StatsCard'));
const ProgressCard = lazy(() => import('@/components/dashboard/ProgressCard'));
const BadgeCard = lazy(() => import('@/components/dashboard/BadgeCard'));
const BadgeDetailModal = lazy(() => import('@/components/dashboard/BadgeDetailModal'));

const MOBILE_BADGE_PAGE_SIZE = 6;

export default function StudentDashboard() {
  const { user, courses: coursesState, badgeConfig } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [viewAllActive, setViewAllActive] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);
  const [viewAllBadges, setViewAllBadges] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    api.get('/api/certificates/mine')
      .then(setCertificates)
      .catch(() => setCertificates([]))
      .finally(() => setIsLoadingCertificates(false));
  }, []);

  // Optimized Logic for Backend Readiness
  const activeLearningCourses = useMemo(() => {
    return (coursesState || []).filter((c) => c.progress > 0 && c.progress < 100);
  }, [coursesState]);

  const completedCourses = useMemo(() => (coursesState || []).filter((c) => c.progress === 100), [coursesState]);

  const visibleActiveCourses = useMemo(() => {
    if (viewAllActive) return activeLearningCourses;
    return activeLearningCourses.slice(0, 3);
  }, [activeLearningCourses, viewAllActive]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 135; // Offsets clean headroom below layout header
      const bodyRect = document.body.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top - bodyRect.top;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  

  // recommended courses logic
  const recommendedCourses = useMemo(() => {
    const allAvailable = (coursesState || []).filter((c) => c.progress === 0);
    
    // 1. Get the tags and categories the user is currently engaged with
    const activeTags = new Set(activeLearningCourses.flatMap(c => c.tags || []));
    const activeCategories = new Set(activeLearningCourses.map(c => c.category));

    return allAvailable
      .map(course => {
        let score = 0;
        
        // Boost if category matches current interests
        if (activeCategories.has(course.category)) score += 10;
        
        // Boost for every matching tag
        const matchingTags = (course.tags || []).filter(tag => activeTags.has(tag));
        score += matchingTags.length * 5;

        // Boost for high ratings (Premium Feel)
        if (course.rating >= 4.5) score += 3;

        return { ...course, score };
      })
      .sort((a, b) => b.score - a.score) // Highest score first
      .slice(0, 3);
  }, [coursesState, activeLearningCourses]);
  

  // Reusable fragment for stats loading
  const statsSkeletons = (
    <>
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </>
  );

  
  const liveBadges = useMemo(() => {
    if (!user || !badgeConfig) return []; // Defensive check for mockData

    return badgeConfig.map((config) => {
      const badgeRecord = user.badges?.find((b) => b.badgeKey === config.key);
      const hasBadgeRecord = !!badgeRecord;

      const requirementMap = {
        'lessons_completed': user.stats?.lessonsCompletedCount || 0,
        'courses_completed': user.stats?.coursesCompletedCount || 0,
        'day_streak': user.stats?.streak || 0,
        'perfect_quizzes': user.stats?.perfectQuizzes || 0,
        'reviews_submitted': user.stats?.reviewsCount || 0,
        'fast_finish': user.stats?.fastFinishCount || 0,
        'profile_completed': user.stats?.isProfileComplete ? 1 : 0,
        'courses_enrolled': user.stats?.enrolledCoursesCount || 0,
        'forum_contributions': user.stats?.forumContributionsCount || 0,
      };

      const currentProgress = requirementMap[config.requirementType] || 0;
      const isEarned = hasBadgeRecord || currentProgress >= config.goal;

      return {
        ...config,
        earned: isEarned,
        currentProgress,
        earnedDate: badgeRecord ? new Date(badgeRecord.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (isEarned ? 'Recently' : null),
      };
    }).sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return (b.currentProgress / b.goal) - (a.currentProgress / a.goal);
    });
  }, [user, badgeConfig]);

  const earnedCount = useMemo(() => 
    liveBadges.filter(b => b.earned).length, 
  [liveBadges]);

  // --- DYNAMIC TREND LOGIC ---
  const trends = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Calculate courses started in the last 30 days
    const startedThisMonthCount = (coursesState || []).filter((c) => {
      if (!c.startedAt || c.progress === 0) return false;
      const startedDate = new Date(c.startedAt);
      return startedDate >= thirtyDaysAgo;
    }).length;

    // 2. Calculate courses completed in the last 7 days
    const completedThisWeekCount = (coursesState || []).filter((c) => {
      if (!c.completedAt || c.progress < 100) return false;
      const completedDate = new Date(c.completedAt);
      return completedDate >= sevenDaysAgo;
    }).length;

    // 3. Contextual formatting handles (Handling singular vs plural syntax beautifully)
    return {
      inProgressTrend: startedThisMonthCount > 0 
        ? `+${startedThisMonthCount} this month` 
        : 'Active now',
      completedTrend: completedThisWeekCount > 0 
        ? `+${completedThisWeekCount} this week` 
        : `${completedCourses.length} total milestones`,
      // If there's a positive streak or velocity increase, we show "up", else neutral styling
      inProgressDirection: startedThisMonthCount > 0 ? 'up' : 'neutral',
      completedDirection: completedThisWeekCount > 0 ? 'up' : 'neutral'
    };
  }, [coursesState, completedCourses.length]);

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {"You're making great progress. Keep learning!"}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/courses">
            <Button>
              Browse Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Fixed Quick-Nav Sub-Header Strip (Bypasses parent layout overflow restrictions) */}
      <div className="sm:hidden fixed top-[64px] left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-6 py-3 flex justify-center gap-2 shadow-sm">
        <Button variant="secondary" size="sm" onClick={() => scrollToSection('continue-learning')} className="shrink-0 rounded-full text-xs h-8">
          <Book className="w-3.5 h-3.5 mr-1" /> Progress
        </Button>
        <Button variant="secondary" size="sm" onClick={() => scrollToSection('badges-section')} className="shrink-0 rounded-full text-xs h-8">
          <Trophy className="w-3.5 h-3.5 mr-1" /> Badges
        </Button>
        <Button variant="secondary" size="sm" onClick={() => scrollToSection('certificates-section')} className="shrink-0 rounded-full text-xs h-8">
          <GraduationCap className="w-3.5 h-3.5 mr-1" /> Certificates
        </Button>
        <Button variant="secondary" size="sm" onClick={() => scrollToSection('recommendations')} className="shrink-0 rounded-full text-xs h-8">
          <Compass className="w-3.5 h-3.5 mr-1" /> For You
        </Button>
      </div>

      {/* Reserves space for the fixed quick-nav strip above so it doesn't overlap the stats cards */}
      <div className="sm:hidden h-14" />

      {/* Stats Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={statsSkeletons}>
          {isLoading ? (
            statsSkeletons
          ) : (
            <>
              <StatsCard title="In Progress" value={activeLearningCourses.length} icon={Book} trend={trends.inProgressDirection} trendValue= {trends.inProgressTrend} />
              <StatsCard title="Completed Courses" value={completedCourses.length} icon={Award} trend={trends.completedDirection} trendValue={trends.completedTrend} />
              <StatsCard title="Perfect Quizzes" value={user?.stats?.perfectQuizzes || 0} icon={Trophy} trend="up" trendValue="100% Score" />
              <StatsCard title="Badges Earned" value={earnedCount} icon={Trophy} trend="up" trendValue={`${earnedCount}/${badgeConfig?.length || 0}`} />
            </>
          )}
        </Suspense>
      </div>

      {/* Enrolled Courses Section */}
      <div id="continue-learning" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
          <Link to="/courses" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        <Suspense fallback={<div className="grid gap-4 w-full"><CourseCardSkeleton /></div>}>
          {isLoading ? (
            <div className="grid gap-4 w-full">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : activeLearningCourses.length > 0 ? (
            <div className="grid gap-4 w-full">
              {visibleActiveCourses.map((course) => (
                <ProgressCard key={course.id} course={course} buttonVariant="outline" />
              ))}

              {activeLearningCourses.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setViewAllActive(!viewAllActive)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {viewAllActive ? (
                      <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Show More ({activeLearningCourses.length - 3} more) <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Book className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No active courses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start your learning journey by enrolling in a course</p>
                <Link to="/courses"><Button>Browse Courses</Button></Link>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>

      {/* Badges Section */}
      <div id="badges-section" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Badges</h2>
          <span className="text-sm text-primary">
            {earnedCount} of {badgeConfig?.length || 0} badges earned
          </span>
        </div>
        <Suspense
        fallback={
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-24 bg-muted animate-pulse rounded-lg" />
          }
        >
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {(viewAllBadges ? liveBadges : liveBadges.slice(0, MOBILE_BADGE_PAGE_SIZE)).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} onClick={() => setSelectedBadge(badge)} />
            ))}
          </div>

          {liveBadges.length > MOBILE_BADGE_PAGE_SIZE && (
            <div className="flex justify-center pt-1 md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewAllBadges(!viewAllBadges)}
                className="text-muted-foreground hover:text-foreground"
              >
                {viewAllBadges ? (
                  <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Show All ({liveBadges.length - MOBILE_BADGE_PAGE_SIZE} more) <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          )}

          <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        </Suspense>
      </div>

      {/* Certificates Section */}
      <div id="certificates-section" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">My Certificates</h2>
          {certificates.length > 0 && (
            <span className="text-sm text-primary">{certificates.length} earned</span>
          )}
        </div>

        {isLoadingCertificates ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg hidden sm:block" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Link key={cert.courseId} to={`/certificate/${cert.courseId}`}>
                <Card className="h-full overflow-hidden border-border/60 hover:border-primary/50 hover:shadow-lg transition-all group">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <GraduationCap className="h-5.5 w-5.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{cert.courseTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Grade {cert.grade}% &middot; {new Date(cert.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
                        View certificate <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No certificates yet</h3>
              <p className="text-sm text-muted-foreground">Finish a course to earn your first certificate.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommended Courses Section */}
      <div id="recommendations" className="space-y-4 mt-6 md:mt-0 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
          <Link to="/courses" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img src={fileUrl(course.thumbnail)} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{course.category}</p>
                <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.instructorName}</p>
                <Link to={`/courses/${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}