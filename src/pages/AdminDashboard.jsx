import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, TrendingUp, Plus, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

const statusColors = {
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, sups] = await Promise.all([
        base44.entities.Event.list("-created_date", 20),
        base44.entities.Signup.list("-created_date", 100)
      ]);
      setEvents(evs);
      setSignups(sups);
      setLoading(false);
    };
    load();
  }, []);

  const totalVolunteers = new Set(signups.map(s => s.volunteer_email)).size;
  const upcomingCount = events.filter(e => e.status === "upcoming").length;
  const confirmedSignups = signups.filter(s => s.status === "confirmed").length;
  const recentEvents = events.slice(0, 5);

  if (loading) return (
    <AppLayout role="admin" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="admin" user={user}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-fraunces font-semibold text-foreground mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage events and volunteers</p>
          </div>
          <Link to="/admin/events/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> New Event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary bg-primary/10" },
            { label: "Upcoming", value: upcomingCount, icon: TrendingUp, color: "text-accent bg-accent/10" },
            { label: "Volunteers", value: totalVolunteers, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Confirmed Sign-ups", value: confirmedSignups, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-fraunces font-semibold">Recent Events</h2>
          <Link to="/admin/events">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Manage all <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No events yet. Create your first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentEvents.map(event => {
                  const eventSignups = signups.filter(s => s.event_id === event.id).length;
                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD"}
                            · {eventSignups} sign-up{eventSignups !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border-0 ${statusColors[event.status]}`}>
                          {event.status}
                        </Badge>
                        <Link to={`/admin/events/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}