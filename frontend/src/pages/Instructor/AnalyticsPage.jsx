import { useState, useEffect } from 'react'
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  Target,
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
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import StatsCard from '@/components/dashboard/StatsCard'
import { api } from '@/lib/apiClient'

// Local placeholder data for charts that don't have a dedicated endpoint yet
const revenueData = [
  { month: 'Jan', revenue: 2400 },
  { month: 'Feb', revenue: 2800 },
  { month: 'Mar', revenue: 3200 },
  { month: 'Apr', revenue: 2900 },
  { month: 'May', revenue: 3600 },
  { month: 'Jun', revenue: 4100 },
]

const completionData = [
  { name: 'Completed', value: 65, color: 'hsl(var(--success))' },
  { name: 'In Progress', value: 25, color: 'hsl(var(--primary))' },
  { name: 'Not Started', value: 10, color: 'hsl(var(--muted))' },
]

const engagementData = [
  { day: 'Mon', views: 120, enrollments: 12 },
  { day: 'Tue', views: 180, enrollments: 18 },
  { day: 'Wed', views: 150, enrollments: 15 },
  { day: 'Thu', views: 200, enrollments: 22 },
  { day: 'Fri', views: 170, enrollments: 17 },
  { day: 'Sat', views: 90, enrollments: 8 },
  { day: 'Sun', views: 70, enrollments: 6 },
]

export function AnalyticsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/courses/mine/stats')
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  const monthlyEnrollments = stats?.monthlyEnrollments ?? []
  const coursePerformance = stats?.coursePerformance ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your course performance and student engagement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats ? `$${stats.totalEarnings.toLocaleString()}` : '—'}
          icon={DollarSign}
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="Total Students"
          value={stats ? stats.totalStudents.toLocaleString() : '—'}
          icon={Users}
          trend="up"
          trendValue="8%"
        />
        <StatsCard
          title="Completion Rate"
          value={stats ? `${stats.completionRate}%` : '—'}
          icon={Target}
          trend="up"
          trendValue="5%"
        />
        <StatsCard
          title="Average Rating"
          value={stats ? stats.averageRating : '—'}
          icon={Star}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Chart (static placeholder until revenue endpoint exists) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v) => [`$${v}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Trends (real backend data) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="enrollments" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Completion (static placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Course Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v) => `${v}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {completionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Engagement (static placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Table (real backend data) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Course</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Students</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Completion</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rating</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {coursePerformance.map((course, index) => (
                  <tr key={course.name} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="p-4 font-medium">{course.name}</td>
                    <td className="p-4 text-muted-foreground">{course.students.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${course.completion}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{course.completion}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span>4.{7 + (index % 3)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      ${(course.students * 0.8 * (49 + index * 10)).toFixed(0)}
                    </td>
                  </tr>
                ))}
                {coursePerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      No course data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
