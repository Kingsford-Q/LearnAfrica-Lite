import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Settings, LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const dropdownRef = useRef(null)
  
  const { user, logout, isInstructorMode, toggleInstructorMode, isLoading } = useAuth()
  const navigate = useNavigate()

  // Optimization: Stable function references for performance
  const handleToggle = useCallback(async () => {
    try {
      await toggleInstructorMode()
      navigate(isInstructorMode ? '/dashboard' : '/instructor')
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to sync mode preference:", error)
    }
  }, [isInstructorMode, toggleInstructorMode, navigate])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/')
      setIsOpen(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }, [logout, navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper to check for elevated privileges
  const canAccessInstructorMode = ['instructor', 'admin', 'superadmin'].includes(user?.role)
  const isSuperAdmin = user?.role === 'superadmin'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted shrink-0 border border-border">
          {!imgError && user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'Profile'}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
          
          {/* Header Section */}
          <div className="flex items-center gap-3 border-b border-border px-3 py-3 mb-1">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted shrink-0 border border-border">
               {!imgError && user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary font-bold text-muted-foreground text-xs uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              {isLoading ? (
                <div className="space-y-1">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-28 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm truncate text-foreground leading-none mb-1">
                    {user?.name || 'Account'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-none">
                    {user?.email}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Menu Actions */}
          <div className="space-y-0.5">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              My Dashboard
            </Link>

            {/* Instructor Mode: Shown to Instructor, Admin, and Superadmin */}
            {canAccessInstructorMode && (
              <button
                onClick={handleToggle}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                {isInstructorMode ? 'Student Mode' : 'Instructor Mode'}
              </button>
            )}

            {/* Superadmin Only: Admin Panel Link */}
            {isSuperAdmin && (
              <Link
                to="/admin/system-overview"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
              >
                <ShieldCheck className="h-4 w-4" />
                System Admin
              </Link>
            )}

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </div>

          {/* Logout Section */}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}