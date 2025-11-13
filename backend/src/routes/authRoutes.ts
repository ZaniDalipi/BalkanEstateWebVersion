import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
  oauthCallback,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import passport from '../config/passport';

const router = express.Router();

// Traditional auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=google_auth_failed` }),
  oauthCallback
);

// Facebook OAuth routes
router.get(
  '/facebook',
  passport.authenticate('facebook', { session: false, scope: ['email'] })
);
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=facebook_auth_failed` }),
  oauthCallback
);

// Apple OAuth routes
router.get(
  '/apple',
  passport.authenticate('apple', { session: false })
);
router.get(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=apple_auth_failed` }),
  oauthCallback
);

export default router;
