import express from 'express';
import { getAdminMetrics } from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/metrics', protect, asyncHandler(getAdminMetrics));

export default router;
