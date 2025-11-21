import express from 'express';
import multer from 'multer';
import {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
  setPublicKey,
  oauthCallback,
  switchRole,
  requestPasswordReset,
  resetPassword,
  uploadAvatar
} from '../controllers/authController';
import { getUserStats, getAllAgents, syncStats } from '../controllers/userController';
import { protect } from '../middleware/auth';
import passport, { oauthStrategies } from '../config/passport';

// Configure multer for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});


const router = express.Router();

// Traditional auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/set-public-key', protect, setPublicKey);
router.post('/switch-role', protect, switchRole);
router.get('/my-stats', protect, getUserStats);
router.post('/sync-stats', protect, syncStats);
router.get('/agents', getAllAgents);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

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

// Google OAuth routes - only register if Google strategy is configured
if (oauthStrategies.google) {
  router.get(
    '/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
  );
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=google_auth_failed` }),
    oauthCallback
  );
}

// Facebook OAuth routes - only register if Facebook strategy is configured
if (oauthStrategies.facebook) {
  router.get(
    '/facebook',
    passport.authenticate('facebook', { session: false, scope: ['email'] })
  );
  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=facebook_auth_failed` }),
    oauthCallback
  );
}

// Apple OAuth routes - only register if Apple strategy is configured
if (oauthStrategies.apple) {
  router.get(
    '/apple',
    passport.authenticate('apple', { session: false })
  );
  router.get(
    '/apple/callback',
    passport.authenticate('apple', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=apple_auth_failed` }),
    oauthCallback
  );
}

export default router;
