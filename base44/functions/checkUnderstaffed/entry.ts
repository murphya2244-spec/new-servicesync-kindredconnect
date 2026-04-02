import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().slice(0, 10);
    const in7Str = in7Days.toISOString().slice(0, 10);

    // Get upcoming events in the next 7 days with capacity set
    const events = await base44.asServiceRole.entities.Event.filter({ status: "upcoming" });
    const upcomingSoon = events.filter(e => e.date && e.date >= todayStr && e.date <= in7Str && e.capacity);

    if (upcomingSoon.length === 0) return Response.json({ checked: 0 });

    const allSignups = await base44.asServiceRole.entities.Signup.list();
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

    let warned = 0;
    for (const event of upcomingSoon) {
      const filled = allSignups.filter(s => s.event_id === event.id && s.status !== "cancelled").length;
      const pct = filled / event.capacity;
      if (pct < 0.5) {
        // Only notify if no recent understaffed warning already exists for this event
        const existing = await base44.asServiceRole.entities.Notification.filter({
          type: "understaffed_warning",
          event_id: event.id
        });
        if (existing.length === 0) {
          await Promise.all(admins.map(admin =>
            base44.asServiceRole.entities.Notification.create({
              recipient_email: admin.email,
              type: "understaffed_warning",
              title: `⚠️ "${event.title}" is understaffed`,
              body: `${filled}/${event.capacity} volunteers (${Math.round(pct * 100)}%) with ${event.date} approaching.`,
              event_id: event.id,
              is_read: false
            })
          ));
          warned++;
        }
      }
    }

    return Response.json({ checked: upcomingSoon.length, warned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});