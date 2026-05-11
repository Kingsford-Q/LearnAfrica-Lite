import { X, ArrowLeft } from "lucide-react";
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function MobileNotificationsDrawer({ 
  isOpen, 
  onClose, 
  notifications, 
  unreadCount, 
  markAllAsRead, 
  markAsRead, 
  notificationIcons, 
  notificationColors,
  isLoading 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background animate-in slide-in-from-right duration-300 ease-in-out md:hidden">
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        
        {/* Header - Matches your Navbar Mobile Menu style */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-background px-5 shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-1 -ml-1 text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
             </button>
             <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
               Notifications
             </span>
          </div>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/20 text-muted-foreground active:scale-90"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="px-5 py-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mb-4 text-xs text-primary font-bold uppercase tracking-wider"
              >
                Mark all as read
              </button>
            )}

            <div className="space-y-1">
              {isLoading ? (
                <div className="py-20 text-center">
                   <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "w-full p-4 flex items-start gap-4 rounded-xl mb-2 text-left transition-colors",
                      !notification.read ? 'bg-primary/5 border border-primary/10' : 'bg-card border border-transparent'
                    )}
                  >
                    <div className={cn("p-2.5 rounded-lg shrink-0", notificationColors[notification.type])}>
                      {notificationIcons[notification.type]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={cn("font-bold text-sm leading-tight", !notification.read ? 'text-foreground' : 'text-muted-foreground')}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="w-2 h-2 bg-primary rounded-full mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium uppercase tracking-tight">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground">No notifications yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-card/50">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
          >
            View All in Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}