import { useEffect, useRef, useState } from "react";
import type { ClickUpFourDemoProps } from "./clickupFourDemoShared";
import ClickUpFourGabBar from "./ClickUpFourGabBar";
import "./ClickUpFourDocsDemo.css";

// Avatars
import avatarLin from "../../assets/clickup-four-demo/docs-lin.png";
import avatarMaggie from "../../assets/clickup-four-demo/docs-maggie.png";
import avatarIgor from "../../assets/clickup-four-demo/docs-igor.jpg";
import avatarSteph from "../../assets/clickup-four-demo/docs-steph.jpg";
// Breadcrumb / header icons
import teamIcons from "../../assets/clickup-four-demo/docs-group1618870335.svg";
import folderArea from "../../assets/clickup-four-demo/docs-area.svg";
import folderFill from "../../assets/clickup-four-demo/docs-fill.svg";
import viewDocFill from "../../assets/clickup-four-demo/docs-fill1.svg";
import favoritedFill from "../../assets/clickup-four-demo/docs-fill2.svg";
// Page
import dividerDot from "../../assets/clickup-four-demo/docs-divider.svg";
import dividerDot2 from "../../assets/clickup-four-demo/docs-divider1.svg";
import textFileIcon from "../../assets/clickup-four-demo/docs-text-file-text-common-file.svg";
// Sidebar
import sideDocFill from "../../assets/clickup-four-demo/docs-fill14.svg";
import sideHelpDocFill from "../../assets/clickup-four-demo/docs-fill15.svg";
import sideGitMergeFill from "../../assets/clickup-four-demo/docs-fill16.svg";
import sideDocFill2 from "../../assets/clickup-four-demo/docs-fill17.svg";
import sideUniversityFill from "../../assets/clickup-four-demo/docs-fill18.svg";
import sideAddFill from "../../assets/clickup-four-demo/docs-fill19.svg";
import sideArchiveFill from "../../assets/clickup-four-demo/docs-fill20.svg";
import sideIndent from "../../assets/clickup-four-demo/docs-indent.svg";
import sideIndent2 from "../../assets/clickup-four-demo/docs-indent1.svg";
// Rail
import railHome from "../../assets/clickup-four-demo/docs-home.svg";
import railChat from "../../assets/clickup-four-demo/docs-frame1618872783.svg";
import railBrainAi from "../../assets/clickup-four-demo/docs-brain-ai-outlined.svg";
import railDoc from "../../assets/clickup-four-demo/docs-doc.svg";
import railNineDots from "../../assets/clickup-four-demo/docs-fill21.svg";
const ALEXANDRA_CARET = { color: "#0b68cb", height: 17 };
const SAMUEL_CARET = { color: "#6647f0", height: 16.15 };

/**
 * Typed strings verified against the Figma frame (68:31422): Alexandra C.'s
 * caret (68:31605) lands exactly after the "Welcome" heading (68:31485), and
 * Samuel H.'s caret (68:31604) lands exactly after "Design/Engineering"
 * (68:31495). Figma contains no motion data; all timing below is inferred.
 */
const ALEXANDRA_TEXT = "Welcome";
const SAMUEL_TEXT = "Design/Engineering";
const ALEXANDRA_START_MS = 500;
const ALEXANDRA_CHAR_MS = 90; // done at 1130ms
const SAMUEL_START_MS = 1100;
const SAMUEL_CHAR_MS = 80; // done at 2540ms; final state holds until the 6s cycle ends

function charsAt(elapsed: number, start: number, perChar: number, total: number) {
  if (elapsed <= start) return 0;
  return Math.min(total, Math.floor((elapsed - start) / perChar) + 1);
}

