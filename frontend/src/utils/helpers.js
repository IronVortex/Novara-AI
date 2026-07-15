export const normalizeThreads = (threads = []) =>
  (threads || []).map((thread) => ({
    threadId: thread.threadId,
    title: thread.title,
    updatedAt: thread.updatedAt,
    isPinned: Boolean(thread.isPinned),
    isFavorite: Boolean(thread.isFavorite),
    tags: thread.tags || [],
  }));

export const sortThreads = (threads = []) =>
  [...threads].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
    if (a.isFavorite !== b.isFavorite) return Number(b.isFavorite) - Number(a.isFavorite);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

export const buildShareUrl = (threadId) => `${window.location.origin}/app?thread=${threadId}`;
