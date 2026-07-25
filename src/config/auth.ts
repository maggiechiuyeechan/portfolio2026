/**
 * Auth configuration. To protect a new section (e.g. /blog when it ships),
 * add its prefix here — middleware picks it up automatically.
 */
export const PROTECTED_PREFIXES = ["/work", "/blog", "/prototypes"];

export const AUTH_COOKIE = "portfolio_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
