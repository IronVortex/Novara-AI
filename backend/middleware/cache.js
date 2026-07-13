const cacheStore = new Map();
const DEFAULT_TTL_MS = 30_000;

export const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const clearCache = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) cacheStore.delete(key);
  }
};
