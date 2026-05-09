import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { cn } from '../../lib/utils';

const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground">
            Learn<span className="text-primary">Africa</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-64"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <NotificationsDropdown />
              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-background text-foreground"
        >
          {isMobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Input type="search" placeholder="Search courses..." className="w-full" />

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col items-center gap-4 pt-4 border-t border-border">
              {/* Icons Row Centered for Mobile */}
              <div className="flex items-center justify-center gap-8 w-full">
                <ThemeToggle />
                {isAuthenticated && (
                  <>
                    {/* Center alignment for notifications to ensure it stays on screen */}
                    <NotificationsDropdown align="center" />
                    {/* End alignment for profile to anchor it correctly */}
                    <ProfileDropdown align="end" />
                  </>
                )}
              </div>

              {!isAuthenticated && (
                <div className="flex gap-2 w-full justify-center">
                  <Link to="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}