import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown } from "lucide-react"
import { cn } from '@/lib/utils'
import MobileNotificationsDrawer from './MobileNotificationsDrawer';

const mockNotifications = [
  { id: 1, type: 'course', title: 'New lesson available', message: 'Introduction to JavaScript has a new lesson: "Async/Await"', time: '2 hours ago', read: false },
  { id: 2, type: 'achievement', title: 'Achievement unlocked!', message: 'You earned the "Fast Learner" badge', time: '5 hours ago', read: false },
  { id: 3, type: 'reminder', title: 'Continue learning', message: "You're 3 days away from losing your streak!", time: '1 day ago', read: true },
  { id: 4, type: 'system', title: 'Welcome to LearnAfrica!', message: 'Start your learning journey today', time: '2 days ago', read: true },
  { id: 5, type: 'system', title: 'Welcome to LearnAfrica!', message: 'Start your learning journey today', time: '2 days ago', read: true },
  { id: 6, type: 'system', title: 'Welcome to LearnAfrica!', message: 'Start your learning journey today', time: '2 days ago', read: true },
  { id: 7, type: 'system', title: 'Welcome to LearnAfrica!', message: 'Start your learning journey today', time: '2 days ago', read: true },
];

const notificationIcons = {
  course: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  achievement: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  reminder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  system: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const notificationColors = {
  course: 'bg-primary/10 text-primary',
  achievement: 'bg-accent/10 text-accent',
  reminder: 'bg-warning/10 text-warning',
  system: 'bg-info/10 text-info',
};

export default function NotificationsDropdown({ hideChevron = false, closeMainMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  // Initializing with mockNotifications so UI is populated before DB fetch
  const [dbNotifications, setDbNotifications] = useState(mockNotifications); 
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const notifications = dbNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // if (data.length > 0) setDbNotifications(data);
      } catch (error) {
        console.error("Backend fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setDbNotifications(updated);
    
    try {
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (error) {
      console.error("Failed to sync mark all as read", error);
    }
  };

  const markAsRead = async (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setDbNotifications(updated);

    try {
      // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error("Failed to sync mark as read", error);
    }
  };

  // --- DELETE NOTIFICATION LOGIC ---
  const deleteNotification = async (id) => {
    // Optimistic Update: Remove from list immediately
    const updated = notifications.filter((n) => n.id !== id);
    setDbNotifications(updated);

    try {
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      console.log(`Backend: Deleted notification ${id}`);
    } catch (error) {
      console.error("Failed to sync delete with backend", error);
    }
  };

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
        notificationIcons={notificationIcons}
        notificationColors={notificationColors}
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
        notificationIcons={notificationIcons}
        notificationColors={notificationColors}
        isLoading={isLoading}
        isDesktopPopover={false} // Triggers fullscreen mode
      />
    </div>
  );
}