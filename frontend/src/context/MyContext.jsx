import { useMemo, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { logoutUser } from "../services/api.js";
import { MyContext } from "./MyContext.js";

export { MyContext } from "./MyContext.js";

export function MyContextProvider({ children }) {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("novara-token") || sessionStorage.getItem("novara-token") || null);
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState(null);

  const isAuthenticated = Boolean(authUser && token);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Stateless JWT logout is client-side; ignore network errors.
    }

    localStorage.removeItem("novara-token");
    sessionStorage.removeItem("novara-token");
    setToken(null);
    setAuthUser(null);
    setPrevChats([]);
    setAllThreads([]);
    setAuthReady(true);
    setToast({ type: "success", message: "Signed out successfully" });
  };

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
      authUser,
      setAuthUser,
      token,
      setToken,
      authReady,
      setAuthReady,
      toast,
      setToast,
      isAuthenticated,
      logout,
    }),
    [prompt, reply, currThreadId, prevChats, newChat, allThreads, authUser, token, authReady, toast, isAuthenticated]
  );

  return <MyContext.Provider value={providerValue}>{children}</MyContext.Provider>;
}
