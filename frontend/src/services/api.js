import { API_BASE_URL } from "../constants/index.js";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

export const sendMessage = async (payload) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getThreads = async () => request("/thread");

export const getThread = async (threadId) => request(`/thread/${threadId}`);

export const deleteThread = async (threadId) =>
  request(`/thread/${threadId}`, { method: "DELETE" });
