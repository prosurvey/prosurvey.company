export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
};

const json = (data: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });

const getString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const parseBody = async (request: Request): Promise<LeadPayload> => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as LeadPayload;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as LeadPayload;
  }

  return {};
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead" && request.method === "POST") {
      try {
        const body = await parseBody(request);

        const name = getString(body.name);
        const email = getString(body.email);
        const phone = getString(body.phone);
        const company = getString(body.company);
        const message = getString(body.message);
        const source = getString(body.source) || "site";

        if (!name || !email) {
          return json(
            { ok: false, error: "name_and_email_required" },
            { status: 400 },
          );
        }

        await env.DB.prepare(
          `
          INSERT INTO leads (name, email, phone, company, message, source)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
        )
          .bind(name, email, phone, company, message, source)
          .run();

        return json({ ok: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "unknown_error";

        return json(
          { ok: false, error: "internal_error", details: message },
          { status: 500 },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
