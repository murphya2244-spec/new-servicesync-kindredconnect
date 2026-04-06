import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Calendar, Users, BarChart2, Bell, CheckCircle, MapPin, Clock, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: "overview",
    label: "Smart Event Management",
    icon: Calendar,
    accent: "from-primary/30 to-primary/5",
    iconColor: "bg-primary text-primary-foreground",
    headline: "Organize events at scale",
    sub: "Create, publish, and manage volunteer events in minutes. Set capacity, required skills, and locations — all from a single intuitive dashboard.",
    visual: <EventVisual />,
    stats: [
      { value: "3×", label: "faster event setup" },
      { value: "98%", label: "volunteer fill rate" },
      { value: "0", label: "double-bookings" },
    ]
  },
  {
    id: "volunteers",
    label: "Volunteer Coordination",
    icon: Users,
    accent: "from-accent/30 to-accent/5",
    iconColor: "bg-accent text-accent-foreground",
    headline: "Know your people",
    sub: "Maintain rich volunteer profiles with skills, availability, and history. Our smart matching suggests the right volunteers for every event automatically.",
    visual: <VolunteersVisual />,
    stats: [
      { value: "500+", label: "volunteers managed" },
      { value: "40%", label: "less admin time" },
      { value: "24h", label: "avg. fill time" },
    ]
  },
  {
    id: "analytics",
    label: "Impact Analytics",
    icon: BarChart2,
    accent: "from-rose-400/20 to-rose-300/5",
    iconColor: "bg-rose-500 text-white",
    headline: "Prove your impact",
    sub: "Real-time dashboards show volunteer hours, event attendance, engagement trends, and understaffing alerts — everything your board needs to see.",
    visual: <AnalyticsVisual />,
    stats: [
      { value: "12k+", label: "hours tracked" },
      { value: "Live", label: "impact reports" },
      { value: "100%", label: "board-ready data" },
    ]
  },
  {
    id: "comms",
    label: "Automated Comms",
    icon: Bell,
    accent: "from-amber-400/20 to-amber-300/5",
    iconColor: "bg-amber-500 text-white",
    headline: "Stay connected effortlessly",
    sub: "Automated reminders, confirmations, and alerts keep volunteers informed. Built-in messaging channels let teams coordinate in real time.",
    visual: <CommsVisual />,
    stats: [
      { value: "90%", label: "show-up rate" },
      { value: "Auto", label: "reminders sent" },
      { value: "0", label: "missed no-shows" },
    ]
  },
];

// ─── Visuals ────────────────────────────────────────────────────────────────

