import { Request, Response } from 'express';
import User from '../models/User';
import Agent from '../models/Agent';
import { generateToken } from '../utils/jwt';
import { IUser } from '../models/User';
import fs from 'fs';
import path from 'path';

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
        licenseDocumentUrl: user.licenseDocumentUrl,
        licenseVerified: user.licenseVerified,
        licenseVerificationDate: user.licenseVerificationDate,
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
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
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
        licenseDocumentUrl: user.licenseDocumentUrl,
        licenseVerified: user.licenseVerified,
        licenseVerificationDate: user.licenseVerificationDate,
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
        licenseDocumentUrl: user.licenseDocumentUrl,
        licenseVerified: user.licenseVerified,
        licenseVerificationDate: user.licenseVerificationDate,
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
    const file = req.file;

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

    // Handle avatar upload
    if (file) {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads/avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `avatar-${user._id}-${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadsDir, filename);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Store relative path for URL
      user.avatarUrl = `/uploads/avatars/${filename}`;
    }

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
        licenseDocumentUrl: user.licenseDocumentUrl,
        licenseVerified: user.licenseVerified,
        licenseVerificationDate: user.licenseVerificationDate,
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
      licenseDocumentUrl: user.licenseDocumentUrl,
      licenseVerified: user.licenseVerified,
      licenseVerificationDate: user.licenseVerificationDate,
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

    const { role, licenseNumber, agencyName, agentId } = req.body;
    const file = req.file;

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
    if (role === 'agent' && licenseNumber && agencyName) {
      // Validate license format (basic validation - you can enhance this)
      if (licenseNumber.length < 5) {
        res.status(400).json({
          message: 'License number must be at least 5 characters'
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

      // If a document is uploaded, require it for verification
      let licenseDocumentUrl: string | undefined;
      const isVerifying = file !== undefined;

      if (file) {
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../uploads/documents');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const filename = `license-${user._id}-${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadsDir, filename);

        // Write file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Store relative path for URL
        licenseDocumentUrl = `/uploads/documents/${filename}`;
      }

      // Generate agent ID if not provided
      const generatedAgentId = agentId || `AG-${Date.now()}`;

      // Update agent-specific fields in User model
      user.licenseNumber = licenseNumber;
      user.agencyName = agencyName;
      user.agentId = generatedAgentId;

      // Only mark as verified if document is uploaded
      if (isVerifying && licenseDocumentUrl) {
        user.licenseDocumentUrl = licenseDocumentUrl;
        user.licenseVerified = true;
        user.licenseVerificationDate = new Date();
      } else {
        // Allow saving license info without verification
        user.licenseVerified = false;
      }

      // Create or update Agent record in separate table
      const existingAgentRecord = await Agent.findOne({ userId: user._id });

      if (existingAgentRecord) {
        // Update existing agent record
        existingAgentRecord.agencyName = agencyName;
        existingAgentRecord.agentId = generatedAgentId;
        existingAgentRecord.licenseNumber = licenseNumber;

        if (isVerifying && licenseDocumentUrl) {
          existingAgentRecord.licenseDocumentUrl = licenseDocumentUrl;
          existingAgentRecord.licenseVerified = true;
          existingAgentRecord.licenseVerificationDate = new Date();
        }
        existingAgentRecord.isActive = true;
        await existingAgentRecord.save();
      } else {
        // Create new agent record
        await Agent.create({
          userId: user._id,
          agencyName,
          agentId: generatedAgentId,
          licenseNumber,
          licenseDocumentUrl,
          licenseVerified: isVerifying && licenseDocumentUrl ? true : false,
          licenseVerificationDate: isVerifying && licenseDocumentUrl ? new Date() : undefined,
          isActive: true,
        });
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
        licenseDocumentUrl: user.licenseDocumentUrl,
        licenseVerified: user.licenseVerified,
        licenseVerificationDate: user.licenseVerificationDate,
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