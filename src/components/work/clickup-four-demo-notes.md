# ClickUp 4.0 carousel demos — Figma extraction notes (phase 1)

Figma file: `gQLLstE0opbSmfjB462JKq`, section `68:34791`. All four frames are **871×530**
(inner "Full Illustration" is 871.25×510; the bottom ~20px of the 530 frame is empty).
Confirmed dimensions match the plan.

## Where the raw extraction lives

- `clickup-four-demo-refs/` (same directory) holds the raw `get_design_context` outputs.
  Files ending in `-map.txt` are **metadata trees** (node ids + names + exact x/y/w/h — the frame was
  too large for full code); the others are **full React+Tailwind reference code** with exact colors,
  fonts, and text. Any node id can be re-queried with `get_design_context` for full code if needed.
- Downloaded assets: `src/assets/clickup-four-demo/` — **174 files** (126 svg, 4 png, 5 jpg + batch 2),
  plus `asset-manifest.json` mapping every local filename → original Figma asset URL. Naming:
  `<source>-<figma-const-name>.<ext>` where source ∈ `docs`, `tasks-sidebar`, `tasks-done`, `tasks-ip`,
  `cal-*`, `wb-*`, `gab-*`, `rail-*` (see `inline-snippets.md` for the inline-node mappings).
  SVG format was preserved wherever Figma served SVG; intrinsic dimensions untouched.

## Frame chrome shared by all four slides

Each frame = dark backdrop with black left rail (40.8px wide, radius 6.8), top "Gab" bar
(WS picker "Mango Inc." / white search pill "Search ⌘K" / profile), and a main app window
(radius ~6.8–10.2, `#f9f9f9`/white). Full chrome markup with exact classes is in `docs-code.txt`
(the only frame that fit in one code response); the Tasks/Whiteboard/Calendar chrome is visually
identical (see `inline-snippets.md` for the Tasks-frame node ids 68:27977 rail, 68:27994 Gab).
NOTE: the 1224×901 app illustration is clipped by the 871.25×510 frame — right sidebar and bottom
favorites bar are cropped out; do not build them.

## 1. Tasks — `68:26758` ("list")

**Important:** the frame contains two full app layers; the *visible* one is the second child
`68:27304` "Chats" (verified against the shipped `public/images/casestudies/Tasks.png`).
Use `tasks-frame-map.txt` lines ~699+ for geometry; ignore the first "List" layer (68:26763).

- Sidebar (code: `tasks-sidebar.txt`, node 68:27766, 197.2×861.9): Home header, Inbox (badge 3),
  My Tasks; Creative Team section (Product Backlog, # Creative, Steph (1), Campaign Agent (3), Igor,
  Vision & Strategy); Spaces: Marketing (selected), Campaigns, Blogs, Brand Assets, Design Workflows,
  Creative Request. Avatars exported (`tasks-sidebar-*.{png,svg}`).
- Main area (metadata: `tasks-main.txt`, node 68:27309): view tabs Chat / Tasks (active) /
  Schedule / Gantt / Customers / + View; breadcrumb "Marketing" ★; column headers
  Name / Assignee / Priority (with "AI" pill) / Team.
- DONE group (code: `tasks-done-table.txt`, node 68:27469, green "DONE" chip, count 5): rows
  Social campaign (Low), Website assets (Urgent, PMM), Landing page (Normal), About page (High),
  Mobile assets (**Urgent**, Design). **Urgent chip styling** is in this file — red flag icon + label,
  copy exactly for the resolved state.
- IN PROGRESS group (node 68:27599, blue "IN PROGRESS" chip, count 3) — key animation rows:
  - Market Research Analysis · avatar `tasks-ip-avatar-court` · Priority cell: text
    **"Prioritizing..."** rendered as gradient text `linear-gradient(to right, #7a28e2, #121212)`
    via background-clip, SF Pro Regular 11.9px / 13.6px, tracking −0.15px · Team tag "Agent"
    (bg `#fceffc`, gradient text `#7a28e2→#c100b6`, SF Pro Medium 510 10.12/11.56).
  - Competitor Benchmarking (subtasks 1) · `tasks-ip-avatar-danila` · "Prioritizing..." · tag "PMM"
    (bg `#ffefef`, text `#c62a2f`).
  - Brand Positioning Strategy (lock, subtasks 5, blocking 1 red) · "Prioritizing..." · tag "Content"
    (bg `#f8f1ee`, text `#7d5e54`).
  - Row: h 30.6px, bottom border 0.85px `#f0f0f0`; priority column w 104.55, px 10.2.
