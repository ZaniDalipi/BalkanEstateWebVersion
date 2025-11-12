import express from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  markAsRead,
} from '../controllers/conversationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markAsRead);

export default router;
