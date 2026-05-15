import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import ProfileDropdown  from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';
import { X, ChevronRight, LayoutDashboard, BookOpen, Menu, Book } from "lucide-react";

const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
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
            <Book className="h-5 w-5" strokeWidth={2.5} />
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

        {/* Desktop Right Section (No Search) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-border/60 mx-1" />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
              <ProfileDropdown user={user}/>
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
          className="md:hidden relative z-[110] flex h-11 w-11 items-center justify-center rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground active:scale-90 transition-transform"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 animate-in zoom-in-50 duration-200" strokeWidth={2.5} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* --- MOBILE MENU (Search Removed) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] md:hidden bg-background animate-in fade-in duration-200">
          <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
            
            <div className="flex h-16 items-center justify-between border-b border-border bg-background px-5 shrink-0">
              <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Menu</span>
              <button onClick={closeMenu} className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/20 text-muted-foreground">
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-background">
              <div className="mx-auto max-w-md px-5 py-8 space-y-8">
                
                <nav className="space-y-3">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.href;
                    const Icon = link.label.toLowerCase().includes('dashboard') ? LayoutDashboard : BookOpen;

                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={closeMenu}
                        className={cn(
                          "group flex h-14 items-center justify-between rounded-xl px-4 transition-all",
                          isActive ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-foreground/90"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex w-8 shrink-0 justify-start">
                            <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={2.5} />
                          </div>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{link.label}</span>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={3} />
                      </Link>
                    )
                  })}
                </nav>

                <div className="space-y-3 border-t border-border pt-8">
                  <ThemeToggle />
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <NotificationsDropdown closeMainMenu={closeMenu} />
                      <ProfileDropdown user={user} hideChevron={false} closeMainMenu={closeMenu} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link to="/login" onClick={closeMenu}><Button variant="outline" className="h-12 w-full rounded-xl">Log In</Button></Link>
                      <Link to="/signup" onClick={closeMenu}><Button className="h-12 w-full rounded-xl">Sign Up</Button></Link>
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