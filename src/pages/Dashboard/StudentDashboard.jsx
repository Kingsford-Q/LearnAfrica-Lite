import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import  StatsCard  from '../../components/dashboard/StatsCard';
import  ProgressCard  from '../../components/dashboard/ProgressCard';
import  BadgeCard  from '../../components/dashboard/BadgeCard';
import { useAuth } from '../../context/AuthContext';
import { courses, badges, recentActivity } from '../../data/mockData';

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

const activityIcons = {
  lesson_completed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quiz_passed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  course_enrolled: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  badge_earned: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

const activityColors = {
  lesson_completed: 'text-success bg-success/10',
  quiz_passed: 'text-warning bg-warning/10',
  course_enrolled: 'text-primary bg-primary/10',
  badge_earned: 'text-accent bg-accent/10',
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const enrolledCourses = courses.filter((c) => c.progress > 0);
  const completedCourses = courses.filter((c) => c.progress === 100);
  const earnedBadges = badges.filter((b) => b.earned);
  const totalHours = 42;

  return (
    <div className="space-y-8 p-6">
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
        <div className="flex gap-3">
          <Link to="/dashboard/leaderboard">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </Button>
          </Link>
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Enrolled Courses"
          value={enrolledCourses.length}
          icon={<BookIcon />}
          trend="up"
          trendValue="+2 this month"
        />
        <StatsCard
          title="Completed Courses"
          value={completedCourses.length}
          icon={<AwardIcon />}
          trend="up"
          trendValue="+1 this week"
        />
        <StatsCard
          title="Hours Learned"
          value={totalHours}
          icon={<ClockIcon />}
          trend="up"
          trendValue="+5 this week"
        />
        <StatsCard
          title="Badges Earned"
          value={earnedBadges.length}
          icon={<TrophyIcon />}
          trend="up"
          trendValue="+3 badges"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
            <Link to="/courses" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 3).map((course) => (
                <ProgressCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookIcon />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Link to="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                        activityColors[activity.type] || 'text-muted-foreground bg-muted'
                      }`}
                    >
                      {activityIcons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      {activity.course && (
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.course}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Achievements</h2>
          <span className="text-sm text-muted-foreground">
            {earnedBadges.length} of {badges.length} badges earned
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
          <Link to="/courses" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses
            .filter((c) => c.progress === 0)
            .slice(0, 3)
            .map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
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
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
