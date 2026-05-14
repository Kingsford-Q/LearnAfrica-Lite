import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { courses as initialCourses, lessons as initialLessons,getMilestones } from '@/data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInstructorMode, setIsInstructorMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [coursesState, setCoursesState] = useState(initialCourses);
  const [lessonsState, setLessonsState] = useState(initialLessons);

  const processedMilestonesRef = useRef(new Set());
  const sessionWelcomedRef = useRef(false);
  const isLoggingOut = useRef(false);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
  [notifications]);

  
  const syncDismissedRef = useCallback((userId) => {
    if (!userId) return;
    const storageKey = `u_${userId}_dismissed_milestones`;
    const dismissed = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    dismissed.forEach(id => processedMilestonesRef.current.add(id));
  }, []);

  const getLiveStats = useCallback(() => {
    const lessonsCompletedCount = lessonsState.filter((l) => l.isCompleted).length;
    const completedCourses = coursesState.filter((c) => c.progress === 100);
    const perfectQuizzes = lessonsState.filter((l) => l.quizScore === 100).length;

    const fastFinishCount = completedCourses.filter((c) => {
      if (!c.enrolledAt || !c.completedAt) return false;
      const duration = new Date(c.completedAt) - new Date(c.enrolledAt);
      return duration <= (7 * 24 * 60 * 60 * 1000);
    }).length;

    // IMPROVED LOGIC: Check both root and profile object for bio 
    // to ensure students (who might have null profile) are included.
    const hasBio = !!(user?.bio || user?.profile?.bio);
    const hasAvatar = !!user?.avatar;
    const isProfileComplete = hasBio && hasAvatar;

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
  }, [
    lessonsState, 
    coursesState, 
    user?.avatar, 
    user?.bio, 
    user?.profile?.bio, 
    user?.reviews?.length, 
    user?.stats?.streak
  ]);

  const markMilestoneAsDismissed = useCallback((internalId) => {
    if (!user?.id || !internalId) return;
    
    const storageKey = `u_${user.id}_dismissed_milestones`;
    const dismissed = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    
    if (!dismissed.includes(internalId)) {
      const updated = [...dismissed, internalId];
      sessionStorage.setItem(storageKey, JSON.stringify(updated));
      processedMilestonesRef.current.add(internalId);
    }
  }, [user?.id]);

  // --- NOTIFICATION ACTIONS ---

  const triggerNotification = useCallback((type, title, message, internalId) => {
    if (processedMilestonesRef.current.has(internalId)) return;

    setNotifications(prev => {
      if (prev.some(n => n.internalId === internalId)) {
        return prev; 
      }

      const now = new Date(); // Use a single reference for time consistency

      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        internalId,
        type,
        title,
        message,
        read: false,
        // Match the key 'time' used in your Drawer component
        time: now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        // Add a 'date' key to replace the hardcoded "May 13, 2026"
        date: now.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        timestamp: now.toISOString(), // Keep for sorting/logic
      };

      return [newNotif, ...prev];
    });
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === notificationId);
      
      // Lock the ref synchronously inside the setter
      if (target?.internalId) {
        processedMilestonesRef.current.add(target.internalId);
      }

      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );

      if (user?.id) {
        sessionStorage.setItem(`u_${user.id}_notifications_data`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user?.id]); // notifications dependency is now removed!

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      // 1. Saturation: Lock the shield for every single item 
      prev.forEach(n => {
        if (n.internalId) {
          processedMilestonesRef.current.add(n.internalId);
        }
      });

      // 2. Map transition
      const updated = prev.map(n => n.read ? n : { ...n, read: true });

      // 3. Atomic Storage Update
      if (user?.id) {
        sessionStorage.setItem(
          `u_${user.id}_notifications_data`, 
          JSON.stringify(updated)
        );
      }
      
      return updated;
    });
  }, [user?.id]);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === notificationId);
      
      if (!target) return prev; // Exit early if already gone

      if (target.internalId) {
        // 1. SILENT LOCK: Immediately block the engine
        processedMilestonesRef.current.add(target.internalId);
        
        // 2. PERSISTENT BANS: Ensure it never comes back after refresh
        if (user?.id) {
          const storageKey = `u_${user.id}_dismissed_milestones`;
          const dismissed = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
          if (!dismissed.includes(target.internalId)) {
            sessionStorage.setItem(storageKey, JSON.stringify([...dismissed, target.internalId]));
          }
        }
      }

      const updated = prev.filter(n => n.id !== notificationId);
      
      // 3. ATOMIC STORAGE UPDATE: Sync the notification list immediately
      if (user?.id) {
        sessionStorage.setItem(`u_${user.id}_notifications_data`, JSON.stringify(updated));
      }
      
      return updated;
    });
  }, [user?.id]);

  useEffect(() => {
    // 1. EXIT GATE: Prevent execution during loading, logout, or if no user exists
    if (!user || isLoading || isLoggingOut.current) return;

    /**
     * 2. INITIAL SHIELD HYDRATION
     * Only sync from storage if the Ref is empty. This prevents the engine 
     * from "re-learning" dismissed items and flickering during bulk updates.
     */
    if (processedMilestonesRef.current.size === 0) {
      syncDismissedRef(user.id);
      const storageKey = `u_${user.id}_dismissed_milestones`;
      const dismissed = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      dismissed.forEach(id => processedMilestonesRef.current.add(id));
    }

    // 3. HANDLE WELCOME MESSAGE
    const welcomeId = `welcome_msg_${user.id}`;
    if (!sessionWelcomedRef.current && !processedMilestonesRef.current.has(welcomeId)) {
      triggerNotification(
        'system', 
        "Welcome back, " + user.name, 
        "We're glad to have you back!", 
        welcomeId 
      );
      sessionWelcomedRef.current = true;
    }

    // 4. EVALUATE MILESTONES
    // Uses the latest stats to check against defined milestone conditions
    const currentStats = getLiveStats();
    const milestones = getMilestones(currentStats, user);

    milestones.forEach(m => {
      const mInternalId = `badge_${m.id}`;
      
      // Check only the Ref here for maximum speed. 
      // The "alreadyExists" atomic check happens inside triggerNotification.
      const isProcessed = processedMilestonesRef.current.has(mInternalId);

      if (m.condition && !isProcessed) {
        triggerNotification(m.type, m.title, m.message, mInternalId);
      }
    });

    /**
     * NOTE: 'notifications' and 'notifications.length' are strictly excluded 
     * from the dependency array to prevent infinite re-triggering loops.
     */
  }, [
    user?.id, 
    isLoading, 
    getLiveStats, 
    triggerNotification, 
    syncDismissedRef
  ]);



  // Initial Auth Hydration
  useEffect(() => {
  const initializeAuth = () => {
    try {
      const stored = sessionStorage.getItem('user');
      if (stored) {
        const basicUser = JSON.parse(stored);
        const uID = basicUser.id;

        syncDismissedRef(uID);

        const uCourses = sessionStorage.getItem(`u_${uID}_courses_data`);
        const uLessons = sessionStorage.getItem(`u_${uID}_lessons_data`);
        const uNotifs = sessionStorage.getItem(`u_${uID}_notifications_data`);

        if (uCourses) setCoursesState(JSON.parse(uCourses));
        if (uLessons) setLessonsState(JSON.parse(uLessons));

        if (uNotifs) {
          const parsedNotifs = JSON.parse(uNotifs);
          setNotifications(parsedNotifs);

          parsedNotifs.forEach(n => {
            if (n.internalId) {
              processedMilestonesRef.current.add(n.internalId);
            }
          });
        }

        setUser({
          ...basicUser,
          badges: basicUser.badges || [],
          stats: basicUser.stats || {}
        });
      }
    } catch (err) {
      console.warn('Auth init failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  initializeAuth();
}, [syncDismissedRef]); 

    // Persistence Sync
  useEffect(() => {
    // 1. Exit if no user session exists or if the logout process has initiated
    if (!user?.id || isLoggingOut.current) return;

    try {
      // 2. Sync Course Data
      sessionStorage.setItem(
        `u_${user.id}_courses_data`, 
        JSON.stringify(coursesState)
      );

      // 3. Sync Lesson Data
      sessionStorage.setItem(
        `u_${user.id}_lessons_data`, 
        JSON.stringify(lessonsState)
      );
      
    } catch (err) {
      console.warn('Persistence sync failed:', err);
    }
    
  }, [coursesState, lessonsState, user?.id]);

  // Update stats on data change
  useEffect(() => {
    if (user) {
      const freshStats = getLiveStats();
      if (JSON.stringify(freshStats) !== JSON.stringify(user.stats)) {
        setUser(prev => ({ ...prev, stats: freshStats }));
      }
    }
  }, [lessonsState, coursesState, getLiveStats]);

  // --- HANDLERS ---

  const login = useCallback(async (credentials) => {
    isLoggingOut.current = false; 
    processedMilestonesRef.current.clear();
    sessionWelcomedRef.current = false;
    
    const uID = credentials.id || credentials.email;
    
    // Sync dismissal memory for this specific user immediately
    syncDismissedRef(uID);
    
    const savedNotifs = sessionStorage.getItem(`u_${uID}_notifications_data`);
    const initialNotifs = savedNotifs ? JSON.parse(savedNotifs) : [];
    
    const savedCourses = sessionStorage.getItem(`u_${uID}_courses_data`);
    const savedLessons = sessionStorage.getItem(`u_${uID}_lessons_data`);

    initialNotifs.forEach(n => {
      if (n.internalId) processedMilestonesRef.current.add(n.internalId);
    });

    setNotifications(initialNotifs);
    setCoursesState(savedCourses ? JSON.parse(savedCourses) : initialCourses);
    setLessonsState(savedLessons ? JSON.parse(savedLessons) : initialLessons);

    const newUser = {
      ...credentials,
      id: uID,
      role: credentials.role || 'student',
      stats: getLiveStats(),
      joinedDate: new Date().toISOString(),
    };

    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));

    console.log("LOGIN USER ID:", uID);

  }, [getLiveStats, syncDismissedRef]);

  const logout = useCallback(() => {
    isLoggingOut.current = true; 

    processedMilestonesRef.current.clear();
    sessionWelcomedRef.current = false;

    setUser(null);
    setNotifications([]); 
    setCoursesState(initialCourses);
    setLessonsState(initialLessons);
    setIsInstructorMode(false);
    
    sessionStorage.removeItem('user');

    setTimeout(() => {
      isLoggingOut.current = false;
    }, 100);
  }, []);

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

  const signup = useCallback(async (userData) => {
    isLoggingOut.current = false;
    processedMilestonesRef.current.clear();
    sessionWelcomedRef.current = false;
    setNotifications([]);
    
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
      // Provide a profile object for everyone so bio checks don't fail
      profile: {
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
        // Only instructors get these specific metrics
        rating: role === 'instructor' ? 0 : null,
        coursesCount: role === 'instructor' ? 0 : null,
      }
    };

    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  }, [getLiveStats]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null;

      // Create the updated user object
      const updatedUser = { 
        ...prev, 
        ...updates,
        // If updates contains a profile, merge it with the existing one
        profile: updates.profile 
          ? { ...prev.profile, ...updates.profile } 
          : prev.profile 
      };

      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const toggleInstructorMode = useCallback(() => {
    const allowed = ['instructor', 'admin', 'superadmin'];
    if (user && allowed.includes(user.role)) {
      setIsInstructorMode((prev) => !prev);
    }
  }, [user?.role]);

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
        
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
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
    isLoading,
    enrollInCourse,
    toggleInstructorMode,
    isInstructorMode,
    role: user?.role,
  }), [user, coursesState, lessonsState, updateProgress, login, signup, logout, updateUser, notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount, isInstructorMode, toggleInstructorMode, isLoading, enrollInCourse]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);