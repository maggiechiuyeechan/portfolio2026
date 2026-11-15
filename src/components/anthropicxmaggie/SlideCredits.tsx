import { collaboratorAvatarBase, collaborators, type SlideCredit } from "./collaborators";
import "./SlideCredits.css";

export default function SlideCredits({ credits }: { credits: readonly SlideCredit[] }) {
  return (
    <ul className="axm-slide-credits" aria-label="Collaborator credits">
      {credits.map(({ collaborator, label = "Credit", displayName = collaborator }) => (
        <li key={`${label}:${collaborator}`}>
          <span>{label}: {displayName}</span>
          <img src={`${collaboratorAvatarBase}/${collaborators[collaborator].avatar}`} alt="" />
        </li>
      ))}
    </ul>
  );
}
