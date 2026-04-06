import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";

export default function RetentionTab({ volunteers, signups }) {
  const now = new Date();

  // Build monthly new + returning volunteer counts for last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return { key: format(d, "yyyy-MM"), label: format(d, "MMM yy") };
  });

  // First signup month per volunteer
  const firstSignupMonth = {};
  [...signups]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .forEach(s => {
      if (!firstSignupMonth[s.volunteer_email]) {
        firstSignupMonth[s.volunteer_email] = format(new Date(s.created_date), "yyyy-MM");
      }
    });

  // Per month: new volunteers (first signup that month) vs returning
  const monthlyData = months.map(({ key, label }) => {
    const monthSignups = signups.filter(s => format(new Date(s.created_date), "yyyy-MM") === key && s.status !== "cancelled");
    const uniqueVols = [...new Set(monthSignups.map(s => s.volunteer_email))];
    const newVols = uniqueVols.filter(e => firstSignupMonth[e] === key);
    const returningVols = uniqueVols.filter(e => firstSignupMonth[e] && firstSignupMonth[e] < key);
    return { label, new: newVols.length, returning: returningVols.length, total: uniqueVols.length };
  });

  // Retention rate: volunteers who signed up in month M and also signed up in month M+1 or later
  const retentionData = months.slice(0, 11).map(({ key, label }, i) => {
    const nextMonths = months.slice(i + 1).map(m => m.key);
    const cohort = Object.entries(firstSignupMonth).filter(([, m]) => m === key).map(([e]) => e);
    if (cohort.length === 0) return { label, rate: 0, cohortSize: 0 };
    const retained = cohort.filter(e => signups.some(s => s.volunteer_email === e && nextMonths.includes(format(new Date(s.created_date), "yyyy-MM"))));
    return { label, rate: Math.round((retained.length / cohort.length) * 100), cohortSize: cohort.length };
  });

  // Volunteer activity segments
  const volActivity = volunteers.map(v => {
    const volSignups = signups.filter(s => s.volunteer_email === v.email && s.status !== "cancelled");
    return { ...v, signupCount: volSignups.length };
  });
  const inactive = volActivity.filter(v => v.signupCount === 0).length;
  const occasional = volActivity.filter(v => v.signupCount >= 1 && v.signupCount <= 2).length;
  const regular = volActivity.filter(v => v.signupCount >= 3 && v.signupCount <= 5).length;
  const core = volActivity.filter(v => v.signupCount > 5).length;

  // At-risk volunteers: signed up before but no signups in last 60 days
  const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const atRisk = volunteers.filter(v => {
    const volS = signups.filter(s => s.volunteer_email === v.email && s.status !== "cancelled");
    if (volS.length === 0) return false;
    const lastSignup = new Date(Math.max(...volS.map(s => new Date(s.created_date))));
    return lastSignup < sixtyDaysAgo;
  });

  const overallRetention = (() => {
    const validMonths = retentionData.filter(d => d.cohortSize >= 2);
    if (!validMonths.length) return 0;
    return Math.round(validMonths.reduce((sum, d) => sum + d.rate, 0) / validMonths.length);
  })();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg. Retention Rate", value: `${overallRetention}%` },
          { label: "Core Volunteers (6+)", value: core },
          { label: "At-Risk (60d inactive)", value: atRisk.length },
          { label: "Inactive Volunteers", value: inactive },
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
        {/* New vs Returning */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">New vs Returning Volunteers (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="new" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="New" stackId="a" />
                <Bar dataKey="returning" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} name="Returning" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Retention Rate trend */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base">Monthly Retention Rate (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={retentionData} margin={{ top: 4, right: 8, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Retention %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Segments */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-fraunces text-base">Volunteer Engagement Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Inactive", sublabel: "0 sign-ups", value: inactive, color: "bg-red-100 text-red-700" },
              { label: "Occasional", sublabel: "1–2 sign-ups", value: occasional, color: "bg-yellow-100 text-yellow-700" },
              { label: "Regular", sublabel: "3–5 sign-ups", value: regular, color: "bg-blue-100 text-blue-700" },
              { label: "Core", sublabel: "6+ sign-ups", value: core, color: "bg-green-100 text-green-700" },
            ].map(({ label, sublabel, value, color }) => (
              <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-semibold mt-0.5">{label}</p>
                <p className="text-xs opacity-75">{sublabel}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Volunteers */}
      {atRisk.length > 0 && (
        <Card className="border-border border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="font-fraunces text-base text-orange-800">At-Risk Volunteers (no activity in 60+ days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-orange-100">
              {atRisk.slice(0, 8).map(v => {
                const volS = signups.filter(s => s.volunteer_email === v.email && s.status !== "cancelled");
                const lastDate = new Date(Math.max(...volS.map(s => new Date(s.created_date))));
                return (
                  <div key={v.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-orange-900">{v.full_name}</p>
                      <p className="text-xs text-orange-700">{v.email}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                      Last: {format(lastDate, "MMM d, yyyy")}
                    </Badge>
                  </div>
                );
              })}
              {atRisk.length > 8 && (
                <p className="text-xs text-orange-700 pt-2">+{atRisk.length - 8} more volunteers at risk.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}