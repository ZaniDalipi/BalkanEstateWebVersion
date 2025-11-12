import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

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
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
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
    const token = generateToken(user._id.toString());

    res.json({
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl,
        city: req.user.city,
        country: req.user.country,
        agencyName: req.user.agencyName,
        agentId: req.user.agentId,
        licenseNumber: req.user.licenseNumber,
        isSubscribed: req.user.isSubscribed,
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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, phone, city, country, agencyName, licenseNumber, avatarUrl } =
      req.body;

    const user = await User.findById(req.user._id);

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
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};
