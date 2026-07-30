/**
 * Navigation — desktop sidebar + mobile sticky header with slide-down menu.
 * Single React island: scroll spy, link hover, and mobile toggle.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut, usePrefersReducedMotion } from "../../lib/motion";
import { getStudyScrollAlignTop, scrollToStudyAnchor } from "../../lib/scrollToStudyAnchor";
import AnimatedTextLink from "../ui/AnimatedTextLink";

type Link = { label: string; href: string };

interface Props {
  workLinks: Link[];
  socials: Link[];
  logoSrc: string;
  logoAlt: string;
}

const MOBILE_QUERY = "(max-width: 41.25rem)";

const linkLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Geist, sans-serif",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  width: "fit-content",
  color: "var(--color-typography-content-secondary)",
};

/**
 * Scroll spy via IntersectionObserver.
 *
 * The previous implementation ran on every scroll event and called
 * getBoundingClientRect() once for the nav plus once per work link — six
 * forced layouts per scroll tick with five studies, unthrottled.
 *
 * IntersectionObserver does the same job off the main thread. The rootMargin
 * reproduces the old marker: a section becomes active once its title crosses
 * just below the nav. Top inset is negative down to the nav's bottom edge;
 * bottom is -100% so only titles above the line are ever "intersecting".
 */
function useActiveWorkLink(workLinks: Link[]) {
  const [activeHref, setActiveHref] = useState(() => workLinks[0]?.href ?? "");

  useEffect(() => {
    if (workLinks.length === 0) return;

    // Visible logo only — hidden mobile/desktop twin reports a zero rect.
    const marker = Math.round(getStudyScrollAlignTop());

    const targets = workLinks
      .map((link) => ({ link, el: document.getElementById(link.href.slice(1)) }))
      .filter((entry): entry is { link: Link; el: HTMLElement } => !!entry.el);

    if (targets.length === 0) return;

    // Which titles are currently above the marker line.
    const above = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`;
          if (entry.isIntersecting) above.add(href);
          else above.delete(href);
        }
        // Last one in document order that's above the line wins — same
        // resolution rule as the old loop.
        let current = workLinks[0]!.href;
        for (const { link } of targets) {
          if (above.has(link.href)) current = link.href;
        }
        setActiveHref(current);
      },
      { rootMargin: `-${marker}px 0px -100% 0px`, threshold: 0 },
    );

    for (const { el } of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [workLinks]);

  return activeHref;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    setIsMobile(media.matches);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function AnimatedLink({
  label,
  href,
  active = false,
  onNavigate,
  onWorkLinkClick,
}: Link & {
  active?: boolean;
  onNavigate?: () => void;
  onWorkLinkClick?: (href: string) => void;
}) {
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (href.startsWith("#") && onWorkLinkClick) {
      event.preventDefault();
      onWorkLinkClick(href);
    }
    onNavigate?.();
  };

  return (
    <AnimatedTextLink
      href={href}
      active={active}
      onClick={handleClick}
      hoverSound="tick"
      pressReleaseSound
    >
      {label}
    </AnimatedTextLink>
  );
}

function NavMenu({
  workLinks,
  socials,
  activeHref,
  onNavigate,
  onWorkLinkClick,
}: {
  workLinks: Link[];
  socials: Link[];
  activeHref: string;
  onNavigate?: () => void;
  onWorkLinkClick?: (href: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      {workLinks.length > 0 && (
        <div>
          <p
            style={{
              ...linkLabelStyle,
              margin: 0,
              marginBottom: "var(--spacing-2)",
            }}
          >
            Work
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-2)",
              alignItems: "stretch",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "1px",
                background: "var(--color-border-default)",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {workLinks.map((link) => (
                <AnimatedLink
                  key={link.href}
                  {...link}
                  active={link.href === activeHref}
                  onNavigate={onNavigate}
                  onWorkLinkClick={onWorkLinkClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {socials.map((link) => (
          <AnimatedLink key={link.href} {...link} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

export default function Nav({ workLinks, socials, logoSrc, logoAlt }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHref = useActiveWorkLink(workLinks);

  const closeMenu = () => setMenuOpen(false);

  const navigateToWork = (href: string) => {
    const run = () =>
      scrollToStudyAnchor(href.slice(1), {
        behavior: reducedMotion ? "auto" : "smooth",
      });

    if (menuOpen) {
      closeMenu();
      window.setTimeout(run, reducedMotion ? 0 : 320);
    } else {
      run();
    }
  };

  // Native hash scroll ignores our logo alignment — fix on load and back/forward.
  useEffect(() => {
    const syncHash = () => {
      const anchorId = window.location.hash.slice(1);
      if (!anchorId || !workLinks.some((link) => link.href === `#${anchorId}`)) return;
      scrollToStudyAnchor(anchorId, { behavior: "auto", updateHash: false });
    };

    const id = requestAnimationFrame(() => requestAnimationFrame(syncHash));
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [workLinks]);

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const navSocials: Link[] = [
    { label: "Email", href: "mailto:mach.sq@gmail.com" },
    ...socials.filter((s) => !s.href.startsWith("mailto:")),
  ];

  const logo = (
    <a
      href="/work"
      className="nav-logo"
      style={{ flex: "1 0 0", minWidth: 0 }}
      data-cuelume-hover="tick"
    >
      <img src={logoSrc} alt={logoAlt} width={21} height={17} />
    </a>
  );

  // Both navs render; nav.css decides which is visible at 41.25rem. Gating on
  // isMobile in JS meant the server always emitted the desktop sidebar, so
  // phones painted the wrong nav and swapped it after hydration — a visible
  // flash plus a layout shift. useIsMobile now only closes the menu when the
  // viewport grows past the breakpoint with the panel still open.
  return (
    <>
      <div className="mobile-nav">
        <div className="mobile-nav-bar">
          {logo}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            data-cuelume-toggle
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img
              src={menuOpen ? "/images/icon-close.svg" : "/images/icon-menu.svg"}
              alt=""
              width={16}
              height={16}
            />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              className="mobile-nav-panel"
              initial={reducedMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <div className="mobile-nav-panel-inner">
                <NavMenu
                  workLinks={workLinks}
                  socials={navSocials}
                  activeHref={activeHref}
                  onNavigate={closeMenu}
                  onWorkLinkClick={navigateToWork}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="nav-desktop" aria-label="Main">
        {logo}
        <NavMenu
          workLinks={workLinks}
          socials={navSocials}
          activeHref={activeHref}
          onWorkLinkClick={navigateToWork}
        />
      </nav>
    </>
  );
}
