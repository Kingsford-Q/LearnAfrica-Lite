import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { badgeConfig, testimonials, categories, difficulties } from '@/data/mockData';
import { api, setAccessToken } from '@/lib/apiClient';

const AuthContext = createContext();

// Maps the backend's UserDto onto the shape the rest of the app already expects
// (nested `profile`/`settings`, lowercase `role`). `stats` starts zeroed and is
// filled in by the real /api/users/me/stats fetch right after hydration/login.
function mapApiUserToAppUser(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: (apiUser.role || 'Student').toLowerCase(),
    avatar: apiUser.avatar,
    joinedDate: apiUser.joinedDate,
    instructorApprovalStatus: apiUser.instructorApprovalStatus,
    profile: {
      bio: apiUser.bio || '',
      location: apiUser.location || '',
      website: apiUser.website || '',
    },
    stats: {
      coursesCompletedCount: 0,
      lessonsCompletedCount: 0,
      enrolledCoursesCount: 0,
      perfectQuizzes: 0,
      fastFinishCount: 0,
      reviewsCount: 0,
      isProfileComplete: apiUser.bio && apiUser.avatar ? 1 : 0,
      streak: apiUser.streak || 0,
    },
    badges: [],
    settings: {
      notifications: {
        email: apiUser.notificationsEmail,
        push: apiUser.notificationsPush,
        updates: apiUser.notificationsUpdates,
      },
      privacy: { twoFactor: apiUser.twoFactorAppEnabled },
      appearance: apiUser.appearance || 'system',
    },
  };
}

// Maps the backend's UserStatsDto onto the `user.stats` shape consumers expect.
function mapApiStats(s, streak) {
  return {
    coursesCompletedCount: s.coursesCompletedCount,
    lessonsCompletedCount: s.lessonsCompletedCount,
    enrolledCoursesCount: s.enrolledCoursesCount,
    perfectQuizzes: s.perfectQuizzesCount,
    fastFinishCount: s.fastFinishCount,
    reviewsCount: s.reviewsCount,
    isProfileComplete: s.isProfileComplete ? 1 : 0,
    streak,
  };
}

