import type { APIRoute } from "astro";
import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "../../config/auth";
import { createSessionToken } from "../../lib/auth";
import { getPostHogServer } from "../../lib/posthog-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const sitePassword = import.meta.env.SITE_PASSWORD;
  const authSecret = import.meta.env.AUTH_SECRET;

  if (!sitePassword || !authSecret) {
    return Response.json(
      { ok: false, error: "Auth is not configured on the server." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const sessionId = request.headers.get("X-PostHog-Session-Id") ?? undefined;
  const distinctId = request.headers.get("X-PostHog-Distinct-Id") ?? "anonymous";

  if (password.trim() !== sitePassword.trim()) {
    const posthog = getPostHogServer();
    if (posthog) {
      posthog.capture({
        distinctId,
        event: "auth_failed",
        properties: {
          $session_id: sessionId,
        },
      });
      await posthog.flush();
    }
    return Response.json({ ok: false, error: "Wrong password." }, { status: 401 });
  }

  const token = await createSessionToken(authSecret, SESSION_MAX_AGE_SECONDS);
  cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  const posthog = getPostHogServer();
  if (posthog) {
    posthog.capture({
      distinctId,
      event: "auth_succeeded",
      properties: {
        $session_id: sessionId,
      },
    });
    await posthog.flush();
  }

  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return Response.json({ ok: true });
};
