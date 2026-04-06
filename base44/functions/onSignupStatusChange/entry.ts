import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Triggered by entity automation on Signup update
// Adjusts volunteer reliability_score and appends to attendance_history
// when status changes to "attended" or "cancelled" (from "confirmed")

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json();
  const { data: signup, old_data: oldSignup } = body;

  if (!signup || !oldSignup) {
    return Response.json({ message: "No data provided" }, { status: 400 });
  }

  const newStatus = signup.status;
  const oldStatus = oldSignup.status;

  // Only act on meaningful transitions
  const isAttended = newStatus === "attended" && oldStatus !== "attended";
  const isNoShow = newStatus === "cancelled" && oldStatus === "confirmed";

  if (!isAttended && !isNoShow) {
    return Response.json({ message: "No reliability action needed" });
  }

  // Find the volunteer user by email
  const users = await base44.asServiceRole.entities.User.filter({ email: signup.volunteer_email });
  const volunteer = users?.[0];

  if (!volunteer) {
    return Response.json({ message: "Volunteer not found" }, { status: 404 });
  }

  // Find the event for history logging
  let eventTitle = signup.event_id;
  let eventDate = null;
  const events = await base44.asServiceRole.entities.Event.filter({ id: signup.event_id });
  if (events?.[0]) {
    eventTitle = events[0].title;
    eventDate = events[0].date;
  }

  // Calculate new reliability score (clamped 0–100)
  const currentScore = volunteer.reliability_score ?? 100;
  const INCREASE = 5;
  const DECREASE = 10;
  const newScore = isAttended
    ? Math.min(100, currentScore + INCREASE)
    : Math.max(0, currentScore - DECREASE);

  // Append to attendance history
  const history = Array.isArray(volunteer.attendance_history) ? volunteer.attendance_history : [];
  history.push({
    event_id: signup.event_id,
    event_title: eventTitle,
    date: eventDate || new Date().toISOString().split("T")[0],
    outcome: isAttended ? "attended" : "no_show"
  });

  await base44.asServiceRole.entities.User.update(volunteer.id, {
    reliability_score: newScore,
    attendance_history: history
  });

  return Response.json({
    message: `Reliability score updated: ${currentScore} → ${newScore} (${isAttended ? "attended" : "no_show"})`,
    volunteer_email: signup.volunteer_email,
    new_score: newScore
  });
});