import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInstructorMode, setIsInstructorMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Added to prevent UI flickering

  // ✅ INITIALIZE: Load user from localStorage once on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          const parsedUser = JSON.parse(stored)
          setUser(parsedUser)
        }
      } catch (err) {
        console.warn('Failed to parse stored user:', err)
        localStorage.removeItem('user') // Clear corrupted data
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // ✅ LOGIN
  const login = (userData) => {
    // Fallback for randomUUID if in a non-secure environment
    const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `user_${Math.random().toString(36).substr(2, 9)}`

    const userWithDefaults = {
      id: userData.id || generatedId,
      name: userData.name || 'Kingsford Quainoo',
      email: userData.email,
      role: userData.role || 'student',
      avatar: userData.avatar || null,
      joinedDate: userData.joinedDate || new Date().toISOString(),
    }

    setUser(userWithDefaults)

    try {
      localStorage.setItem('user', JSON.stringify(userWithDefaults))
    } catch (err) {
      console.error('LocalStorage error during login:', err)
    }
  }

  // ✅ LOGOUT
  const logout = () => {
    setUser(null)
    setIsInstructorMode(false)
    localStorage.removeItem('user')
  }

  // ✅ SAFE USER UPDATE
  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;

      const updatedUser = { 
        ...prev, 
        ...updates,
        // If updates.avatar is missing and prev.avatar is missing, 
        // explicitly set to null so the Lucide icon shows.
        avatar: updates.avatar || prev.avatar || null 
      };

      try {
        const storageData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar, 
          joinedDate: updatedUser.joinedDate,
        };
        
        localStorage.setItem('user', JSON.stringify(storageData));
      } catch (err) {
        // If the avatar was a huge base64 string, this catch will trigger.
        console.error('Update failed. Likely quota limit exceeded:', err);
      }

      return updatedUser;
    });
  };

  // ✅ TOGGLE INSTRUCTOR MODE
  const toggleInstructorMode = () => {
    if (user?.role === 'instructor' || user?.role === 'admin') {
      setIsInstructorMode((prev) => !prev)
    } else {
      console.warn('Access Denied: Not authorized for instructor mode.')
    }
  }

  // Don't render the app until we know if the user is logged in or not
  // This prevents the "Login" button flashing for a split second
  if (isLoading) {
    return null // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isInstructorMode,
        toggleInstructorMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}