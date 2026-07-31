import type { APIRoute } from "astro";
import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "../../config/auth";
import { createSessionToken, timingSafeEqual } from "../../lib/auth";
import { clientKey, noteFailure, noteSuccess, retryAfterMs } from "../../lib/loginThrottle";

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

  // Throttle before reading the body — a blocked caller shouldn't get to spend
  // our CPU on JSON parsing or an HMAC.
  const key = clientKey(request);
  const waitMs = retryAfterMs(key);
  if (waitMs > 0) {
    const seconds = Math.ceil(waitMs / 1000);
    return Response.json(
      { ok: false, error: "Too many attempts.", retryAfterSeconds: seconds },
      { status: 429, headers: { "Retry-After": String(seconds) } },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!timingSafeEqual(password.trim(), sitePassword.trim())) {
    const delay = noteFailure(key);
    return Response.json(
      {
        ok: false,
        error: "Wrong password.",
        ...(delay > 0 ? { retryAfterSeconds: Math.ceil(delay / 1000) } : null),
      },
      { status: 401 },
    );
  }

  noteSuccess(key);

  const token = await createSessionToken(authSecret, SESSION_MAX_AGE_SECONDS);
  cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return Response.json({ ok: true });
};
