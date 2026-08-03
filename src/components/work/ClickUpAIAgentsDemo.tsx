import "./ClickUpAIDemo.css";

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
    </div>
  );
}
