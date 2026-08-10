import { useEffect, useState } from "react";
import dayMon from "../../assets/headspace-demo/day-mon.png";
import dayTue from "../../assets/headspace-demo/day-tue.png";
import dayWed from "../../assets/headspace-demo/day-wed.png";
import fpGroup7 from "../../assets/headspace-demo/fp-group7.png";
import rfTop from "../../assets/headspace-demo/rf-top.png";
import rfLowerBg from "../../assets/headspace-demo/rf-lower-bg.png";
import rfDaily from "../../assets/headspace-demo/rf-daily.png";
import rfBottom from "../../assets/headspace-demo/rf-bottom.png";

const DAYS = [
  { label: "MON", caption: "Jammin\u2019", img: dayMon, imgLeft: 32, imgTop: 218, imgW: 80.93, imgH: 95.84, center: 72.5 },
  { label: "TUE", caption: "Stressed", img: dayTue, imgLeft: 131, imgTop: 218, imgW: 62, imgH: 95.84, center: 161.5 },
  { label: "WED", caption: "Productive \u{1F4AA}", img: dayWed, imgLeft: 207, imgTop: 219, imgW: 81.32, imgH: 90.79, center: 248 },
  { label: "THU", caption: "I got this!", img: dayWed, imgLeft: 298, imgTop: 219, imgW: 81.32, imgH: 90.79, center: 338.5 },
];

/**
 * The "week's reflective moments" front-page screen (Figma 2408:6499),
 * with a staggered entrance animation. Playback is driven by the `live`
 * prop from the parent hero.
 *
 * Once live has fired, keep `is-revealed` so the mid-content (which starts at
 * opacity 0) never snaps back to a blank phone if the intersection observer
 * flickers — chrome (top/bottom) is always painted, so that read as "broken".
 */
export default function HeadspaceReflectionDemo({ live }: { live: boolean }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (live) setRevealed(true);
  }, [live]);

  return (
    <div
      className={`hsd-phone hsr-phone${live ? " is-live" : ""}${revealed ? " is-revealed" : ""}`}
      aria-hidden="true"
    >
      <img className="hsr-top" src={rfTop.src} alt="" />
      <p className="hsr-greeting hsr-in hsr-in-0">Happy Friday, Maggie!</p>

      <div className="hsr-card hsr-in hsr-in-1">
        <p className="hsr-card-title">Your week&rsquo;s reflective moments</p>
      </div>

      {DAYS.map((day, index) => (
        <div key={day.label} className={`hsr-day hsr-in hsr-in-day-${index}`}>
          <p className="hsr-day-label" style={{ left: day.center }}>
            {day.label}
          </p>
          <img
            src={day.img.src}
            alt=""
            style={{ left: day.imgLeft, top: day.imgTop, width: day.imgW, height: day.imgH }}
          />
          <p className="hsr-day-caption" style={{ left: day.center }}>
            {day.caption}
          </p>
        </div>
      ))}

      <p className="hsr-summary hsr-in hsr-in-2">
        You started off feeling energetic, with a productive second half of the week. Take taking
        time to decompress and relax maybe just what you need this weekend.
      </p>

      <div className="hsr-lower hsr-in hsr-in-3">
        <div className="hsr-divider" />
        <p className="hsr-section">Start your day</p>
        <img className="hsr-lower-bg" src={rfLowerBg.src} alt="" />
        <div className="hsr-list-pill" />
        <p className="hsr-list-title">Weekend visualisation</p>
        <img className="hsr-group7" src={fpGroup7.src} alt="" />
        <img className="hsr-daily" src={rfDaily.src} alt="" />
      </div>

      <img className="hsr-bottom" src={rfBottom.src} alt="" />
    </div>
  );
}
