import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, DollarSign, Star, ArrowRight, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/apiClient';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const ITEMS_PER_PAGE = 5;

export function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    api.get('/api/courses/mine/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  // Pagination Logic (Sort by timestamp if available, otherwise use mock array)
  const totalPages = Math.ceil(stats.recentStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = stats.recentStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10 space-y-10 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Instructor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Instructor'}! Monitoring your performance.
          </p>
        </div>
        <Link to="/instructor/courses/create" className="w-full sm:w-auto">
          <Button className="w-full gap-2 h-10 text-xs font-medium">
            Create New Course <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} trend="up" trendValue="2" />
        <StatsCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon={Users} trend="up" trendValue="12%" />
        <StatsCard title="Total Earnings" value={`$${stats.totalEarnings.toLocaleString()}`} icon={DollarSign} trend="up" trendValue="8%" />
        <StatsCard title="Average Rating" value={stats.averageRating} icon={Star} />
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Monthly Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-62.5 sm:h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyEnrollments} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] fill-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} fill="url(#colorEnroll)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-62.5 sm:h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.coursePerformance} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} className="text-[10px] font-medium" />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                  <Bar dataKey="students" radius={[0, 4, 4, 0]} barSize={16}>
                    {stats.coursePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Student View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight">Recent Students</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <Card className="hidden md:block overflow-hidden border-border/50 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border/50">
              <tr>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Student Name</th>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight">Enrolled Course</th>
                <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-tight text-right">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedStudents.map((s) => (
                <tr key={s.userId} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-secondary-foreground">
                        {getInitials(s.name)}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{s.course}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary/70 transition-all duration-700" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">{s.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Mobile List View (Hidden on Desktop/Tablet) */}
        <div className="md:hidden space-y-3">
          {paginatedStudents.map((s) => (
            <Card key={s.userId} className="p-4 border-border/50 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                  {getInitials(s.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.course}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Course Progress</span>
                  <span>{s.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary/70" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}