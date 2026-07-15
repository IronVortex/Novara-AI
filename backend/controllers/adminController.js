import User from '../models/User.js';
import Thread from '../models/Thread.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ANALYTICS_FILE = path.join(__dirname, '../../logs/analytics.jsonl');

/**
 * Admin-only: aggregate platform metrics
 * GET /api/admin/metrics
 */
export const getAdminMetrics = async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const [totalUsers, totalThreads] = await Promise.all([
    User.countDocuments(),
    Thread.countDocuments(),
  ]);

  const totalMessages = await Thread.aggregate([
    { $project: { count: { $size: '$messages' } } },
    { $group: { _id: null, total: { $sum: '$count' } } },
  ]);

  // Read analytics log for token/latency data
  let avgLatency = 0;
  let totalTokensUsed = 0;
  let analyticsCount = 0;
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const lines = fs.readFileSync(ANALYTICS_FILE, 'utf-8').split('\n').filter(Boolean);
      analyticsCount = lines.length;
      const parsed = lines.map((l) => JSON.parse(l));
      totalTokensUsed = parsed.reduce((s, e) => s + (e.totalTokens || 0), 0);
      avgLatency = parsed.length > 0
        ? Math.round(parsed.reduce((s, e) => s + (e.latencyMs || 0), 0) / parsed.length)
        : 0;
    }
  } catch { /* ignore */ }

  // Most recent 10 users
  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      totalUsers,
      totalThreads,
      totalMessages: totalMessages[0]?.total || 0,
      totalTokensUsed,
      avgLatencyMs: avgLatency,
      analyticsEvents: analyticsCount,
      recentUsers,
    },
  });
};