- Hidden layers checked: the frame's two hidden `AI` text layers (68:27305-ish, `name="AI"`) are just
  the small "AI" badge texts, **not** a shimmer state. **Figma contains only the static
  "Prioritizing..." gradient text and, in the DONE group, final Urgent chips. There is no
  Prioritizing→Urgent intermediate/shimmer frame — the shimmer sweep and the resolve transition must
  be inferred (report as inferred timing).** Suggested read: animate a highlight sweep across the
  gradient text, then swap to the Urgent chip copied from the DONE rows.
- Group headers below: TO DO (3), BACKLOG (3) chips (collapsed groups, metadata only).

## 2. Docs — `68:31422` ("doc")

Full code: `docs-code.txt` (single complete dump incl. chrome). Highlights:

- Left sidebar "Pages" tree; center white page (612×564.4 at left calc(50%−66.3px), top 37.4)
  with title **"Onboarding wiki"** (SF Pro Bold 27.2px, #202020), meta row (Fan Lin avatar,
  Contributors avatars, "Last updated at 11:47 am").
- Two-column link lists: **Welcome** (✉️ Letter from the CEO / 💬 Company Story /
  💜 Values and Principles) and **Tools and systems** (👥 Communication / 📁 Project Management /
  🎨 Design/Engineering); headings SF Pro Semibold 15.3px, items SF Pro Medium 13.6/17.
- "Resources" section with a "Design Principles" doc bookmark card + hover preview mock.
- **Collaborator cursors (animation targets):**
  - **Alexandra C.** — flag chip bg `#0b68cb` (azure blue 1000), white SF Pro Medium 8.15px,
    radius 3.745 (square top-left corner), at left 68.85 / top 0 *inside* node 68:31482
    (which sits at left 34.85 / top 131.75 in the page) → beside the **Welcome** heading.
    Caret line node 68:31605 at left 315.35 / top 177.65 (h 17px, asset `docs-vector3671`).
  - **Samuel H.** — identical chip, bg `#6647f0` (cu background/primary), at left 604.35 /
    top 247.35 (page coords), caret node 68:31604 at 604.35 / 256.7 (h 16.15px, asset
    `docs-vector3670`) → beside the right-column headings ("Tools and systems" area /
    Resources column). Verify final target strings against the visual before typing:
    cursors sit next to headings, so type into/extend those heading texts.
- No prototype/motion data present — typing speed and stagger are inferred.

## 3. Whiteboards — `68:28756` ("whiteboard")

- Geometry map: `whiteboard-frame-map.txt`; board content metadata (2400 nodes, dot grid, shapes,
  connectors, text): `whiteboard-canvas.txt` (node 68:28766 — **metadata only**, the board interior
  was too large for code; re-query small subgroups by id as you build).
  There is also a background bitmap `CleanShot...@2x 1` (68:28765) behind the canvas group.
- Floating chrome (code in `inline-snippets.md`): title pill "Priority Mapping" (68:31305),
  avatar pill (68:31287, avatars `wb-avatar-mvd`/`wb-avatar-maggie`), right controls (68:31316),
  Docs Preview Card (68:31190), "Group 1618867116" (68:31222) — the last two are metadata; re-query
  if needed.
- **Collaborator cursors (frame-root, above everything):**
  - `68:31420` "Andrew K." — teal `#12a594` chip, arrow asset `wb-cursor-arrow-a`,
    at x 459 / y 256.35 (73.95×30.87).
  - `68:31421` "Court S." — purple `#a43cb4` chip, arrow `wb-cursor-arrow-b`,
    at x 202.30 / y 239.70.
- AI "Image generation in progress" card `68:31069` at 506.96/244.45 (see `inline-snippets.md`).
- **Blue sticky:** the sticky notes live inside the 68:28766 canvas subtree (metadata only here).
  Locate the existing blue sticky by scanning `whiteboard-canvas.txt` for rounded-rectangles/texts in
  the board area and re-query that subgroup for exact fill/shadow before building the drag+type
  animation. **No drag path or motion data exists in Figma — the drag trajectory, easing, and typing
  cadence are inferred.**

## 4. Calendar — `68:28067`

- Geometry map: `calendar-frame-map.txt`; main area metadata `calendar-main.txt` (68:28075 "middle"),
  days grid metadata `calendar-days.txt` (68:28234).
- Header (code inline, node 68:28123): "Sep 2025" + "AI Notetaker" button (`cal-header-ai-notepad`).
  Sub-header 68:28147 (day/date strip) — metadata only, re-query if needed.
- Time column + **now line** (code captured, node 68:28184): hour labels "8 am"…"11pm"
  (SF Pro Medium 510, 10.727px, `#bbb` for past / `#838383` later). The **now indicator** sits in the
  9-am hour row: red rounded badge `#e5484d` (35.757×~14, radius 595) with white SF Pro Text Medium
  9.833px label **"8:47"**, followed by a 932.376×7.151 line image (asset `cal-now-line.svg`;
  vectors 68:28193/28200/28202/28203 — the line is segmented so it can pass behind/through event
  pills). Whole now-row group node 68:28196, width 964.557.
