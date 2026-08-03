/**
 * Error boundary around a lazily-loaded, decorative subtree.
 *
 * WHY THIS EXISTS
 * <Suspense> handles a lazy chunk that is *pending*. It does nothing for one
 * that *rejects*. The common way to hit that isn't a code bug — it's a stale
 * document: chunk filenames are content-hashed, so a visitor holding an old
 * index.html when a new build ships requests a hash that no longer exists, the
 * dynamic import 404s, and React unwinds to the nearest boundary.
 *
 * With no boundary in the tree, "nearest" is the whole island. On the hero that
 * took the password form down with the decoration and left the visitor staring
 * at an empty page with no way into the site. On /work it takes a case study
 * down with its animation.
 *
 * In both places the same rule applies: the animation is decoration, the copy
 * is the product. So swallow the failure, render nothing (or `fallback`) where
 * the subtree would have been, and leave the rest of the page standing.
 *
 * RESET: this component holds no reset logic on purpose. Callers key the
 * subtree they wrap — HeroShell on `scene-<variantId>-<replayKey>`, the
 * carousel on the slide label — so a swap remounts the boundary and clears any
 * previous failure for free. Rebuilding that inside the class would just be a
 * second, worse copy of a rule React already enforces.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Identifies the subtree in the console message. */
  label: string;
  /** Rendered in place of `children` after a failure. Defaults to nothing. */
  fallback?: ReactNode;
}

interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface it — a silently missing visual is exactly the kind of thing that
    // goes unnoticed for months otherwise.
    console.error(
      `[boundary] "${this.props.label}" failed to render; continuing without it.`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return this.props.fallback ?? null;
  }
}
