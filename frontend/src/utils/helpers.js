export const normalizeThreads = (threads = []) =>
  (threads || []).map((thread) => ({
    threadId: thread.threadId,
    title: thread.title,
    updatedAt: thread.updatedAt,
  }));
