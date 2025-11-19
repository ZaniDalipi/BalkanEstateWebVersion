import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Agency from '../models/Agency';
import User, { IUser } from '../models/User';
import Agent from '../models/Agent';
import Property, { IProperty } from '../models/Property';
import { geocodeAgency } from '../services/geocodingService';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

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

    // Check if user has enterprise tier
    if (user.subscriptionPlan !== 'enterprise') {
      res.status(403).json({
        message: 'Agency profiles are only available for Enterprise tier subscribers.',
        code: 'ENTERPRISE_TIER_REQUIRED',
      });
      return;
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
      isFeatured: true, // Enterprise tier gets featured by default
      // Add geocoded coordinates (will be undefined if geocoding failed)
      ...(coordinates.lat && coordinates.lng && {
        lat: coordinates.lat,
        lng: coordinates.lng,
      }),
    };

    console.log(`📍 Creating agency with coordinates:`, coordinates.lat ? `${coordinates.lat}, ${coordinates.lng}` : 'No coordinates');

    const agency = await Agency.create(agencyData);

    // Add owner to agents array
    agency.agents.push(user._id as mongoose.Types.ObjectId);
    agency.totalAgents = 1;
    await agency.save();

    // Update user with agency reference
    user.agencyId = agency._id as mongoose.Types.ObjectId;
    user.isEnterpriseTier = true;
    await user.save();

    res.status(201).json({ agency });
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
// @route   GET /api/agencies/:idOrSlug
// @access  Public
export const getAgency = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    if (!idOrSlug) {
      console.error('❌ getAgency: No idOrSlug parameter provided');
      res.status(400).json({ message: 'Agency ID or slug is required' });
      return;
    }

    console.log(`🔍 Looking up agency by: ${idOrSlug}`);

    // Try to find by ID first, then by slug
    let agency;
    let lookupMethod = '';

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      lookupMethod = 'ID';
      console.log(`🔑 Attempting lookup by ObjectId: ${idOrSlug}`);
      agency = await Agency.findById(idOrSlug)
        .populate('ownerId', 'name email phone avatarUrl')
        .populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating');
    }

    if (!agency) {
      lookupMethod = 'slug';
      const slugLower = idOrSlug.toLowerCase();
      console.log(`🏷️  Attempting lookup by slug: ${slugLower}`);
      agency = await Agency.findOne({ slug: slugLower })
        .populate('ownerId', 'name email phone avatarUrl')
        .populate('agents', 'name email phone avatarUrl role agencyName licenseNumber activeListings totalSalesValue propertiesSold rating');
    }

    if (!agency) {
      console.error(`❌ Agency not found for identifier: ${idOrSlug}`);
      res.status(404).json({
        message: 'Agency not found',
        searchedFor: idOrSlug,
        attemptedMethods: ['ObjectId', 'slug']
      });
      return;
    }

    console.log(`✅ Agency found via ${lookupMethod}: ${agency.name} (ID: ${agency._id})`);

    // Validate that populated fields were successful
    if (!agency.ownerId) {
      console.warn(`⚠️  Agency owner not found or failed to populate for agency: ${agency._id}`);
    }

    // Get agency's properties with error handling
    let properties: IProperty[] = [];
    try {
      const sellerIds = [agency.ownerId, ...agency.agents].filter(Boolean);
      console.log(`🏠 Fetching properties for ${sellerIds.length} sellers (owner + ${agency.agents.length} agents)`);

      properties = await Property.find({
        sellerId: { $in: sellerIds },
        status: 'active',
      }).sort({ createdAt: -1 });

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

    // Check ownership
    if (agency.ownerId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to update this agency' });
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
