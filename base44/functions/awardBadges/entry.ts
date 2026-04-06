import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BADGES = [
  { id: "hours_10",  criteria: { type: "hours",  value: 10  } },
  { id: "hours_25",  criteria: { type: "hours",  value: 25  } },
  { id: "hours_50",  criteria: { type: "hours",  value: 50  } },
  { id: "hours_100", criteria: { type: "hours",  value: 100 } },
  { id: "hours_250", criteria: { type: "hours",  value: 250 } },
  { id: "events_1",  criteria: { type: "events", value: 1  } },
  { id: "events_5",  criteria: { type: "events", value: 5  } },
  { id: "events_10", criteria: { type: "events", value: 10 } },
  { id: "events_25", criteria: { type: "events", value: 25 } },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct call { volunteer_email } and entity automation payload { data: { volunteer_email } }
    const volunteer_email = body.volunteer_email || body.data?.volunteer_email;

    if (!volunteer_email) {
      return Response.json({ error: "Missing volunteer_email" }, { status: 400 });
    }

    // Fetch all attended signups for this volunteer
    const signups = await base44.asServiceRole.entities.Signup.filter({
      volunteer_email,
      status: "attended"
    });

    const totalHours = signups.reduce((sum, s) => sum + (s.hours_logged || 0), 0);
    const eventsAttended = signups.length;

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email: volunteer_email });
    if (!users.length) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const user = users[0];

    // Compute which badges are earned
    const earned = BADGES
      .filter(badge => {
        if (badge.criteria.type === "hours") return totalHours >= badge.criteria.value;
        if (badge.criteria.type === "events") return eventsAttended >= badge.criteria.value;
        return false;
      })
      .map(b => b.id);

    // Check for newly earned badges
    const existing = user.badges_earned || [];
    const newBadges = earned.filter(id => !existing.includes(id));

    // Update user
    await base44.asServiceRole.entities.User.update(user.id, {
      badges_earned: earned,
      total_hours: totalHours,
      events_attended_count: eventsAttended
    });

    // Create notifications for newly earned badges
    for (const badgeId of newBadges) {
      const badgeNames = {
        hours_10: "Getting Started", hours_25: "Dedicated Helper",
        hours_50: "50 Hours Served", hours_100: "Century of Service",
        hours_250: "Service Legend", events_1: "First Step",
        events_5: "Regular Volunteer", events_10: "Event Champion",
        events_25: "Community Pillar"
      };
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: volunteer_email,
        type: "signup_confirmed",
        title: `🏅 New Badge: ${badgeNames[badgeId] || badgeId}`,
        body: `Congratulations! You've earned a new achievement badge.`,
        is_read: false
      });
    }

    return Response.json({ totalHours, eventsAttended, badges_earned: earned, new_badges: newBadges });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});