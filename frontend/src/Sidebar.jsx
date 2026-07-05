import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";

const API = "http://localhost:5000/api/chats";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch(`${API}/thread`);

      const res = await response.json();

      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`${API}/thread/${newThreadId}`);

      const res = await response.json();

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await fetch(`${API}/thread/${threadId}`, {
        method: "DELETE",
      });

      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img
          src="src/assets/blacklogo.png"
          alt="logo"
          className="logo"
        />

        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread) => (
          <li
            key={thread.threadId}
            onClick={() => changeThread(thread.threadId)}
            className={
              thread.threadId === currThreadId
                ? "highlighted"
                : ""
            }
          >
            {thread.title}

            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>By Afshan ❤️</p>
      </div>
    </section>
  );
}

export default Sidebar;