import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#eab308", "#6b7280", "#e07a3c"];

export default function DemographicsTab({ volunteers, signups }) {
  // Skills distribution
  const skillCounts = {};
  volunteers.forEach(v => {
    (v.skills || []).forEach(s => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Availability breakdown
  const availCounts = {};
  volunteers.forEach(v => {
    const a = v.availability || "not_set";
    availCounts[a] = (availCounts[a] || 0) + 1;
  });
  const availLabels = { weekdays: "Weekdays", weekends: "Weekends", both: "Both", flexible: "Flexible", not_set: "Not Set" };
  const availData = Object.entries(availCounts).map(([key, value], i) => ({
    name: availLabels[key] || key,
    value,
    color: COLORS[i % COLORS.length]
  }));

  // Work environment preference
  const envCounts = { indoor: 0, outdoor: 0, hybrid: 0 };
  volunteers.forEach(v => {
    (v.work_environment_preference || []).forEach(e => {
      if (envCounts[e] !== undefined) envCounts[e]++;
    });
  });
  const envData = [
    { name: "Indoor", value: envCounts.indoor },
    { name: "Outdoor", value: envCounts.outdoor },
    { name: "Hybrid", value: envCounts.hybrid },
  ].filter(d => d.value > 0);

  // Interaction style preference
  const intCounts = { high_social: 0, low_social: 0, independent: 0, team_based: 0 };
  volunteers.forEach(v => {
    (v.interaction_type_preference || []).forEach(i => {
      if (intCounts[i] !== undefined) intCounts[i]++;
    });
  });
  const intLabels = { high_social: "High Social", low_social: "Low Social", independent: "Independent", team_based: "Team-Based" };
  const intData = Object.entries(intCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v], i) => ({ name: intLabels[k], value: v, color: COLORS[i % COLORS.length] }));

  // Profile completeness
  const complete = volunteers.filter(v => v.skills?.length && v.availability && v.bio).length;
  const partial = volunteers.filter(v => (v.skills?.length || v.availability || v.bio) && !(v.skills?.length && v.availability && v.bio)).length;
  const empty = volunteers.length - complete - partial;
  const completenessData = [
    { name: "Complete", value: complete, color: "#22c55e" },
    { name: "Partial", value: partial, color: "#eab308" },
    { name: "Empty", value: empty, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Volunteers", value: volunteers.length },
          { label: "With Skills Listed", value: volunteers.filter(v => v.skills?.length).length },
          { label: "With Availability Set", value: volunteers.filter(v => v.availability).length },
          { label: "With Bio", value: volunteers.filter(v => v.bio).length },
        ].map(({ label, value }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Skills */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Top Volunteer Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No skills data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topSkills} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Volunteers" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Availability Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {availData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No availability data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={availData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ name, percent }) => `${Math.round(percent * 100)}%`} labelLine={false}>
                    {availData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Work Environment Preference */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Work Environment Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {envData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No preference data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={envData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Volunteers" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Interaction Style Preference */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Interaction Style Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {intData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No preference data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={intData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} label={({ name, percent }) => `${Math.round(percent * 100)}%`} labelLine={false}>
                    {intData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Completeness */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-fraunces text-base">Profile Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={completenessData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                  {completenessData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {completenessData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value} volunteers ({Math.round((d.value / volunteers.length) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}