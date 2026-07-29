import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Minimal <body> stand-in. bodyFlag only touches document.body.dataset.
const dataset: Record<string, string> = {};
(globalThis as unknown as { document: unknown }).document = {
  body: { dataset },
};

const { acquireBodyFlag } = await import("../src/lib/bodyFlag.ts");

beforeEach(() => {
  for (const key of Object.keys(dataset)) delete dataset[key];
});

test("acquiring sets the flag, releasing removes it", () => {
  const release = acquireBodyFlag("heroInteractive");
  assert.equal(dataset.heroInteractive, "");
  release();
  assert.equal("heroInteractive" in dataset, false);
});

test("the flag survives an overlapping handover", () => {
  // This is the bug the refcount exists for. During a "Surprise me" swap the
  // incoming scene can mount before the outgoing one unmounts; with the old
  // save/restore the outgoing cleanup wiped the incoming scene's cursor.
  const outgoing = acquireBodyFlag("heroInteractive");
  const incoming = acquireBodyFlag("heroInteractive");

  outgoing();
  assert.equal(
    dataset.heroInteractive,
    "",
    "flag must persist while the incoming scene still holds it",
  );

  incoming();
  assert.equal("heroInteractive" in dataset, false);
});

test("releasing twice does not drop another holder's flag", () => {
  const first = acquireBodyFlag("heroInteractive");
  const second = acquireBodyFlag("heroInteractive");

  first();
  first(); // double-invoke, as StrictMode cleanup can do
  assert.equal(dataset.heroInteractive, "");

  second();
  assert.equal("heroInteractive" in dataset, false);
});

test("independent flags do not interfere", () => {
  const a = acquireBodyFlag("heroInteractive");
  const b = acquireBodyFlag("heroSceneFrame");

  a();
  assert.equal("heroInteractive" in dataset, false);
  assert.equal(dataset.heroSceneFrame, "");
  b();
});
