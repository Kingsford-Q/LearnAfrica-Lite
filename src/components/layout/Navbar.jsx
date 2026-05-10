import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import ProfileDropdown  from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { cn } from '../../lib/utils';
import { Search, X, ChevronRight, LayoutDashboard, BookOpen, Bell, User } from "lucide-react";


const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Prevent background scroll and handle orientation changes
  useEffect(() => {
  if (!isMobileMenuOpen) return;

  // Save current scroll position
  const scrollY = window.scrollY;

  // Lock the page in place
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  // Cleanup when menu closes
  return () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore original scroll position
    window.scrollTo(0, scrollY);
  };
}, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 lg:z-[100] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Learn<span className="text-primary">Africa</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-primary',
                location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            {isSearchOpen ? (
              <Input
                type="search"
                placeholder="Search courses..."
                className="w-72 h-10 animate-in fade-in slide-in-from-right-4 duration-200"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
          <ThemeToggle />
          <div className="h-6 w-px bg-border/60 mx-1" />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
              <ProfileDropdown user = {user}/>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="px-5">Get Started</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile Interaction Layer */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          className="md:hidden relative z-[110] flex h-11 w-11 items-center justify-center rounded-2xl border border-input bg-background/50 backdrop-blur-sm text-foreground active:scale-90 transition-transform"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6 animate-in zoom-in-50 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      
{/* --- UNIFIED COMPACT MOBILE MENU --- */}

{/* --- REFINED UNIFIED MOBILE MENU --- */}
{isMobileMenuOpen && (
  <div className="fixed inset-0 z-[150] md:hidden bg-background animate-in fade-in duration-200">
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-background px-5 shrink-0">
        <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Menu
        </span>
        <button 
          onClick={closeMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-all active:scale-90"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Unified Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-md px-5 py-8 space-y-8">
          
          {/* Search Container */}
          <div className="relative rounded-xl bg-card border border-border shadow-sm">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50">
              <Search className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <Input
              type="search"
              placeholder="Search courses..."
              className="h-12 w-full border-0 bg-transparent pl-12 pr-4 text-sm focus-visible:ring-0"
            />
          </div>

          {/* Navigation Section */}
          <nav className="space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const isDashboard = link.label.toLowerCase().includes('dashboard');
              const Icon = isDashboard ? LayoutDashboard : BookOpen;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "group flex h-14 items-center justify-between rounded-xl px-4 transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-card border border-border text-foreground/90 hover:bg-muted hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Standardized Width with no shrinkage */}
                    <div className="flex w-8 shrink-0 justify-start">
                      <Icon 
                        className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground/70")} 
                        strokeWidth={2.5} 
                      />
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                  
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:translate-x-1",
                      isActive ? "text-primary opacity-100" : "text-muted-foreground/60"
                    )} 
                    strokeWidth={3}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Action Section */}
          <div className="space-y-3 border-t border-border pt-8">
            
            {/* Theme Toggle - Left Aligned */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="space-y-3">
                {/* Notifications */}
                <div className="group flex h-14 items-center rounded-xl bg-card border border-border px-4 shadow-sm hover:bg-muted ">
                  <div className="flex w-8 shrink-0 justify-start scale-110 group-hover:text-primary">
                    <NotificationsDropdown />
                  </div>
                  <span className="ml-4 text-foreground/80 text-sm font-semibold transition-colors group-hover:text-primary">
                    Notifications
                  </span>
                </div>

                {/* Profile - Chevron/Dropdown Icon Hidden */}
                <div className="group flex h-14 items-center rounded-xl bg-card border border-border px-4 shadow-sm hover:bg-muted">
                  {/* Hide only the chevron (second SVG), keep the profile icon visible */}
                  <div className="flex w-8 shrink-0 justify-start scale-110 group-hover:text-primary [&_svg:nth-of-type(2)]:hidden">
                    <ProfileDropdown hideChevron/>
                  </div>

                  <span className="ml-4 text-foreground/80 text-sm font-semibold transition-colors group-hover:text-primary">
                    Profile Settings
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="h-12 w-full rounded-xl bg-card text-sm font-semibold border-border">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={closeMenu}>
                  <Button className="h-12 w-full rounded-xl text-sm font-semibold shadow-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </header>
  );
}