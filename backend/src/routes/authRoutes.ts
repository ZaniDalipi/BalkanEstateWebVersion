import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
