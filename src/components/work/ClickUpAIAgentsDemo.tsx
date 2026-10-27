import "./ClickUpAIDemo.css";
import projectManager from "../../assets/clickup-ai-demo/agent-avatar-project-manager-yellow-grey.webp";
import personalAssistant from "../../assets/clickup-ai-demo/agent-avatar-personal-assistant-purple-grey.webp";
import meetingsManager from "../../assets/clickup-ai-demo/agent-avatar-meetings-manager-blue-grey.webp";

export default function ClickUpAIAgentsDemo() {
  return (
    <div className="cua-agents-demo study-image">
      <picture>
        <source
          type="image/avif"
          srcSet="/images/casestudies/Agents-480.avif 480w, /images/casestudies/Agents-768.avif 768w, /images/casestudies/Agents-948.avif 948w, /images/casestudies/Agents-1387.avif 1387w"
          sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1200px) calc((100vw - 48px) / 2), 462px"
        />
        <source
          type="image/webp"
          srcSet="/images/casestudies/Agents-480.webp 480w, /images/casestudies/Agents-768.webp 768w, /images/casestudies/Agents-948.webp 948w, /images/casestudies/Agents-1387.webp 1387w"
          sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1200px) calc((100vw - 48px) / 2), 462px"
        />
        <img
          src="/images/casestudies/Agents.png"
          width="1387"
          height="1500"
          loading="lazy"
          decoding="async"
          alt="ClickUp Super Agents menu with Project Manager recommendations"
        />
      </picture>
      {/* Positions follow the 1387 × 1500 source image so the avatars scale with it. */}
      {[projectManager, personalAssistant, meetingsManager].map((avatar, index) => (
        <img
          key={avatar.src}
          src={avatar.src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            left: `${315 / 1387 * 100}%`,
            top: `${[784, 882, 980][index] / 1500 * 100}%`,
            width: `${67 / 1387 * 100}%`,
            height: `${67 / 1500 * 100}%`,
            clipPath: "circle(40%)",
            transform: "scale(1.25)",
          }}
        />
      ))}
    </div>
  );
}
