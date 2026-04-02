import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Clock, X, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

const statusColors = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-500",
  attended: "bg-blue-100 text-blue-700"
};

export default function MySignups() {
  const [user, setUser] = useState(null);
  const [signups, setSignups] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const sups = await base44.entities.Signup.filter({ volunteer_email: me.email });
      setSignups(sups);
      // Load event details
      const eventIds = [...new Set(sups.map(s => s.event_id))];
      const evMap = {};
      await Promise.all(eventIds.map(async id => {
        const evs = await base44.entities.Event.filter({ id });
        if (evs[0]) evMap[id] = evs[0];
      }));
      setEvents(evMap);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (signup) => {
    await base44.entities.Signup.update(signup.id, { status: "cancelled" });
    setSignups(prev => prev.map(s => s.id === signup.id ? { ...s, status: "cancelled" } : s));
  };

  const active = signups.filter(s => s.status !== "cancelled");
  const cancelled = signups.filter(s => s.status === "cancelled");

  if (loading) return (
    <AppLayout role="volunteer" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  const SignupCard = ({ signup }) => {
    const event = events[signup.event_id];
    return (
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-fraunces text-lg leading-tight">
              {event?.title || "Event"}
            </CardTitle>
            <Badge className={`text-xs border-0 shrink-0 ${statusColors[signup.status]}`}>
              {signup.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1.5">
          {event?.date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.date), "MMM d, yyyy")}
              {event.time && <span>· {event.time}</span>}
            </div>
          )}
          {event?.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          )}
          {signup.hours_logged > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-accent font-medium">
              <Clock className="w-4 h-4" />
              {signup.hours_logged} hours logged
            </div>
          )}
          {signup.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => handleCancel(signup)}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel Sign-up
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout role="volunteer" user={user}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">My Sign-ups</h1>
          <p className="text-muted-foreground">Track your volunteer commitments</p>
        </div>

        {active.length > 0 ? (
          <div className="space-y-4 mb-8">
            <h2 className="font-fraunces text-lg font-semibold">Active ({active.length})</h2>
            {active.map(s => <SignupCard key={s.id} signup={s} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground mb-8">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>You haven't signed up for any events yet.</p>
            <Button className="mt-4 bg-primary" asChild>
              <a href="/events">Browse Events</a>
            </Button>
          </div>
        )}

        {cancelled.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-fraunces text-lg font-semibold text-muted-foreground">Cancelled</h2>
            {cancelled.map(s => <SignupCard key={s.id} signup={s} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}