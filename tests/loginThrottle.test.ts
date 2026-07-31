import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clientKey,
  noteFailure,
  noteSuccess,
  resetThrottle,
  retryAfterMs,
} from "../src/lib/loginThrottle.ts";
import { timingSafeEqual } from "../src/lib/auth.ts";

beforeEach(() => resetThrottle());

const KEY = "203.0.113.7";

test("the first few failures are not throttled", () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(noteFailure(KEY), 0, `attempt ${i + 1} should be free`);
  }
  assert.equal(retryAfterMs(KEY), 0);
});

test("backoff kicks in after the free attempts and doubles", () => {
  for (let i = 0; i < 5; i++) noteFailure(KEY);

  assert.equal(noteFailure(KEY), 2_000);
  assert.equal(noteFailure(KEY), 4_000);
  assert.equal(noteFailure(KEY), 8_000);
});

test("backoff is capped", () => {
  for (let i = 0; i < 40; i++) noteFailure(KEY);
  assert.equal(noteFailure(KEY), 60_000);
});

test("retryAfterMs counts down against the clock", () => {
  const now = 1_000_000;
  for (let i = 0; i < 6; i++) noteFailure(KEY, now);

  assert.equal(retryAfterMs(KEY, now), 2_000);
  assert.equal(retryAfterMs(KEY, now + 1_500), 500);
  assert.equal(retryAfterMs(KEY, now + 2_000), 0);
});

test("a success clears the record, so a typo streak isn't held against you", () => {
  for (let i = 0; i < 8; i++) noteFailure(KEY);
  assert.ok(retryAfterMs(KEY) > 0);

  noteSuccess(KEY);
  assert.equal(retryAfterMs(KEY), 0);
  assert.equal(noteFailure(KEY), 0);
});

test("clients are throttled independently", () => {
  for (let i = 0; i < 8; i++) noteFailure("198.51.100.1");
  assert.ok(retryAfterMs("198.51.100.1") > 0);
  assert.equal(retryAfterMs("198.51.100.2"), 0);
});

test("a long-idle record is forgotten", () => {
  const now = 1_000_000;
  for (let i = 0; i < 8; i++) noteFailure(KEY, now);
  assert.ok(retryAfterMs(KEY, now) > 0);

  // 16 minutes later — past IDLE_RESET_MS.
  assert.equal(retryAfterMs(KEY, now + 16 * 60_000), 0);
});

test("clientKey reads the leftmost x-forwarded-for entry", () => {
  const request = new Request("https://example.com/api/auth", {
    headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
  });
  assert.equal(clientKey(request), "203.0.113.7");
});

test("clientKey degrades to a shared bucket rather than to nothing", () => {
  const request = new Request("https://example.com/api/auth");
  assert.equal(clientKey(request), "unknown");
});

test("timingSafeEqual matches only on exact equality", () => {
  assert.equal(timingSafeEqual("hunter2", "hunter2"), true);
  assert.equal(timingSafeEqual("hunter2", "hunter3"), false);
  assert.equal(timingSafeEqual("hunter2", "hunter"), false);
  assert.equal(timingSafeEqual("", ""), true);
  assert.equal(timingSafeEqual("", "x"), false);
});

test("timingSafeEqual handles multi-byte characters", () => {
  assert.equal(timingSafeEqual("pässwörd", "pässwörd"), true);
  assert.equal(timingSafeEqual("pässwörd", "passwörd"), false);
});
