import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Calendar, Clock, Heart, MapPin, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

const categoryColors = {
  community_outreach: "bg-orange-100 text-orange-700",
  food_bank: "bg-yellow-100 text-yellow-700",
  environmental: "bg-green-100 text-green-700",
  education: "bg-blue-100 text-blue-700",
  healthcare: "bg-red-100 text-red-700",
  animal_welfare: "bg-purple-100 text-purple-700",
  disaster_relief: "bg-gray-100 text-gray-700",
  other: "bg-secondary text-secondary-foreground"
};

export default function VolunteerDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin();
        return;
      }
      setUser(me);
      const [evs, sups] = await Promise.all([
        base44.entities.Event.filter({ status: "upcoming" }, "date", 6),
        base44.entities.Signup.filter({ volunteer_email: me.email })
      ]);
      setEvents(evs);
      setMySignups(sups);
      setLoading(false);
    };
    load();
  }, []);

  const signedUpEventIds = new Set(mySignups.map(s => s.event_id));
  const upcomingMyEvents = mySignups.filter(s => s.status !== "cancelled").length;

  if (loading) return (
    <AppLayout role="volunteer" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="volunteer" user={user}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold text-foreground mb-1">
            Welcome back, {user?.full_name?.split(" ")[0] || "Volunteer"} 👋
          </h1>
          <p className="text-muted-foreground">Ready to make a difference today?</p>
        </div>

        {/* Profile completeness prompt */}
        {(() => {
          const missing = [];
          if (!user?.skills?.length) missing.push("skills");
          if (!user?.availability) missing.push("availability");
          if (!user?.bio) missing.push("bio");
          if (missing.length > 0) return (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 text-sm">Complete your profile to get better event matches</p>
                <p className="text-amber-700 text-xs mt-0.5">Missing: {missing.join(", ")}. We use this to recommend events that fit your skills.</p>
              </div>
              <Link to="/profile">
                <button className="shrink-0 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors">
                  Complete Profile
                </button>
              </Link>
            </div>
          );
          return (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-800 text-sm font-medium">Profile complete — you'll receive personalized event recommendations!</p>
            </div>
          );
        })()}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Events Joined", value: upcomingMyEvents, icon: Calendar, color: "text-primary bg-primary/10" },
            { label: "Hours Logged", value: user?.total_hours || 0, icon: Clock, color: "text-accent bg-accent/10" },
            { label: "Sign-ups", value: mySignups.length, icon: Heart, color: "text-rose-500 bg-rose-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-3 flex flex-col items-center text-center sm:flex-row sm:text-left sm:p-4 sm:gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 sm:mb-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground sm:text-2xl">{value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-fraunces font-semibold">Upcoming Opportunities</h2>
          <Link to="/events">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map(event => (
            <Card key={event.id} className="border-border hover:shadow-md transition-shadow">
              {event.image_url && (
                <div className="h-32 rounded-t-lg overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-fraunces text-lg leading-tight">{event.title}</CardTitle>
                  {signedUpEventIds.has(event.id) && (
                    <Badge className="bg-accent/10 text-accent border-0 shrink-0">Joined</Badge>
                  )}
                </div>
                <Badge variant="secondary" className={`w-fit text-xs ${categoryColors[event.category] || ""}`}>
                  {event.category?.replace(/_/g, " ")}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD"}
                  {event.time && <span>· {event.time}</span>}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
                <Link to={`/events/${event.id}`}>
                  <Button size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {signedUpEventIds.has(event.id) ? "View Details" : "Sign Up"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No upcoming events yet. Check back soon!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}