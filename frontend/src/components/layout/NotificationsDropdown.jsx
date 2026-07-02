import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils'
import MobileNotificationsDrawer from './MobileNotificationsDrawer';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Trophy,
  Clock,
  Settings,
  UserPlus,
  MessageSquare,
  ShieldCheck,
  Info,
  Bell,
  ChevronDown,
  Megaphone,
} from 'lucide-react';

const notificationIcons = {
  course: <BookOpen className="w-5 h-5" />,
  achievement: <Trophy className="w-5 h-5" />,
  reminder: <Clock className="w-5 h-5" />,
  system: <Settings className="w-5 h-5" />,
  enrollment: <UserPlus className="w-5 h-5" />,
  community: <MessageSquare className="w-5 h-5" />,
  security: <ShieldCheck className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  announcement: <Megaphone className="w-5 h-5" />,
};

const notificationColors = {
  course: 'bg-primary/10 text-primary',
  achievement: 'bg-yellow-500/10 text-yellow-600',
  reminder: 'bg-orange-500/10 text-orange-600',
  system: 'bg-slate-500/10 text-slate-600',
  enrollment: 'bg-green-500/10 text-green-600',
  community: 'bg-blue-500/10 text-blue-600',
  security: 'bg-red-500/10 text-red-600',
  info: 'bg-cyan-500/10 text-cyan-600',
  announcement: 'bg-purple-500/10 text-purple-600',
};

const NotificationIconHelper = ({ type }) => {
  const icon = notificationIcons[type] || notificationIcons.info;
  const colorClass = notificationColors[type] || notificationColors.info;

  return (
    <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
      {icon}
    </div>
  );
};

export default function NotificationsDropdown({ hideChevron = false, closeMainMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCloseEverything = () => {
    setIsOpen(false);        // Closes the Notifications Drawer
    if (closeMainMenu) {
      closeMainMenu();       // Closes the LearnAfrica Mobile Menu
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="group flex md:h-9 h-14 cursor-pointer items-center md:justify-center  bg-card md:bg-transparent rounded-lg border md:border-none border-input px-3 md:px-1 md:hover:bg-accent hover:bg-muted active:scale-[0.98]  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        {/* Icon */}
        <div className="ml-4 md:ml-0 relative flex md:w-full shrink-0 justify-start md:justify-center">
          <Bell className="w-[18px] h-[18px] text-foreground" />

          {/* Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 md:-right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Mobile label */}
        <span className="ml-4 md:hidden text-sm font-semibold text-foreground/80 group-hover:text-primary">
          Notifications
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

      {/* 1. DESKTOP POPOVER (Uses the Drawer UI) */}
      <MobileNotificationsDrawer 
        isOpen={isOpen} 
        onClose={handleCloseEverything}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
        markAsRead={markAsRead}
        onDelete={deleteNotification}
        NotificationIcon={NotificationIconHelper}
        isLoading={isLoading}
        isDesktopPopover={true} // Triggers floating mode
      />

      {/* 2. MOBILE SLIDE-IN (Uses the Drawer UI) */}
      <MobileNotificationsDrawer 
        isOpen={isOpen} 
        onClose={handleCloseEverything}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
        markAsRead={markAsRead}
        onDelete={deleteNotification}
        NotificationIcon={NotificationIconHelper}
        isLoading={isLoading}
        isDesktopPopover={false} // Triggers fullscreen mode
      />
    </div>
  );
}