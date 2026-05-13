import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Settings, LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import MobileProfileDrawer from './MobileProfileDrawer' // Our new drawer component

export default function ProfileDropdown({ hideChevron = false, closeMainMenu }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const dropdownRef = useRef(null)
  
  const { user, logout, isInstructorMode, toggleInstructorMode, isLoading } = useAuth()
  const navigate = useNavigate()

  /**
   * Logic to close both this dropdown and the parent main menu
   */
  const handleFullClose = useCallback(() => {
    setIsOpen(false)
    if (closeMainMenu) closeMainMenu()
  }, [closeMainMenu])

  // Optimization: Stable function references for performance
  const handleToggle = useCallback(async () => {
    try {
      await toggleInstructorMode()
      // If we were in student mode, we are switching TO instructor mode
      navigate(!isInstructorMode ? '/instructor' : '/dashboard')
      handleFullClose() // Updated logic
    } catch (error) {
      console.error("Failed to sync mode preference:", error)
    }
  }, [isInstructorMode, toggleInstructorMode, navigate, handleFullClose])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/')
      handleFullClose() // Updated logic
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }, [logout, navigate, handleFullClose])

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
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="group flex px-3 md:px-0 md:h-9 h-14 cursor-pointer items-center md:justify-center rounded-lg bg-card md:bg-transparent border md:border-none border-input hover:bg-muted active:scale-[0.98]"
      >

        {/* Avatar */}
        <div className="ml-3 md:ml-0 flex md:w-full shrink-0 justify-start md:justify-center bg-transparent">
          <div className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent overflow-hidden">
            {!imgError && user?.avatar && user.avatar !== '/placeholder-user.jpg' ? (
              <img
                src={user.avatar}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <User
                className="h-5 w-5"
                strokeWidth={2.25}
              />
            )}
          </div>
        </div>

        {/* Mobile label */}
        <span className="ml-3 md:hidden text-sm font-semibold text-foreground/80 group-hover:text-primary">
          Profile
        </span>

        {/* Chevron (desktop only optionally hidden) */}
        {!hideChevron && (
          <ChevronDown
            className={cn(
              "ml-auto md:ml-0 h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180", isOpen ? "text-primary opacity-100" : "text-muted-foreground/60"
            )}
          />
        )}
      </div>

      {/* 1. DESKTOP POPOVER (Floating Mode) */}
      <MobileProfileDrawer 
        isOpen={isOpen} 
        onClose={handleFullClose} // Added full close logic
        user={user}
        isLoading={isLoading}
        isInstructorMode={isInstructorMode}
        canAccessInstructorMode={canAccessInstructorMode}
        isSuperAdmin={isSuperAdmin}
        handleToggle={handleToggle}
        handleLogout={handleLogout}
        imgError={imgError}
        isDesktopPopover={true}
      />

      {/* 2. MOBILE SLIDE-IN (Fullscreen Mode) */}
      <MobileProfileDrawer 
        isOpen={isOpen} 
        onClose={handleFullClose} // Added full close logic
        user={user}
        isLoading={isLoading}
        isInstructorMode={isInstructorMode}
        canAccessInstructorMode={canAccessInstructorMode}
        isSuperAdmin={isSuperAdmin}
        handleToggle={handleToggle}
        handleLogout={handleLogout}
        imgError={imgError}
        isDesktopPopover={false}
      />
    </div>
  )
}