import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts - Converted to Named Imports
import  MainLayout  from './layouts/MainLayout';
import  DashboardLayout  from './layouts/DashboardLayout';
import  InstructorLayout  from './layouts/InstructorLayout';
import { AuthLayout }  from './layouts/AuthLayout';

// Pages - Converted to Named Imports
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { SignupPage } from './pages/Auth/SignupPage';
import { CoursesPage } from './pages/Courses/CoursesPage';
import { CourseDetailPage } from './pages/Courses/CourseDetailPage';
import { LessonPage } from './pages/Lessons/LessonPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { QuizResultsPage } from './pages/Quiz/QuizResultsPage';
import  StudentDashboard  from './pages/Dashboard/StudentDashboard';
import { InstructorDashboard } from './pages/Instructor/InstructorDashboard';
import { CreateCoursePage } from './pages/Instructor/CreateCoursePage';
import { AnalyticsPage } from './pages/Instructor/AnalyticsPage';
import  ProfilePage from './pages/Profile/ProfilePage';
import  SettingsPage  from './pages/Settings/SettingsPage';
import  CertificatePage  from './pages/Certificate/CertificatePage';
import  LeaderboardPage  from './pages/Leaderboard/LeaderboardPage';
import  NotFoundPage  from './pages/NotFound/NotFoundPage';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Public Only Route (redirect if authenticated)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Student Dashboard Routes */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="certificate/:courseId" element={<CertificatePage />} />
      </Route>

      {/* Learning Routes */}
      <Route
        path="learn"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="course/:courseId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="course/:courseId/quiz/:quizId" element={<QuizPage />} />
        <Route path="course/:courseId/quiz/:quizId/results" element={<QuizResultsPage />} />
      </Route>

      {/* Instructor Routes */}
      <Route
        path="instructor"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="courses/create" element={<CreateCoursePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}