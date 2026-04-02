import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function EventsPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, sups] = await Promise.all([
        base44.entities.Event.list("date"),
        base44.entities.Signup.filter({ volunteer_email: me.email })
      ]);
      setEvents(evs);
      setMySignups(sups);
      setLoading(false);
    };
    load();
  }, []);

  const signedUpIds = new Set(mySignups.map(s => s.event_id));

  const filtered = events.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSignup = async (event) => {
    if (signedUpIds.has(event.id)) return;
    await base44.entities.Signup.create({
      event_id: event.id,
      volunteer_email: user.email,
      volunteer_name: user.full_name,
      status: "confirmed"
    });
    setMySignups(prev => [...prev, { event_id: event.id, volunteer_email: user.email, status: "confirmed" }]);
  };

  if (loading) return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">Volunteer Events</h1>
          <p className="text-muted-foreground">Find your next opportunity to give back</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="community_outreach">Community Outreach</SelectItem>
              <SelectItem value="food_bank">Food Bank</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="animal_welfare">Animal Welfare</SelectItem>
              <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(event => (
            <Card key={event.id} className="border-border hover:shadow-md transition-shadow">
              {event.image_url && (
                <div className="h-36 rounded-t-lg overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-fraunces text-lg leading-tight">{event.title}</CardTitle>
                  {signedUpIds.has(event.id) && (
                    <Badge className="bg-accent/10 text-accent border-0 shrink-0">Joined</Badge>
                  )}
                </div>
                <Badge variant="secondary" className={`w-fit text-xs ${categoryColors[event.category] || ""}`}>
                  {event.category?.replace(/_/g, " ")}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
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
                {event.capacity && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Up to {event.capacity} volunteers
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full mt-3"
                  disabled={signedUpIds.has(event.id)}
                  onClick={() => handleSignup(event)}
                  variant={signedUpIds.has(event.id) ? "secondary" : "default"}
                >
                  {signedUpIds.has(event.id) ? "Already Signed Up ✓" : "Sign Up"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No events found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}