import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Staffing Gap Detection & Resolution
// Monitors all upcoming events, checks filled vs required capacity,
// flags understaffed events, notifies coordinator, recommends replacements.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all upcoming events with a defined capacity
    const allEvents = await base44.asServiceRole.entities.Event.filter({ status: "upcoming" });
    const eventsWithCapacity = allEvents.filter(e => e.capacity && e.capacity > 0);

    if (eventsWithCapacity.length === 0) {
      return Response.json({ message: "No upcoming events with capacity requirements.", gaps_found: 0 });
    }

    // Get all active signups
    const allSignups = await base44.asServiceRole.entities.Signup.list();
    const activeSignups = allSignups.filter(s => s.status !== "cancelled");

    // Build signup count map
    const signupCountMap = {};
    activeSignups.forEach(s => {
      signupCountMap[s.event_id] = (signupCountMap[s.event_id] || 0) + 1;
    });

    const allVolunteers = await base44.asServiceRole.entities.User.filter({ role: "user" });
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

    let gapsFound = 0;

    for (const event of eventsWithCapacity) {
      const filled = signupCountMap[event.id] || 0;
      const required = event.capacity;
      const hasGap = filled < required;

      if (!hasGap) continue;

      gapsFound++;
      const gap = required - filled;

      // --- Find available replacement/backup volunteers ---
      const signedUpEmails = new Set(
        activeSignups.filter(s => s.event_id === event.id).map(s => s.volunteer_email)
      );

      let candidates = allVolunteers.filter(v => !signedUpEmails.has(v.email));

      // Score by skill match if event has skill requirements
      if (event.skills_needed && event.skills_needed.length > 0) {
        candidates = candidates
          .map(v => {
            const matches = (event.skills_needed || []).filter(skill =>
              (v.skills || []).some(vs =>
                vs.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(vs.toLowerCase())
              )
            );
            return { ...v, matchCount: matches.length };
          })
          .sort((a, b) => b.matchCount - a.matchCount);
      }

      const topCandidates = candidates.slice(0, 5);
      const candidateNames = topCandidates.map(v => v.full_name || v.email).join(", ");

      // --- Notify admins (deduped: only if no existing understaffed_warning for this event) ---
      for (const admin of admins) {
        const existing = await base44.asServiceRole.entities.Notification.filter({
          recipient_email: admin.email,
          event_id: event.id,
          type: "understaffed_warning"
        });

        if (existing.length > 0) continue;

        await base44.asServiceRole.entities.Notification.create({
          recipient_email: admin.email,
          type: "understaffed_warning",
          title: `Staffing gap: "${event.title}" needs ${gap} more volunteer${gap !== 1 ? "s" : ""}`,
          body: `Event "${event.title}" on ${event.date} is understaffed: ${filled}/${required} spots filled (gap of ${gap}).${candidateNames ? " Recommended backups: " + candidateNames + "." : " No matching volunteers found in the pool."}`,
          event_id: event.id,
          is_read: false
        });
      }
    }

    return Response.json({
      message: "Staffing gap detection complete.",
      events_checked: eventsWithCapacity.length,
      gaps_found: gapsFound
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});