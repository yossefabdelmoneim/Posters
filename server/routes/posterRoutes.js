import express from 'express';
import { getAllPosters, getPosterById, getPostersByCategory } from '../controllers/posterController.js';
const router = express.Router();

router.get('/', getAllPosters);
router.get('/:id', getPosterById);
router.get('/category/:categoryId', getPostersByCategory);

export default router;
