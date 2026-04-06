import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * After an event is created/updated, scan the volunteer pool for skill matches.
 * - If skills_needed is specified and NO volunteers match → flag event as "unfilled"
 * - If skills_needed is empty (any volunteer works) → check if ANY volunteers exist
 * - Notify admins about unfilled status
 * - Notify top-matched volunteers inviting them to sign up
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_id } = await req.json();

    if (!event_id) {
      return Response.json({ error: 'event_id required' }, { status: 400 });
    }

    const events = await base44.asServiceRole.entities.Event.filter({ id: event_id });
    const event = events[0];
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });

    // Fetch all volunteers (non-admin users)
    const allUsers = await base44.asServiceRole.entities.User.list();
    const volunteers = allUsers.filter(u => u.role !== 'admin');

    const skillsNeeded = event.skills_needed || [];

    // Score each volunteer
    const scored = volunteers.map(v => {
      const volSkills = (v.skills || []).map(s => s.toLowerCase());
      const matchCount = skillsNeeded.filter(s => volSkills.includes(s.toLowerCase())).length;
      const matchPct = skillsNeeded.length > 0 ? matchCount / skillsNeeded.length : 1;
      return { volunteer: v, matchCount, matchPct };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchPct - a.matchPct);

    // Determine suitable volunteers
    // "Suitable" = at least 1 matching skill if skills are required, or any volunteer if no skills required
    const suitable = skillsNeeded.length > 0
      ? scored.filter(s => s.matchCount > 0)
      : scored;

    const isUnfilled = suitable.length === 0;

    // Update event status
    if (isUnfilled && event.status === 'upcoming') {
      await base44.asServiceRole.entities.Event.update(event_id, { status: 'unfilled' });
    }

    // Notify admins if unfilled
    if (isUnfilled) {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      await Promise.all(admins.map(admin =>
        base44.asServiceRole.entities.Notification.create({
          recipient_email: admin.email,
          type: 'understaffed_warning',
          title: `"${event.title}" has no matching volunteers`,
          body: skillsNeeded.length > 0
            ? `No volunteers found with required skills: ${skillsNeeded.join(', ')}`
            : 'No volunteers are currently registered in the system.',
          event_id,
          is_read: false
        })
      ));
    }

    // Notify top matched volunteers (up to 10) inviting them to sign up
    const topMatches = suitable.slice(0, 10);
    await Promise.all(topMatches.map(({ volunteer }) =>
      base44.asServiceRole.entities.Notification.create({
        recipient_email: volunteer.email,
        type: 'event_reminder',
        title: `New opportunity matching your skills: "${event.title}"`,
        body: [
          event.date ? `Date: ${event.date}` : null,
          event.location ? `Location: ${event.location}` : null,
          event.time ? `Time: ${event.time}` : null
        ].filter(Boolean).join(' · '),
        event_id,
        is_read: false
      })
    ));

    return Response.json({
      ok: true,
      is_unfilled: isUnfilled,
      suitable_count: suitable.length,
      notified_volunteers: topMatches.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});