import { useMemo, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { MyContext } from "./MyContext.js";

export { MyContext } from "./MyContext.js";

export function MyContextProvider({ children }) {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providerValue = useMemo(
    () => ({
      prompt,
      setPrompt,
      reply,
      setReply,
      currThreadId,
      setCurrThreadId,
      prevChats,
      setPrevChats,
      newChat,
      setNewChat,
      allThreads,
      setAllThreads,
    }),
    [prompt, reply, currThreadId, prevChats, newChat, allThreads]
  );

  return <MyContext.Provider value={providerValue}>{children}</MyContext.Provider>;
}
