import express from 'express';
import { saveChat, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/save', saveChat);
router.get('/:userId', getChatHistory);

export default router;
