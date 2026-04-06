import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Volunteer Management for Nonprofits
            </div>
            <h1 className="text-5xl md:text-6xl font-fraunces font-semibold text-foreground leading-tight mb-6">
              Connect Hearts,<br />
              <span className="text-primary">Build Community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              VolunteerConnect brings nonprofits and passionate volunteers together. 
              Organize events, manage sign-ups, and track impact — all in one warm, welcoming place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/volunteer-dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                  I'm a Volunteer
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/admin-dashboard">
                <Button size="lg" variant="outline" className="border-2 gap-2 text-base px-8 py-6 rounded-xl hover:bg-secondary">
                  I'm an Admin
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Why VolunteerConnect</p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold text-foreground">
            Everything you need to make <br className="hidden md:block" />
            <span className="text-primary">a lasting difference</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              gradient: "from-primary/20 via-primary/10 to-transparent",
              iconBg: "bg-primary text-primary-foreground",
              title: "Discover Events",
              desc: "Browse curated volunteer opportunities filtered by cause, location, and your personal availability.",
              stat: "50+ events",
              statLabel: "listed each month"
            },
            {
              icon: Users,
              gradient: "from-accent/20 via-accent/10 to-transparent",
              iconBg: "bg-accent text-accent-foreground",
              title: "Easy Sign-ups",
              desc: "Register in one click and manage your entire schedule from a beautiful personal dashboard.",
              stat: "1-click",
              statLabel: "registration flow"
            },
            {
              icon: Heart,
              gradient: "from-rose-400/20 via-rose-300/10 to-transparent",
              iconBg: "bg-rose-500 text-white",
              title: "Track Impact",
              desc: "Log volunteer hours and watch your community contribution grow over time.",
              stat: "Real-time",
              statLabel: "impact tracking"
            }
          ].map(({ icon: Icon, gradient, iconBg, title, desc, stat, statLabel }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.5 }}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 pointer-events-none`} />
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
      </div>

      {/* Footer */}
      <footer className="border-t border-border text-center py-8 text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <span>VolunteerConnect — Made with love for nonprofits</span>
        </div>
      </footer>
    </div>
  );
}