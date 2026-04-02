import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Search, UserPlus, X, CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import VolunteerProfileDrawer from "@/components/VolunteerProfileDrawer";

const statusColors = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-500",
  attended: "bg-blue-100 text-blue-700"
};

export default function AdminEventRoster() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [signups, setSignups] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [volunteerMap, setVolunteerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evResults, sups, volunteers] = await Promise.all([
        base44.entities.Event.filter({ id }),
        base44.entities.Signup.filter({ event_id: id }),
        base44.entities.User.list()
      ]);
      setEvent(evResults[0] || null);
      setSignups(sups);
      setAllVolunteers(volunteers);
      const map = {};
      volunteers.forEach(v => { map[v.email] = v; });
      setVolunteerMap(map);
      setLoading(false);
    };
    load();
  }, [id]);

  const activeSignups = signups.filter(s => s.status !== "cancelled");
  const capacityPct = event?.capacity ? Math.min(100, Math.round((activeSignups.length / event.capacity) * 100)) : null;

  const handleRemove = async (signup) => {
    await base44.entities.Signup.update(signup.id, { status: "cancelled" });
    setSignups(prev => prev.map(s => s.id === signup.id ? { ...s, status: "cancelled" } : s));
    toast.success("Volunteer removed from event.");
  };

  const handleStatusChange = async (signup, status) => {
    await base44.entities.Signup.update(signup.id, { status });
    setSignups(prev => prev.map(s => s.id === signup.id ? { ...s, status } : s));
    toast.success(`Status updated to ${status}.`);
  };

  const handleAssign = async (volunteer) => {
    const already = signups.find(s => s.volunteer_email === volunteer.email && s.status !== "cancelled");
    if (already) { toast.error("Volunteer is already on the roster."); return; }
    const created = await base44.entities.Signup.create({
      event_id: id,
      volunteer_email: volunteer.email,
      volunteer_name: volunteer.full_name,
      status: "confirmed"
    });
    setSignups(prev => [...prev, { ...created, volunteer_email: volunteer.email, volunteer_name: volunteer.full_name, status: "confirmed", event_id: id }]);
    toast.success(`${volunteer.full_name} assigned to event.`);
    setAssignSearch("");
  };

  const openProfile = (vol) => {
    setSelectedVolunteer(vol);
    setDrawerOpen(true);
  };

  const filteredSignups = signups.filter(s => {
    const v = volunteerMap[s.volunteer_email];
    const name = v?.full_name || s.volunteer_name || s.volunteer_email;
    return name.toLowerCase().includes(search.toLowerCase()) ||
      s.volunteer_email.toLowerCase().includes(search.toLowerCase());
  });

  const eventSkills = event?.skills_needed || [];

  const getMatchScore = (vol) => {
    if (!eventSkills.length || !vol.skills?.length) return 0;
    return vol.skills.filter(s => eventSkills.some(es => es.toLowerCase() === s.toLowerCase())).length;
  };

  const getMatchedSkills = (vol) => {
    if (!eventSkills.length || !vol.skills?.length) return [];
    return vol.skills.filter(s => eventSkills.some(es => es.toLowerCase() === s.toLowerCase()));
  };

  // When no search query, show suggested matches (volunteers with matching skills, sorted by score)
  // When there's a search query, filter by name/email but still sort by match score
  const assignCandidates = (() => {
    const notOnRoster = allVolunteers.filter(v => {
      const alreadyActive = signups.find(s => s.volunteer_email === v.email && s.status !== "cancelled");
      return !alreadyActive;
    });

    if (!assignSearch) {
      // Show top skill-matched volunteers when no search
      if (!eventSkills.length) return [];
      return notOnRoster
        .filter(v => getMatchScore(v) > 0)
        .sort((a, b) => getMatchScore(b) - getMatchScore(a))
        .slice(0, 6);
    }

    return notOnRoster
      .filter(v =>
        v.full_name?.toLowerCase().includes(assignSearch.toLowerCase()) ||
        v.email?.toLowerCase().includes(assignSearch.toLowerCase())
      )
      .sort((a, b) => getMatchScore(b) - getMatchScore(a))
      .slice(0, 8);
  })();

  if (loading) return (
    <AppLayout role="admin" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  if (!event) return (
    <AppLayout role="admin" user={user}>
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <p>Event not found.</p>
        <Link to="/admin/events"><Button className="mt-4 bg-primary">Back to Events</Button></Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role="admin" user={user}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/admin/events">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-fraunces font-semibold truncate">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              {event.date ? format(new Date(event.date), "MMMM d, yyyy") : "Date TBD"}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
          <Link to={`/admin/events/${id}`}>
            <Button variant="outline" size="sm">Edit Event</Button>
          </Link>
        </div>

        {/* Capacity Bar */}
        {event.capacity && (
          <Card className="border-border mb-6 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-primary" />
                  Roster Capacity
                </div>
                <span className="text-sm font-semibold">
                  {activeSignups.length} / {event.capacity}
                  {capacityPct >= 100 && <Badge className="ml-2 bg-red-100 text-red-700 border-0">Full</Badge>}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${capacityPct >= 100 ? "bg-red-500" : capacityPct >= 75 ? "bg-yellow-500" : "bg-accent"}`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Assignment */}
        <Card className="border-border mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-fraunces text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Manual Assignment
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAssign(!showAssign)}>
                {showAssign ? "Hide" : "Add Volunteer"}
              </Button>
            </div>
          </CardHeader>
          {showAssign && (
            <CardContent className="pt-0">
              <Input
                placeholder="Search volunteers by name or email..."
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                className="mb-3"
              />

              {/* Suggested matches label */}
              {!assignSearch && eventSkills.length > 0 && assignCandidates.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Suggested based on skills: <span className="font-medium text-foreground">{eventSkills.join(", ")}</span>
                </div>
              )}

              {assignCandidates.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border">
                  {assignCandidates.map(vol => {
                    const initials = vol.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                    const score = getMatchScore(vol);
                    const matched = getMatchedSkills(vol);
                    return (
                      <div key={vol.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/40">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={vol.profile_image_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate">{vol.full_name}</p>
                              {score > 0 && (
                                <span className="inline-flex items-center gap-0.5 bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {score}/{eventSkills.length}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{vol.email}</p>
                            {matched.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {matched.map(skill => (
                                  <span key={skill} className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleAssign(vol)} className="bg-primary hover:bg-primary/90 h-7 px-3 text-xs ml-2 shrink-0">
                          Assign
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {!assignSearch && eventSkills.length > 0 && assignCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">No volunteers with matching skills found. Try searching by name.</p>
              )}
              {!assignSearch && !eventSkills.length && (
                <p className="text-sm text-muted-foreground text-center py-3">Search for a volunteer above, or add skills to this event for smart suggestions.</p>
              )}
              {assignSearch && assignCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">No matching volunteers found.</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Roster */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-fraunces text-lg font-semibold">Roster ({activeSignups.length})</h2>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search roster..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
          </div>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            {filteredSignups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No volunteers on the roster yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredSignups.map(signup => {
                  const vol = volunteerMap[signup.volunteer_email];
                  const name = vol?.full_name || signup.volunteer_name || signup.volunteer_email;
                  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={signup.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => vol && openProfile(vol)}>
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={vol?.profile_image_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                          </Avatar>
                        </button>
                        <div>
                          <button
                            onClick={() => vol && openProfile(vol)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
                          >
                            {name}
                          </button>
                          <p className="text-xs text-muted-foreground">{signup.volunteer_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border-0 ${statusColors[signup.status]}`}>
                          {signup.status}
                        </Badge>
                        {signup.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-accent hover:text-accent"
                            onClick={() => handleStatusChange(signup, "attended")}
                            title="Mark Attended"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {signup.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleRemove(signup)}
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <VolunteerProfileDrawer
        volunteer={selectedVolunteer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </AppLayout>
  );
}