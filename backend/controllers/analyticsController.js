import { getUserStats } from "../services/analyticsService.js";

/**
 * Handles fetching aggregate usage metrics for the logged-in user.
 * Route: GET /api/auth/analytics
 */
export const getMyAnalytics = async (req, res) => {
  const stats = await getUserStats(req.user._id);
  res.json({
    success: true,
    data: stats,
  });
};
