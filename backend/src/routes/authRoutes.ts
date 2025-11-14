import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
  oauthCallback,
  switchRole,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import passport, { oauthStrategies } from '../config/passport';
import { documentUpload } from '../utils/upload';

const router = express.Router();

// Traditional auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/switch-role', protect, documentUpload.single('licenseDocument'), switchRole);

// Get available OAuth providers
router.get('/oauth/providers', (req, res) => {
  res.json({
    providers: {
      google: oauthStrategies.google,
      facebook: oauthStrategies.facebook,
      apple: oauthStrategies.apple,
    },
  });
});

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