function EventVisual() {
  const events = [
    { title: "City Clean-up Day", date: "Apr 12", spots: 18, total: 20, cat: "Environmental", color: "bg-accent" },
    { title: "Food Bank Drive", date: "Apr 15", spots: 32, total: 40, cat: "Food Bank", color: "bg-primary" },
    { title: "Youth Tutoring", date: "Apr 20", spots: 9, total: 10, cat: "Education", color: "bg-rose-500" },
  ];
  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="bg-background/80 border border-border rounded-xl p-4 flex items-center gap-4"
        >
          <div className={`w-2 h-10 rounded-full ${e.color} shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{e.date}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{e.cat}</span>
            </div>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${e.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${(e.spots / e.total) * 100}%` }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-foreground">{e.spots}/{e.total}</p>
            <p className="text-xs text-muted-foreground">spots</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VolunteersVisual() {
  const volunteers = [
    { name: "Sarah M.", skills: ["First Aid", "Teaching"], hours: 48, match: 98 },
    { name: "James T.", skills: ["Driving", "Cooking"], hours: 32, match: 91 },
    { name: "Priya K.", skills: ["Spanish", "Counseling"], hours: 61, match: 87 },
  ];
  return (
    <div className="space-y-3">
      {volunteers.map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="bg-background/80 border border-border rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {v.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{v.name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {v.skills.map(s => (
                <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-sm font-bold text-accent">{v.match}%</span>
            </div>
            <p className="text-xs text-muted-foreground">{v.hours}h logged</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [60, 85, 72, 90, 65, 95, 80];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Hours", value: "1,284", icon: Clock, color: "text-primary" },
          { label: "Active Vols.", value: "143", icon: Users, color: "text-accent" },
          { label: "Events Done", value: "38", icon: CheckCircle, color: "text-rose-500" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-background/80 border border-border rounded-xl p-3 text-center"
          >
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-fraunces font-semibold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-background/80 border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Volunteer hours this week</p>
        <div className="flex items-end gap-2 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full bg-primary rounded-sm"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                style={{ maxHeight: "100%" }}
              />
              <span className="text-[9px] text-muted-foreground">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommsVisual() {
  const messages = [
    { from: "System", text: "⏰ Reminder: City Clean-up Day is tomorrow at 9am!", time: "8:00 AM", type: "auto" },
    { from: "Sarah M.", text: "Confirmed! I'll be there with my team 🙌", time: "8:05 AM", type: "user" },
    { from: "System", text: "✅ 18/20 volunteers confirmed for City Clean-up Day.", time: "9:00 AM", type: "auto" },
    { from: "Admin", text: "Great turnout everyone — see you tomorrow!", time: "9:02 AM", type: "admin" },
  ];
  return (
    <div className="space-y-2">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.2 }}
          className={`flex gap-2 ${m.type === "user" ? "flex-row-reverse" : ""}`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
            m.type === "auto" ? "bg-amber-100 text-amber-600" :
            m.type === "admin" ? "bg-primary/10 text-primary" :
            "bg-accent/10 text-accent"
          }`}>
            {m.type === "auto" ? "🤖" : m.from[0]}
          </div>
          <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${
            m.type === "user"
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-background/80 border border-border text-foreground rounded-tl-sm"
          }`}>
            {m.type !== "user" && <p className="text-[9px] font-semibold mb-0.5 opacity-60">{m.from}</p>}
            {m.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Demo Page ──────────────────────────────────────────────────────────

export default function DemoPage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[active];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-fraunces font-semibold text-foreground">VolunteerConnect</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-accent/15 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs uppercase tracking-widest font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full mb-5">Platform Demo</span>
            <h1 className="font-fraunces text-4xl md:text-5xl font-semibold text-white leading-tight mb-5">
              See how organizations run<br />
              <span className="text-primary">smarter volunteer programs</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              A guided tour of VolunteerConnect's enterprise capabilities — from event management to real-time impact analytics.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Demo Tabs */}
      <div className="max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {slides.map((s, i) => {
            const TabIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active === i
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-8 items-start"
          >
            {/* Left: text */}
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${slide.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-fraunces text-3xl font-semibold text-foreground mb-3">{slide.headline}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">{slide.sub}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {slide.stats.map(({ value, label }, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="font-fraunces text-2xl font-semibold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: animated visual */}
            <div className={`relative bg-gradient-to-br ${slide.accent} rounded-2xl border border-border p-5 min-h-[320px]`}>
              <div className="absolute top-3 left-4 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <div className="mt-6">
                {slide.visual}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === i ? "bg-primary w-6" : "bg-border w-1.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Benefits strip */}
      <div className="border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold text-center mb-8">Built for organizations that care</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with role-based access controls." },
              { icon: Zap, title: "Instant Setup", desc: "Onboard your team in under 30 minutes, no IT required." },
              { icon: TrendingUp, title: "Scalable Growth", desc: "From 10 to 10,000 volunteers without changing plans." },
              { icon: Heart, title: "Mission-first Design", desc: "Built by nonprofit leaders, for nonprofit leaders." },
            ].map(({ icon: BIcon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <BIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-foreground text-center py-16 px-6">
        <h2 className="font-fraunces text-3xl font-semibold text-white mb-4">Ready to transform your volunteer program?</h2>
        <p className="text-white/60 mb-8 max-w-lg mx-auto">Join hundreds of organizations already running smarter, more impactful volunteer programs with VolunteerConnect.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/admin-dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 px-10 py-6 rounded-xl shadow-xl shadow-primary/30 text-base">
              Get Started Free <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 px-8 py-6 rounded-xl text-base">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-foreground text-center py-6 text-white/30 text-xs">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5 text-primary" />
          VolunteerConnect — Made with love for nonprofits
        </div>
      </footer>
    </div>
  );
}