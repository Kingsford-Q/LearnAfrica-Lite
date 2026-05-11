import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInstructorMode, setIsInstructorMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ INITIALIZE: Load user from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch (err) {
        console.warn('Failed to parse stored user:', err)
        localStorage.removeItem('user') 
      } finally {
        setIsLoading(false)
      }
    }
    initializeAuth()
  }, [])

  // ✅ PERSISTENCE HELPER: Keeps localStorage in sync
  const saveToStorage = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      console.error('Storage sync failed:', err)
    }
  }

  // ✅ SIGNUP: Logic-heavy to handle both student and instructor paths
  const signup = useCallback(async (userData) => {
    // 1. Determine Role based on the toggle from Step 1
    const role = userData.isInstructor ? 'instructor' : 'student'

    // 2. Build the Backend-Ready User Object
    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name || 'New Learner',
      email: userData.email,
      role: role,
      avatar: userData.avatar || null,
      joinedDate: new Date().toISOString(),
      
      // ✅ Profile Metadata: Only populated for instructors
      profile: role === 'instructor' ? {
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
        rating: 0,
        coursesCount: 0,
      } : null
    }

    // In production, replace the lines below with:
    // const response = await axios.post('/api/auth/signup', newUser)
    setUser(newUser)
    saveToStorage(newUser)
  }, [])

  // ✅ LOGIN: Handles incoming data from backend or dummy data
  const login = useCallback(async (credentials) => {
    // Simulate finding a user (this would be an API call)
    const mockUser = {
      ...credentials,
      id: crypto.randomUUID(),
      role: credentials.role || 'student', 
      joinedDate: new Date().toISOString(),
    }

    setUser(mockUser)
    saveToStorage(mockUser)
  }, [])

  // ✅ LOGOUT
  const logout = useCallback(() => {
    setUser(null)
    setIsInstructorMode(false)
    localStorage.removeItem('user')
  }, [])

  // ✅ UPDATE USER: Merges updates into current user state
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null
      const updatedUser = { ...prev, ...updates }
      saveToStorage(updatedUser)
      return updatedUser
    })
  }, [])

  // ✅ TOGGLE MODE: Only allows switching if user is an instructor or admin
  const toggleInstructorMode = () => {
    const allowed = ['instructor', 'admin', 'superadmin']
    if (user && allowed.includes(user.role)) {
      setIsInstructorMode((prev) => !prev)
    } else {
      console.warn("Access Denied: User role doesn't support instructor mode.")
    }
  }

  // Prevent flash of unauthenticated content while checking localStorage
  if (isLoading) return null 

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isInstructorMode,
        toggleInstructorMode,
        role: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}