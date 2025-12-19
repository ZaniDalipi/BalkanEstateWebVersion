import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { uploadImage, deleteImages } from '../services/cloudinaryService';

// @desc    Submit agent license for verification
// @route   POST /api/license/submit
// @access  Private
export const submitLicense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;
    const { licenseNumber, country, expiryDate } = req.body;

    // Validate required fields
    if (!licenseNumber || !country) {
      res.status(400).json({
        message: 'License number and country are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
      return;
    }

    // Get the uploaded file
    if (!req.file) {
      res.status(400).json({
        message: 'License document image is required',
        code: 'MISSING_DOCUMENT'
      });
      return;
    }

    // Upload license document to Cloudinary (using avatar type for user-related documents)
    const uploadResult = await uploadImage(req.file.buffer, {
      userId: String(currentUser._id),
      type: 'avatar',
      maxWidth: 2000,
      maxHeight: 2000,
    });

    const user = await User.findById(currentUser._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete old license document if exists
    if (user.agentLicense?.documentPublicId) {
      await deleteImages([user.agentLicense.documentPublicId]);
    }

    // Update user with license information
    user.agentLicense = {
      number: licenseNumber,
      country,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      documentUrl: uploadResult.url,
      documentPublicId: uploadResult.publicId,
      status: 'pending',
      submittedAt: new Date(),
      isVerified: false,
    };

    await user.save();

    console.log(`📝 License submitted by ${user.email} (${country} - ${licenseNumber})`);

    res.status(200).json({
      message: 'License submitted successfully. It will be reviewed by our team within 24-48 hours.',
      license: {
        number: user.agentLicense.number,
        country: user.agentLicense.country,
        status: user.agentLicense.status,
        submittedAt: user.agentLicense.submittedAt,
      },
    });
  } catch (error: any) {
    console.error('Submit license error:', error);
    res.status(500).json({
      message: 'Error submitting license',
      error: error.message
    });
  }
};

// @desc    Get license verification status
// @route   GET /api/license/status
// @access  Private
export const getLicenseStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;
    const user = await User.findById(currentUser._id)
      .select('agentLicense email name');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.agentLicense || !user.agentLicense.number) {
      res.status(200).json({
        hasLicense: false,
        status: 'not_submitted',
        message: 'No license submitted yet',
      });
      return;
    }

    // Check if license is expired
    if (user.agentLicense.expiryDate && new Date(user.agentLicense.expiryDate) < new Date()) {
      user.agentLicense.status = 'expired';
      await user.save();
    }

    res.status(200).json({
      hasLicense: true,
      license: {
        number: user.agentLicense.number,
        country: user.agentLicense.country,
        status: user.agentLicense.status,
        isVerified: user.agentLicense.isVerified,
        submittedAt: user.agentLicense.submittedAt,
        verifiedAt: user.agentLicense.verifiedAt,
        expiryDate: user.agentLicense.expiryDate,
        rejectionReason: user.agentLicense.rejectionReason,
        documentUrl: user.agentLicense.documentUrl,
      },
    });
  } catch (error: any) {
    console.error('Get license status error:', error);
    res.status(500).json({
      message: 'Error fetching license status',
      error: error.message
    });
  }
};

