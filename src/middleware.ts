import { defineMiddleware } from "astro:middleware";
import { AUTH_COOKIE, PROTECTED_PREFIXES } from "./config/auth";
import { verifySessionToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return next();

  const token = context.cookies.get(AUTH_COOKIE)?.value;
  const secret = import.meta.env.AUTH_SECRET;

  if (!token || !secret || !(await verifySessionToken(token, secret))) {
    return context.redirect("/");
  }

  return next();
});
