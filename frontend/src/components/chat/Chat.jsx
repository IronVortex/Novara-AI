import { useContext } from "react";
import { MyContext } from "../../context/MyContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import Loader from "../common/Loader.jsx";
import { APP_NAME } from "../../constants/index.js";

function Chat({ loading }) {
  const { newChat, prevChats } = useContext(MyContext);

  return (
    <div className="chat-surface">
      {newChat && !prevChats.length ? (
        <div className="empty-state">
          <div className="empty-badge">✦</div>
          <h3>Start your next conversation with {APP_NAME}</h3>
          <p>Ask for ideas, summaries, code help, or a polished strategy.</p>
        </div>
      ) : null}

      <div className="messages-list">
        {(prevChats || []).map((chat, index) => (
          <ChatMessage key={`${chat.role}-${index}`} message={chat} />
        ))}
      </div>

      {loading ? <Loader loading={loading} label="Novara is responding" /> : null}
    </div>
  );
}

export default Chat;
