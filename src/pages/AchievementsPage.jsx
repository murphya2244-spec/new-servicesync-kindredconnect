import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BADGES } from "@/lib/badges";
import { Trophy, Clock, Calendar, Award, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/AppLayout";
import BadgeDisplay from "@/components/BadgeDisplay";

export default function AchievementsPage() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hours");

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const volunteers = await base44.entities.User.list();
      // Only show volunteers with any activity
      const ranked = volunteers
        .filter(v => v.role !== "admin" && v.role !== "coordinator")
        .map(v => ({
          ...v,
          total_hours: v.total_hours || 0,
          events_attended_count: v.events_attended_count || 0,
          badges_earned: v.badges_earned || []
        }));
      setLeaderboard(ranked);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </AppLayout>
  );

  const earnedIds = user?.badges_earned || [];
  const totalHours = user?.total_hours || 0;
  const eventsCount = user?.events_attended_count || 0;

  const sortedLeaderboard = [...leaderboard].sort((a, b) =>
    activeTab === "hours" ? b.total_hours - a.total_hours : b.events_attended_count - a.events_attended_count
  ).slice(0, 20);

  const myRank = sortedLeaderboard.findIndex(v => v.email === user?.email) + 1;

  return (
    <AppLayout role={user?.role || "volunteer"} user={user}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-fraunces font-semibold mb-1">Achievements</h1>
          <p className="text-muted-foreground">Your badges, milestones, and community rankings</p>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Hours Served", value: totalHours, icon: Clock, color: "text-primary bg-primary/10" },
            { label: "Events Attended", value: eventsCount, icon: Calendar, color: "text-accent bg-accent/10" },
            { label: "Badges Earned", value: earnedIds.length, icon: Award, color: "text-yellow-600 bg-yellow-100" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 sm:mb-0 shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Badges Grid */}
        <Card className="border-border mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="font-fraunces text-lg flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" /> My Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGES.map(badge => {
                const Icon = badge.icon;
                const earned = earnedIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      earned
                        ? "border-border bg-card shadow-sm"
                        : "border-dashed border-border bg-muted/20 opacity-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${earned ? badge.color : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">{badge.description}</p>
                    </div>
                    {earned && (
                      <span className="text-green-500 shrink-0 text-lg">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-fraunces text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Community Leaderboard
                {myRank > 0 && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs ml-1">You: #{myRank}</Badge>
                )}
              </CardTitle>
              <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setActiveTab("hours")}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === "hours" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Hours
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === "events" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Events
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {sortedLeaderboard.filter(v => (activeTab === "hours" ? v.total_hours : v.events_attended_count) > 0).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity recorded yet. Start volunteering to appear on the leaderboard!</p>
            ) : (
              <div className="space-y-2">
                {sortedLeaderboard
                  .filter(v => (activeTab === "hours" ? v.total_hours : v.events_attended_count) > 0)
                  .map((vol, i) => {
                    const isMe = vol.email === user?.email;
                    const initials = vol.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                    const rankDisplay = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                    const metricValue = activeTab === "hours" ? `${vol.total_hours} hrs` : `${vol.events_attended_count} events`;
                    return (
                      <div
                        key={vol.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/40"}`}
                      >
                        <span className="text-base font-bold w-8 text-center shrink-0">{rankDisplay}</span>
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={vol.profile_image_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">{vol.full_name}{isMe && <span className="text-xs text-primary ml-1">(you)</span>}</p>
                            <BadgeDisplay earnedBadgeIds={vol.badges_earned} size="sm" max={3} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary shrink-0">{metricValue}</span>
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