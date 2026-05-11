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

export default function NotificationsDropdown( {hideChevron = false}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dbNotifications, setDbNotifications] = useState([]); // Database source
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Optimization: Prioritize DB data, fallback to mock if DB is empty
  const notifications = dbNotifications.length > 0 ? dbNotifications : mockNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Placeholder for backend fetch
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setDbNotifications(data);
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
    // Optimistic UI update
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setDbNotifications(updated);
    
    try {
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (error) {
      console.error("Failed to sync mark all as read", error);
    }
  };

  const markAsRead = async (id) => {
    // Optimistic UI update
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setDbNotifications(updated);

    try {
      // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error("Failed to sync mark as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
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

      {/* DESKTOP DROPDOWN */}
      {isOpen && (
        /* The parent container handles the positioning and the 'hidden md:flex' toggle */
        <div className="hidden md:flex absolute top-full right-0 mt-2 w-80 z-50 flex-col bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary font-medium hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Scrollable Area */}
          <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar max-h-80 lg:max-h-[450px]">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${notificationColors[notification.type]}`}>
                    {notificationIcons[notification.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`font-medium text-sm leading-tight truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase">
                      {notification.time}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No new notifications
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-sm font-semibold text-primary hover:bg-muted/50 border-t border-border bg-muted/20 shrink-0"
          >
            View All
          </Link>
        </div>
      )}

      {/* MOBILE DRAWER (Handles its own z-index and fixed positioning) */}
      <MobileNotificationsDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
        markAsRead={markAsRead}
        notificationIcons={notificationIcons}
        notificationColors={notificationColors}
        isLoading={isLoading}
      />
    
    </div>
  );
}