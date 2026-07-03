const TABLE_NAME = "site_analytics_events";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "game_selected",
  "generate_clicked",
  "numbers_generated",
  "support_clicked",
  "navigation_clicked"
]);

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function cleanText(value, maxLength = 500) {
  if (value === undefined || value === null) {
    return null;
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const cleaned = {};

  Object.entries(value).forEach(([key, item]) => {
    const safeKey = cleanText(key, 80);

    if (!safeKey) {
      return;
    }

    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      cleaned[safeKey] =
        typeof item === "string" ? cleanText(item, 500) : item;
    }
  });

  return cleaned;
}

function cleanSupabaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");
}

function requireEnv(env, name) {
  const value = env[name];

  if (!value) {
    const error = new Error(`Missing Cloudflare environment variable: ${name}`);
    error.publicCode = "MISSING_ENVIRONMENT_VARIABLE";
    error.publicDetails = {
      missing_variable: name
    };
    throw error;
  }

  return String(value).trim();
}

async function insertAnalyticsEvent(env, record) {
  const supabaseUrl = cleanSupabaseUrl(requireEnv(env, "SUPABASE_URL"));
  const serviceRoleKey = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE_NAME}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const responseText = await response.text();

    const error = new Error(
      `Supabase analytics insert failed: ${response.status}`
    );

    error.publicCode = "SUPABASE_INSERT_FAILED";
    error.publicDetails = {
      status: response.status,
      response: cleanText(responseText, 500)
    };

    throw error;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let payload = null;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid content type."
        },
        415
      );
    }

    payload = await request.json();

    const eventName = cleanText(payload.event_name, 80);

    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid event name."
        },
        400
      );
    }

    const record = {
      event_name: eventName,
      page_path: cleanText(payload.page_path, 300),
      page_url: cleanText(payload.page_url, 1000),
      page_title: cleanText(payload.page_title, 300),
      referrer: cleanText(payload.referrer, 1000),
      visitor_id: cleanText(payload.visitor_id, 120),
      session_id: cleanText(payload.session_id, 120),
      game_key: cleanText(payload.game_key, 80),
      details: cleanDetails(payload.details),
      country: cleanText(request.headers.get("CF-IPCountry"), 20),
      user_agent: cleanText(request.headers.get("User-Agent"), 500)
    };

    await insertAnalyticsEvent(env, record);

    return jsonResponse({
      success: true
    });
  } catch (error) {
    console.error(error);

    const debugMode =
      payload &&
      payload.details &&
      (payload.details.test === true || payload.details.debug === true);

    return jsonResponse(
      {
        success: false,
        error: "Tracking failed.",
        code: error.publicCode || "TRACKING_FAILED",
        details: debugMode ? error.publicDetails || null : null
      },
      500
    );
  }
}

export async function onRequestGet() {
  return jsonResponse(
    {
      success: false,
      error: "Method not allowed."
    },
    405
  );
}
