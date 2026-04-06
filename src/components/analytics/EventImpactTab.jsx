import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, subMonths } from "date-fns";
import { TrendingUp, Clock, Users, CheckCircle } from "lucide-react";

export default function EventImpactTab({ events, signups, volunteers }) {
  const attended = signups.filter(s => s.status === "attended");
  const active = signups.filter(s => s.status !== "cancelled");

  // Total volunteer hours
  const totalHours = volunteers.reduce((sum, v) => sum + (v.total_hours || 0), 0);

  // Attendance rate per event
  const eventImpact = events
    .map(e => {
      const eventActive = active.filter(s => s.event_id === e.id);
      const eventAttended = attended.filter(s => s.event_id === e.id);
      const fillRate = e.capacity ? Math.round((eventActive.length / e.capacity) * 100) : null;
      const attendRate = eventActive.length > 0 ? Math.round((eventAttended.length / eventActive.length) * 100) : 0;
      const hours = eventAttended.reduce((sum, s) => sum + (s.hours_logged || 0), 0);
      return { ...e, signupCount: eventActive.length, attendedCount: eventAttended.length, fillRate, attendRate, hours };
    })
    .filter(e => e.signupCount > 0)
    .sort((a, b) => b.attendedCount - a.attendedCount);

  // Top 8 events by attendance for chart
  const topEventsChart = eventImpact.slice(0, 8).map(e => ({
    name: e.title.length > 16 ? e.title.slice(0, 16) + "…" : e.title,
    attended: e.attendedCount,
    signups: e.signupCount,
  }));

  // Hours by category
  const categoryHours = {};
  const categoryAttended = {};
  events.forEach(e => {
    const cat = e.category || "other";
    const eAttended = attended.filter(s => s.event_id === e.id);
    const eHours = eAttended.reduce((sum, s) => sum + (s.hours_logged || 0), 0);
    categoryHours[cat] = (categoryHours[cat] || 0) + eHours;
    categoryAttended[cat] = (categoryAttended[cat] || 0) + eAttended.length;
  });
  const categoryImpact = Object.entries(categoryAttended)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({
      name: cat.replace(/_/g, " "),
      volunteers: count,
      hours: categoryHours[cat] || 0
    }));

  // Monthly hours trend (last 12 months)
  const now = new Date();
  const monthlyHoursTrend = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    const key = format(d, "yyyy-MM");
    const monthSignups = attended.filter(s => format(new Date(s.created_date), "yyyy-MM") === key);
    const hours = monthSignups.reduce((sum, s) => sum + (s.hours_logged || 0), 0);
    return { label: format(d, "MMM yy"), hours, attendees: monthSignups.length };
  });

  // Overall KPIs
  const overallAttendRate = active.length > 0 ? Math.round((attended.length / active.length) * 100) : 0;
  const avgFillRate = (() => {
    const withCapacity = eventImpact.filter(e => e.fillRate !== null);
    if (!withCapacity.length) return 0;
    return Math.round(withCapacity.reduce((sum, e) => sum + e.fillRate, 0) / withCapacity.length);
  })();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Hours Served", value: totalHours.toLocaleString(), icon: Clock, color: "text-primary bg-primary/10" },
          { label: "Total Attendances", value: attended.length, icon: CheckCircle, color: "text-accent bg-accent/10" },
          { label: "Attendance Rate", value: `${overallAttendRate}%`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Avg. Fill Rate", value: `${avgFillRate}%`, icon: Users, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 sm:mb-0 shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top events by attendance */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Top Events by Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {topEventsChart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No attendance data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topEventsChart} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="signups" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} name="Sign-ups" opacity={0.5} />
                  <Bar dataKey="attended" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Attended" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly hours trend */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Monthly Hours Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyHoursTrend} margin={{ top: 4, right: 8, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Impact by Category */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-fraunces text-base">Impact by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryImpact.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No attendance data yet.</p>
          ) : (
            <div className="space-y-2">
              {categoryImpact.map(c => (
                <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="text-sm font-medium capitalize">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{c.volunteers} attendees</Badge>
                    {c.hours > 0 && <Badge className="bg-accent/10 text-accent border-0 text-xs">{c.hours} hrs</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Event Breakdown Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-fraunces text-base">Event-by-Event Report</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          {eventImpact.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No event data yet.</p>
          ) : (
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 font-medium">Event</th>
                  <th className="text-center py-2 font-medium">Sign-ups</th>
                  <th className="text-center py-2 font-medium">Attended</th>
                  <th className="text-center py-2 font-medium">Attend Rate</th>
                  <th className="text-center py-2 font-medium">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {eventImpact.map(e => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2 pr-4">
                      <p className="font-medium truncate max-w-[180px]">{e.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{e.category?.replace(/_/g, " ")}</p>
                    </td>
                    <td className="text-center py-2">{e.signupCount}</td>
                    <td className="text-center py-2">{e.attendedCount}</td>
                    <td className="text-center py-2">
                      <Badge className={`border-0 text-xs ${e.attendRate >= 75 ? "bg-green-100 text-green-700" : e.attendRate >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {e.attendRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-2">
                      {e.fillRate !== null ? (
                        <Badge className={`border-0 text-xs ${e.fillRate >= 75 ? "bg-green-100 text-green-700" : e.fillRate >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                          {e.fillRate}%
                        </Badge>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}