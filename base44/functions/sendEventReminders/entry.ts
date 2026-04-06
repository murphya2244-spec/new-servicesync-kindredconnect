import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role since this is a scheduled/system task
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Format dates as YYYY-MM-DD for comparison
    const todayStr = now.toISOString().split("T")[0];
    const in24Str = in24h.toISOString().split("T")[0];
    const in48Str = in48h.toISOString().split("T")[0];

    // Get upcoming events in the next 24-48 hours
    const allEvents = await base44.asServiceRole.entities.Event.filter({
      status: "upcoming"
    });

    // Filter events happening tomorrow (within ~24h window)
    const targetEvents = allEvents.filter(e => {
      if (!e.date) return false;
      return e.date === in24Str || e.date === todayStr;
    });

    if (targetEvents.length === 0) {
      return Response.json({ message: "No events requiring reminders today.", sent: 0 });
    }

    let remindersSent = 0;

    for (const event of targetEvents) {
      // Get confirmed signups for this event
      const signups = await base44.asServiceRole.entities.Signup.filter({
        event_id: event.id,
        status: "confirmed"
      });

      if (signups.length === 0) continue;

      for (const signup of signups) {
        // Check if a reminder was already sent for this event+volunteer
        const existing = await base44.asServiceRole.entities.Notification.filter({
          recipient_email: signup.volunteer_email,
          event_id: event.id,
          type: "event_reminder"
        });

        if (existing.length > 0) continue; // Already reminded

        // Send reminder notification
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: signup.volunteer_email,
          type: "event_reminder",
          title: `Reminder: ${event.title} is tomorrow!`,
          body: `Hi ${signup.volunteer_name || "Volunteer"}! Your shift for "${event.title}" is coming up on ${event.date}${event.time ? " at " + event.time : ""}${event.location ? " at " + event.location : ""}. Please confirm your attendance in the app.`,
          event_id: event.id,
          is_read: false
        });

        remindersSent++;
      }

      // --- Check unconfirmed ratio and alert coordinator ---
      const allSignups = await base44.asServiceRole.entities.Signup.filter({
        event_id: event.id
      });

      const activeSignups = allSignups.filter(s => s.status !== "cancelled");
      const confirmedSignups = activeSignups.filter(s => s.status === "confirmed" || s.status === "attended");
      const unconfirmedSignups = activeSignups.filter(s => s.status === "pending");

      const totalActive = activeSignups.length;
      const unconfirmedCount = unconfirmedSignups.length;
      const unconfirmedRatio = totalActive > 0 ? unconfirmedCount / totalActive : 0;

      // Alert if more than 30% are unconfirmed (or more than 3 unconfirmed for small events)
      const tooManyUnconfirmed = totalActive > 0 && (unconfirmedRatio > 0.3 || unconfirmedCount > 3);

      if (tooManyUnconfirmed) {
        // Find backup volunteers: users with skills matching the event but not signed up
        const allVolunteers = await base44.asServiceRole.entities.User.filter({ role: "user" });
        const signedUpEmails = new Set(activeSignups.map(s => s.volunteer_email));

        let backupSuggestions = [];
        if (event.skills_needed && event.skills_needed.length > 0) {
          backupSuggestions = allVolunteers
            .filter(v => !signedUpEmails.has(v.email) && v.skills && v.skills.length > 0)
            .map(v => {
              const matches = event.skills_needed.filter(skill =>
                v.skills.some(vs => vs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(vs.toLowerCase()))
              );
              return { ...v, matchCount: matches.length };
            })
            .filter(v => v.matchCount > 0)
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, 5);
        } else {
          // No skills needed — suggest any available volunteers
          backupSuggestions = allVolunteers
            .filter(v => !signedUpEmails.has(v.email))
            .slice(0, 5);
        }

        const backupNames = backupSuggestions.map(v => v.full_name || v.email).join(", ");

        // Notify all admins
        const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

        for (const admin of admins) {
          // Avoid duplicate coordinator alerts
          const existingAlert = await base44.asServiceRole.entities.Notification.filter({
            recipient_email: admin.email,
            event_id: event.id,
            type: "understaffed_warning"
          });

          if (existingAlert.length > 0) continue;

          await base44.asServiceRole.entities.Notification.create({
            recipient_email: admin.email,
            type: "understaffed_warning",
            title: `⚠️ ${unconfirmedCount} unconfirmed volunteer${unconfirmedCount !== 1 ? "s" : ""} for "${event.title}"`,
            body: `${unconfirmedCount} out of ${totalActive} volunteers have not confirmed attendance for "${event.title}" on ${event.date}.${backupNames ? " Suggested backups: " + backupNames + "." : " No backup volunteers with matching skills found."}`,
            event_id: event.id,
            is_read: false
          });
        }
      }
    }

    return Response.json({
      message: "Reminders processed.",
      events_checked: targetEvents.length,
      reminders_sent: remindersSent
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});