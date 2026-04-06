import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertTriangle, TrendingUp, Users, Calendar, Award, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import AppLayout from "@/components/AppLayout";
import DemographicsTab from "@/components/analytics/DemographicsTab";
import RetentionTab from "@/components/analytics/RetentionTab";
import EventImpactTab from "@/components/analytics/EventImpactTab";

const CATEGORY_COLORS = {
  community_outreach: "#f97316",
  food_bank: "#eab308",
  environmental: "#22c55e",
  education: "#3b82f6",
  healthcare: "#ef4444",
  animal_welfare: "#a855f7",
  disaster_relief: "#6b7280",
  other: "#e07a3c"
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "demographics", label: "Demographics" },
  { id: "retention", label: "Retention" },
  { id: "impact", label: "Event Impact" },
];

export default function AdminAnalytics() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [signups, setSignups] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [evs, sups, vols] = await Promise.all([
        base44.entities.Event.list("date", 100),
        base44.entities.Signup.list("-created_date", 500),
        base44.entities.User.list()
      ]);
      setEvents(evs);
      setSignups(sups);
      setAllVolunteers(vols);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <AppLayout role="admin" user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  // --- Overview Metrics ---
  const activeSignups = signups.filter(s => s.status !== "cancelled");
  const totalVolunteers = new Set(activeSignups.map(s => s.volunteer_email)).size;
  const attendedSignups = signups.filter(s => s.status === "attended");
  const attendanceRate = activeSignups.length > 0
    ? Math.round((attendedSignups.length / activeSignups.length) * 100)
    : 0;

  const signupCountMap = {};
  activeSignups.forEach(s => {
    signupCountMap[s.event_id] = (signupCountMap[s.event_id] || 0) + 1;
  });
  const signupsPerEvent = events
    .filter(e => signupCountMap[e.id])
    .sort((a, b) => (signupCountMap[b.id] || 0) - (signupCountMap[a.id] || 0))
    .slice(0, 8)
    .map(e => ({
      name: e.title.length > 18 ? e.title.slice(0, 18) + "…" : e.title,
      signups: signupCountMap[e.id] || 0,
      capacity: e.capacity || 0
    }));

  const categoryCounts = {};
  events.forEach(e => {
    const cat = e.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
    color: CATEGORY_COLORS[name] || "#e07a3c"
  }));

  const unfilledEvents = events.filter(e => e.status === "unfilled");
  const today = new Date();
  const in14 = new Date(); in14.setDate(today.getDate() + 14);
  const understaffedEvents = events.filter(e => {
    if (!e.capacity || (e.status !== "upcoming" && e.status !== "unfilled")) return false;
    if (!e.date) return false;
    const d = parseISO(e.date);
    if (d < today || d > in14) return false;
    const filled = signupCountMap[e.id] || 0;
    return filled < e.capacity * 0.5;
  });

  const userMap = {};
  allVolunteers.forEach(u => { userMap[u.email] = u; });
  const volCounts = {};
  activeSignups.forEach(s => {
    volCounts[s.volunteer_email] = volCounts[s.volunteer_email] || { name: s.volunteer_name || s.volunteer_email, count: 0, email: s.volunteer_email };
    volCounts[s.volunteer_email].count++;
  });
  const topVolunteers = Object.values(volCounts)
    .map(v => ({ ...v, reliability_score: userMap[v.email]?.reliability_score ?? null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Only show volunteers (not admins/coordinators) in demographic/retention tabs
  const volunteerUsers = allVolunteers.filter(v => v.role !== "admin" && v.role !== "coordinator");

  return (
    <AppLayout role="admin" user={user}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">Analytics</h1>
          <p className="text-muted-foreground">Platform insights and operational reporting</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-8 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[
                { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary bg-primary/10" },
                { label: "Volunteers", value: totalVolunteers, icon: Users, color: "text-blue-600 bg-blue-50" },
                { label: "Sign-ups", value: activeSignups.length, icon: TrendingUp, color: "text-accent bg-accent/10" },
                { label: "Attendance", value: `${attendanceRate}%`, icon: Award, color: "text-green-600 bg-green-50" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-border">
                  <CardContent className="p-3 flex flex-col items-center text-center sm:flex-row sm:text-left sm:p-4 sm:gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 sm:mb-0 shrink-0 ${color}`}>
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

            {unfilledEvents.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-orange-800 text-sm mb-1">
                    {unfilledEvents.length} event{unfilledEvents.length !== 1 ? "s" : ""} with no matching volunteers
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {unfilledEvents.map(e => (
                      <Link key={e.id} to={`/admin/events/${e.id}/roster`}>
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200 hover:bg-orange-200 transition-colors">
                          {e.title} <ChevronRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {understaffedEvents.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="font-fraunces text-base flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Understaffed Events (next 14 days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {understaffedEvents.map(e => {
                    const filled = signupCountMap[e.id] || 0;
                    const pct = Math.round((filled / e.capacity) * 100);
                    return (
                      <div key={e.id} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-yellow-900">{e.title}</p>
                          <p className="text-xs text-yellow-700">
                            {format(parseISO(e.date), "MMM d")} · {filled}/{e.capacity} volunteers ({pct}% filled)
                          </p>
                        </div>
                        <Link to={`/admin/events/${e.id}/roster`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                            Roster <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="font-fraunces text-base">Sign-ups per Event</CardTitle>
                </CardHeader>
                <CardContent>
                  {signupsPerEvent.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No sign-up data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={signupsPerEvent} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sign-ups" />
                        <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Capacity" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="font-fraunces text-base">Events by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No events yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ name, percent }) => `${Math.round(percent * 100)}%`} labelLine={false}>
                          {categoryData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-fraunces text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Top Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {topVolunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No volunteers yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topVolunteers.map((v, i) => (
                      <div key={v.name} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{v.name}</p>
                        </div>
                        {v.reliability_score !== null && (
                          <Badge className={`border-0 text-xs ${v.reliability_score >= 80 ? "bg-green-100 text-green-700" : v.reliability_score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {v.reliability_score}% reliable
                          </Badge>
                        )}
                        <Badge className="bg-primary/10 text-primary border-0">{v.count} sign-up{v.count !== 1 ? "s" : ""}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "demographics" && (
          <DemographicsTab volunteers={volunteerUsers} signups={signups} />
        )}

        {activeTab === "retention" && (
          <RetentionTab volunteers={volunteerUsers} signups={signups} />
        )}

        {activeTab === "impact" && (
          <EventImpactTab events={events} signups={signups} volunteers={allVolunteers} />
        )}
      </div>
    </AppLayout>
  );
}