import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Agency from '../models/Agency';
import User, { IUser } from '../models/User';
import Agent from '../models/Agent';
import Property from '../models/Property';
import { geocodeAgency } from '../services/geocodingService';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

// Helper function to generate unique Agent ID
function generateAgentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGT-${timestamp}-${randomStr}`;
}

// @desc    Create agency profile (Enterprise tier only)
// @route   POST /api/agencies
// @access  Private
export const createAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user has Enterprise subscription (skip in development mode)
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment && user.subscriptionPlan !== 'enterprise') {
      res.status(403).json({
        message: 'Agency profiles are only available for Enterprise tier subscribers. Please upgrade your plan to create an agency.',
      });
      return;
    }

    if (isDevelopment && user.subscriptionPlan !== 'enterprise') {
      console.log('🔧 Development mode: Bypassing Enterprise subscription check for agency creation');
    }

    // Check if agency already exists for this user
    const existingAgency = await Agency.findOne({ ownerId: user._id });
    if (existingAgency) {
      res.status(400).json({ message: 'Agency profile already exists for this user' });
      return;
    }

    // Geocode the agency address automatically
    // Only geocode if we have at least city and country (for precision)
    const coordinates = await geocodeAgency({
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
    });

    const agencyData = {
      ...req.body,
      ownerId: user._id,
      agents: [user._id], // Add the owner as the first agent
      admins: [user._id], // Add the owner as admin
      isFeatured: req.body.isFeatured || false, // Can be set manually or defaults to false
      totalAgents: 1, // Initialize with 1 agent (the owner)
      // Add geocoded coordinates (will be undefined if geocoding failed)
      ...(coordinates.lat && coordinates.lng && {
        lat: coordinates.lat,
        lng: coordinates.lng,
      }),
    };

    console.log(`📍 Creating agency with coordinates:`, coordinates.lat ? `${coordinates.lat}, ${coordinates.lng}` : 'No coordinates');

    // Use constructor + save() pattern to allow pre-save hook to generate slug and invitationCode
    const agency = new Agency(agencyData);
    await agency.save();

    // Add owner to agents array
    user.agencyId = agency._id as unknown as mongoose.Types.ObjectId;
    agency.totalAgents = 1;
    await agency.save();

    // Update user with agency reference
    user.agencyId = agency._id as unknown as mongoose.Types.ObjectId;
    user.isEnterpriseTier = true;
    user.agencyName = agency.name;

    // If user is not already an agent, change their role to agent
    if (user.role !== 'agent') {
      user.role = 'agent';
    }

    await user.save();

    // Create or update Agent profile for the agency owner
    const licenseNumber = req.body.licenseNumber || `LIC-${Date.now()}`;
    let agentProfile = await Agent.findOne({ userId: user._id });

    if (agentProfile) {
      // Update existing agent profile with new agency
      agentProfile.agencyId = agency._id as mongoose.Types.ObjectId;
      agentProfile.agencyName = agency.name;
      agentProfile.licenseNumber = licenseNumber;
      await agentProfile.save();
      console.log(`✅ Updated existing agent profile for ${user.email}`);
    } else {
      // Create new agent profile
      const agentId = generateAgentId();
      agentProfile = await Agent.create({
        userId: user._id,
        agencyId: agency._id,
        agencyName: agency.name,
        agentId,
        licenseNumber,
        licenseVerified: false,
      });
      console.log(`✅ Created new agent profile for ${user.email} with ID: ${agentId}`);
    }

    // Update user with agent ID
    user.agentId = agentProfile.agentId;
    await user.save();

    console.log(`✅ Agency created successfully. User ${user.email} is now admin of agency ${agency.name}`);

    res.status(201).json({ agency, agent: agentProfile });
  } catch (error: any) {
    console.error('Create agency error:', error);
    res.status(500).json({ message: 'Error creating agency', error: error.message });
  }
};

// @desc    Get all agencies (public, with featured rotation)
// @route   GET /api/agencies
// @access  Public
export const getAgencies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { city, country, featured, page = 1, limit = 12 } = req.query;

    const filter: any = {};

    if (city) {
      filter.city = new RegExp(city as string, 'i');
      console.log(`🔍 Filtering agencies by city: ${city}`);
    }

    if (country) {
      filter.country = new RegExp(country as string, 'i');
      console.log(`🔍 Filtering agencies by country: ${country}`);
    }

    if (featured === 'true') {
      filter.isFeatured = true;
      console.log(`⭐ Filtering for featured agencies only`);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ message: 'Invalid page number' });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ message: 'Invalid limit (must be 1-100)' });
      return;
    }

    const skip = (pageNum - 1) * limitNum;

    console.log(`📄 Fetching agencies: page ${pageNum}, limit ${limitNum}, skip ${skip}`);

    // Get agencies sorted by rotation order for featured ones
    const agencies = await Agency.find(filter)
      .populate('ownerId', 'name email phone avatarUrl')
      .populate('agents', 'name email phone avatarUrl role agencyName')
      .populate('admins', 'name email phone avatarUrl')
      .sort({ isFeatured: -1, adRotationOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance when we don't need document methods

    const total = await Agency.countDocuments(filter);

    console.log(`✅ Found ${agencies.length} agencies out of ${total} total`);

    res.json({
      agencies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get agencies error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: 'Error fetching agencies',
      error: error.message,
      filters: req.query
    });
  }
};

// @desc    Get single agency by ID or slug
// @route   GET /api/agencies/:country/:name OR GET /api/agencies/:idOrSlug
// @access  Public
export const getAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { country, name, idOrSlug } = req.params;

    // Construct slug from country/name or use idOrSlug
    let identifier = idOrSlug;
    if (country && name) {
      identifier = `${country}/${name}`;
      console.log(`🔍 Looking up agency by country/name: ${identifier}`);
    } else if (idOrSlug) {
      console.log(`🔍 Looking up agency by idOrSlug: ${idOrSlug}`);
    }

    if (!identifier) {
      console.error('❌ getAgency: No identifier provided');
      res.status(400).json({ message: 'Agency ID or slug is required' });
      return;
    }

    // Try to find by ID first, then by slug
    let agency;
    let lookupMethod = '';

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      lookupMethod = 'ID';
      console.log(`🔑 Attempting lookup by ObjectId: ${identifier}`);
      agency = await Agency.findById(identifier)
        .populate('ownerId', 'name email phone avatarUrl')
        .populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating')
        .populate('admins', 'name email phone avatarUrl');
    }

    if (!agency) {
      lookupMethod = 'slug';
      const slugLower = identifier.toLowerCase();
      console.log(`🏷️  Attempting lookup by slug: ${slugLower}`);
      agency = await Agency.findOne({ slug: slugLower })
        .populate('ownerId', 'name email phone avatarUrl')
        .populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating')
        .populate('admins', 'name email phone avatarUrl');
    }

    // If not found and slug contains forward slash, try converting to comma format for backward compatibility
    if (!agency && identifier.includes('/')) {
      lookupMethod = 'slug (legacy format)';
      const legacySlug = identifier.toLowerCase().replace('/', ',');
      console.log(`🏷️  Attempting lookup by legacy slug format: ${legacySlug}`);
      agency = await Agency.findOne({ slug: legacySlug })
        .populate('ownerId', 'name email phone avatarUrl')
        .populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating')
        .populate('admins', 'name email phone avatarUrl');
    }

    if (!agency) {
      console.error(`❌ Agency not found for identifier: ${identifier}`);
      res.status(404).json({
        message: 'Agency not found',
        searchedFor: identifier,
        attemptedMethods: ['ObjectId', 'slug', 'legacy slug format']
      });
      return;
    }

    console.log(`✅ Agency found via ${lookupMethod}: ${agency.name} (ID: ${agency._id})`);

    // Validate that populated fields were successful
    if (!agency.ownerId) {
      console.warn(`⚠️  Agency owner not found or failed to populate for agency: ${agency._id}`);
    }

    // Auto-add owner/admin as member if they're viewing the agency and not already a member
    if (req.user) {
      const currentUser = req.user as IUser;
      const userId = String(currentUser._id);
      const ownerId = String(agency.ownerId._id || agency.ownerId);
      const agencyAdmins = agency.admins?.map((id: any) => String(id)) || [];
      const agencyAgents = agency.agents.map((agent: any) => String(agent._id || agent));

      // Check if user is owner or admin but not in the agents array
      const isOwnerOrAdmin = userId === ownerId || agencyAdmins.includes(userId);
      if (isOwnerOrAdmin && !agencyAgents.includes(userId)) {
        console.log(`👤 Auto-adding owner/admin ${currentUser.email} to agency members`);

        // Add user to agents array
        agency.agents.push(new mongoose.Types.ObjectId(userId));
        agency.totalAgents = (agency.totalAgents || 0) + 1;
        await agency.save();

        // Update user's agency info if not already set
        const user = await User.findById(userId);
        if (user) {
          if (!user.agencyId) {
            user.agencyId = new mongoose.Types.ObjectId(String(agency._id));
            user.agencyName = agency.name;
            if (user.role !== 'agent') {
              user.role = 'agent';
            }
          }

          // Create or update Agent profile when user joins agency
          let agentProfile = await Agent.findOne({ userId: user._id });
          const licenseNumber = agentProfile?.licenseNumber || `LIC-${Date.now()}`;

          if (agentProfile) {
            // Update existing agent profile with new agency
            agentProfile.agencyId = agency._id as mongoose.Types.ObjectId;
            agentProfile.agencyName = agency.name;
            await agentProfile.save();
            console.log(`✅ Updated existing agent profile for ${user.email}`);
          } else {
            // Create new agent profile
            const agentId = generateAgentId();
            agentProfile = await Agent.create({
              userId: user._id,
              agencyId: agency._id,
              agencyName: agency.name,
              agentId,
              licenseNumber,
              licenseVerified: false,
            });
            console.log(`✅ Created new agent profile for ${user.email} with ID: ${agentId}`);
          }

          // Update user with agent ID
          user.agentId = agentProfile.agentId;
          await user.save();
          console.log(`✅ User ${currentUser.email} profile updated with agency info`);
        }

        // Re-populate agents to include the newly added admin
        await agency.populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating');
      }
    }

    // Get agency's properties with error handling
    let properties: any[] = [];
    try {
      const sellerIds = [agency.ownerId, ...agency.agents].filter(Boolean);
      console.log(`🏠 Fetching properties for ${sellerIds.length} sellers (owner + ${agency.agents.length} agents)`);

      const rawProperties = await Property.find({
        sellerId: { $in: sellerIds },
        status: 'active',
      })
        .populate('sellerId', 'name email phone avatarUrl role agencyName')
        .sort({ createdAt: -1 })
        .lean();

      // Transform sellerId to seller for frontend compatibility
      properties = rawProperties.map((prop: any) => ({
        ...prop,
        id: prop._id.toString(),
        seller: prop.sellerId,
      }));

      console.log(`✅ Found ${properties.length} properties for agency`);
    } catch (propertyError: any) {
      console.error(`⚠️  Error fetching properties for agency ${agency._id}:`, propertyError.message);
      // Continue anyway, return agency without properties
      properties = [];
    }

    res.json({ agency, properties });
  } catch (error: any) {
    console.error('❌ Get agency error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: 'Error fetching agency',
      error: error.message,
      identifier: req.params.idOrSlug
    });
  }
};

// @desc    Update agency profile
// @route   PUT /api/agencies/:id
// @access  Private
export const updateAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check if user is owner or admin
    const userId = String((req.user as IUser)._id);
    const isOwner = agency.ownerId.toString() === userId;
    const isAdmin = agency.admins && agency.admins.some(adminId => adminId.toString() === userId);

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to update this agency. Only the owner or agency admins can edit.' });
      return;
    }

    // Update agency
    Object.assign(agency, req.body);
    await agency.save();

    await agency.populate('ownerId', 'name email phone avatarUrl');
    await agency.populate('agents', 'name email phone avatarUrl role agencyName');

    res.json({ agency });
  } catch (error: any) {
    console.error('Update agency error:', error);
    res.status(500).json({ message: 'Error updating agency', error: error.message });
  }
};

// @desc    Add agent to agency
// @route   POST /api/agencies/:id/agents
// @access  Private
export const addAgentToAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { agentUserId } = req.body;
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check ownership
    if (agency.ownerId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to modify this agency' });
      return;
    }

    // Check if agent user exists and has agent role
    const agentUser = await User.findById(agentUserId);
    if (!agentUser) {
      res.status(404).json({ message: 'Agent user not found' });
      return;
    }

    if (agentUser.role !== 'agent') {
      res.status(400).json({ message: 'User must have agent role' });
      return;
    }

    // Check if agent is already in the agency
    if (agency.agents.some(id => id.toString() === agentUserId)) {
      res.status(400).json({ message: 'Agent is already part of this agency' });
      return;
    }

    // Add agent to agency
    agency.agents.push(agentUserId);
    agency.totalAgents = agency.agents.length;
    await agency.save();

    // Update agent's agency info
    agentUser.agencyName = agency.name;
    agentUser.agencyId = agency._id as mongoose.Types.ObjectId;
    await agentUser.save();

    await agency.populate('agents', 'name email phone avatarUrl role agencyName');

    res.json({ agency });
  } catch (error: any) {
    console.error('Add agent error:', error);
    res.status(500).json({ message: 'Error adding agent to agency', error: error.message });
  }
};

// @desc    Remove agent from agency
// @route   DELETE /api/agencies/:id/agents/:agentId
// @access  Private
export const removeAgentFromAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check ownership
    if (agency.ownerId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to modify this agency' });
      return;
    }

    // Remove agent from agency
    agency.agents = agency.agents.filter(
      id => id.toString() !== req.params.agentId
    );
    agency.totalAgents = agency.agents.length;
    await agency.save();

    // Clear agent's agency info in User model
    const agentUser = await User.findById(req.params.agentId);
    if (agentUser) {
      agentUser.agencyName = undefined;
      agentUser.agencyId = undefined;
      await agentUser.save();
    }

    // Clear agent's agency info in Agent model
    const agentRecord = await Agent.findOne({ userId: req.params.agentId });
    if (agentRecord) {
      agentRecord.agencyName = 'Independent Agent';
      agentRecord.agencyId = undefined;
      await agentRecord.save();
    }

    res.json({ message: 'Agent removed from agency successfully' });
  } catch (error: any) {
    console.error('Remove agent error:', error);
    res.status(500).json({ message: 'Error removing agent from agency', error: error.message });
  }
};

// @desc    Get featured agencies for rotation (homepage)
// @route   GET /api/agencies/featured/rotation
// @access  Public
export const getFeaturedAgencies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    // Get current month to determine rotation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Get all featured agencies
    const agencies = await Agency.find({ isFeatured: true })
      .populate('ownerId', 'name email phone avatarUrl')
      .sort({ adRotationOrder: 1, createdAt: -1 });

    // Rotate based on month
    const rotatedAgencies = [];
    const totalAgencies = agencies.length;

    if (totalAgencies > 0) {
      const startIndex = currentMonth % totalAgencies;
      const limitNum = Number(limit);

      for (let i = 0; i < Math.min(limitNum, totalAgencies); i++) {
        const index = (startIndex + i) % totalAgencies;
        rotatedAgencies.push(agencies[index]);
      }
    }

    res.json({ agencies: rotatedAgencies });
  } catch (error: any) {
    console.error('Get featured agencies error:', error);
    res.status(500).json({ message: 'Error fetching featured agencies', error: error.message });
  }
};

// @desc    Upload agency logo
// @route   POST /api/agencies/:id/upload-logo
// @access  Private
export const uploadAgencyLogo = async (
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
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary not configured');
      res.status(500).json({ message: 'Image upload service not configured' });
      return;
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check ownership
    if (agency.ownerId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to update this agency' });
      return;
    }

    console.log('Uploading logo for agency:', agency._id);

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'balkan-estate/agencies/logos',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error uploading logo', error: error.message });
          }
          return;
        }

        if (result) {
          try {
            // Update agency with new logo URL
            agency.logo = result.secure_url;
            await agency.save();

            console.log('Logo uploaded successfully:', result.secure_url);

            if (!res.headersSent) {
              res.json({ logo: result.secure_url, agency });
            }
          } catch (saveError: any) {
            console.error('Error saving agency:', saveError);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Error saving logo URL', error: saveError.message });
            }
          }
        }
      }
    );

    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error: any) {
    console.error('Upload agency logo error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading logo', error: error.message });
    }
  }
};

// @desc    Upload agency cover image
// @route   POST /api/agencies/:id/upload-cover
// @access  Private
export const uploadAgencyCover = async (
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
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary not configured');
      res.status(500).json({ message: 'Image upload service not configured' });
      return;
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check ownership
    if (agency.ownerId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to update this agency' });
      return;
    }

    console.log('Uploading cover for agency:', agency._id);

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'balkan-estate/agencies/covers',
        transformation: [
          { width: 1200, height: 400, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error uploading cover image', error: error.message });
          }
          return;
        }

        if (result) {
          try {
            // Update agency with new cover URL
            agency.coverImage = result.secure_url;
            await agency.save();

            console.log('Cover uploaded successfully:', result.secure_url);

            if (!res.headersSent) {
              res.json({ coverImage: result.secure_url, agency });
            }
          } catch (saveError: any) {
            console.error('Error saving agency:', saveError);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Error saving cover URL', error: saveError.message });
            }
          }
        }
      }
    );

    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error: any) {
    console.error('Upload agency cover error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading cover image', error: error.message });
    }
  }
};

// @desc    Join agency by invitation code
// @route   POST /api/agencies/join-by-code
// @access  Private
export const joinAgencyByInvitationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { invitationCode, agencyId } = req.body;

    if (!invitationCode) {
      res.status(400).json({ message: 'Invitation code is required' });
      return;
    }

    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is an agent
    if (user.role !== 'agent') {
      res.status(403).json({ message: 'Only agents can join agencies' });
      return;
    }

    // Find agency by invitation code
    const agency = await Agency.findOne({ invitationCode: invitationCode.toUpperCase() });

    if (!agency) {
      res.status(404).json({ message: 'Invalid invitation code' });
      return;
    }

    // If agencyId is provided, validate that the invitation code matches the selected agency
    if (agencyId && String(agency._id) !== String(agencyId)) {
      res.status(400).json({
        message: `This invitation code does not belong to the selected agency. Please verify the code and try again.`
      });
      return;
    }

    // Check if agent is already in the agency
    if (agency.agents.some(id => id.toString() === String(user._id))) {
      res.status(400).json({ message: 'You are already a member of this agency' });
      return;
    }

    // If agent is already in another agency, remove them from the old one first
    if (user.agencyId && String(user.agencyId) !== String(agency._id)) {
      try {
        const oldAgency = await Agency.findById(user.agencyId);
        if (oldAgency) {
          // Remove agent from old agency's agents array
          oldAgency.agents = oldAgency.agents.filter(
            agentId => agentId.toString() !== String(user._id)
          );
          oldAgency.totalAgents = oldAgency.agents.length;
          await oldAgency.save();
          console.log(`✅ Removed agent from old agency: ${oldAgency.name}`);
        }
      } catch (error) {
        console.error('Error removing agent from old agency:', error);
        // Continue anyway - we still want to add them to the new agency
      }
    }

    // Add agent to new agency
    const userObjectId = user._id as unknown as mongoose.Types.ObjectId;
    agency.agents.push(userObjectId);
    agency.totalAgents = agency.agents.length;
    await agency.save();

    // Update agent's agency info
    user.agencyName = agency.name;
    user.agencyId = agency._id as mongoose.Types.ObjectId;
    await user.save();

    // Also update the Agent document with both agency name and ID
    const Agent = mongoose.model('Agent');
    const updatedAgent = await Agent.findOneAndUpdate(
      { userId: user._id },
      {
        agencyName: agency.name,
        agencyId: agency._id,
      },
      { new: true }
    );

    // Return complete user and agency data
    res.json({
      message: `Successfully joined ${agency.name}!`,
      agency: {
        id: agency._id,
        name: agency.name,
        slug: agency.slug,
        city: agency.city,
        country: agency.country,
        totalAgents: agency.totalAgents,
        totalProperties: agency.totalProperties,
      },
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        agencyName: user.agencyName,
        agencyId: user.agencyId,
        licenseNumber: user.licenseNumber,
        agentId: user.agentId,
        isSubscribed: user.isSubscribed,
        subscriptionPlan: user.subscriptionPlan,
        listingsCount: user.listingsCount,
      },
      agent: updatedAgent,
    });
  } catch (error: any) {
    console.error('Join agency by invitation code error:', error);
    res.status(500).json({ message: 'Error joining agency', error: error.message });
  }
};

// @desc    Verify invitation code for an agency
// @route   POST /api/agencies/:id/verify-code
// @access  Private
export const verifyInvitationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ valid: false, message: 'Invitation code is required' });
      return;
    }

    // Find the agency by ID
    const agency = await Agency.findById(id);

    if (!agency) {
      res.status(404).json({ valid: false, message: 'Agency not found' });
      return;
    }

    // Compare the invitation codes (case-insensitive)
    const isValid = agency.invitationCode &&
                    agency.invitationCode.toUpperCase() === code.toUpperCase();

    if (isValid) {
      console.log(`✅ Valid invitation code for agency: ${agency.name}`);
      res.json({ valid: true, message: 'Invitation code is valid' });
    } else {
      console.log(`❌ Invalid invitation code for agency: ${agency.name}`);
      res.json({ valid: false, message: 'Invalid invitation code' });
    }
  } catch (error: any) {
    console.error('Verify invitation code error:', error);
    res.status(500).json({ valid: false, message: 'Error verifying invitation code', error: error.message });
  }
};

// @desc    Find agency by invitation code
// @route   POST /api/agencies/find-by-code
// @access  Private
export const findAgencyByInvitationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Invitation code is required' });
      return;
    }

    console.log(`🔍 Looking up agency with invitation code: ${code.toUpperCase()}`);

    // Find agency by invitation code
    const agency = await Agency.findOne({ invitationCode: code.toUpperCase() })
      .populate('ownerId', 'name email');

    if (!agency) {
      console.log(`❌ No agency found with invitation code: ${code.toUpperCase()}`);
      res.status(404).json({ message: 'Invalid invitation code. Please check and try again.' });
      return;
    }

    console.log(`✅ Found agency: ${agency.name} (${agency._id})`);

    res.json({
      success: true,
      agency: {
        _id: agency._id,
        name: agency.name,
        description: agency.description,
        city: agency.city,
        country: agency.country,
        slug: agency.slug,
        logo: agency.logo,
        coverImage: agency.coverImage,
        totalAgents: agency.totalAgents || 0,
      }
    });
  } catch (error: any) {
    console.error('Find agency by invitation code error:', error);
    res.status(500).json({ message: 'Error looking up agency', error: error.message });
  }
};

// @desc    Add admin to agency
// @route   POST /api/agencies/:id/admins
// @access  Private (Owner only)
export const addAgencyAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { id } = req.params;
    const { userId } = req.body;
    const currentUser = req.user as IUser;

    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // Find the agency
    const agency = await Agency.findById(id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check if current user is the owner
    if (String(agency.ownerId) !== String(currentUser._id)) {
      res.status(403).json({ message: 'Only the agency owner can add admins' });
      return;
    }

    // Check if user is already an admin
    if (agency.admins && agency.admins.some(adminId => String(adminId) === String(userId))) {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    // Check if user is an agent in this agency
    if (!agency.agents.some(agentId => String(agentId) === String(userId))) {
      res.status(400).json({ message: 'User must be an agent in this agency to become an admin' });
      return;
    }

    // Add user to admins array
    if (!agency.admins) {
      agency.admins = [];
    }
    agency.admins.push(userId as unknown as mongoose.Types.ObjectId);
    await agency.save();

    console.log(`✅ Added admin to agency: ${agency.name}`);
    res.json({ message: 'Admin added successfully', agency });
  } catch (error: any) {
    console.error('Add agency admin error:', error);
    res.status(500).json({ message: 'Error adding admin', error: error.message });
  }
};

// @desc    Remove admin from agency
// @route   DELETE /api/agencies/:id/admins/:userId
// @access  Private (Owner only)
export const removeAgencyAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { id, userId } = req.params;
    const currentUser = req.user as IUser;

    // Find the agency
    const agency = await Agency.findById(id);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check if current user is the owner
    if (String(agency.ownerId) !== String(currentUser._id)) {
      res.status(403).json({ message: 'Only the agency owner can remove admins' });
      return;
    }

    // Check if user is an admin
    if (!agency.admins || !agency.admins.some(adminId => String(adminId) === String(userId))) {
      res.status(400).json({ message: 'User is not an admin' });
      return;
    }

    // Remove user from admins array
    agency.admins = agency.admins.filter(adminId => String(adminId) !== String(userId));
    await agency.save();

    console.log(`✅ Removed admin from agency: ${agency.name}`);
    res.json({ message: 'Admin removed successfully', agency });
  } catch (error: any) {
    console.error('Remove agency admin error:', error);
    res.status(500).json({ message: 'Error removing admin', error: error.message });
  }
};

// @desc    Leave agency (agent can leave their own agency)
// @route   POST /api/agencies/leave
// @access  Private
export const leaveAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user has an agency
    if (!user.agencyId) {
      res.status(400).json({ message: 'You are not part of any agency' });
      return;
    }

    // Find the agency
    const agency = await Agency.findById(user.agencyId);

    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Prevent owner from leaving their own agency
    if (String(agency.ownerId) === String(user._id)) {
      res.status(403).json({
        message: 'Agency owners cannot leave their own agency. Please transfer ownership or delete the agency first.'
      });
      return;
    }

    const agencyName = agency.name;

    // Remove agent from agency's agents array
    agency.agents = agency.agents.filter(
      id => id.toString() !== String(user._id)
    );
    agency.totalAgents = agency.agents.length;

    // Also remove from admins array if they are an admin
    if (agency.admins && agency.admins.some(id => String(id) === String(user._id))) {
      agency.admins = agency.admins.filter(
        id => String(id) !== String(user._id)
      );
      console.log(`✅ Removed user from admins of agency: ${agencyName}`);
    }

    await agency.save();

    // Clear agent's agency info in User model
    user.agencyName = undefined;
    user.agencyId = undefined;
    await user.save();

    // Clear agent's agency info in Agent model
    const agentRecord = await Agent.findOne({ userId: user._id });
    if (agentRecord) {
      agentRecord.agencyName = 'Independent Agent';
      agentRecord.agencyId = undefined;
      await agentRecord.save();
      console.log(`✅ Updated agent profile to Independent Agent`);
    }

    console.log(`✅ User ${user.email} left agency: ${agencyName}`);

    res.json({
      message: `Successfully left ${agencyName}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        agencyName: user.agencyName,
      }
    });
  } catch (error: any) {
    console.error('Leave agency error:', error);
    res.status(500).json({ message: 'Error leaving agency', error: error.message });
  }
};
