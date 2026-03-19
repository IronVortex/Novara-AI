import "./ChatWindow.css";
import Chat from "./Chat.jsx"
function ChatWindow(){
    return(
        <div className="chatWindow"> 
        <div className="navbar">
            <span>NOVARA-AI &nbsp; <i class="fa-solid fa-angle-down"></i></span>
            <div className="userIcondiv">
               <span className="userIcon"><i class="fa-solid fa-user"></i></span> 
            </div>
        </div>
        <Chat></Chat>
        <div className="chatInput">
            <div className="userInput">
                 <input placeholder="Ask Anything...">
                 </input>
                 <div id="submit">
                    <i class="fa-solid fa-paper-plane"></i>
                 </div>
            </div>
            <p className="info">
                Novara AI can make mistakes . Check important information . See cookie preferences .
            </p>
        </div>
        </div>
    )
}

export default ChatWindow;
