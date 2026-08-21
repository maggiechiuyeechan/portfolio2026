/**
 * Safari (and some older engines) reject `transform: scale(calc(100cqw / Npx))`,
 * leaving fixed-width demo stages clipped inside overflow:hidden containers.
 * This sets `--demo-scale` from the container width / design width instead.
 *
 * This runs from BaseLayout on page load, which is earlier than the demos'
 * `client:visible` islands hydrate — deliberately, so a demo is already scaled
 * correctly while the user scrolls toward it. The cost is that React hydrates
 * elements carrying an inline `--demo-scale` its own render never produced, so
 * every scaler element below must set `suppressHydrationWarning`.
 */

type ScalerEntry = {
  selector: string;
  designWidth: number | ((node: HTMLElement) => number);
};

const SCALERS: ScalerEntry[] = [
  { selector: ".cu4-demo-frame", designWidth: 871 },
  { selector: ".hsd-pane", designWidth: 430 },
  { selector: ".bluedot-hero-pane.is-report .bluedot-hero-stage", designWidth: 580.917 },
  { selector: ".bluedot-hero-pane.is-flight .bluedot-hero-stage", designWidth: 343.75 },
  {
    // Narrow frames crop a 680px-wide slice starting at 230px — see ClickUpAIDemo.css.
    selector: ".cua-chat-scaler",
    designWidth: () => (window.matchMedia("(max-width: 30rem)").matches ? 680 : 936.667),
  },
  { selector: ".cua-credits-scaler", designWidth: 462.333 },
];

const bound = new WeakMap<HTMLElement, () => void>();

function applyScale(node: HTMLElement, designWidth: number) {
  const container = node.parentElement;
  if (!container || !designWidth) return;

  const width = container.getBoundingClientRect().width;
  node.style.setProperty("--demo-scale", String(width / designWidth));
}

function bindScaler(node: HTMLElement, entry: ScalerEntry) {
  if (bound.has(node)) return;

  const container = node.parentElement;
  if (!container) return;

  const update = () => {
    const designWidth =
      typeof entry.designWidth === "function" ? entry.designWidth(node) : entry.designWidth;
    applyScale(node, designWidth);
  };

  const ro = new ResizeObserver(update);
  ro.observe(container);
  update();

  bound.set(node, () => {
    ro.disconnect();
    node.style.removeProperty("--demo-scale");
  });
}

function scan(root: ParentNode) {
  for (const entry of SCALERS) {
    root.querySelectorAll<HTMLElement>(entry.selector).forEach((node) => {
      bindScaler(node, entry);
    });
  }
}

function refreshChatScalers() {
  const entry = SCALERS.find((item) => item.selector === ".cua-chat-scaler");
  if (!entry) return;

  document.querySelectorAll<HTMLElement>(".cua-chat-scaler").forEach((node) => {
    const designWidth =
      typeof entry.designWidth === "function" ? entry.designWidth(node) : entry.designWidth;
    applyScale(node, designWidth);
  });
}

export function initDemoScale() {
  if (typeof document === "undefined") return;

  scan(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) scan(node);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const mobileChat = window.matchMedia("(max-width: 30rem)");
  mobileChat.addEventListener("change", refreshChatScalers);

  return () => {
    observer.disconnect();
    mobileChat.removeEventListener("change", refreshChatScalers);
    document.querySelectorAll<HTMLElement>("[style*='--demo-scale']").forEach((node) => {
      bound.get(node)?.();
    });
  };
}
