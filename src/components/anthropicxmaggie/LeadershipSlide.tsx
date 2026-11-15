import { collaboratorAvatarBase, collaborators } from "./collaborators";
import "./LeadershipSlide.css";

const assets = "/anthropicxmaggie/slides/leadership";

const responsibilities = [
  { title: "People & Team management", icon: "people", node: "439:61852" },
  { title: "Design & Research Processes", icon: "processes", node: "439:61859" },
  { title: "Hiring ", icon: "hiring", node: "439:61866" },
  { title: "Cross-Functional Leadership", icon: "cross-functional", node: "439:61879" },
  { title: "Budget & Resources", icon: "budget", node: "439:61886" },
  { title: "Culture & Rituals", icon: "culture", node: "439:61872" },
] as const;

const rituals = [
  ["MON", "Design Weekly Kick-Off", "8:30 AM PST", "Team syncs on priorities, blockers, announcements"],
  ["TUE", "Design System Jam (Optional)", "10:00 AM PST", "Optional attendance: Designers work on a component or app-wide design pattern together"],
  ["WED", "AI Workshop (optional)", "8:45 AM PST", "Optional attendance: A designer presents learnings, challenges, wins frm a project they’ve recently done"],
  ["THU", "Weekly Peer Review", "9:00 AM PST", "Designers break into small groups to work through a design problem they are currently facing"],
  ["FRI", "Quality Fridays, P&D Staff", "9:00 AM PST", "Product Managers, Designers & Researchers do team wide presentations & announcements"],
] as const;

const teamPhotos = [
  ["team-lounge.png", "Team members relaxing together", "440:62311"],
  ["meow-wolf.png", "Team members at Meow Wolf", "440:62314"],
] as const;

const teamDocuments = [
  ["team-workshop.png", "Team workshop board", "440:62324"],
  ["team-notes.png", "Team planning notes", "440:62325"],
  ["product-rollout.png", "Product rollout framework", "441:62332"],
  ["product-health.png", "June 2024 Product Health report", "441:62335"],
] as const;

function Responsibilities() {
  return (
    <div className="axm-leadership axm-leadership-summary" data-node-id="439:61821">
      <h1 data-node-id="439:61819">Building design team foundations 0-1</h1>
      <div className="axm-leadership-cards">
        {responsibilities.map((card) => (
          <article key={card.node} className="axm-leadership-card" data-node-id={card.node}>
            <img className="axm-leadership-icon" src={`${assets}/round-${card.icon}.svg`} alt="" />
            <p>{card.title}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Team() {
  return (
    <div className="axm-leadership" data-node-id="440:61897">
      <h1 data-node-id="440:62103">Our Design and Research Team</h1>
      <div className="axm-leadership-team" data-node-id="440:62023">
        {Object.values(collaborators).map(({ avatar, name, role, city }, index) => (
          <article key={avatar} data-node-id={`440:${62024 + index}`}>
            <img src={`${collaboratorAvatarBase}/${avatar}`} alt="" />
            <div>
              <p className="axm-leadership-bold">{name}</p>
              <p>{role}</p>
              <p className="axm-leadership-muted">{city}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Rituals() {
  return (
    <div className="axm-leadership" data-node-id="440:62104">
      <h1 data-node-id="440:62119">Team rituals</h1>
      <div className="axm-leadership-week">
        {rituals.map(([day, title, time, detail], index) => (
          <article key={day}>
            <p className="axm-leadership-bold" data-node-id={`440:${62234 + index}`}>{day}</p>
            <div className="axm-leadership-ritual" data-node-id={`440:${62239 + 5 * index}`}>
              <p className="axm-leadership-bold">{title}</p>
              <p>{time}</p>
              <p className="axm-leadership-muted">{detail}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Collage({ documents = false }: { documents?: boolean }) {
  const layers = documents ? teamDocuments : teamPhotos;

  return (
    <div className={`axm-leadership axm-leadership-collage axm-image-entrances ${documents ? "axm-leadership-documents" : "axm-leadership-photos"}`}
      data-node-id={documents ? "440:62316" : "440:62269"}>
      {layers.map(([file, alt, node]) => (
        <div className="axm-leadership-layer" data-node-id={node} key={node}>
          <div className="axm-leadership-artwork">
            <img src={`${assets}/${file}`} alt={alt} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeadershipSlide({ number }: { number: number }) {
  switch (number) {
    case 3.2: return <Responsibilities />;
    case 3.3: return <Team />;
    case 3.4: return <Rituals />;
    case 3.5: return <Collage />;
    case 3.6: return <Collage documents />;
    default: return null;
  }
}
