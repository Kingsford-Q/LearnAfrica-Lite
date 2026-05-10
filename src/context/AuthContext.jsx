import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // Load user safely from localStorage
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      console.warn('Failed to parse stored user:', err)
      return null
    }
  })

  const [isInstructorMode, setIsInstructorMode] = useState(false)

  // ✅ LOGIN
  const login = (userData) => {
    const userWithDefaults = {
      id: userData.id || crypto.randomUUID(),
      name: userData.name || 'Kingsford Quainoo',
      email: userData.email,
      role: userData.role || 'student',
      avatar: userData.avatar || '/placeholder-user.jpg', // IMPORTANT FIX
      joinedDate: userData.joinedDate || new Date().toISOString(),
    }

    setUser(userWithDefaults)

    try {
      localStorage.setItem('user', JSON.stringify(userWithDefaults))
    } catch (err) {
      console.warn('localStorage quota exceeded on login:', err)
    }
  }

  // ✅ LOGOUT
  const logout = () => {
    setUser(null)
    setIsInstructorMode(false)
    localStorage.removeItem('user')
  }

  // ✅ SAFE USER UPDATE (FIXED)
  const updateUser = (updates) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates }

      try {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar, // MUST BE URL, NOT BASE64
            joinedDate: updatedUser.joinedDate,
          })
        )
      } catch (err) {
        console.warn('localStorage update failed (quota issue):', err)
      }

      return updatedUser
    })
  }

  // ✅ TOGGLE INSTRUCTOR MODE
  const toggleInstructorMode = () => {
    if (user?.role === 'instructor' || user?.role === 'admin') {
      setIsInstructorMode((prev) => !prev)
    } else {
      console.warn('Access Denied: Not authorized for instructor mode.')
    }
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