- **Focused event card** (code captured, node 68:28236, 319.6×215.05 at x 191.49 / y 161.4 in the
  week grid): white, radius 10.2, Google Calendar icon, small grey "Event" label,
  title **"Design Sprint Feedback"** (SF Pro Text Semibold 13.68), dates "14 Sep, 2025 · 9:30 am →
  10:30 am", **"Join Meeting" button** with **Zoom icon `68:28283`** (11.56×11.56, asset
  `cal-event-zoom.svg`) — this is the shake target; attendees (court avatar + memoji + "+3"),
  linked items "App Mentions design", "Mango Technologies Product Design".
- Day columns ("tu" ×7, each 140.48 wide, hour rows 47.38 tall) filled with `subtle-pill` /
  `event-pill` instances (metadata w/ exact x/y/w/h in `calendar-days.txt`). Re-query one
  `subtle-pill` (e.g. 68:28343) and one `event-pill` (68:28393) for their fills when building.
- Animation math: now = 8:47, next event = 9:30. The now line should creep toward the 9:30 event
  slot during the 6s; **no motion data in Figma — speed and the Zoom shake are inferred.**

## Carousel shell (done in phase 1)

- `ClickUpFourCarousel.tsx` now renders four demo components inside `div.cu4-panel[role=tabpanel]`
  (same tabpanel/aria/labeling as the old `<picture>`s). Tabs, `CYCLE_MS = 6000`,
  hover/focus/offscreen pause and reduced-motion handling are untouched.
- Prop contract (see `clickupFourDemoShared.tsx`): `{ active, paused, reducedMotion }`.
  `paused` is `carouselPaused || offscreen`. Run the 6s sequence only while `active && !paused`;
  **restart from the beginning when `active` becomes true** (deterministic behavior chosen in plan).
  With `reducedMotion`, render the completed static state.
- Scaling approach: `.cu4-panel` keeps the old absolute placement/opacity crossfade and has
  `container-type: inline-size` + `aspect-ratio: 871/530` (identical to the previous 2613/1590 ratio,
  so the stage/taupe/noise/radius/shadow presentation is pixel-identical). `.cu4-demo-frame` is a
  fixed **871×530** box scaled with
  `transform: scale(tan(atan2(100cqw, 871px)))`, origin top-left — pure CSS length division, no
  ResizeObserver, no internal reflow. Build all phase-2 demos at exact 871×530 px inside
  `.cu4-demo-frame`.
- Current stubs (`ClickUpFour{Tasks,Docs,Whiteboards,Calendar}Demo.tsx`) render the pre-existing
  static `<picture>` exports via `ClickUpFourStaticPlaceholder` so the site keeps working.

## Fonts

The frames use **SF Pro** exclusively (variants: `SF Pro` Regular/Medium(510)/Semibold(590)/Bold,
`SF Pro Text` Medium/Semibold, `SF Pro Display` Regular; most text uses
`font-variation-settings: "wdth" 100`). **The repo does not ship SF Pro** —
`public/fonts/` has only Aguzzo, Apercu, Bagoss, Geist, and no CSS references SF Pro.
On macOS/iOS the `-apple-system`/`system-ui` stack resolves to SF Pro; elsewhere it will fall back
(metric drift on Windows/Android/Linux). **Decision needed in phase 2:** rely on
`system-ui, -apple-system, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial` (recommended;
SF Pro is not redistributable) — report this as the accepted deviation rather than silently
substituting another shipped font.

## Missing / ambiguous (do not silently approximate)

1. **Tasks:** no shimmer/intermediate "Prioritizing" animation state in Figma — only static gradient
   text; shimmer sweep + resolve-to-Urgent transition are inferred. Urgent chip source: DONE rows.
2. **Docs:** cursors sit beside headings; the exact strings each collaborator "types" are not
   specified in Figma (no alternate text states) — inferred (type the nearby heading/list text).
3. **Whiteboards:** board interior only extracted as metadata (too large for code) — re-query the
   sticky-note subgroup ids from `whiteboard-canvas.txt` during build; drag path inferred; background
   includes a CleanShot bitmap node that was not exported (68:28765) — check visually whether it is
   visible or covered.
4. **Calendar:** sub-header (68:28147), day-column pill fills (subtle-pill/event-pill instances) not
   yet expanded to code; "memoji-1" avatar in the event card and "cu_zeb" profile avatar in the Gab
   bar had no exported bitmap (component instances without image fills in the response).
5. No prototype/motion data exists anywhere in the file — **all timing is inferred**.
6. Asset URLs in the refs dumps expire ~7 days from 2026-07-31; everything referenced has been
   downloaded, but re-queried nodes will return fresh URLs.
