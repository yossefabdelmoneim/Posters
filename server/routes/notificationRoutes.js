import express from 'express';
import { requireAdmin, authenticateToken } from '../middlewares/authMiddleware.js';
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);

export default router;
