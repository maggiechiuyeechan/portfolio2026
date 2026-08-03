# Inline Figma snippets (nodes queried individually)

These nodes were fetched with `get_design_context` and returned inline (not saved by the tool).
Asset URLs below have been downloaded into `src/assets/clickup-four-demo/` (see mapping in
`../clickup-four-demo-notes.md`). Markup can be re-fetched anytime from Figma file
`gQLLstE0opbSmfjB462JKq` using the node ids.

## Whiteboard collaborator cursor A — node `68:31420` (frame root child, x=459, y=256.35, 73.95x30.87)

- Cursor arrow: 20x20 box, arrow vector 13.067x14 centered (asset `wb-cursor-arrow-a`), rendered with
  overshoot insets `inset-[-26.69%_-42.27%_-46.24%_-33.73%]` (drop shadow baked into SVG).
- Name chip at left:20 top:20, h=24, bg `#12a594` (cu/teal/800), border 1px rgba(0,0,0,0.19),
  radius 2px top-left / 8px elsewhere, padding 6px x 4px,
  shadow `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)`.
- Label: "Andrew K." — SF Pro Text Medium 12px / 16px, white, centered.

## Whiteboard collaborator cursor B — node `68:31421` (x=202.30, y=239.70, same component)

Identical structure; chip bg `#a43cb4` (ai/background/primary-hover); label "Court S."
(asset `wb-cursor-arrow-b`).

## Whiteboard "AI image generating" card — nodes `68:31069`–`68:31073` (x=506.96, y=244.45, 153.12x86.91)

- White card, radius 5.518px, shadow `0 0.85px 1.7px rgba(0,0,0,.05), 0 0 0.85px rgba(0,0,0,.27)`.
- Inner dashed-ish border frame 146.22x80.70 centered, 0.69px solid #f9f9f9, radius 5.518px.
- "brain ai colored" icon 13.6x13.6 at left 68.83 / top 32 (asset `wb-ai-brain-mask` + `wb-ai-brain-vector`,
  plus decorative white radial-gradient shimmer bars — reproducible as inline SVG data URIs; see raw
  transcript if pixel-level parity of the shimmer is needed).
- Caption: "Image generation in progress" — SF Pro Regular 8px / 13.602px, #838383,
  left calc(50%-54.73px), top 49.51.
- NOTE: this is the AI card, NOT the blue sticky. Blue stickies live inside `whiteboard-canvas.txt`
  (node 68:28766 subtree) — search for sticky fill colors there.

## Whiteboard floating title bar — node `68:31305` (x=6.8, y=6.8, 156.2x27.6)

White pill, radius 5.95, drop shadow `0 0 0.425px rgba(0,0,0,.27), 0 0.85px 0.85px rgba(0,0,0,.05)`.
Contents: `view-whiteboard-filled` icon 13.6 (asset `wb-title-icon`), title "Priority Mapping"
(SF Pro Text Semibold 11.9/13.6 #202020, tracking -0.1275px), favorite star icon (asset
`wb-title-fav`) + chevron-down (asset `wb-title-chevron`).

## Whiteboard right controls — node `68:31316` (x=998.9, y=6.8, 158.79x27.6)

White pill (same radius/shadow) with buttons: users icon + "Share" (SF Pro Medium 11.9 #646464),
ellipsis, comment (active state bg rgba(0,0,0,0.06)), expand, close. Assets `wb-right-users`,
`wb-right-ellipsis`, `wb-right-comment`, `wb-right-expand`, `wb-right-close`. Icon size 13.6, padding 5.1.

## Whiteboard avatar pill — node `68:31287` (x=612, y=6.8, 196.19x27.6)

White pill: avatar stack (17px round avatars `wb-avatar-mvd`, `wb-avatar-maggie`, 1.7px white borders,
-3.4px overlap), then Share / ellipsis / comment / expand / close buttons (assets `wb-btnbar-*`).

## Tasks left rail — node `68:27977` (black rounded 40.8x861.9, radius 6.8)

Top stack (gap 6.8, from y 6.8): Home item with conic-gradient glow blur behind (decorative,
data-URI in transcript), icon assets `rail-home`, `rail-frame1618872783`, `rail-brain-ai`,
`rail-nine-dots` (27.2px icon tiles, 17px glyphs). Bottom: `rail-add-user` + "Invite" label
(SF Pro Text Semibold 8.5px white) and `rail-question`.

## Tasks top bar (Gab) — node `68:27994` (1224x23.8 at y=5.1)

- Left: WS Picker pill bg rgba(0,0,0,0.06) radius 5.1 — logo 15.3px white tile (mask-composited
  assets `gab-ws-mask-a/b`, `gab-ws-logo`, `gab-ws-overlay`), label "Mango Inc."
  (SF Pro Text Semibold 11.9 #202020) + chevron `gab-chevron` 11.9px.
- Center: search rolodex pill white, x=379.1, 228.65x23.8, radius 37.4,
  shadow `0 0 0.85px rgba(0,0,0,.27), 0 0.85px 1.7px rgba(0,0,0,.05)`.
  "Search ⌘K" (SF Pro Medium 510, 11.9, #8d8d8d; ⌘K in #bbb) + search icon `gab-search`.
  Hidden rotating AI suggestions ("Summarize task", "Find similar", "Create update",
  "Generate subtasks") sit below with icon assets `gab-summarize`, `gab-find`, `gab-stroke`+`gab-improve`,
  `gab-subtask` and the animated `gab-brain-mask`/`gab-brain-vector` brain icon.
- Right: add-task `gab-add-task`, edit `gab-edit`, brain `gab-brain-union`, rotated ellipsis
  `gab-ellipsis`, then Profile pill (#f9f9f9, radius 100) with cu_zeb avatar (image not exported — avatar
  bitmap missing, see notes) + online indicator `gab-indicator-bg`/`gab-indicator` + chevron `gab-profile-chevron`.
- Same chrome also appears with full markup in `docs-code.txt` (different node ids, same visuals).
