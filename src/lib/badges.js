import { Award, Clock, Calendar, Star, Shield, Zap, Heart, Trophy } from "lucide-react";

export const BADGES = [
  // Hours-based
  {
    id: "hours_10",
    name: "Getting Started",
    description: "Logged 10 hours of service",
    icon: Clock,
    color: "text-green-600 bg-green-100",
    criteria: { type: "hours", value: 10 }
  },
  {
    id: "hours_25",
    name: "Dedicated Helper",
    description: "Logged 25 hours of service",
    icon: Heart,
    color: "text-pink-600 bg-pink-100",
    criteria: { type: "hours", value: 25 }
  },
  {
    id: "hours_50",
    name: "50 Hours Served",
    description: "Logged 50 hours of service",
    icon: Star,
    color: "text-yellow-600 bg-yellow-100",
    criteria: { type: "hours", value: 50 }
  },
  {
    id: "hours_100",
    name: "Century of Service",
    description: "Logged 100 hours of service",
    icon: Trophy,
    color: "text-orange-600 bg-orange-100",
    criteria: { type: "hours", value: 100 }
  },
  {
    id: "hours_250",
    name: "Service Legend",
    description: "Logged 250 hours of service",
    icon: Award,
    color: "text-purple-600 bg-purple-100",
    criteria: { type: "hours", value: 250 }
  },

  // Events-based
  {
    id: "events_1",
    name: "First Step",
    description: "Attended your first event",
    icon: Zap,
    color: "text-blue-600 bg-blue-100",
    criteria: { type: "events", value: 1 }
  },
  {
    id: "events_5",
    name: "Regular Volunteer",
    description: "Attended 5 events",
    icon: Calendar,
    color: "text-indigo-600 bg-indigo-100",
    criteria: { type: "events", value: 5 }
  },
  {
    id: "events_10",
    name: "Event Champion",
    description: "Attended 10 events",
    icon: Shield,
    color: "text-teal-600 bg-teal-100",
    criteria: { type: "events", value: 10 }
  },
  {
    id: "events_25",
    name: "Community Pillar",
    description: "Attended 25 events",
    icon: Trophy,
    color: "text-amber-600 bg-amber-100",
    criteria: { type: "events", value: 25 }
  }
];

/**
 * Compute which badges a volunteer has earned.
 * @param {number} totalHours
 * @param {number} eventsAttended
 * @returns {string[]} array of badge IDs earned
 */
export function computeEarnedBadges(totalHours, eventsAttended) {
  return BADGES
    .filter(badge => {
      if (badge.criteria.type === "hours") return (totalHours || 0) >= badge.criteria.value;
      if (badge.criteria.type === "events") return (eventsAttended || 0) >= badge.criteria.value;
      return false;
    })
    .map(b => b.id);
}

/**
 * Get badge definition by ID.
 */
export function getBadgeById(id) {
  return BADGES.find(b => b.id === id) || null;
}