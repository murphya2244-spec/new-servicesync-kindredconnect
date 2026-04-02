import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url, text_input } = await req.json();
    if (!file_url && !text_input) {
      return Response.json({ error: 'Provide file_url or text_input' }, { status: 400 });
    }

    const schema = {
      type: "object",
      properties: {
        phone: { type: "string" },
        address: { type: "string" },
        bio: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string" },
              degree: { type: "string" },
              field: { type: "string" },
              year: { type: "string" }
            }
          }
        },
        work_experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              title: { type: "string" },
              duration: { type: "string" },
              description: { type: "string" }
            }
          }
        }
      }
    };

    let extracted;

    if (file_url) {
      const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });
      extracted = result.status === 'success' ? result.output : {};
    } else {
      extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Extract structured volunteer profile information from the following text. 
Return phone, address, a short bio, skills (as array of strings), education history, and work experience.
Text: ${text_input}`,
        response_json_schema: schema
      });
    }

    // Clean nulls/empty
    const clean = (obj) => {
      if (!obj) return {};
      return Object.fromEntries(
        Object.entries(obj).filter(([, v]) =>
          v !== null && v !== undefined && v !== "" &&
          !(Array.isArray(v) && v.length === 0)
        )
      );
    };

    return Response.json({ extracted: clean(extracted) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});