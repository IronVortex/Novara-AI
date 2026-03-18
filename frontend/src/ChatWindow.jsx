import "./ChatWindow.css";
import Chat from "./Chat.jsx"
function ChatWindow(){
    return(
        <div className="chatWindow"> 
        <div className="navbar">
            <span>NOVARA &nbsp;  AI &nbsp; <i class="fa-solid fa-angle-down"></i></span>
            <div className="userIcondiv">
                <i class="fa-solid fa-user"></i>
            </div>
        </div>
        <Chat></Chat>
        <div className="chatInput">
            <div className="userInput">
                 
            </div>

        </div>
        </div>
    )
}

export default ChatWindow;
