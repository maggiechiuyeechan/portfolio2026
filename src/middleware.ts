import { defineMiddleware } from "astro:middleware";
import { AUTH_COOKIE, PROTECTED_PREFIXES } from "./config/auth";
import { verifySessionToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return next();

  const secret = import.meta.env.AUTH_SECRET;

  // A missing secret is a deployment fault, not a failed login. Redirecting
  // here made it indistinguishable from a wrong password: /api/auth would set
  // a cookie and return 200, the form would report success, and the visitor
  // would land back on / — forever, with nothing logged anywhere. Fail loud.
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Protected routes cannot verify sessions. " +
        "Set it in the Vercel project environment (all environments) and redeploy.",
    );
  }

  const token = context.cookies.get(AUTH_COOKIE)?.value;

  if (!token || !(await verifySessionToken(token, secret))) {
    return context.redirect("/");
  }

  return next();
});
