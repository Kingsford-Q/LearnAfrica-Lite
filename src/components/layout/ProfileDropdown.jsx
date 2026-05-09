import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LayoutDashboard, GraduationCap, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, logout, isInstructorMode, toggleInstructorMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
          <img
            src={user?.avatar || '/placeholder-user.jpg'}
            alt={user?.name || 'User'}
            className="h-full w-full object-cover"
          />
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
          <div className="border-b border-border px-3 py-2 mb-1">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            My Dashboard
          </Link>

          <button
            onClick={() => {
              toggleInstructorMode()
              navigate(isInstructorMode ? '/dashboard' : '/instructor')
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <GraduationCap className="h-4 w-4" />
            {isInstructorMode ? 'Student Mode' : 'Instructor Mode'}
          </button>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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
