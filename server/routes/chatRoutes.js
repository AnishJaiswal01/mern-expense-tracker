import express from 'express';
import protect from '../middleware/auth.js';
import { analyzeChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', protect, analyzeChat);

export default router;
