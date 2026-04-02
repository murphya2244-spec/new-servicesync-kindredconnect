import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Clock, Calendar, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/AppLayout";

export default function AdminVolunteers() {
  const [user, setUser] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [signups, setSignups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [users, sups] = await Promise.all([
        base44.entities.User.filter({ role: "volunteer" }),
        base44.entities.Signup.list()
      ]);
      setVolunteers(users);
      setSignups(sups);
      setLoading(false);
    };
    load();
  }, []);

  const getVolunteerStats = (email) => {
    const vSups = signups.filter(s => s.volunteer_email === email);
    const hours = vSups.reduce((sum, s) => sum + (s.hours_logged || 0), 0);
    return { count: vSups.length, hours };
  };

  const filtered = volunteers.filter(v =>
    v.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">Volunteers</h1>
          <p className="text-muted-foreground">{volunteers.length} registered volunteers</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No volunteers found.</p>
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filtered.map(vol => {
                  const stats = getVolunteerStats(vol.email);
                  const initials = vol.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                  return (
                    <div key={vol.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={vol.profile_image_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{vol.full_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {vol.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{stats.count} events</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{stats.hours} hrs</span>
                        </div>
                        {vol.availability && (
                          <Badge variant="secondary" className="text-xs">
                            {vol.availability}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}