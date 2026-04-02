import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function NotificationBell({ userEmail }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    const fetch = async () => {
      const notifs = await base44.entities.Notification.filter(
        { recipient_email: userEmail, is_read: false },
        "-created_date",
        20
      );
      setNotifications(notifs);
    };
    fetch();

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email === userEmail) {
        if (event.type === "create") setNotifications(prev => [event.data, ...prev]);
        if (event.type === "update") setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [userEmail]);

  const markRead = async (notif) => {
    await base44.entities.Notification.update(notif.id, { is_read: true });
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  const markAllRead = async () => {
    await Promise.all(notifications.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications([]);
  };

  const typeColors = {
    event_reminder: "bg-blue-100 text-blue-700",
    understaffed_warning: "bg-yellow-100 text-yellow-700",
    signup_confirmed: "bg-green-100 text-green-700",
    event_cancelled: "bg-red-100 text-red-700",
    new_signup: "bg-accent/10 text-accent"
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-semibold text-sm">Notifications</p>
          {notifications.length > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>All caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${typeColors[n.type] || "bg-muted text-muted-foreground"}`}>
                      {n.type?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {n.created_date ? format(new Date(n.created_date), "MMM d, h:mm a") : ""}
                  </p>
                </div>
                <button onClick={() => markRead(n)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 text-xs">✕</button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}