// @desc    Verify or reject agent license (Admin only)
// @route   PUT /api/license/verify/:userId
// @access  Private/Admin
export const verifyLicense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        code: 'ADMIN_ONLY'
      });
      return;
    }

    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!status || !['verified', 'rejected'].includes(status)) {
      res.status(400).json({
        message: 'Status must be either "verified" or "rejected"',
        code: 'INVALID_STATUS'
      });
      return;
    }

    // If rejecting, reason is required
    if (status === 'rejected' && !rejectionReason) {
      res.status(400).json({
        message: 'Rejection reason is required when rejecting a license',
        code: 'REJECTION_REASON_REQUIRED'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.agentLicense || !user.agentLicense.number) {
      res.status(400).json({
        message: 'User has not submitted a license',
        code: 'NO_LICENSE_SUBMITTED'
      });
      return;
    }

    // Update license status
    user.agentLicense.status = status;
    user.agentLicense.isVerified = status === 'verified';
    user.agentLicense.verifiedAt = status === 'verified' ? new Date() : undefined;
    user.agentLicense.verifiedBy = status === 'verified' ? (currentUser._id as any) : undefined;
    user.agentLicense.rejectionReason = status === 'rejected' ? rejectionReason : undefined;

    await user.save();

    const actionText = status === 'verified' ? 'verified' : 'rejected';
    console.log(`✅ Admin ${currentUser.email} ${actionText} license for ${user.email} (${user.agentLicense.country} - ${user.agentLicense.number})`);

    res.status(200).json({
      message: `License ${actionText} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        license: {
          number: user.agentLicense.number,
          country: user.agentLicense.country,
          status: user.agentLicense.status,
          isVerified: user.agentLicense.isVerified,
          verifiedAt: user.agentLicense.verifiedAt,
          rejectionReason: user.agentLicense.rejectionReason,
        },
      },
    });
  } catch (error: any) {
    console.error('Verify license error:', error);
    res.status(500).json({
      message: 'Error verifying license',
      error: error.message
    });
  }
};

// @desc    Get all pending license verifications (Admin only)
// @route   GET /api/license/pending
// @access  Private/Admin
export const getPendingLicenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        code: 'ADMIN_ONLY'
      });
      return;
    }

    // Find all users with pending license verification
    const pendingUsers = await User.find({
      'agentLicense.status': 'pending',
    })
      .select('name email phone agentLicense createdAt')
      .sort({ 'agentLicense.submittedAt': 1 }); // Oldest first

    const pendingLicenses = pendingUsers.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      license: {
        number: user.agentLicense?.number,
        country: user.agentLicense?.country,
        documentUrl: user.agentLicense?.documentUrl,
        submittedAt: user.agentLicense?.submittedAt,
        expiryDate: user.agentLicense?.expiryDate,
      },
      userCreatedAt: user.createdAt,
    }));

    console.log(`📋 Admin ${currentUser.email} fetched ${pendingLicenses.length} pending license verifications`);

    res.status(200).json({
      count: pendingLicenses.length,
      licenses: pendingLicenses,
    });
  } catch (error: any) {
    console.error('Get pending licenses error:', error);
    res.status(500).json({
      message: 'Error fetching pending licenses',
      error: error.message
    });
  }
};

// @desc    Get all licenses (Admin only) - for dashboard/analytics
// @route   GET /api/license/all
// @access  Private/Admin
export const getAllLicenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        code: 'ADMIN_ONLY'
      });
      return;
    }

    const { status, country } = req.query;

    // Build query
    const query: any = {
      'agentLicense.number': { $exists: true },
    };

    if (status && ['pending', 'verified', 'rejected', 'expired'].includes(status as string)) {
      query['agentLicense.status'] = status;
    }

    if (country) {
      query['agentLicense.country'] = country;
    }

    const users = await User.find(query)
      .select('name email phone agentLicense createdAt')
      .sort({ 'agentLicense.submittedAt': -1 }); // Newest first

    const licenses = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      license: {
        number: user.agentLicense?.number,
        country: user.agentLicense?.country,
        status: user.agentLicense?.status,
        isVerified: user.agentLicense?.isVerified,
        documentUrl: user.agentLicense?.documentUrl,
        submittedAt: user.agentLicense?.submittedAt,
        verifiedAt: user.agentLicense?.verifiedAt,
        expiryDate: user.agentLicense?.expiryDate,
        rejectionReason: user.agentLicense?.rejectionReason,
      },
      userCreatedAt: user.createdAt,
    }));

    res.status(200).json({
      count: licenses.length,
      licenses,
    });
  } catch (error: any) {
    console.error('Get all licenses error:', error);
    res.status(500).json({
      message: 'Error fetching licenses',
      error: error.message
    });
  }
};
