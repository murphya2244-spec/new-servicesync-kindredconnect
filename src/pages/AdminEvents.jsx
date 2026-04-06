import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Calendar, Users, Pencil, Trash2, MoreVertical, ClipboardList, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

const statusColors = {
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  unfilled: "bg-orange-100 text-orange-700"
};

export default function AdminEvents() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [signupCounts, setSignupCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, sups] = await Promise.all([
        base44.entities.Event.list("-created_date"),
        base44.entities.Signup.list()
      ]);
      setEvents(evs);
      const counts = {};
      sups.forEach(s => {
        if (s.status !== "cancelled") counts[s.event_id] = (counts[s.event_id] || 0) + 1;
      });
      setSignupCounts(counts);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.Event.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleStatusChange = async (event, status) => {
    await base44.entities.Event.update(event.id, { status });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status } : e));
  };

  const handleRescan = async (event) => {
    await base44.functions.invoke('scanVolunteersForEvent', { event_id: event.id });
    // Refresh events to pick up any status change
    const evs = await base44.entities.Event.list("-created_date");
    setEvents(evs);
  };

  const unfilledEvents = events.filter(e => e.status === "unfilled");

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-fraunces font-semibold mb-1">Events</h1>
            <p className="text-muted-foreground">{events.length} total events</p>
          </div>
          <Link to="/admin/events/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Event</span>
            </Button>
          </Link>
        </div>

        {/* Unfilled alert */}
        {unfilledEvents.length > 0 && (
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                {unfilledEvents.length} unfilled event{unfilledEvents.length !== 1 ? "s" : ""}
              </p>
              <p className="text-orange-700 text-xs mt-0.5">
                No volunteers with matching skills were found. Re-scan after recruiting or use the roster to manually assign volunteers.
              </p>
            </div>
          </div>
        )}

        <Card className="border-border">
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No events yet.</p>
                <Link to="/admin/events/new">
                  <Button className="mt-4 bg-primary">Create First Event</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.date ? format(new Date(event.date), "MMM d, yyyy") : "TBD"}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground hidden sm:flex">
                        <Users className="w-4 h-4" />
                        {signupCounts[event.id] || 0}
                      </div>
                      <Badge className={`text-xs border-0 hidden sm:flex ${statusColors[event.status]}`}>
                        {event.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/admin/events/${event.id}/roster`}>
                            <DropdownMenuItem>
                              <ClipboardList className="w-4 h-4 mr-2" /> View Roster
                            </DropdownMenuItem>
                          </Link>
                          <Link to={`/admin/events/${event.id}`}>
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          {event.status === "unfilled" && (
                              <DropdownMenuItem onClick={() => handleRescan(event)}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Re-scan Volunteers
                              </DropdownMenuItem>
                            )}
                          {event.status === "unfilled" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(event, "upcoming")}>
                                Mark as Upcoming
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuItem onClick={() => handleStatusChange(event, "completed")}>
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(event, "cancelled")}>
                                Cancel Event
                              </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}