import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title or name" },
          description: { type: "string", description: "Event description or summary" },
          date: { type: "string", description: "Event date in YYYY-MM-DD format if available" },
          time: { type: "string", description: "Event start time in HH:MM format if available" },
          location: { type: "string", description: "Venue name or address" },
          capacity: { type: "number", description: "Maximum number of attendees or volunteers" },
          image_url: { type: "string", description: "Any image URL mentioned in the document" }
        }
      }
    });

    if (result.status !== "success") {
      return Response.json({ error: result.details || "Extraction failed" }, { status: 400 });
    }

    // Clean up nulls
    const extracted = {};
    const raw = Array.isArray(result.output) ? result.output[0] : result.output;
    if (raw) {
      Object.entries(raw).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") extracted[k] = v;
      });
    }

    return Response.json({ extracted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});