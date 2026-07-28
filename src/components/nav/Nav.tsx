/**
 * Navigation — desktop sidebar + mobile sticky header with slide-down menu.
 * Single React island: scroll spy, link hover, and mobile toggle.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut, usePrefersReducedMotion } from "../../lib/motion";
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
  fontFamily: "Inter, sans-serif",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
  width: "fit-content",
  color: "var(--color-typography-content-secondary)",
};

function getScrollMarker() {
  const nav = document.querySelector(".shell-nav");
  if (nav) return nav.getBoundingClientRect().bottom + 4;
  return 48;
}

function useActiveWorkLink(workLinks: Link[]) {
  const [activeHref, setActiveHref] = useState(() => workLinks[0]?.href ?? "");

  useEffect(() => {
    if (workLinks.length === 0) return;

    const updateActive = () => {
      const marker = getScrollMarker();
      let current = workLinks[0].href;

      for (const link of workLinks) {
        const title = document.getElementById(link.href.slice(1));
        if (title && title.getBoundingClientRect().top <= marker) {
          current = link.href;
        }
      }

      setActiveHref(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("hashchange", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
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
}: Link & { active?: boolean; onNavigate?: () => void }) {
  return (
    <AnimatedTextLink href={href} active={active} onClick={onNavigate}>
      {label}
    </AnimatedTextLink>
  );
}

function NavMenu({
  workLinks,
  socials,
  activeHref,
  onNavigate,
}: {
  workLinks: Link[];
  socials: Link[];
  activeHref: string;
  onNavigate?: () => void;
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

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const navSocials: Link[] = [
    { label: "Email", href: "mailto:mach.sq@gmail.com" },
    ...socials.filter((s) => !s.href.startsWith("mailto:")),
  ];

  const logo = (
    <a href="/work" className="nav-logo" style={{ flex: "1 0 0", minWidth: 0 }}>
      <img src={logoSrc} alt={logoAlt} width={28} height={14} />
    </a>
  );

  if (isMobile) {
    return (
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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <nav className="nav-desktop" aria-label="Main">
      {logo}
      <NavMenu
        workLinks={workLinks}
        socials={navSocials}
        activeHref={activeHref}
      />
    </nav>
  );
}
