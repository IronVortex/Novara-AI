import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "../constants/index.js";
import { logoutUser } from "../services/api.js";
import { firebaseLogout } from "../services/firebase.js";
import { MyContext } from "./MyContext.js";

export { MyContext } from "./MyContext.js";

const loadLocalSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export function MyContextProvider({ children }) {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv4());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("novara-token") || sessionStorage.getItem("novara-token") || null
  );
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [settings, setSettingsState] = useState(loadLocalSettings);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAuthenticated = Boolean(authUser && token);

  const setSettings = (next) => {
    setSettingsState((prev) => {
      const merged = typeof next === "function" ? next(prev) : { ...prev, ...next };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const resetChatState = () => {
    setPrevChats([]);
    setAllThreads([]);
    setPrompt("");
    setReply(null);
    setNewChat(true);
    setCurrThreadId(uuidv4());
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Stateless JWT logout is client-side.
    }
    try {
      await firebaseLogout();
    } catch {
      // Ignore Firebase logout when not configured.
    }

    localStorage.removeItem("novara-token");
    sessionStorage.removeItem("novara-token");
    setToken(null);
    setAuthUser(null);
    resetChatState();
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
      settings,
      setSettings,
      sidebarCollapsed,
      setSidebarCollapsed,
      resetChatState,
    }),
    [
      prompt,
      reply,
      currThreadId,
      prevChats,
      newChat,
      allThreads,
      authUser,
      token,
      authReady,
      toast,
      isAuthenticated,
      settings,
      sidebarCollapsed,
    ]
  );

  return <MyContext.Provider value={providerValue}>{children}</MyContext.Provider>;
}
