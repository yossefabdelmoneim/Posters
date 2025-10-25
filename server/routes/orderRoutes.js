import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';
import {
    createOrder,
    getMyOrders,
    adminGetOrders,
    adminUpdateOrderStatus,
    getOrderItems
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/my', authenticateToken, getMyOrders);

// admin
router.get('/', authenticateToken, requireAdmin, adminGetOrders);
router.put('/:id', authenticateToken, requireAdmin, adminUpdateOrderStatus);
router.get('/:id/items', authenticateToken, getOrderItems);

export default router;
