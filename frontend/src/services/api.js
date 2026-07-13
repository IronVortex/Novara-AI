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

export const loginUser = async (payload) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const registerUser = async (payload) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMe = async () => request("/auth/me");

export const logoutUser = async () => request("/auth/logout", { method: "POST" });

export const sendMessage = async (payload) =>
  request("/chats/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getThreads = async () => request("/chats/thread");

export const getThread = async (threadId) => request(`/chats/thread/${threadId}`);

export const deleteThread = async (threadId) =>
  request(`/chats/thread/${threadId}`, { method: "DELETE" });
