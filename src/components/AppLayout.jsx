import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, Home, Calendar, Users, LogOut, Menu, X, Settings, MessageSquare, BarChart2, ClipboardList, Award } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const volunteerNav = [
  { label: "Dashboard", href: "/volunteer-dashboard", icon: Home },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "My Sign-ups", href: "/my-signups", icon: Heart },
  { label: "Achievements", href: "/achievements", icon: Award },
  { label: "My Profile", href: "/profile", icon: Settings },
];

const adminNav = [
  { label: "Dashboard", href: "/admin-dashboard", icon: Home },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Volunteers", href: "/admin/volunteers", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
];

export default function AppLayout({ children, role, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nav = (role === "admin" || role === "coordinator") ? adminNav : volunteerNav;

  const handleLogout = () => base44.auth.logout("/");

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Only show first 4 nav items in bottom bar; rest in overflow
  const bottomNav = nav.slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69ceb30e963d134a3c9f2147/2f59a1456_ServiceSync_Logo_8.png"
              alt="ServiceSync"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 ${location.pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2">
            <NotificationBell userEmail={user?.email} />
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profile_image_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground leading-none">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{role === "volunteer" ? "Volunteer" : role === "coordinator" ? "Coordinator" : "Admin"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5 hidden md:flex">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
            {/* Mobile: more menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile slide-down overflow menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {nav.slice(4).map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href} onClick={() => setMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${location.pathname === href ? "bg-primary/10 text-primary" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-1">
              <div className="flex items-center gap-2 px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profile_image_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role === "volunteer" ? "Volunteer" : role === "coordinator" ? "Coordinator" : "Admin"}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Content — add bottom padding on mobile for the bottom nav */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href || location.pathname.startsWith(href + "/");
            return (
              <Link key={href} to={href} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
                <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </Link>
            );
          })}
          {/* More button for remaining nav items */}
          {nav.length > 4 && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              <Menu className={`w-5 h-5 ${menuOpen ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium ${menuOpen ? "text-primary" : "text-muted-foreground"}`}>More</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}