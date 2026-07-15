import Thread from '../models/Thread.js';

/**
 * Full-text search across user's threads and messages.
 * GET /api/chats/search?q=query
 */
export const searchChats = async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const threads = await Thread.find({
    userId: req.user._id,
    $or: [
      { title: { $regex: regex } },
      { 'messages.content': { $regex: regex } },
    ],
  })
    .select('threadId title lastMessage updatedAt messages')
    .limit(20)
    .lean();

  const results = threads.map((t) => {
    // Find first matching message snippet
    const matchingMsg = t.messages?.find((m) => regex.test(m.content));
    return {
      threadId: t.threadId,
      title: t.title,
      snippet: matchingMsg?.content?.slice(0, 120) || t.lastMessage || '',
      updatedAt: t.updatedAt,
    };
  });

  res.json({ success: true, results });
};
