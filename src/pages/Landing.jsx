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
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              color: "text-primary bg-primary/10",
              title: "Discover Events",
              desc: "Browse upcoming volunteer opportunities filtered by cause, location, and availability."
            },
            {
              icon: Users,
              color: "text-accent bg-accent/10",
              title: "Easy Sign-ups",
              desc: "Register for events in one click and manage your schedule from a personal dashboard."
            },
            {
              icon: Heart,
              color: "text-rose-500 bg-rose-50",
              title: "Track Impact",
              desc: "Log volunteer hours and see the difference you're making in your community."
            }
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-fraunces text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
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