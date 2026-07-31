/**
 * Error boundary around the lazily-loaded hero scene.
 *
 * WHY THIS EXISTS
 * <Suspense> handles a lazy chunk that is *pending*. It does nothing for one
 * that *rejects*. The common way to hit that isn't a code bug — it's a stale
 * document: scene chunk filenames are content-hashed, so a visitor holding an
 * old index.html when a new build ships requests a hash that no longer exists,
 * the dynamic import 404s, and React unwinds to the nearest boundary.
 *
 * With no boundary in the tree, "nearest" meant the whole HeroRotator island.
 * That takes the password form down with the decoration, and the visitor is
 * left staring at an empty hero with no way into the site.
 *
 * The scenes are decoration. The form is the product. So: swallow the failure,
 * render nothing where the scene would have been, and leave the rest of the
 * hero standing. Every variant renders correctly with no scene — the shell
 * already treats it as optional.
 *
 * RESET: this component holds no reset logic on purpose. HeroShell keys the
 * scene subtree on `scene-<variantId>-<replayKey>`, so a variant swap or a
 * breakpoint replay remounts the boundary and clears any previous failure for
 * free. Rebuilding that inside the class would just be a second, worse copy of
 * a rule React already enforces.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Variant id — for the console message only. */
  label: string;
}

interface State {
  failed: boolean;
}

export default class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface it — a silently missing background is exactly the kind of thing
    // that goes unnoticed for months otherwise.
    console.error(
      `[hero] scene "${this.props.label}" failed to render; continuing without it.`,
      error,
      info.componentStack,
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
