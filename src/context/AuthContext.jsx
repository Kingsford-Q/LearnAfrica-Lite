import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { courses as initialCourses, lessons as initialLessons, notifications as initialNotifications } from '@/data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInstructorMode, setIsInstructorMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- HELPER: Get User Specific Key ---
  const getUKey = useCallback((key) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return key;
    try {
      const { id } = JSON.parse(storedUser);
      return `u_${id}_${key}`;
    } catch {
      return key;
    }
  }, []);

  // ✅ PERSISTENT STATE: Load from LocalStorage with fallback
  const [notifications, setNotifications] = useState(() => {
    const key = getUKey('notifications_data');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [coursesState, setCoursesState] = useState(() => {
    const key = getUKey('courses_data');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [lessonsState, setLessonsState] = useState(() => {
    const key = getUKey('lessons_data');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialLessons;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // ✅ 1. DYNAMIC STATS RESOLVER
  const getLiveStats = useCallback(() => {
    const lessonsCompletedCount = lessonsState.filter((l) => l.isCompleted).length;
    const completedCourses = coursesState.filter((c) => c.progress === 100);
    const perfectQuizzes = lessonsState.filter((l) => l.quizScore === 100).length;

    const fastFinishCount = completedCourses.filter((c) => {
      if (!c.enrolledAt || !c.completedAt) return false;
      const duration = new Date(c.completedAt) - new Date(c.enrolledAt);
      return duration <= (7 * 24 * 60 * 60 * 1000);
    }).length;

    const isProfileComplete = !!(user?.avatar && user?.bio);

    return {
      lessonsCompletedCount,
      coursesCompletedCount: completedCourses.length,
      enrolledCoursesCount: coursesState.filter((c) => c.progress > 0).length,
      perfectQuizzes,
      fastFinishCount,
      reviewsCount: user?.reviews?.length || 0,
      isProfileComplete: isProfileComplete ? 1 : 0,
      streak: user?.stats?.streak || 1,
    };
  }, [lessonsState, coursesState, user?.reviews?.length, user?.avatar, user?.bio, user?.stats?.streak]);

  // ✅ 2. INITIALIZE AUTH
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const basicUser = JSON.parse(stored);
          
          // Re-load the data for THIS specific user to avoid data leakage from previous sessions
          const uID = basicUser.id;
          const uCourses = localStorage.getItem(`u_${uID}_courses_data`);
          const uLessons = localStorage.getItem(`u_${uID}_lessons_data`);
          const uNotifs = localStorage.getItem(`u_${uID}_notifications_data`);

          if (uCourses) setCoursesState(JSON.parse(uCourses));
          if (uLessons) setLessonsState(JSON.parse(uLessons));
          if (uNotifs) setNotifications(JSON.parse(uNotifs));

          setUser({
            ...basicUser,
            stats: getLiveStats(),
            badges: basicUser.badges || []
          });
        }
      } catch (err) {
        console.warn('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []); // Run only once on mount

  // ✅ 3. PERSISTENCE SYNC: Save data states to storage whenever they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`u_${user.id}_courses_data`, JSON.stringify(coursesState));
    }
  }, [coursesState, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`u_${user.id}_lessons_data`, JSON.stringify(lessonsState));
    }
  }, [lessonsState, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`u_${user.id}_notifications_data`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  // ✅ 4. AUTO-STATS SYNC
  useEffect(() => {
    if (user) {
      const freshStats = getLiveStats();
      if (JSON.stringify(freshStats) !== JSON.stringify(user.stats)) {
        setUser(prev => ({ ...prev, stats: freshStats }));
      }
    }
  }, [lessonsState, coursesState, getLiveStats]);

  // ✅ 5. ROBUST PROGRESS UPDATER
  const updateProgress = useCallback((courseId, lessonId, score = null) => {
    return new Promise((resolve) => {
      setLessonsState(prevLessons => {
        const updatedLessons = prevLessons.map(l => 
          String(l.id) === String(lessonId) 
            ? { ...l, isCompleted: true, quizScore: score !== null ? score : l.quizScore } 
            : l
        );

        setCoursesState(prevCourses => prevCourses.map(course => {
          if (String(course.id) === String(courseId)) {
            const courseLessons = updatedLessons.filter(l => String(l.courseId) === String(courseId));
            const completedCount = courseLessons.filter(l => l.isCompleted).length;
            const newProgress = Math.round((completedCount / courseLessons.length) * 100);
            
            return { 
              ...course, 
              progress: newProgress,
              completedAt: newProgress === 100 ? new Date().toISOString() : course.completedAt
            };
          }
          return course;
        }));

        resolve(updatedLessons);
        return updatedLessons;
      });
    });
  }, []);

  const saveToStorage = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Storage sync failed:', err);
    }
  };

  const login = useCallback(async (credentials) => {
    const newUser = {
      ...credentials,
      id: credentials.id || crypto.randomUUID(), // Preserve ID if provided
      role: credentials.role || 'student',
      joinedDate: new Date().toISOString(),
      stats: getLiveStats(),
      enrolledCourses: [],
      badges: []
    };
    setUser(newUser);
    saveToStorage(newUser);
  }, [getLiveStats]);

  const signup = useCallback(async (userData) => {
    const role = userData.isInstructor ? 'instructor' : 'student';
    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name || 'New Learner',
      email: userData.email,
      role: role,
      avatar: userData.avatar || null,
      joinedDate: new Date().toISOString(),
      stats: getLiveStats(),
      enrolledCourses: [],
      badges: [],
      profile: role === 'instructor' ? {
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
        rating: 0,
        coursesCount: 0,
      } : null
    };
    setUser(newUser);
    saveToStorage(newUser);
  }, [getLiveStats]);

  const logout = useCallback(() => {
    setUser(null);
    setIsInstructorMode(false);
    localStorage.removeItem('user');
    // Note: We don't necessarily need to clear user-specific data here 
    // because it's namespaced and won't be seen by others.
    // Reset states back to initial for the next "guest"
    setCoursesState(initialCourses);
    setLessonsState(initialLessons);
    setNotifications(initialNotifications);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...updates };
      saveToStorage(updatedUser);
      return updatedUser;
    });
  }, []);

  const toggleInstructorMode = useCallback(() => {
    const allowed = ['instructor', 'admin', 'superadmin'];
    if (user && allowed.includes(user.role)) {
      setIsInstructorMode((prev) => !prev);
    }
  }, [user?.role]);

  // ✅ 6. ENROLLMENT HANDLER
  const enrollInCourse = useCallback(async (courseId) => {
    return new Promise((resolve) => {
      setCoursesState(prevCourses => prevCourses.map(course => {
        if (String(course.id) === String(courseId)) {
          return { 
            ...course, 
            enrollments: (course.enrollments || 0) + 1,
            enrolledAt: new Date().toISOString() 
          };
        }
        return course;
      }));

      setUser(prevUser => {
        if (!prevUser) return null;
        const alreadyEnrolled = prevUser.enrolledCourses?.includes(Number(courseId));
        if (alreadyEnrolled) return prevUser;

        const updatedUser = {
          ...prevUser,
          enrolledCourses: [...(prevUser.enrolledCourses || []), Number(courseId)]
        };
        
        saveToStorage(updatedUser);
        return updatedUser;
      });
      resolve(true);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    courses: coursesState, 
    lessons: lessonsState,
    updateProgress,
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
    enrollInCourse,
    toggleInstructorMode,
    isInstructorMode,
    role: user?.role,
  }), [user, coursesState, lessonsState, updateProgress, login, signup, logout, updateUser, notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount, isInstructorMode, toggleInstructorMode, enrollInCourse]);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);