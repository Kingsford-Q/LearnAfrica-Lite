import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { courses as initialCourses, lessons as initialLessons, notifications as initialNotifications } from '@/data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInstructorMode, setIsInstructorMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


const [notifications, setNotifications] = useState(() => {
  const saved = localStorage.getItem('notifications_data');
  return saved ? JSON.parse(saved) : initialNotifications;
});  

  // ✅ PERSISTENT STATE: Load from LocalStorage if available, otherwise use mockData
  const [coursesState, setCoursesState] = useState(() => {
    const saved = localStorage.getItem('courses_data');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [lessonsState, setLessonsState] = useState(() => {
    const saved = localStorage.getItem('lessons_data');
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
          const initialStats = getLiveStats(); 
          setUser({
            ...basicUser,
            stats: initialStats,
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
  }, []); 

  // ✅ 3. PERSISTENCE SYNC: Save data states to storage whenever they change
  useEffect(() => {
    localStorage.setItem('courses_data', JSON.stringify(coursesState));
  }, [coursesState]);

  useEffect(() => {
    localStorage.setItem('lessons_data', JSON.stringify(lessonsState));
  }, [lessonsState]);

  // ✅ 4. AUTO-STATS SYNC: Updates the user object when progress is made
  useEffect(() => {
    if (user) {
      const freshStats = getLiveStats();
      if (JSON.stringify(freshStats) !== JSON.stringify(user.stats)) {
        setUser(prev => ({ ...prev, stats: freshStats }));
      }
    }

    localStorage.setItem('notifications_data', JSON.stringify(notifications));
  }, [lessonsState, coursesState, getLiveStats, notifications]);

  // ✅ 5. ROBUST PROGRESS UPDATER (Now includes quizScore support)
  const updateProgress = useCallback((courseId, lessonId, score = null) => {
    return new Promise((resolve) => {
      setLessonsState(prevLessons => {
        const updatedLessons = prevLessons.map(l => 
          String(l.id) === String(lessonId) 
            ? { 
                ...l, 
                isCompleted: true, 
                // Only update score if a new one is provided
                quizScore: score !== null ? score : l.quizScore 
              } 
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
      id: crypto.randomUUID(),
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
    localStorage.removeItem('courses_data'); 
    localStorage.removeItem('lessons_data');
    localStorage.removeItem('notifications_data');
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
    role: user?.role,
  }), [user, coursesState, lessonsState, updateProgress, login, signup, logout, updateUser,notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount, isInstructorMode, toggleInstructorMode, enrollInCourse]);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);