/** Icon image absolutely positioned by fractional inset within its box. */
function Fill({ src, inset }: { src: string; inset: string }) {
  return (
    <div style={{ position: "absolute", inset }}>
      <img alt="" src={src} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

function CollabCursor({
  name,
  flagClass,
  caretColor,
  caretHeight,
}: {
  name: string;
  flagClass: string;
  caretColor: string;
  caretHeight: number;
}) {
  return (
    <span className="cu4docs-cursor">
      <span
        className="cu4docs-caret"
        aria-hidden="true"
        style={
          {
            "--cu4docs-caret-color": caretColor,
            "--cu4docs-caret-h": `${caretHeight}px`,
          } as React.CSSProperties
        }
      />
      <span className={`cu4docs-flag ${flagClass}`}>{name}</span>
    </span>
  );
}

export default function ClickUpFourDocsDemo({ active, paused, reducedMotion }: ClickUpFourDemoProps) {
  const [typed, setTyped] = useState({ a: ALEXANDRA_TEXT.length, s: SAMUEL_TEXT.length });
  const elapsedRef = useRef(0);

  // Restart the sequence whenever the slide becomes active.
  useEffect(() => {
    if (active && !reducedMotion) {
      elapsedRef.current = 0;
      setTyped({ a: 0, s: 0 });
    } else {
      // Inactive or reduced motion: completed static state.
      setTyped({ a: ALEXANDRA_TEXT.length, s: SAMUEL_TEXT.length });
    }
  }, [active, reducedMotion]);

  // Drive typing with rAF; elapsed time only advances while running.
  useEffect(() => {
    if (!active || paused || reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const a = charsAt(elapsedRef.current, ALEXANDRA_START_MS, ALEXANDRA_CHAR_MS, ALEXANDRA_TEXT.length);
      const s = charsAt(elapsedRef.current, SAMUEL_START_MS, SAMUEL_CHAR_MS, SAMUEL_TEXT.length);
      setTyped((prev) => (prev.a === a && prev.s === s ? prev : { a, s }));
      if (a < ALEXANDRA_TEXT.length || s < SAMUEL_TEXT.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, reducedMotion]);

  const rootClass = `cu4docs-root${paused ? " is-paused" : ""}${reducedMotion || !active ? " is-static" : ""}`;

  return (
    <div className="cu4-demo-frame">
      <div className={rootClass} aria-hidden="true">
        <div className="cu4docs-surface">
          {/* Main app window */}
          <div className="cu4docs-app">
            <div className="cu4docs-appbg">
              <div className="cu4docs-breadcrumbs">
                {/* team space icon */}
                <div style={{ padding: 3.4 }}>
                  <div className="cu4docs-icon-13">
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 11.9,
                        height: 11.9,
                        borderRadius: 3.245,
                        background: "#e5484d",
                        border: "0.992px solid #e5484d",
                      }}
                    >
                      <div style={{ position: "absolute", inset: "calc(25% - 0.5px)" }}>
                        <Fill src={teamIcons.src} inset="0 -2.61% 0 -3.64%" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cu4docs-crumb-sep">/</div>
                {/* folder icon */}
                <div style={{ padding: 3.4 }}>
                  <div className="cu4docs-icon-13">
                    <Fill src={folderArea.src} inset="46% 16.67% 20.89% 16.72%" />
                    <Fill src={folderFill.src} inset="8.33% 8.33% 12.56% 8.33%" />
                  </div>
                </div>
                <div className="cu4docs-crumb-sep">/</div>
                {/* current doc */}
                <div style={{ display: "flex", alignItems: "center", gap: 3.4, padding: 3.4 }}>
                  <div className="cu4docs-icon-13">
                    <Fill src={viewDocFill.src} inset="8.44% 13.29% 8.44% 13.3%" />
                  </div>
                  <p className="cu4docs-t-semibold-11">Crew Central</p>
                </div>
                {/* favorited star */}
                <div style={{ padding: 3.4 }}>
                  <div className="cu4docs-icon-13">
                    <Fill src={favoritedFill.src} inset="9.82% 8.15% 9.76% 8.15%" />
                  </div>
                </div>
              </div>
            </div>

            {/* Left sidebar */}
            <div className="cu4docs-sidebar">
              <div style={{ display: "flex", flexDirection: "column", gap: 1.7, width: "100%" }}>
                <div className="cu4docs-pages-heading">
                  <p>Pages</p>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item is-selected">
                    <div className="cu4docs-icon-13">
                      <Fill src={sideDocFill.src} inset="7.24% 12.5%" />
                    </div>
                    <p>Onboarding wiki</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item">
                    <div className="cu4docs-icon-13">
                      <Fill src={sideHelpDocFill.src} inset="8.33% 12.46% 8.46% 12.5%" />
                    </div>
                    <p>Core Values</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-indent" style={{ width: 20.4 }}>
                    <img alt="" src={sideIndent.src} />
                  </div>
                  <div className="cu4docs-side-item">
                    <div className="cu4docs-icon-13" style={{ transform: "scaleY(-1)" }}>
                      <Fill src={sideGitMergeFill.src} inset="6.25% 12.5%" />
                    </div>
                    <p>Who we are</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-indent" style={{ width: 40.8 }}>
                    <img alt="" src={sideIndent2.src} />
                  </div>
                  <div className="cu4docs-side-item">
                    <div className="cu4docs-icon-13">
                      <Fill src={sideDocFill2.src} inset="7.24% 12.5%" />
                    </div>
                    <p>Company Pillars</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item">
                    <span>⭐️</span>
                    <p>Benefits</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item">
                    <span>🎢</span>
                    <p>Payroll</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item">
                    <div className="cu4docs-icon-13">
                      <Fill src={sideUniversityFill.src} inset="12.32% 4.21% 7.88% 4.17%" />
                    </div>
                    <p>Office Locations</p>
                  </div>
                </div>
                <div className="cu4docs-side-row">
                  <div className="cu4docs-side-item" style={{ padding: "5.1px 5.1px 5.1px 6.8px", color: "#8d8d8d", letterSpacing: "-0.15px" }}>
                    <div className="cu4docs-icon-13">
                      <Fill src={sideAddFill.src} inset="16.67% 16.69% 16.69% 16.67%" />
                    </div>
                    <p>Add page</p>
                  </div>
                </div>
              </div>
              <div className="cu4docs-side-row" style={{ position: "absolute", bottom: 6.8, left: 0, width: 272 }}>
                <div className="cu4docs-side-item" style={{ padding: "5.1px 5.1px 5.1px 6.8px", color: "#8d8d8d", letterSpacing: "-0.15px" }}>
                  <div className="cu4docs-icon-13">
                    <Fill src={sideArchiveFill.src} inset="12.5% 8.33% 8.85% 8.33%" />
                  </div>
                  <p>57 Archived</p>
                </div>
              </div>
            </div>

            {/* Doc page */}
            <div className="cu4docs-page">
              <div className="cu4docs-page-heading">
                <div style={{ height: 34, flexShrink: 0 }} />
                <div style={{ width: 557.6, paddingTop: 3.4 }}>
                  <div style={{ padding: 3.4 }}>
                    <p className="cu4docs-title">Onboarding wiki</p>
                  </div>
                </div>
                <div className="cu4docs-meta">
                  <div style={{ display: "flex", alignItems: "center", gap: 3.4, padding: "1.7px 3.4px 1.7px 1.7px" }}>
                    <div className="cu4docs-avatar-17">
                      <img alt="" src={avatarLin.src} />
                    </div>
                    <p className="cu4docs-meta-text">Fan Lin</p>
                  </div>
                  <img alt="" src={dividerDot.src} width={8.5} height={20.4} />
                  <div style={{ display: "flex", alignItems: "center", gap: 3.4, padding: "1.7px 3.4px 1.7px 1.7px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {/* 68:31541 — every photo is 17 and the white ring is drawn
                          outside it, so -2.75 puts the photo centres 14.25 apart. */}
                      <div className="cu4docs-avatar-17 is-ringed" style={{ marginRight: -2.75, zIndex: 3 }}>
                        <img alt="" src={avatarMaggie.src} />
                      </div>
                      <div className="cu4docs-avatar-17 is-ringed" style={{ marginRight: -2.75, zIndex: 2 }}>
                        <img alt="" src={avatarIgor.src} />
                      </div>
                      <div className="cu4docs-avatar-17" style={{ zIndex: 1 }}>
                        <img alt="" src={avatarSteph.src} />
                      </div>
                    </div>
                    <p className="cu4docs-meta-text is-contributors">Contributors</p>
                  </div>
                  <img alt="" src={dividerDot2.src} width={8.5} height={20.4} />
                  <div style={{ padding: 3.4 }}>
                    <p className="cu4docs-meta-text">Last updated at 11:47 am</p>
                  </div>
                </div>
                <div style={{ width: "100%", padding: "6.8px 3.4px" }}>
                  <div style={{ height: 0.85, background: "#f0f0f0" }} />
                </div>
              </div>

              <div className="cu4docs-content">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="cu4docs-col">
                    <div className="cu4docs-col-heading">
                      {ALEXANDRA_TEXT.slice(0, typed.a)}
                      <CollabCursor
                        name="Alexandra C."
                        flagClass="cu4docs-flag-alexandra"
                        caretColor={ALEXANDRA_CARET.color}
                        caretHeight={ALEXANDRA_CARET.height}
                      />
                    </div>
                    <div className="cu4docs-col-items">
                      <p>{"✉️  Letter from the CEO"}</p>
                      <p>{"💬  Company Story"}</p>
                      <p>{"💜  Values and Principles"}</p>
                    </div>
                  </div>
                  <div className="cu4docs-col">
                    <p className="cu4docs-col-heading">Tools and systems</p>
                    <div className="cu4docs-col-items">
                      <p>{"👥  Communication"}</p>
                      <p>{"📁  Project Management"}</p>
                      <p>
                        {"🎨  "}
                        {SAMUEL_TEXT.slice(0, typed.s)}
                        <CollabCursor
                          name="Samuel H."
                          flagClass="cu4docs-flag-samuel"
                          caretColor={SAMUEL_CARET.color}
                          caretHeight={SAMUEL_CARET.height}
                        />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="cu4docs-resources">
                  <p className="cu4docs-resources-heading">Resources</p>
                  <div style={{ paddingTop: 3.4, width: 408 }}>
                    <div className="cu4docs-bookmark">
                      <div className="cu4docs-bookmark-top">
                        <p className="cu4docs-bookmark-title">Design Principles</p>
                        <div className="cu4docs-bookmark-sub">
                          <div style={{ position: "relative", width: 11.9, height: 11.9, flexShrink: 0 }}>
                            <div style={{ position: "absolute", inset: "12.5% 17.61% 12.5% 17.62%" }}>
                              <div style={{ position: "absolute", inset: "-8.33% -9.65%" }}>
                                <img alt="" src={textFileIcon.src} style={{ width: "100%", height: "100%" }} />
                              </div>
                            </div>
                          </div>
                          <p style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span className="cu4docs-bookmark-sub-doc">Doc</span>
                            {" in "}
                            <span
                              style={{
                                textDecoration: "underline dotted",
                                textDecorationColor: "#8d8d8d",
                                textUnderlinePosition: "from-font",
                              }}
                            >
                              Design Team
                            </span>
                          </p>
                        </div>
                        {/* Hover preview mock */}
                        <div className="cu4docs-mock">
                          <div
                            style={{
                              position: "absolute",
                              top: 3.9,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 102.85,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.558,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 6.233,
                                fontWeight: 590,
                                lineHeight: 1.25,
                                letterSpacing: "-0.1247px",
                                color: "#202020",
                              }}
                            >
                              Design Principles
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 1.558 }}>
                              <div
                                className="cu4docs-avatar-17"
                                style={{ width: 3.896, height: 3.896, border: "0.974px solid #fff" }}
                              >
                                <img alt="" src={avatarMaggie.src} />
                              </div>
                              <p style={{ fontSize: 3.117, fontWeight: 510, lineHeight: 1.5, color: "#202020", whiteSpace: "nowrap" }}>
                                Maggie Chan
                              </p>
                              <div style={{ width: 0.39, height: 0.39, borderRadius: 99, background: "#838383" }} />
                              <p style={{ fontSize: 3.117, fontWeight: 400, lineHeight: 1.5, color: "#838383", whiteSpace: "nowrap" }}>
                                Last Updated Today at 9:41 am
                              </p>
                            </div>
                          </div>
                          <div className="cu4docs-mock-body">
                            <p className="is-medium" style={{ marginBottom: 1.169 }}>
                              🌟 Problems Identified
                            </p>
                            <ol start={1} style={{ listStyle: "decimal" }}>
                              <li className="is-medium-item">{"Design Quality: Aesthetics & UX"}</li>
                            </ol>
                            <ul style={{ listStyle: "disc" }}>
                              <li style={{ marginBottom: 0.39 }}>
                                Visual consistency issues (UI polish, fat guy illustrations, outdated visuals)
                              </li>
                              <li style={{ marginBottom: 0.39 }}>
                                {"Can we be sure that UX solves major problems and use cases? "}
                              </li>
                              <li>Lack of systematized feedback (peer review, user testing standards)</li>
                            </ul>
                            <ol start={2} style={{ listStyle: "decimal" }}>
                              <li className="is-medium-item">{"Process & Execution Gaps"}</li>
                            </ol>
                            <ul style={{ listStyle: "disc" }}>
                              <li style={{ marginBottom: 0.39 }}>Projects spinning → no clear scope, timelines, or goals</li>
                              <li style={{ marginBottom: 0.39 }}>Stale projects → lost momentum, unclear priorities</li>
                              <li style={{ marginBottom: 0.39 }}>Design QA issues → not meeting quality bar, rework needed</li>
                              <li style={{ marginBottom: 0.39 }}>No clear kickoff or shared rituals between PM + Design + Eng</li>
                              <li>No source of truth/templates → wasted time, repeated mistakes</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Black left rail */}
          <div className="cu4docs-rail">
            <div className="cu4docs-rail-items">
              <div className="cu4docs-rail-icon is-dim">
                <img alt="" src={railHome.src} />
              </div>
              <div className="cu4docs-rail-icon is-dim">
                <img alt="" src={railChat.src} />
              </div>
              <div className="cu4docs-rail-icon is-dim">
                <img alt="" src={railBrainAi.src} />
              </div>
              <div className="cu4docs-rail-icon" style={{ borderRadius: 100 }}>
                {/* blue glow behind the active Docs icon */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 100,
                    filter: "blur(4.973px)",
                    backgroundImage:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(90deg, rgb(0, 145, 255) 0%, rgb(0, 145, 255) 100%)",
                  }}
                />
                <img alt="" src={railDoc.src} style={{ position: "relative" }} />
              </div>
              <div className="cu4docs-rail-icon is-dim">
                <div style={{ position: "absolute", top: 5.1, left: 5.1, width: 17, height: 17 }}>
                  <Fill src={railNineDots.src} inset="12.5%" />
                </div>
              </div>
            </div>
          </div>

          <ClickUpFourGabBar />
        </div>
      </div>
    </div>
  );
}
