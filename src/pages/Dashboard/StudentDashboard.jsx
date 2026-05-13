import { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
// Updated import path based on your folder structure
import { StatsCardSkeleton, CourseCardSkeleton } from '@/components/common/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { courses, badgeConfig } from '@/data/mockData';

// Lazy loaded components for code splitting
const StatsCard = lazy(() => import('@/components/dashboard/StatsCard'));
const ProgressCard = lazy(() => import('@/components/dashboard/ProgressCard'));
const BadgeCard = lazy(() => import('@/components/dashboard/BadgeCard'));

// Reusable Icons
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export default function StudentDashboard() {
  const { user, courses: coursesState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Optimized Logic for Backend Readiness
  const enrolledCourses = useMemo(() => (coursesState || []).filter((c) => c.progress > 0), [coursesState]);
  const completedCourses = useMemo(() => (coursesState || []).filter((c) => c.progress === 100), [coursesState]);
  
  // recommended courses logic
  const recommendedCourses = useMemo(() => (coursesState || []).filter((c) => c.progress === 0).slice(0, 3), [coursesState]);
  
  const totalHours = user?.totalHoursLearned || 42;

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
      const hasBadgeRecord = user.badges?.some((b) => b.badgeId === config.id);

      const requirementMap = {
        'lessons_completed': user.stats?.lessonsCompletedCount || 0,
        'courses_completed': user.stats?.coursesCompletedCount || 0,
        'day_streak': user.stats?.streak || 0,
        'perfect_quizzes': user.stats?.perfectQuizzes || 0,
        'reviews_submitted': user.stats?.reviewsCount || 0,
        'fast_finish': user.stats?.fastFinishCount || 0,
        'profile_completed': user.stats?.isProfileComplete ? 1 : 0,
      };

      const currentProgress = requirementMap[config.requirementType] || 0;
      const isEarned = hasBadgeRecord || currentProgress >= config.goal;

      return {
        ...config,
        earned: isEarned,
        currentProgress,
        earnedDate: isEarned ? (hasBadgeRecord ? 'Verified' : 'Recently') : null,
      };
    }).sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return (b.currentProgress / b.goal) - (a.currentProgress / a.goal);
    });
  }, [user]);

  const earnedCount = useMemo(() => 
    liveBadges.filter(b => b.earned).length, 
  [liveBadges]);

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={statsSkeletons}>
          {isLoading ? (
            statsSkeletons
          ) : (
            <>
              <StatsCard title="Enrolled Courses" value={enrolledCourses.length} icon={<BookIcon />} trend="up" trendValue="+2 this month" />
              <StatsCard title="Completed Courses" value={completedCourses.length} icon={<AwardIcon />} trend="up" trendValue="+1 this week" />
              <StatsCard title="Perfect Quizzes" value={user?.stats?.perfectQuizzes || 0} icon={<TrophyIcon />} trend="up" trendValue="100% Score" />
              <StatsCard title="Badges Earned" value={earnedCount} icon={<TrophyIcon />} trend="up" trendValue={`${earnedCount}/${badgeConfig.length}`} />
            </>
          )}
        </Suspense>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
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
          ) : enrolledCourses.length > 0 ? (
            <div className="grid gap-4 w-full">
              {enrolledCourses.slice(0, 3).map((course) => (
                <ProgressCard key={course.id} course={course} buttonVariant="outline" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookIcon />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start your learning journey by enrolling in a course</p>
                <Link to="/courses"><Button>Browse Courses</Button></Link>
              </CardContent>
            </Card>
          )}
        </Suspense>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Badges</h2>
          <span className="text-sm text-primary">
            {earnedCount} of {badgeConfig.length} badges earned
          </span>
        </div>
        <Suspense 
    fallback={
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 h-24 bg-muted animate-pulse rounded-lg" />
    }
  >
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
      {liveBadges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  </Suspense>
      </div>

      {/* Recommended Courses Section */}
      <div className="space-y-4 mt-6 md:mt-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
          <Link to="/courses" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
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
                <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
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