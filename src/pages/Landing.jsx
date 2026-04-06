import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Users, Calendar, ArrowRight, Zap, BarChart2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

function InView({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      custom={delay}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
        {/* Parallax background */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=80')] bg-cover bg-center opacity-10"
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative max-w-5xl mx-auto px-6 pt-28 pb-36 text-center w-full"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-7 border border-primary/20"
          >
            <Heart className="w-4 h-4" />
            Volunteer Management for Nonprofits
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-fraunces font-semibold text-foreground leading-[1.1] mb-7 tracking-tight"
          >
            Connect Hearts,
            <br />
            <span className="text-primary">Build Community</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            VolunteerConnect brings nonprofits and passionate volunteers together.
            Organize events, manage sign-ups, and track impact — all in one warm, welcoming place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/volunteer-dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base px-9 py-6 rounded-xl shadow-lg shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5">
                I'm a Volunteer
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/admin-dashboard">
              <Button size="lg" variant="outline" className="border-2 gap-2 text-base px-9 py-6 rounded-xl hover:bg-secondary transition-transform duration-200 hover:-translate-y-0.5">
                I'm an Admin
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Subtle scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-2 rounded-full bg-muted-foreground/40" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Feature Cards ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <InView className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Why VolunteerConnect</p>
          <h2 className="font-fraunces text-3xl md:text-5xl font-semibold text-foreground leading-tight">
            Everything you need to make
            <br className="hidden md:block" />
            <span className="text-primary"> a lasting difference</span>
          </h2>
        </InView>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Calendar,
              gradient: "from-primary/20 via-primary/5 to-transparent",
              iconBg: "bg-primary text-primary-foreground",
              title: "Discover Events",
              desc: "Browse curated volunteer opportunities filtered by cause, location, and your personal availability.",
              stat: "50+",
              statLabel: "events listed monthly",
              delay: 0,
            },
            {
              icon: Users,
              gradient: "from-accent/20 via-accent/5 to-transparent",
              iconBg: "bg-accent text-accent-foreground",
              title: "Easy Sign-ups",
              desc: "Register in one click and manage your entire schedule from a beautiful personal dashboard.",
              stat: "1-click",
              statLabel: "registration flow",
              delay: 1,
            },
            {
              icon: Heart,
              gradient: "from-rose-400/20 via-rose-300/5 to-transparent",
              iconBg: "bg-rose-500 text-white",
              title: "Track Impact",
              desc: "Log volunteer hours and watch your community contribution grow over time.",
              stat: "Real-time",
              statLabel: "impact tracking",
              delay: 2,
            },
          ].map(({ icon: Icon, gradient, iconBg, title, desc, stat, statLabel, delay }, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              custom={delay}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 pointer-events-none transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="relative p-7 flex flex-col h-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-fraunces text-xl font-semibold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{desc}</p>
                <div className="mt-auto flex items-baseline gap-1.5 border-t border-border pt-4">
                  <span className="text-lg font-fraunces font-semibold text-foreground">{stat}</span>
                  <span className="text-xs text-muted-foreground">{statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Enterprise CTA card — same width, inline ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-5 relative overflow-hidden rounded-2xl border border-border bg-foreground"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/10 to-accent/20 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center gap-6">
            {/* Left: badges + text */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/20 px-2.5 py-1 rounded-full mb-3">For Organizations</span>
              <h3 className="font-fraunces text-xl md:text-2xl font-semibold text-white leading-snug mb-2">
                Scale your volunteer program without the chaos
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
                {["Unlimited volunteers", "Advanced analytics", "Custom branding", "Priority support"].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-white/55 text-xs">
                    <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <Link to="/demo" className="shrink-0">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white gap-2 px-7 py-5 rounded-xl shadow-lg shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                See It in Action
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Social Proof ─────────────────────────────────────── */}
      <div className="border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-6 py-20">

          {/* Trusted by */}
          <InView className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">Trusted by volunteer organizations</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {["Red Cross Chapter", "City Food Bank", "Green Earth Alliance", "Hope Shelter", "Youth Futures"].map((org, i) => (
                <motion.span
                  key={org}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-sm font-semibold text-muted-foreground/50 tracking-wide whitespace-nowrap"
                >
                  {org}
                </motion.span>
              ))}
            </div>
          </InView>

          <div className="border-t border-border my-14" />

          {/* Testimonials */}
          <InView className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">What volunteers say</p>
            <h2 className="font-fraunces text-2xl md:text-4xl font-semibold text-foreground">
              Real stories, real impact
            </h2>
          </InView>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "VolunteerConnect made it so easy to find events that actually match my schedule. I've logged more hours this year than ever before.",
                name: "Sarah M.",
                role: "Community Volunteer",
                initials: "SM",
                color: "bg-primary/10 text-primary",
                delay: 0,
              },
              {
                quote: "The dashboard is beautiful and simple. I signed up for my first event in under a minute — no confusing forms, just heart.",
                name: "James T.",
                role: "First-time Volunteer",
                initials: "JT",
                color: "bg-accent/10 text-accent",
                delay: 1,
              },
              {
                quote: "Being able to see my impact over time is incredibly motivating. It keeps me coming back every single weekend.",
                name: "Priya K.",
                role: "Weekly Volunteer",
                initials: "PK",
                color: "bg-rose-100 text-rose-500",
                delay: 2,
              },
            ].map(({ quote, name, role, initials, color, delay }, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                custom={delay}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default"
              >
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-primary fill-primary" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic flex-1">"{quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border text-center py-8 text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <span>VolunteerConnect — Made with love for nonprofits</span>
        </div>
      </footer>
    </div>
  );
}