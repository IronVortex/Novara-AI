import { GUEST_STORAGE_KEY, EMPTY_THREAD_TITLE } from "../constants/index.js";

const readStore = () => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { threads: [] };
  } catch {
    return { threads: [] };
  }
};

const writeStore = (store) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(store));
};

export const getGuestThreads = () => {
  const store = readStore();
  return (store.threads || []).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
};

export const getGuestThread = (threadId) => {
  return getGuestThreads().find((thread) => thread.threadId === threadId) || null;
};

export const saveGuestThread = ({ threadId, title, messages, isPinned = false, isFavorite = false }) => {
  const store = readStore();
  const index = store.threads.findIndex((thread) => thread.threadId === threadId);
  const next = {
    threadId,
    title: title || messages?.[0]?.content?.slice(0, 60) || EMPTY_THREAD_TITLE,
    messages: messages || [],
    isPinned,
    isFavorite,
    tags: [],
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    store.threads[index] = { ...store.threads[index], ...next };
  } else {
    store.threads.unshift(next);
  }

  writeStore(store);
  return next;
};

export const updateGuestThreadMeta = (threadId, patch) => {
  const store = readStore();
  const index = store.threads.findIndex((thread) => thread.threadId === threadId);
  if (index < 0) return null;
  store.threads[index] = {
    ...store.threads[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store.threads[index];
};

export const deleteGuestThread = (threadId) => {
  const store = readStore();
  store.threads = store.threads.filter((thread) => thread.threadId !== threadId);
  writeStore(store);
};

export const clearGuestThreads = () => {
  writeStore({ threads: [] });
};

export const exportGuestMarkdown = (threadId) => {
  const thread = getGuestThread(threadId);
  if (!thread) return null;
  const markdown = [
    `# ${thread.title}`,
    "",
    ...thread.messages.map((message) => `## ${message.role === "user" ? "You" : "Novara"}\n\n${message.content}`),
  ].join("\n\n");
  return { markdown, title: thread.title, threadId };
};
