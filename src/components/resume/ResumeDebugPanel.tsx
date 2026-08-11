/**
 * Floating control panel for /resume: toggles the red content-grid overlay
 * and inspects the design system tokens.
 *
 * Token values are read from the live CSS custom properties at mount rather
 * than duplicated here, so the panel always shows what tokens.css actually
 * ships (figma-token-sync rule: tokens are the single source of truth).
 */
import { useEffect, useState } from "react";

const GRAY_TOKENS = Array.from({ length: 12 }, (_, i) => `--color-gray-${i + 1}`);

const SEMANTIC_COLOR_TOKENS = [
  "--color-background-main",
  "--color-background-hover",
  "--color-background-pressed",
  "--color-background-inverse",
  "--color-typography-content-default",
  "--color-typography-content-secondary",
  "--color-typography-content-tertiary",
  "--color-border-default",
  "--color-border-low-contrast",
];

const SPACING_TOKENS = [
  "--spacing-05",
  "--spacing-1",
  "--spacing-2",
  "--spacing-3",
  "--spacing-4",
  "--spacing-5",
  "--spacing-6",
  "--spacing-15",
  "--spacing-30",
];

const RADIUS_TOKENS = [
  "--radius-1",
  "--radius-2",
  "--radius-3",
  "--radius-4",
  "--radius-6",
  "--radius-full",
];

const LAYOUT_TOKENS = [
  "--grid-columns",
  "--grid-gutter",
  "--content-max-width",
  "--single-column-break",
];

const TYPE_STYLES = [
  { class: "text-display", label: "display" },
  { class: "text-title", label: "title" },
  { class: "text-heading", label: "heading" },
  { class: "text-body", label: "body" },
  { class: "text-caption", label: "caption" },
] as const;

const TYPE_CSS_PROPS = [
  "font-family",
  "font-weight",
  "font-variation-settings",
  "font-size",
  "line-height",
  "letter-spacing",
  "text-transform",
  "color",
] as const;

const ALL_TOKENS = [
  ...GRAY_TOKENS,
  ...SEMANTIC_COLOR_TOKENS,
  ...SPACING_TOKENS,
  ...RADIUS_TOKENS,
  ...LAYOUT_TOKENS,
];

function readTypeCss(className: string): string {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = "Aa";
  el.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;";
  document.body.appendChild(el);
  const styles = getComputedStyle(el);
  const lines: string[] = [];
  for (const prop of TYPE_CSS_PROPS) {
    const value = styles.getPropertyValue(prop).trim();
    if (!value || value === "normal" || value === "none") continue;
    lines.push(`${prop}: ${value};`);
  }
  document.body.removeChild(el);
  return lines.join("\n");
}

function useTokenValues() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const token of ALL_TOKENS) {
      next[token] = styles.getPropertyValue(token).trim();
    }
    setValues(next);
  }, []);

  return values;
}

function useTypeCss() {
  const [cssByClass, setCssByClass] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const style of TYPE_STYLES) {
      next[style.class] = readTypeCss(style.class);
    }
    setCssByClass(next);
  }, []);

  return cssByClass;
}

function TokenRow({ token, value, swatch }: { token: string; value: string; swatch?: boolean }) {
  return (
    <div className="resume-panel-row">
      {swatch && (
        <span
          className="resume-panel-swatch"
          style={{ background: `var(${token})` }}
          aria-hidden="true"
        />
      )}
      <code className="resume-panel-token">{token.replace(/^--/, "")}</code>
      <code className="resume-panel-value">{value}</code>
    </div>
  );
}

function TypeStyleRow({ className, css }: { className: string; css: string }) {
  return (
    <div className="resume-panel-type-row" tabIndex={0}>
      <code className="resume-panel-token">{className}</code>
      <span className={`${className} resume-panel-type-sample`} aria-hidden="true">
        Aa
      </span>
      {css && (
        <pre className="resume-panel-type-tooltip" role="tooltip">
          {css}
        </pre>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-panel-section">
      <h3 className="text-caption resume-panel-section-title">{title}</h3>
      {children}
    </section>
  );
}

export default function ResumeDebugPanel() {
  const [open, setOpen] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const tokens = useTokenValues();
  const typeCss = useTypeCss();

  useEffect(() => {
    document
      .querySelector(".resume-content")
      ?.classList.toggle("resume-grid-debug", gridOn);
  }, [gridOn]);

  return (
    <div className="resume-panel">
      {open && (
        <div className="resume-panel-body">
          <label className="resume-panel-row resume-panel-control">
            <input
              type="checkbox"
              checked={gridOn}
              onChange={(event) => setGridOn(event.target.checked)}
            />
            <span className="text-body">Grid lines</span>
          </label>

          <Section title="Gray scale">
            {GRAY_TOKENS.map((token) => (
              <TokenRow key={token} token={token} value={tokens[token] ?? ""} swatch />
            ))}
          </Section>

          <Section title="Semantic colors">
            {SEMANTIC_COLOR_TOKENS.map((token) => (
              <TokenRow key={token} token={token} value={tokens[token] ?? ""} swatch />
            ))}
          </Section>

          <Section title="Spacing">
            {SPACING_TOKENS.map((token) => (
              <TokenRow key={token} token={token} value={tokens[token] ?? ""} />
            ))}
          </Section>

          <Section title="Radius">
            {RADIUS_TOKENS.map((token) => (
              <TokenRow key={token} token={token} value={tokens[token] ?? ""} />
            ))}
          </Section>

          <Section title="Layout">
            {LAYOUT_TOKENS.map((token) => (
              <TokenRow key={token} token={token} value={tokens[token] ?? ""} />
            ))}
          </Section>

          <Section title="Typography">
            {TYPE_STYLES.map((style) => (
              <TypeStyleRow
                key={style.class}
                className={style.class}
                css={typeCss[style.class] ?? ""}
              />
            ))}
          </Section>
        </div>
      )}

      <button
        type="button"
        className="resume-panel-toggle text-caption"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Grid & tokens"}
      </button>
    </div>
  );
}
