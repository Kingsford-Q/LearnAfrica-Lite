import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { badgeConfig, testimonials, categories, difficulties } from '@/data/mockData';
import { api, setAccessToken } from '@/lib/apiClient';
import { useTheme } from './ThemeContext';

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
      forumContributionsCount: 0,
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
      instructor: {
        payout: apiUser.instructorPayoutAlerts,
        messages: apiUser.instructorMessagesEnabled,
      },
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
    forumContributionsCount: s.forumContributionsCount,
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
    link: n.actionUrl || null,
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
  const userRef = useRef(null);
  userRef.current = user;
  const { setTheme } = useTheme();

  // A stale refresh-token cookie (expired session, revoked on another device,
  // etc.) surfaces here instead of leaving the app stuck showing "logged in"
  // UI forever with every background request silently failing. Only acts if
  // we actually thought we had a session — anonymous visitors also trigger a
  // failed refresh attempt on first load, and that's not a real "expiry".
  useEffect(() => {
    const handleSessionExpired = () => {
      if (userRef.current && !isLoggingOut.current) {
        setUser(null);
        setIsInstructorMode(false);
      }
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  // Adopts the account's saved appearance (set on another device via Settings)
  // as this browser's theme. Guards against the backend's "system" default,
  // which isn't a real theme value ThemeContext understands.
  const syncThemeFromAccount = useCallback((appearance) => {
    if (appearance === 'light' || appearance === 'dark') setTheme(appearance);
  }, [setTheme]);

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

  const fetchBadges = useCallback(async () => {
    try {
      const data = await api.get('/api/users/me/badges');
      setUser(prev => prev ? { ...prev, badges: data.map(b => ({ badgeKey: b.badgeKey, earnedAt: b.earnedAt })) } : prev);
    } catch {
      // Best-effort — keep the last known badges.
    }
  }, []);

  // Re-syncs role/approval-status/profile fields from the backend without a full
  // reload, so e.g. an instructor approval takes effect while the tab stays open.
  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get('/api/auth/me');
      setUser(prev => {
        const mapped = mapApiUserToAppUser(me);
        return prev ? { ...mapped, stats: prev.stats, badges: prev.badges } : mapped;
      });
    } catch {
      // Best-effort — keep the last known session state.
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
    fetchBadges();
  }, [user?.id, fetchEnrollments, fetchStats, fetchBadges]);

  // --- NOTIFICATION ACTIONS (backend-driven) ---

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/api/notifications');
      const fetched = data.map(mapApiNotification);
      // A read notification never goes back to unread server-side, so treat
      // "read" as a one-way ratchet when merging. Without this, the 30s
      // background poll can race an in-flight mark-as-read request: if the
      // GET was already in flight before the POST resolved, it carries a
      // stale "unread" snapshot that would otherwise stomp the optimistic
      // update the instant it lands, making the notification flip back to
      // unread right after the user opened it.
      setNotifications(prev => {
        const previouslyRead = new Set(prev.filter(n => n.read).map(n => n.id));
        return fetched.map(n => previouslyRead.has(n.id) ? { ...n, read: true } : n);
      });
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
    const interval = setInterval(() => {
      fetchNotifications();
      refreshUser();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, isLoading, fetchNotifications, refreshUser]);

  // Initial Auth Hydration — restores the session via the refresh-token cookie,
  // so a reload stays logged in even with no access token cached in memory.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const me = await api.get('/api/auth/me');
        setUser(mapApiUserToAppUser(me));
        syncThemeFromAccount(me.appearance);
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
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, twoFactorToken: data.twoFactorToken };
    }
    setAccessToken(data.accessToken);
    setUser(mapApiUserToAppUser(data.user));
    syncThemeFromAccount(data.user.appearance);
    return { requiresTwoFactor: false };
  }, [syncThemeFromAccount]);

  const verifyTwoFactorLogin = useCallback(async (twoFactorToken, code) => {
    const data = await api.post('/api/auth/login/2fa', { twoFactorToken, code });
    setAccessToken(data.accessToken);
    setUser(mapApiUserToAppUser(data.user));
    syncThemeFromAccount(data.user.appearance);
  }, [syncThemeFromAccount]);

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
      // Two-factor is deliberately excluded here — it's only ever changed via
      // the dedicated setup/verify/disable endpoints, never a blind toggle.
      const apiUser = await api.put('/api/users/me/settings', {
        notificationsEmail: s.notifications?.email,
        notificationsPush: s.notifications?.push,
        notificationsUpdates: s.notifications?.updates,
        appearance: s.appearance,
        instructorPayoutAlerts: s.instructor?.payout,
        instructorMessagesEnabled: s.instructor?.messages,
      });
      setUser(prev => ({
        ...prev,
        settings: {
          notifications: { email: apiUser.notificationsEmail, push: apiUser.notificationsPush, updates: apiUser.notificationsUpdates },
          privacy: { twoFactor: apiUser.twoFactorAppEnabled },
          appearance: apiUser.appearance,
          instructor: { payout: apiUser.instructorPayoutAlerts, messages: apiUser.instructorMessagesEnabled },
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
      refreshBadges: fetchBadges,
      login,
      verifyTwoFactorLogin,
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
    fetchBadges,
    login,
    verifyTwoFactorLogin,
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
