const artwork = "/anthropicxmaggie/slides/task-type-fields/";
const cards = [
  { node: "533:14177", file: "523-14133-clean-shot20261112at60726pm2x1.png", left: 74, top: 383, width: 740, height: 292 },
  { node: "533:14178", file: "523-14133-clean-shot20261112at42737pm2x1.png", left: 88, top: 279, width: 713, height: 499 },
  { node: "533:14179", file: "523-14133-chat-gpt-image-nov132026111026pm1.png", left: 105, top: 195, width: 678, height: 668, imageNode: "533:14180" },
  { node: "533:14181", file: "523-14133-chat-gpt-image-nov132026111008pm1.png", left: 125, top: 80, width: 637, height: 898, imageNode: "533:14182" },
];

const quotes = [
  ["523:14174", "“We tested the function and are happy so far, it helped cleaning up unnecessary custom fields for different task types (in our case project types).”"],
  ["523:14139", "“The Custom Fields by Task Type are working well for us!”"],
  ["523:14138", "“Using this in the beta phase has been a game changer! My team and I absolutely love this feature”"],
  ["523:14175", "“We have been beta testing this feature and can confirm that it significantly advances several of our use cases.”"],
];

export default function DesignCollage() {
  return (
    <div className="axm-feedback-collage" data-node-id="533:14176">
      <div className="axm-feedback-cards axm-image-entrances">
        {cards.map(({ node, file, left, top, width, height, imageNode }) => (
          <div className="axm-feedback-card" data-node-id={node} key={node}
            style={{ left: `${left / 1728 * 100}%`, top: `${top / 1117 * 100}%`, width: `${width / 1728 * 100}%`, height: `${height / 1117 * 100}%` }}>
            <img src={artwork + file} data-node-id={imageNode} alt="" />
          </div>
        ))}
      </div>
      <div className="axm-feedback-quotes" aria-label="Customer feedback quotes" tabIndex={0}>
        <div className="axm-feedback-quote-track" data-node-id="533:14185">
          <div className="axm-feedback-quote-group axm-feedback-quote-repeat" aria-hidden="true">
            {quotes.map(([node, quote]) => <p key={node}>{quote}</p>)}
          </div>
          <div className="axm-feedback-quote-group">
            {quotes.map(([node, quote]) => <p key={node} data-node-id={node}>{quote}</p>)}
          </div>
          <div className="axm-feedback-quote-group axm-feedback-quote-repeat" aria-hidden="true">
            {quotes.map(([node, quote]) => <p key={node}>{quote}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
