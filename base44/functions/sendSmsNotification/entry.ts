/**
 * SMS Notification Skeleton — Powered by Twilio
 *
 * STATUS: Not yet active. To enable:
 * 1. Sign up at https://twilio.com and get a phone number.
 * 2. Add these secrets in your Base44 dashboard settings:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_PHONE_NUMBER
 * 3. Call this function from sendEventReminders.js or onNewSignup.js as needed.
 *
 * Example call from another backend function:
 *   await base44.functions.invoke('sendSmsNotification', {
 *     to: "+15550001234",       // volunteer's phone number
 *     message: "Reminder: Your event 'Food Bank Drive' is tomorrow at 9am!"
 *   });
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, message } = await req.json();

    if (!to || !message) {
      return Response.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    // Guard: Do not proceed if secrets are not configured
    if (!accountSid || !authToken || !fromNumber) {
      console.warn("SMS not sent: Twilio secrets are not configured yet.");
      return Response.json({
        status: "skipped",
        reason: "Twilio credentials not set. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your secrets."
      });
    }

    // Send SMS via Twilio REST API
    const credentials = btoa(`${accountSid}:${authToken}`);
    const body = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.message || "Twilio error" }, { status: 500 });
    }

    return Response.json({ status: "sent", sid: result.sid });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});