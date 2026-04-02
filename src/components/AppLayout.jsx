import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, Home, Calendar, Users, LogOut, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const volunteerNav = [
  { label: "Dashboard", href: "/volunteer-dashboard", icon: Home },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "My Sign-ups", href: "/my-signups", icon: Heart },
];

const adminNav = [
  { label: "Dashboard", href: "/admin-dashboard", icon: Home },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Volunteers", href: "/admin/volunteers", icon: Users },
];

export default function AppLayout({ children, role, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nav = role === "admin" ? adminNav : volunteerNav;

  const handleLogout = () => base44.auth.logout("/");

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-fraunces font-semibold text-lg text-foreground hidden sm:block">
              VolunteerConnect
            </span>
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

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profile_image_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground leading-none">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5 hidden md:flex">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {nav.map(({ label, href, icon: Icon }) => (
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
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}