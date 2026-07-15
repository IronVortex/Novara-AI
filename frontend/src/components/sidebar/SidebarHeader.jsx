import { Link } from "react-router-dom";
import { APP_NAME } from "../../constants/index.js";
import Button from "../common/Button.jsx";
import { IconPlus } from "../common/Icons.jsx";

function SidebarHeader({ onNewChat }) {
  return (
    <div className="sidebar-header">
      <Link to="/" className="brand-block" aria-label={`${APP_NAME} home`}>
        <div className="brand-mark">N</div>
        <div>
          <h2>{APP_NAME}</h2>
          <p>Intelligent workspace</p>
        </div>
      </Link>
      <Button className="sidebar-create-btn" onClick={onNewChat}>
        <IconPlus size={16} /> New chat
      </Button>
    </div>
  );
}

export default SidebarHeader;
