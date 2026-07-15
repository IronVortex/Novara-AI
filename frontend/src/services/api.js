import { API_BASE_URL } from "../constants/index.js";

const getStoredToken = () =>
  localStorage.getItem("novara-token") || sessionStorage.getItem("novara-token") || null;

const request = async (path, options = {}) => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

const consumeSseStream = async (response, handlers = {}) => {
  const { onChunk, onDone, onError } = handlers;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventBlock of events) {
      const lines = eventBlock.split("\n");
      let eventName = "message";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }

      if (!dataLine) continue;
      const parsed = JSON.parse(dataLine);

      if (eventName === "chunk") onChunk?.(parsed.content);
      if (eventName === "done") onDone?.(parsed);
      if (eventName === "error") onError?.(new Error(parsed.error));
    }
  }
};

export const loginUser = async (payload) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const registerUser = async (payload) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const loginWithFirebase = async (payload) =>
  request("/auth/firebase", { method: "POST", body: JSON.stringify(payload) });

export const getMe = async () => request("/auth/me");
export const logoutUser = async () => request("/auth/logout", { method: "POST" });
export const getModels = async () => request("/auth/models");
export const updateProfile = async (payload) =>
  request("/auth/profile", { method: "PATCH", body: JSON.stringify(payload) });
export const updatePreferences = async (payload) =>
  request("/auth/preferences", { method: "PATCH", body: JSON.stringify(payload) });
export const deleteAccount = async () => request("/auth/account", { method: "DELETE" });
export const clearAllChats = async () => request("/auth/chats", { method: "DELETE" });
export const migrateGuestThreads = async (payload) =>
  request("/auth/migrate-guest", { method: "POST", body: JSON.stringify(payload) });

export const sendMessage = async (payload) =>
  request("/chats/chat", { method: "POST", body: JSON.stringify(payload) });

export const sendMessageStream = async (payload, handlers = {}) => {
  const { onChunk, onDone, onError, signal } = handlers;
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}/chats/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Stream request failed");
  }

  await consumeSseStream(response, { onChunk, onDone, onError });
};

export const sendGuestMessageStream = async (payload, handlers = {}) => {
  const { onChunk, onDone, onError, signal } = handlers;

  const response = await fetch(`${API_BASE_URL}/chats/guest/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Guest stream request failed");
  }

  await consumeSseStream(response, { onChunk, onDone, onError });
};

export const regenerateMessage = async (payload) =>
  request("/chats/regenerate", { method: "POST", body: JSON.stringify(payload) });

export const continueMessage = async (payload) =>
  request("/chats/continue", { method: "POST", body: JSON.stringify(payload) });

export const editMessage = async (payload) =>
  request("/chats/edit", { method: "POST", body: JSON.stringify(payload) });

export const updateMessageMeta = async (payload) =>
  request("/chats/message", { method: "PATCH", body: JSON.stringify(payload) });

export const getThreads = async () => request("/chats/thread");

export const getThread = async (threadId) => request(`/chats/thread/${threadId}`);

export const updateThread = async (threadId, payload) =>
  request(`/chats/thread/${threadId}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteThread = async (threadId) =>
  request(`/chats/thread/${threadId}`, { method: "DELETE" });

export const exportThread = async (threadId) => request(`/chats/thread/${threadId}/export`);

export const uploadFile = async (file) => {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chats/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Upload failed");
  return data;
};