// Maps the backend's NotificationDto onto the shape MobileNotificationsDrawer expects.
function mapApiNotification(n) {
  const created = new Date(n.createdAt);
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.isRead,
    timestamp: n.createdAt,
    time: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    date: created.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInstructorMode, setIsInstructorMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [coursesState, setCoursesState] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrollmentsState, setEnrollmentsState] = useState([]);

  const isLoggingOut = useRef(false);

  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read).length,
  [notifications]);

  // --- CATALOG + ENROLLMENTS (real backend data) ---

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await api.get('/api/courses');
      setCoursesState(data);
    } catch {
      // Best-effort — keep the last known catalog.
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      const data = await api.get('/api/enrollments/mine');
      setEnrollmentsState(data);
    } catch {
      setEnrollmentsState([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/api/users/me/stats');
      setUser(prev => prev ? { ...prev, stats: mapApiStats(data, prev.stats?.streak || 0) } : prev);
    } catch {
      // Best-effort — keep the last known stats.
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (!user) {
      setEnrollmentsState([]);
      return;
    }
    fetchEnrollments();
    fetchStats();
  }, [user?.id, fetchEnrollments, fetchStats]);

  // --- NOTIFICATION ACTIONS (backend-driven) ---

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/api/notifications');
      setNotifications(data.map(mapApiNotification));
    } catch {
      // Best-effort — keep the last known list, next poll will retry.
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    try {
      await api.post(`/api/notifications/${notificationId}/read`);
    } catch {
      // Best-effort — next poll resyncs.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => n.read ? n : { ...n, read: true }));
    try {
      await api.post('/api/notifications/read-all');
    } catch {
      // Best-effort — next poll resyncs.
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    try {
      await api.delete(`/api/notifications/${notificationId}`);
    } catch {
      // Best-effort — next poll resyncs.
    }
  }, []);

  // Poll for new notifications while a user session is active.
  useEffect(() => {
    if (!user || isLoading) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, isLoading, fetchNotifications]);

  // Initial Auth Hydration — restores the session via the refresh-token cookie,
  // so a reload stays logged in even with no access token cached in memory.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const me = await api.get('/api/auth/me');
        setUser(mapApiUserToAppUser(me));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // --- HANDLERS ---

  const login = useCallback(async (email, password) => {
    isLoggingOut.current = false;

    const data = await api.post('/api/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(mapApiUserToAppUser(data.user));
  }, []);

  const logout = useCallback(() => {
    isLoggingOut.current = true;

    api.post('/api/auth/logout').catch(() => {});
    setAccessToken(null);

    setUser(null);
    setIsInstructorMode(false);

    setTimeout(() => {
      isLoggingOut.current = false;
    }, 100);
  }, []);

  const signup = useCallback(async (userData) => {
    isLoggingOut.current = false;

    const data = await api.post('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      isInstructor: !!userData.isInstructor,
      instructorTitle: userData.title || null,
      instructorPortfolio: userData.website || null,
      instructorSkills: userData.skills || [],
    });
    setAccessToken(data.accessToken);

    let apiUser = data.user;

    // Onboarding collects bio/location separately from the registration payload.
    if (userData.bio || userData.location) {
      apiUser = await api.put('/api/users/me/profile', {
        bio: userData.bio || null,
        location: userData.location || null,
        website: userData.website || null,
      });
    }

    setUser(mapApiUserToAppUser(apiUser));
  }, []);

  const updateUser = useCallback(async (updates) => {
    if (!user) return;

    if (updates.settings) {
      const s = updates.settings;
      const apiUser = await api.put('/api/users/me/settings', {
        notificationsEmail: s.notifications?.email,
        notificationsPush: s.notifications?.push,
        notificationsUpdates: s.notifications?.updates,
        twoFactorAppEnabled: s.privacy?.twoFactor,
        appearance: s.appearance,
      });
      setUser(prev => ({
        ...prev,
        settings: {
          notifications: { email: apiUser.notificationsEmail, push: apiUser.notificationsPush, updates: apiUser.notificationsUpdates },
          privacy: { twoFactor: apiUser.twoFactorAppEnabled },
          appearance: apiUser.appearance,
        },
      }));
      return;
    }

    const bio = updates.profile?.bio ?? updates.bio;
    const location = updates.profile?.location ?? updates.location;
    const website = updates.profile?.website ?? updates.website;

    const apiUser = await api.put('/api/users/me/profile', {
      name: updates.name ?? null,
      avatar: updates.avatar ?? null,
      bio: bio ?? null,
      location: location ?? null,
      website: website ?? null,
    });

    setUser(prev => ({
      ...prev,
      name: apiUser.name,
      avatar: apiUser.avatar,
      profile: { ...prev.profile, bio: apiUser.bio || '', location: apiUser.location || '', website: apiUser.website || '' },
      stats: { ...prev.stats, isProfileComplete: apiUser.bio && apiUser.avatar ? 1 : 0 },
    }));
  }, [user]);

  const toggleInstructorMode = useCallback(() => {
    const allowed = ['instructor', 'admin', 'superadmin'];
    if (user && allowed.includes(user.role)) {
      setIsInstructorMode((prev) => !prev);
    }
  }, [user?.role]);

  const value = useMemo(() => {
    const courses = coursesState.map((course) => {
      const enrollment = enrollmentsState.find((e) => e.courseId === course.id);
      return {
        ...course,
        isEnrolled: !!enrollment,
        progress: enrollment ? enrollment.progressPercent : 0,
        enrolledAt: enrollment?.enrolledAt || null,
        completedAt: enrollment?.completedAt || null,
      };
    });

    return {
      user,
      courses,
      coursesLoading,
      refreshCourses: fetchCourses,
      refreshEnrollments: fetchEnrollments,
      refreshStats: fetchStats,
      login,
      signup,
      logout,
      updateUser,
      notifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      unreadCount,
      isAuthenticated: !!user,
      isLoading,
      toggleInstructorMode,
      isInstructorMode,
      role: user?.role,
      badgeConfig,
      categories,
      difficulties,
      testimonials,
    };
  }, [
    user,
    coursesState,
    enrollmentsState,
    coursesLoading,
    fetchCourses,
    fetchEnrollments,
    fetchStats,
    login,
    signup,
    logout,
    updateUser,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
    isInstructorMode,
    toggleInstructorMode,
    isLoading,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
