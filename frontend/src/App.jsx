import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { SignupPage } from './pages/Auth/SignupPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { CoursesPage } from './pages/Courses/CoursesPage';
import { CourseDetailPage } from './pages/Courses/CourseDetailPage';
import { LessonPage } from './pages/Lessons/LessonPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { QuizResultsPage } from './pages/Quiz/QuizResultsPage';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import { InstructorDashboard } from './pages/Instructor/InstructorDashboard';
import { CreateCoursePage } from './pages/Instructor/CreateCoursePage';
import { MyCoursesPage } from './pages/Instructor/MyCoursesPage';
import { CourseStudentsPage } from './pages/Instructor/CourseStudentsPage';
import { InstructorReviewsPage } from './pages/Instructor/InstructorReviewsPage';
import { AnalyticsPage } from './pages/Instructor/AnalyticsPage';
import InstructorApprovalsPage from './pages/Admin/InstructorApprovalsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import CertificatePage from './pages/Certificate/CertificatePage';
import VerifyCredentialPage from './pages/Verify/VerifyCredentialPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import InstructorOnboarding from './pages/Auth/InstructorOnboarding';
import { Loader2 } from "lucide-react";


// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Public Only Route (redirect if authenticated)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading} = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
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
        <Route path="verify" element={<VerifyCredentialPage />} />
        <Route path="verify/:code" element={<VerifyCredentialPage />} />
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
        <Route
          path="forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="signup/instructor-onboarding"
          element={
            <PublicOnlyRoute>
              <InstructorOnboarding />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Shared Authenticated Routes - Ensures /settings always works */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
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
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>

      <Route path="/certificate/:courseId" element={<CertificatePage />} />

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
          <ProtectedRoute allowedRoles={['instructor', 'admin', 'superadmin']}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="courses/create" element={<CreateCoursePage />} />
        <Route path="courses/:courseId/students" element={<CourseStudentsPage />} />
        <Route path="reviews" element={<InstructorReviewsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Admin / SuperAdmin Routes */}
      <Route
        path="admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="instructors" replace />} />
        <Route path="instructors" element={<InstructorApprovalsPage />} />
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
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}