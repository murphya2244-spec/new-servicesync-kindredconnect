import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const signup = payload.data;

    if (!signup?.event_id || !signup?.volunteer_email) {
      return Response.json({ ok: true });
    }

    // Get event details
    const events = await base44.asServiceRole.entities.Event.filter({ id: signup.event_id });
    const event = events[0];
    if (!event) return Response.json({ ok: true });

    // Notify the volunteer that their signup is confirmed
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: signup.volunteer_email,
      type: "signup_confirmed",
      title: `You're signed up for "${event.title}"`,
      body: event.date ? `Event on ${event.date}${event.location ? " at " + event.location : ""}` : null,
      event_id: signup.event_id,
      is_read: false
    });

    // Notify all admins of the new signup
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    await Promise.all(admins.map(admin =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: admin.email,
        type: "new_signup",
        title: `${signup.volunteer_name || signup.volunteer_email} signed up for "${event.title}"`,
        body: null,
        event_id: signup.event_id,
        is_read: false
      })
    ));

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});