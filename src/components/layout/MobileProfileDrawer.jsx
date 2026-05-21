import { Link } from 'react-router-dom';
import { X, LayoutDashboard, GraduationCap, Settings, LogOut, ShieldCheck, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileProfileDrawer({
  isOpen,
  onClose, // This function should clear the state for all open menus
  user,
  isLoading,
  isInstructorMode,
  canAccessInstructorMode,
  isSuperAdmin,
  handleToggle,
  handleLogout,
  imgError,
  isDesktopPopover = false
}) {
  if (!isOpen) return null;

  // Handles switching modes and closing all menus
  const onToggleClick = () => {
    handleToggle();
    onClose();
  };

  // Handles logging out and closing all menus
  const onLogoutClick = () => {
    handleLogout();
    onClose();
  };

  return (
    <div className={cn(
      "z-[200] bg-background animate-in duration-300 ease-in-out border border-border/40",
      isDesktopPopover 
        ? "absolute top-full right-0 mt-2 w-72 rounded-2xl border border-border shadow-2xl slide-in-from-top-2 overflow-hidden hidden md:flex flex-col" 
        : "fixed inset-0 h-[100dvh] slide-in-from-right md:hidden flex flex-col"
    )}>
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="flex h-14 items-center justify-between border-b border-border/60 bg-background px-5 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose} // Triggers global reset
              className="p-1 -ml-1 text-muted-foreground active:scale-90 transition-transform hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80">
              Account Workspace
            </span>
          </div>
          <button 
            onClick={onClose} // Triggers global reset
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted active:scale-90"
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          
          {/* User Profile Summary Card */}
          <div className="px-4 py-4">
            <Link 
              to="/profile"
              onClick={onClose} // Triggers global reset
              className="group flex items-center gap-4 rounded-2xl bg-muted/20 p-3 border border-border/50 hover:bg-muted/40 transition-all active:scale-[0.98]"
            >
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-background shrink-0 border border-border shadow-sm">
                {!imgError && user?.avatar ? (
                  <img src={user.avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                    <User className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 text-left flex-1">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-28 animate-pulse rounded bg-muted" />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-[13px] truncate text-foreground leading-tight">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 truncate font-medium mt-0.5">
                      {user?.email}
                    </p>
                  </>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="px-4 space-y-1">
            <MenuLink 
              to="/dashboard" 
              icon={<LayoutDashboard className="h-4 w-4" />} 
              label="My Dashboard" 
              onClick={onClose} 
            />
            
            {canAccessInstructorMode && (
              <button
                onClick={onToggleClick}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-semibold text-foreground/80 transition-all hover:bg-primary/[0.03] hover:text-primary group border-l-2 border-transparent hover:border-primary active:scale-[0.99]"
              >
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  < GraduationCap className="h-4 w-4" />
                </div>
                <span>{isInstructorMode ? 'Switch to Student' : 'Instructor Portal'}</span>
              </button>
            )}

            {isSuperAdmin && (
              <MenuLink 
                to="/admin/system-overview" 
                icon={<ShieldCheck className="h-4 w-4" />} 
                label="System Admin" 
                onClick={onClose} 
                variant="primary"
              />
            )}
            
            <MenuLink 
              to="/settings" 
              icon={<Settings className="h-4 w-4" />} 
              label="Settings" 
              onClick={onClose} 
            />
          </div>
        </div>

        {/* --- FOOTER / LOGOUT --- */}
        <div className={cn(
          "p-4 border-t border-border/60 bg-card/20 backdrop-blur-md",
          !isDesktopPopover && "pb-8" 
        )}>
          <button
            onClick={onLogoutClick}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/5 text-red-500 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-red-500 hover:text-white border border-red-500/10"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={3} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ to, icon, label, onClick, variant = "default" }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all group border-l-2 active:scale-[0.99]",
        variant === "primary" 
          ? "bg-primary/5 text-primary border-primary" 
          : "text-foreground/80 border-transparent hover:bg-muted hover:border-primary/50 hover:text-primary"
      )}
    >
      <div className={cn(
        "transition-colors",
        variant === "primary" ? "text-primary" : "text-muted-foreground group-hover:text-primary"
      )}>
        {icon}
      </div>
      {label}
    </Link>
  );
}