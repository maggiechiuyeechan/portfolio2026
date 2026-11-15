import meetingAvatar1 from "../../../assets/clickup-ai-demo/chat-avatar-jony.png";
import meetingAvatar2 from "../../../assets/clickup-ai-demo/chat-avatar-mykyta.png";
import meetingAvatar3 from "../../../assets/clickup-ai-demo/chat-avatar-ivan.png";
import meetingAvatar4 from "../../../assets/clickup-ai-demo/chat-avatar-calvin.png";

const imgImage15 = "/anthropicxmaggie/slides/task-type-fields/company-task-view.svg";
const meetingAvatars = [meetingAvatar1, meetingAvatar2, meetingAvatar3, meetingAvatar4];

export default function CompanyLayout() {
  return (
    <div className="axm-fields-layer-1" data-node-id="523:14140" data-name="01 About Maggie">
      <p className="axm-fields-layer-314" data-node-id="523:14147">
        Custom task type layouts - CRM: Company
      </p>
      <div className="axm-fields-layer-318 axm-task-layout-frame" data-node-id="523:14152" data-name="image 15">
        <div className="axm-task-layout-content axm-company-layout-content">
          <img alt="" className="axm-fields-layer-316" src={imgImage15} />
          <span className="axm-company-doc-icon" style={{ top: "3.19%" }} aria-hidden="true">👋</span>
          <span className="axm-company-doc-icon" style={{ top: "4.36%" }} aria-hidden="true">☎️</span>
          {meetingAvatars.map((avatar, index) => (
            <img key={avatar.src} src={avatar.src} alt="" className="axm-company-meeting-avatar"
              style={{ top: `${(869 + index * 78) / 13224 * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
