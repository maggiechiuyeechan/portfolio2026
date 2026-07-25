import type { APIRoute } from "astro";
import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "../../config/auth";
import { createSessionToken } from "../../lib/auth";

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

  if (password.trim() !== sitePassword.trim()) {
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

  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return Response.json({ ok: true });
};
