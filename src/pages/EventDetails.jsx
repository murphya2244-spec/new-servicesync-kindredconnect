import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import ConflictWarningDialog from "@/components/ConflictWarningDialog";

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

function hasDateConflict(eventA, eventB) {
  return eventA.date && eventB.date && eventA.date === eventB.date;
}

export default function EventDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [allSignups, setAllSignups] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evResults, allSups, mySups, allEvs] = await Promise.all([
        base44.entities.Event.filter({ id }),
        base44.entities.Signup.filter({ event_id: id }),
        base44.entities.Signup.filter({ volunteer_email: me.email }),
        base44.entities.Event.list()
      ]);
      setEvent(evResults[0] || null);
      setAllSignups(allSups);
      setMySignups(mySups);
      setAllEvents(allEvs);
      setLoading(false);
    };
    load();
  }, [id]);

  const activeMySignups = mySignups.filter(s => s.status !== "cancelled");
  const signedUpIds = new Set(activeMySignups.map(s => s.event_id));
  const activeSignupCount = allSignups.filter(s => s.status !== "cancelled").length;
  const isFull = event?.capacity && activeSignupCount >= event.capacity;
  const isJoined = signedUpIds.has(id);

  const getConflicts = () => {
    const myEventIds = activeMySignups.map(s => s.event_id);
    const myEvents = allEvents.filter(e => myEventIds.includes(e.id) && e.id !== id);
    return myEvents.filter(e => hasDateConflict(e, event));
  };

  const doSignup = async () => {
    await base44.entities.Signup.create({
      event_id: id,
      volunteer_email: user.email,
      volunteer_name: user.full_name,
      status: "confirmed"
    });
    setMySignups(prev => [...prev, { event_id: id, volunteer_email: user.email, status: "confirmed" }]);
    setAllSignups(prev => [...prev, { event_id: id, volunteer_email: user.email, status: "confirmed" }]);
    toast.success("Signed up successfully!");
  };

  const handleSignup = async () => {
    if (isJoined || isFull) return;
    const conflicting = getConflicts();
    if (conflicting.length > 0) {
      setConflicts(conflicting);
      setConflictDialogOpen(true);
      return;
    }
    await doSignup();
  };

  const handleCancelSignup = async () => {
    const signup = mySignups.find(s => s.event_id === id && s.status !== "cancelled");
    if (!signup) return;
    await base44.entities.Signup.update(signup.id, { status: "cancelled" });
    setMySignups(prev => prev.map(s => s.id === signup.id ? { ...s, status: "cancelled" } : s));
    toast.success("Sign-up cancelled.");
  };

  if (loading) return (
    <AppLayout role="volunteer" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  if (!event) return (
    <AppLayout role="volunteer" user={user}>
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Event not found.</p>
        <Link to="/events"><Button className="mt-4 bg-primary">Back to Events</Button></Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="volunteer" user={user}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/events">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>

        {/* Banner Image */}
        {event.image_url && (
          <div className="h-56 rounded-xl overflow-hidden mb-6">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title & Badges */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-fraunces font-semibold text-foreground mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`text-xs ${categoryColors[event.category] || ""}`}>
                {event.category?.replace(/_/g, " ")}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">{event.status}</Badge>
            </div>
          </div>
          {isJoined && (
            <Badge className="bg-accent/10 text-accent border-0 text-sm px-3 py-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Signed Up
            </Badge>
          )}
        </div>

        {/* Details */}
        <Card className="border-border mb-6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>{event.date ? format(new Date(event.date), "EEEE, MMMM d, yyyy") : "Date TBD"}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            {event.capacity && (
              <div className={`flex items-center gap-2 text-sm ${isFull ? "text-red-500 font-medium" : "text-foreground"}`}>
                <Users className="w-4 h-4 shrink-0" style={{ color: isFull ? undefined : "hsl(var(--primary))" }} />
                <span>{activeSignupCount} / {event.capacity} volunteers signed up</span>
                {isFull && <AlertCircle className="w-4 h-4" />}
              </div>
            )}
            {event.skills_needed?.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <Tag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {event.skills_needed.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-fraunces font-semibold mb-2">About this Event</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Sign-up Action */}
        <div className="flex gap-3">
          {isJoined ? (
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleCancelSignup}
            >
              Cancel Sign-up
            </Button>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 px-8"
              disabled={isFull || event.status === "cancelled"}
              onClick={handleSignup}
            >
              {isFull ? "Event Full" : event.status === "cancelled" ? "Event Cancelled" : "Sign Up"}
            </Button>
          )}
        </div>
      </div>

      <ConflictWarningDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        conflicts={conflicts}
        onConfirm={async () => { setConflictDialogOpen(false); await doSignup(); }}
      />
    </AppLayout>
  );
}