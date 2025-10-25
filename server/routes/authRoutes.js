// routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser, me } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser); // creates ordinary users only
router.post('/login', loginUser);
router.get('/me', authenticateToken, me);

export default router;