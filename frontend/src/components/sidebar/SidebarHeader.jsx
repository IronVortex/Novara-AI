import { APP_NAME } from "../../constants/index.js";
import Button from "../common/Button.jsx";

function SidebarHeader({ onNewChat }) {
  return (
    <div className="sidebar-header">
      <div className="brand-block">
        <div className="brand-mark">N</div>
        <div>
          <h2>{APP_NAME}</h2>
          <p>Premium AI workspace</p>
        </div>
      </div>
      <Button className="sidebar-create-btn" onClick={onNewChat}>
        + New chat
      </Button>
    </div>
  );
}

export default SidebarHeader;
