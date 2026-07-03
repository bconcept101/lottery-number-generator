const REPORTS = {
  overview24h: "analytics_overview_24h",
  activeSessionsNow: "analytics_active_sessions_now",
  topPages24h: "analytics_top_pages_24h",
  topGames24h: "analytics_top_games_24h",
  clickDetails24h: "analytics_click_details_24h",
  recentEvents24h: "analytics_recent_events_24h",
  daily14d: "analytics_daily_14d"
};

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
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
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
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return String(value).trim();
}

function getSubmittedPasskey(request, payload) {
  const headerPasskey = request.headers.get("X-Admin-Analytics-Passkey");

  if (headerPasskey) {
    return cleanText(headerPasskey, 300);
  }

  if (payload && payload.passkey) {
    return cleanText(payload.passkey, 300);
  }

  return "";
}

function isAuthorized(request, payload, env) {
  const submittedPasskey = getSubmittedPasskey(request, payload);
  const expectedPasskey = requireEnv(env, "ADMIN_ANALYTICS_PASSKEY");

  return submittedPasskey && submittedPasskey === expectedPasskey;
}

async function fetchSupabaseReport(env, viewName) {
  const supabaseUrl = cleanSupabaseUrl(requireEnv(env, "SUPABASE_URL"));
  const serviceRoleKey = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/${viewName}?select=*`, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Supabase report failed for ${viewName}: ${response.status} ${responseText}`
    );
  }

  return response.json();
}

async function loadAnalyticsReports(env) {
  const [
    overview24h,
    activeSessionsNow,
    topPages24h,
    topGames24h,
    clickDetails24h,
    recentEvents24h,
    daily14d
  ] = await Promise.all([
    fetchSupabaseReport(env, REPORTS.overview24h),
    fetchSupabaseReport(env, REPORTS.activeSessionsNow),
    fetchSupabaseReport(env, REPORTS.topPages24h),
    fetchSupabaseReport(env, REPORTS.topGames24h),
    fetchSupabaseReport(env, REPORTS.clickDetails24h),
    fetchSupabaseReport(env, REPORTS.recentEvents24h),
    fetchSupabaseReport(env, REPORTS.daily14d)
  ]);

  return {
    generated_at: new Date().toISOString(),
    overview_24h: overview24h[0] || {},
    active_sessions_now: activeSessionsNow[0] || {},
    top_pages_24h: topPages24h,
    top_games_24h: topGames24h,
    click_details_24h: clickDetails24h,
    recent_events_24h: recentEvents24h,
    daily_14d: daily14d
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";
    let payload = {};

    if (contentType.includes("application/json")) {
      payload = await request.json();
    }

    if (!isAuthorized(request, payload, env)) {
      return jsonResponse(
        {
          success: false,
          error: "Unauthorized."
        },
        401
      );
    }

    const reports = await loadAnalyticsReports(env);

    return jsonResponse({
      success: true,
      reports
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        success: false,
        error: "Unable to load analytics reports."
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
