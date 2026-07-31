/**
 * HMAC-signed session tokens (Web Crypto, works on Vercel Node and Edge).
 * Token format: "<expiryEpochMs>.<hmacSha256Hex>" — forging a cookie without
 * AUTH_SECRET is not possible, and expiry is embedded in the signed payload.
 */
const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time string comparison.
 *
 * `a !== b` bails at the first differing byte, so how long it takes leaks how
 * many leading characters were correct. Over the public internet that signal is
 * buried in network jitter and this is close to theatre — but it's five lines,
 * and "close to" is doing real work in that sentence.
 *
 * Compares UTF-8 bytes, and always walks the full length of the longer input so
 * that a length mismatch costs the same as a content mismatch.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const length = Math.max(left.length, right.length);

  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(
  secret: string,
  maxAgeSeconds: number,
): Promise<string> {
  const payload = String(Date.now() + maxAgeSeconds * 1000);
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<boolean> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;
  const payload = token.slice(0, dotIndex);
  const signature = fromHex(token.slice(dotIndex + 1));
  if (!signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const key = await importKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature as BufferSource,
    encoder.encode(payload),
  );
}
