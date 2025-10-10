import express, { Router } from 'express';
import { saveChat, getChatHistory } from '../controllers/chatController.js';
import { GooglePlaces } from '../controllers/googleplaces.js';
const router = express.Router();
import { getChatByIdController } from '../controllers/chatController.js';

router.get('/session/:chatId', getChatByIdController);

router.post('/save', saveChat);
router.get('/:userId', getChatHistory);


export default router;
