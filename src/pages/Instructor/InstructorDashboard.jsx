import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Star,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Button } from '@/components/common/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import  StatsCard  from '@/components/dashboard/StatsCard'
import { useAuth } from '@/context/AuthContext'
import { instructorStats, courses } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function InstructorDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Instructor'}! Here&apos;s how your courses are performing.
          </p>
        </div>
        <Link to="/instructor/create-course">
          <Button>
            Create New Course
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={instructorStats.totalCourses}
          icon={BookOpen}
          trend="up"
          trendValue="2"
        />
        <StatsCard
          title="Total Students"
          value={instructorStats.totalStudents.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${instructorStats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="8%"
        />
        <StatsCard
          title="Average Rating"
          value={instructorStats.averageRating}
          icon={Star}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Enrollment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={instructorStats.monthlyEnrollments}>
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEnrollments)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instructorStats.coursePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="students" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Students */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Students</h2>
            <Link to="/instructor/students" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Course</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {instructorStats.recentStudents.map(student => (
                    <tr key={student.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{student.course}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{student.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/instructor/create-course" className="block">
              <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Create New Course</p>
                    <p className="text-xs text-muted-foreground">Start building a new course</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/instructor/lessons" className="block">
              <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Add Lessons</p>
                    <p className="text-xs text-muted-foreground">Add content to your courses</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/instructor/analytics" className="block">
              <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Star className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">View Analytics</p>
                    <p className="text-xs text-muted-foreground">Track course performance</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
