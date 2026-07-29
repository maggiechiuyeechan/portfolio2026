import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "../src/lib/auth.ts";

const SECRET = "test-secret-do-not-use";

test("a freshly minted token verifies", async () => {
  const token = await createSessionToken(SECRET, 60);
  assert.equal(await verifySessionToken(token, SECRET), true);
});

test("a token does not verify under a different secret", async () => {
  const token = await createSessionToken(SECRET, 60);
  assert.equal(await verifySessionToken(token, "some-other-secret"), false);
});

test("an expired token is rejected", async () => {
  // Negative max-age puts the expiry in the past.
  const token = await createSessionToken(SECRET, -1);
  assert.equal(await verifySessionToken(token, SECRET), false);
});

test("extending the expiry without re-signing is rejected", async () => {
  // The whole point of signing the payload: a visitor who edits the cookie to
  // push their expiry out must fail verification.
  const token = await createSessionToken(SECRET, 60);
  const [, signature] = token.split(".");
  const forged = `${Date.now() + 10 * 365 * 24 * 60 * 60 * 1000}.${signature}`;
  assert.equal(await verifySessionToken(forged, SECRET), false);
});

test("a tampered signature is rejected", async () => {
  const token = await createSessionToken(SECRET, 60);
  const [payload, signature] = token.split(".");
  const flipped =
    signature!.slice(0, -1) + (signature!.at(-1) === "a" ? "b" : "a");
  assert.equal(await verifySessionToken(`${payload}.${flipped}`, SECRET), false);
});

test("malformed tokens are rejected without throwing", async () => {
  const malformed = [
    "",
    "no-dot",
    ".",
    "abc.",
    ".abc",
    "123.zzzz", // non-hex signature
    "123.abc", // odd-length hex
    "notanumber.aabb",
    "999999999999999.aabb", // valid-looking expiry, garbage signature
  ];

  for (const token of malformed) {
    assert.equal(
      await verifySessionToken(token, SECRET),
      false,
      `expected ${JSON.stringify(token)} to be rejected`,
    );
  }
});
