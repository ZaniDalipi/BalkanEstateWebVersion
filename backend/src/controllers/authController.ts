import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { IUser } from '../models/User';

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

    // If switching to agent, validate license information
    if (role === 'agent') {
      if (!licenseNumber || !agencyName) {
        res.status(400).json({
          message: 'License number and agency name are required to become an agent'
        });
        return;
      }

      // Validate license format (basic validation - you can enhance this)
      if (licenseNumber.length < 5) {
        res.status(400).json({
          message: 'License number must be at least 5 characters'
        });
        return;
      }

      // Check if license number is already in use by another user
      const existingAgent = await User.findOne({
        licenseNumber,
        _id: { $ne: user._id },
        licenseVerified: true
      });

      if (existingAgent) {
        res.status(400).json({
          message: 'This license number is already registered to another agent'
        });
        return;
      }

      // Update agent-specific fields
      user.licenseNumber = licenseNumber;
      user.agencyName = agencyName;
      user.agentId = agentId || `AG-${Date.now()}`; // Generate agent ID if not provided
      user.licenseVerified = true;
      user.licenseVerificationDate = new Date();
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