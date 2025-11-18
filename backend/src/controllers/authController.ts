import { Request, Response } from 'express';
import User from '../models/User';
import Agent from '../models/Agent';
import Agency from '../models/Agency';
import { generateToken } from '../utils/jwt';
import { IUser } from '../models/User';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

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

    const { name, phone, city, country, agencyName, agentId, licenseNumber, avatarUrl } =
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
    if (agentId) user.agentId = agentId;
    if (licenseNumber) user.licenseNumber = licenseNumber;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    console.log('Profile updated for user:', user._id);
    console.log('Updated fields:', { name, phone, city, country, agencyName, agentId, licenseNumber });

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
        agencyId: user.agencyId,
        agentId: user.agentId,
        licenseNumber: user.licenseNumber,
        licenseVerified: user.licenseVerified,
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

// @desc    Set user's public key for E2E encryption
// @route   POST /api/auth/set-public-key
// @access  Private
export const setPublicKey = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { publicKey } = req.body;

    if (!publicKey) {
      res.status(400).json({ message: 'Public key is required' });
      return;
    }

    // Validate that it's a valid JWK format (basic check)
    try {
      JSON.parse(publicKey);
    } catch (error) {
      res.status(400).json({ message: 'Invalid public key format' });
      return;
    }

    // Update user's public key
    const user = await User.findByIdAndUpdate(
      (req.user as IUser)._id,
      { publicKey },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'Public key set successfully',
      publicKey: user.publicKey,
    });
  } catch (error: any) {
    console.error('Set public key error:', error);
    res.status(500).json({ message: 'Error setting public key', error: error.message });
  }
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

// @desc    Switch user role (with license validation for agent)
// @route   POST /api/auth/switch-role
// @access  Private
export const switchRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { role, licenseNumber, agencyInvitationCode, agentId } = req.body;

    // Validate role
    const validRoles = ['buyer', 'private_seller', 'agent'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If switching to agent and license info is provided, validate and save it
    if (role === 'agent' && licenseNumber && agencyInvitationCode) {
      // Validate license format (basic validation - you can enhance this)
      if (licenseNumber.length < 5) {
        res.status(400).json({
          message: 'License number must be at least 5 characters'
        });
        return;
      }

      // Verify agency invitation code
      const agency = await Agency.findOne({ invitationCode: agencyInvitationCode.toUpperCase() });

      if (!agency) {
        res.status(404).json({
          message: 'Invalid agency invitation code. Please check the code and try again.'
        });
        return;
      }

      // Check if license number is already in use by another agent
      const existingAgent = await Agent.findOne({
        licenseNumber,
        userId: { $ne: user._id },
      });

      if (existingAgent) {
        res.status(400).json({
          message: 'This license number is already registered to another agent'
        });
        return;
      }

      // Generate agent ID if not provided
      const generatedAgentId = agentId || `AG-${Date.now()}`;

      // Update agent-specific fields in User model
      user.licenseNumber = licenseNumber;
      user.agencyName = agency.name; // Use agency name from the verified agency
      user.agentId = generatedAgentId;
      user.licenseVerified = true;
      user.licenseVerificationDate = new Date();
      user.agencyId = agency._id; // Link to agency

      // Create or update Agent record in separate table
      const existingAgentRecord = await Agent.findOne({ userId: user._id });

      if (existingAgentRecord) {
        // Update existing agent record
        existingAgentRecord.agencyName = agency.name;
        existingAgentRecord.agentId = generatedAgentId;
        existingAgentRecord.licenseNumber = licenseNumber;
        existingAgentRecord.licenseVerified = true;
        existingAgentRecord.licenseVerificationDate = new Date();
        existingAgentRecord.isActive = true;
        await existingAgentRecord.save();
      } else {
        // Create new agent record
        await Agent.create({
          userId: user._id,
          agencyName: agency.name,
          agentId: generatedAgentId,
          licenseNumber,
          licenseVerified: true,
          licenseVerificationDate: new Date(),
          isActive: true,
        });
      }

      // Add agent to agency's agents array if not already there
      if (!agency.agents.includes(user._id)) {
        agency.agents.push(user._id);
        agency.totalAgents = agency.agents.length;
        await agency.save();
      }
    }

    // Update role
    user.role = role;
    await user.save();

    res.json({
      message: 'Role updated successfully',
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
        licenseVerified: user.licenseVerified,
        listingsCount: user.listingsCount,
        totalListingsCreated: user.totalListingsCreated,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error('Switch role error:', error);
    res.status(500).json({ message: 'Error switching role', error: error.message });
  }
};

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

// @desc    Upload user avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                                   process.env.CLOUDINARY_API_KEY &&
                                   process.env.CLOUDINARY_API_SECRET;

    console.log('=== Cloudinary Configuration Check ===');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? `Set (${process.env.CLOUDINARY_CLOUD_NAME})` : 'NOT SET');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (hidden)' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'NOT SET');

    if (!cloudinaryConfigured) {
      console.error('❌ Cloudinary is not fully configured');
      res.status(500).json({
        message: 'Image upload service not configured. Please add your Cloudinary credentials to the .env file.',
        missingFields: {
          cloudName: !process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !process.env.CLOUDINARY_API_KEY,
          apiSecret: !process.env.CLOUDINARY_API_SECRET
        }
      });
      return;
    }

    const userId = String((req.user as IUser)._id);
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('✓ Starting avatar upload for user:', userId);
    console.log('File size:', req.file.size, 'bytes');
    console.log('File type:', req.file.mimetype);

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (deleteError) {
        console.log('Could not delete old avatar:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Cloudinary with better organization
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Organized folder structure: balkan-estate/avatars/users/{userId}
        folder: `balkan-estate/avatars/users/${userId}`,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good', fetch_format: 'auto' } // Cost-optimized
        ],
        // Add context for better organization
        context: {
          type: 'user_avatar',
          user_id: userId,
        },
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error uploading avatar', error: error.message });
          }
          return;
        }

        if (result) {
          try {
            // Update user with new avatar URL and publicId
            user.avatarUrl = result.secure_url;
            user.avatarPublicId = result.public_id;
            await user.save();

            console.log('Avatar uploaded successfully:', result.secure_url);

            if (!res.headersSent) {
              res.json({
                avatarUrl: result.secure_url,
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
                  agencyId: user.agencyId,
                  agentId: user.agentId,
                  licenseNumber: user.licenseNumber,
                  licenseVerified: user.licenseVerified,
                  isSubscribed: user.isSubscribed,
                }
              });
            }
          } catch (saveError: any) {
            console.error('Error saving user:', saveError);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Error saving avatar URL', error: saveError.message });
            }
          }
        }
      }
    );

    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading avatar', error: error.message });
    }
  }
};