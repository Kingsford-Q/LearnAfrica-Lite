import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  const [isInstructorMode, setIsInstructorMode] = useState(false)

  const login = (userData) => {
    const userWithDefaults = {
      id: '1',
      name: userData.name || 'Kingsford Quainoo',
      email: userData.email,
      avatar: '/placeholder-user.jpg',
      role: userData.role || 'instructor', // Allows passing 'instructor' during login
      joinedDate: new Date().toISOString(),
      ...userData
    }
    setUser(userWithDefaults)
    localStorage.setItem('user', JSON.stringify(userWithDefaults))
  }

  const logout = () => {
    setUser(null)
    setIsInstructorMode(false)
    localStorage.removeItem('user')
  }

  const updateUser = (updates) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      // Sync to localStorage so it persists on refresh
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const toggleInstructorMode = () => {
    // Only allow toggle if user has the correct role
    if (user?.role === 'instructor' || user?.role === 'admin') {
      setIsInstructorMode(prev => !prev);
    } else {
      console.warn("Access Denied: User role is not authorized for Instructor Mode.");
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user,
      isInstructorMode,
      toggleInstructorMode
    }}>
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