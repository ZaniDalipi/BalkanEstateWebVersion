import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { IUser } from '../models/User';
import crypto from 'crypto';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: role || 'buyer',
    });

    // Generate token
    const token = generateToken(String(user._id));

    res.status(201).json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    // Check if either email or phone is provided
    if (!email && !phone) {
      res.status(400).json({ message: 'Email or phone number is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (phone) {
      user = await User.findOne({ phone: phone.trim() });
    }

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      res.status(401).json({
        message: 'This account uses social login. Please login with your social provider.'
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(String(user._id));

    res.json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = req.user as IUser;
    res.json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, phone, city, country, agencyName, licenseNumber, avatarUrl } =
      req.body;

    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (country) user.country = country;
    if (agencyName) user.agencyName = agencyName;
    if (licenseNumber) user.licenseNumber = licenseNumber;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};

// @desc    OAuth callback handler
// @route   GET /api/auth/:provider/callback
// @access  Public
export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;

    if (!user) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
      return;
    }

    // Generate token
    const token = generateToken(String(user._id));

    // Redirect to frontend with token and user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userData = encodeURIComponent(JSON.stringify({
      id: String(user._id),
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      agencyName: user.agencyName,
      agentId: user.agentId,
      licenseNumber: user.licenseNumber,
      isSubscribed: user.isSubscribed,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
    }));

    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userData}`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
      return;
    }

    // Check if user is a local auth user (has password)
    if (user.provider !== 'local' || !user.password) {
      res.status(400).json({
        message: 'This account uses social login. Password reset is not available.'
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await user.save();

    // In a real application, you would send an email here
    // For now, we'll return the token in the response (ONLY FOR DEVELOPMENT)
    // TODO: Implement email sending service
    console.log('Password reset token:', resetToken);
    console.log('Reset URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      // ONLY FOR DEVELOPMENT - Remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Generate new auth token
    const authToken = generateToken(String(user._id));

    res.json({
      message: 'Password reset successful',
      token: authToken,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};