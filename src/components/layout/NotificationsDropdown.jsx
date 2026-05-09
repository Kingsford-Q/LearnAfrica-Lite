import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const mockNotifications = [
  {
    id: 1,
    type: 'course',
    title: 'New lesson available',
    message: 'Introduction to JavaScript has a new lesson: "Async/Await"',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Achievement unlocked!',
    message: 'You earned the "Fast Learner" badge',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Continue learning',
    message: "You're 3 days away from losing your streak!",
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'Welcome to LearnAfrica!',
    message: 'Start your learning journey today',
    time: '2 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    title: 'Welcome to LearnAfrica!',
    message: 'Start your learning journey today',
    time: '2 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'system',
    title: 'Welcome to LearnAfrica!',
    message: 'Start your learning journey today',
    time: '2 days ago',
    read: true,
  },
  {
    id: 7,
    type: 'system',
    title: 'Welcome to LearnAfrica!',
    message: 'Start your learning journey today',
    time: '2 days ago',
    read: true,
  },
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

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`
          z-50 flex flex-col bg-card border border-border rounded-xl shadow-xl overflow-hidden
          /* Layout Base */
          absolute top-full mt-2
          /* MOBILE: Floating and centered */
          left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[300px]
          /* MD (Tablets) & LG: Fixed to right side */
          md:right-0 md:left-auto md:translate-x-0 md:w-80
          /* SAFETY: Prevents the whole dropdown from going off-screen height-wise */
          max-h-[calc(100vh-120px)]
        `}>
          
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
            <h3 className="font-semibold text-xs md:text-sm text-foreground uppercase tracking-wider">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] md:text-xs text-primary font-medium hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Scrollable Area - Fixed the md scroll issue by defining strict max-heights */}
          <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar max-h-64 md:max-h-80 lg:max-h-[450px]">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full p-3 md:p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0 ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${notificationColors[notification.type]}`}>
                    {notificationIcons[notification.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`font-medium text-xs md:text-sm leading-tight truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground/70 mt-1">
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
            className="block p-3 text-center text-xs md:text-sm font-semibold text-primary hover:bg-muted/50 border-t border-border bg-muted/20 shrink-0"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}