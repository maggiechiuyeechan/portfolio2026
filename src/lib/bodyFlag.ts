/**
 * Reference-counted `data-*` flags on <body>.
 *
 * Scenes previously did this by hand:
 *
 *   const previous = document.body.style.cursor;
 *   document.body.style.cursor = "pointer";
 *   ...
 *   document.body.style.cursor = previous;   // on cleanup
 *
 * Four scenes each carried a copy, and the save/restore is order-dependent:
 * during a "Surprise me" swap the incoming scene can mount before the
 * outgoing one unmounts, so the outgoing cleanup restores a value that was
 * already replaced and the flag is lost. Counting acquisitions makes the
 * order irrelevant — the flag is present while at least one holder wants it.
 *
 * Styling lives in CSS (see hero.css) rather than inline, so it can be
 * overridden per element instead of blanketing the page.
 */
const counts = new Map<string, number>();

/** Set `data-<name>` on <body>. Returns a release function. */
export function acquireBodyFlag(name: string): () => void {
  if (typeof document === "undefined") return () => {};

  const next = (counts.get(name) ?? 0) + 1;
  counts.set(name, next);
  if (next === 1) document.body.dataset[name] = "";

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const remaining = (counts.get(name) ?? 1) - 1;
    counts.set(name, remaining);
    if (remaining <= 0) {
      counts.delete(name);
      delete document.body.dataset[name];
    }
  };
}
