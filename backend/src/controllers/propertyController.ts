import { Request, Response } from 'express';
import Property from '../models/Property';
import User, { IUser } from '../models/User';
import Agent from '../models/Agent';
import Agency from '../models/Agency';
import SalesHistory from '../models/SalesHistory';
import { geocodeProperty } from '../services/geocodingService';
import { incrementViewCount, updateSoldStats, incrementActiveListings } from '../utils/statsUpdater';
import {
  uploadPropertyImages,
  deleteImages,
  deleteFolder,
} from '../services/cloudinaryService';

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      query,
      minPrice,
      maxPrice,
      beds,
      baths,
      livingRooms,
      minSqft,
      maxSqft,
      sortBy,
      propertyType,
      city,
      country,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Default to active properties + recently sold (within 24 hours)
    // Recently sold properties will be shown at the top with a "SOLD" label
    if (!status || status === 'active') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filter.$or = [
        { status: 'active' },
        {
          status: 'sold',
          soldAt: { $gte: twentyFourHoursAgo }
        }
      ];
    } else {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (beds) filter.beds = { $gte: Number(beds) };
    if (baths) filter.baths = { $gte: Number(baths) };
    if (livingRooms) filter.livingRooms = { $gte: Number(livingRooms) };

    if (minSqft || maxSqft) {
      filter.sqft = {};
      if (minSqft) filter.sqft.$gte = Number(minSqft);
      if (maxSqft) filter.sqft.$lte = Number(maxSqft);
    }

    if (propertyType && propertyType !== 'any') {
      filter.propertyType = propertyType;
    }

    if (city) {
      filter.city = new RegExp(city as string, 'i');
    }

    if (country) {
      filter.country = new RegExp(country as string, 'i');
    }

    // Filter by role context (for dual-role system)
    if (req.query.createdAsRole) {
      filter.createdAsRole = req.query.createdAsRole;
    }

    // Filter by specific user (for "My Listings")
    if (req.query.sellerId) {
      filter.sellerId = req.query.sellerId;
    }

    if (query) {
      filter.$or = [
        { address: new RegExp(query as string, 'i') },
        { city: new RegExp(query as string, 'i') },
        { description: new RegExp(query as string, 'i') },
      ];
    }

    // Build sort object
    // Priority order: Premium > Highlight > Featured > Urgent > Standard, then sold properties, then apply user-selected sorting
    let sort: any = {};

    // First priority: Promoted properties (Premium > Highlight > Featured)
    // We'll handle this with a custom sort after fetching

    // Add status sorting (sold first among non-promoted)
    sort.status = -1; // 'sold' > 'active' alphabetically (reversed)

    // Then apply user's preferred sorting
    if (sortBy === 'price-low') {
      sort.price = 1;
    } else if (sortBy === 'price-high') {
      sort.price = -1;
    } else if (sortBy === 'sqft-low') {
      sort.sqft = 1;
    } else if (sortBy === 'sqft-high') {
      sort.sqft = -1;
    } else {
      sort.lastRenewed = -1; // Default: newest first
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with seller population
    // Fetch more than needed to allow for promoted property sorting
    const fetchLimit = limitNum * 2; // Fetch 2x to ensure we have enough promoted properties
    let properties = await Property.find(filter)
      .populate('sellerId', 'name email phone avatarUrl role agencyName agencyId')
      .sort(sort)
      .skip(skip)
      .limit(fetchLimit);

    // Custom sort: Prioritize promoted properties by tier
    // Order: Premium (active) > Highlight (active) > Featured (active) > Urgent > Standard
    properties.sort((a, b) => {
      const aIsPromoted = a.isPromoted && a.promotionEndDate && a.promotionEndDate > new Date();
      const bIsPromoted = b.isPromoted && b.promotionEndDate && b.promotionEndDate > new Date();

      // Both promoted or both not promoted - use tier scoring
      if (aIsPromoted && bIsPromoted) {
        const tierScores: Record<string, number> = {
          premium: 100,
          highlight: 70,
          featured: 40,
          standard: 10,
        };

        const aScore = (tierScores[a.promotionTier || 'standard'] || 0) + (a.hasUrgentBadge ? 5 : 0);
        const bScore = (tierScores[b.promotionTier || 'standard'] || 0) + (b.hasUrgentBadge ? 5 : 0);

        if (aScore !== bScore) {
          return bScore - aScore; // Higher score first
        }
        // If same tier, use original sort order
        return 0;
      }

      // One is promoted, one isn't - promoted comes first
      if (aIsPromoted && !bIsPromoted) return -1;
      if (!aIsPromoted && bIsPromoted) return 1;

      // Neither promoted - use original sort order
      return 0;
    });

    // Trim to requested limit after sorting
    properties = properties.slice(0, limitNum);

    // Enrich properties with agency logos for agent sellers
    const agencyIds = properties
      .map(p => (p.sellerId as any)?.agencyId)
      .filter(Boolean);

    let enrichedProperties: any[] = properties;

    if (agencyIds.length > 0) {
      const agencies = await Agency.find(
        { _id: { $in: agencyIds } },
        { _id: 1, logo: 1 }
      ).lean();

      const agencyLogoMap = new Map(
        agencies.map(a => [String(a._id), a.logo])
      );

      // Add agencyLogo to each property's seller
      enrichedProperties = properties.map(p => {
        const prop = p.toObject ? p.toObject() : p;
        const seller = prop.sellerId as any;
        if (seller?.agencyId) {
          seller.agencyLogo = agencyLogoMap.get(String(seller.agencyId));
        }
        return prop;
      });
    }

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      properties: enrichedProperties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'sellerId',
      'name email phone avatarUrl role agencyName agencyId licenseNumber'
    );

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Increment views on property
    property.views += 1;
    await property.save();

    // Update seller's stats in real-time
    await incrementViewCount(String(property.sellerId._id || property.sellerId));

    // Enrich property with agency logo if seller is an agent
    let enrichedProperty = property.toObject();
    const seller = enrichedProperty.sellerId as any;
    if (seller?.agencyId) {
      const agency = await Agency.findById(seller.agencyId, { logo: 1 }).lean();
      if (agency) {
        seller.agencyLogo = agency.logo;
      }
    }

    res.json({ property: enrichedProperty });
  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
export const createProperty = async (
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

    // Tier-based listing limits
    const getTierLimit = (plan: string): number => {
      // Normalize plan name for comparison
      const normalizedPlan = plan?.toLowerCase() || 'free';

      // Check for pro plans (seller or buyer, monthly or yearly)
      if (normalizedPlan.includes('pro')) {
        return 15;
      }

      // Check for enterprise plans
      if (normalizedPlan.includes('enterprise') || normalizedPlan.includes('premium')) {
        return 100; // Effectively unlimited
      }

      // Free tier
      return 3;
    };

    let userPlan = user.subscriptionPlan || 'free';
    let tierLimit = getTierLimit(userPlan);
    let subscriptionSource = 'personal';

    // Check if agent can benefit from agency subscription
    if (user.role === 'agent' && user.agencyId) {
      const agency = await Agency.findById(user.agencyId);
      if (agency && agency.agentDetails) {
        // Find active agents sorted by join date
        const activeAgents = agency.agentDetails
          .filter((ad: any) => ad.isActive)
          .sort((a: any, b: any) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

        // Check if user is in first 5 agents
        const agentIndex = activeAgents.findIndex((ad: any) => ad.userId.toString() === String(user._id));

        if (agentIndex !== -1 && agentIndex < 5) {
          // Agent is in first 5, check agency subscription
          const agencyPlan = agency.subscriptionPlan || 'free';
          const agencyLimit = getTierLimit(agencyPlan);

          // Check if agency subscription is active
          const isAgencySubActive = !agency.subscriptionExpiresAt || agency.subscriptionExpiresAt > new Date();

          // Use higher limit (agency or personal)
          if (isAgencySubActive && agencyLimit > tierLimit) {
            tierLimit = agencyLimit;
            userPlan = agencyPlan;
            subscriptionSource = 'agency';
          }
        }
      }
    }

    // Check if subscription is expired for paid tiers
    if (subscriptionSource === 'personal' && userPlan !== 'free' && user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      // Subscription expired, revert to free tier limits
      user.subscriptionPlan = 'free';
      user.isSubscribed = false;
      await user.save();

      if (user.listingsCount >= 3) {
        res.status(403).json({
          message: 'Your subscription has expired. You can only have 3 active listings on the free tier.',
          code: 'SUBSCRIPTION_EXPIRED',
          limit: 3,
          current: user.listingsCount,
        });
        return;
      }
    }

    // Check tier-based listing limit
    if (user.listingsCount >= tierLimit) {
      const message = subscriptionSource === 'agency'
        ? `You have reached the limit of ${tierLimit} listings covered by your agency's ${userPlan} subscription.`
        : `You have reached the limit of ${tierLimit} listings for your ${userPlan} tier. Please upgrade to create more listings.`;

      res.status(403).json({
        message,
        code: 'LISTING_LIMIT_REACHED',
        limit: tierLimit,
        current: user.listingsCount,
        tier: userPlan,
        source: subscriptionSource,
      });
      return;
    }

    // Geocode the property address automatically
    // Only geocode if we have at least city and country (for precision)
    const coordinates = await geocodeProperty({
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
    });

    // Determine which role is being used to create this listing
    const createdAsRole = req.body.createdAsRole || user.activeRole || user.role || 'private_seller';

    // Validate user has access to the role they're trying to use
    if (user.availableRoles && !user.availableRoles.includes(createdAsRole)) {
      res.status(403).json({
        message: `You do not have access to create listings as ${createdAsRole}`,
        availableRoles: user.availableRoles
      });
      return;
    }

    const propertyData = {
      ...req.body,
      sellerId: String(currentUser._id),
      // Add user identification for 1:1 relationship tracking
      createdByName: user.name,
      createdByEmail: user.email,
      // Role context tracking
      createdAsRole,
      ...(createdAsRole === 'agent' && {
        createdByAgencyName: user.agencyName,
        createdByLicenseNumber: user.licenseNumber,
      }),
      // Add geocoded coordinates (will be undefined if geocoding failed)
      ...(coordinates.lat && coordinates.lng && {
        lat: coordinates.lat,
        lng: coordinates.lng,
      }),
    };

    console.log(`📍 Creating property with coordinates:`, coordinates.lat ? `${coordinates.lat}, ${coordinates.lng}` : 'No coordinates');
    console.log(`👤 Property created by: ${user.name} (${user.email}) as ${createdAsRole}`);

    const property = await Property.create(propertyData);

    // Update role-specific listing counts
    if (createdAsRole === 'private_seller' && user.privateSellerSubscription) {
      user.privateSellerSubscription.activeListingsCount = (user.privateSellerSubscription.activeListingsCount || 0) + 1;
    } else if (createdAsRole === 'agent' && user.agentSubscription) {
      user.agentSubscription.activeListingsCount = (user.agentSubscription.activeListingsCount || 0) + 1;
    }

    // Update user listing counts
    user.listingsCount += 1;
    user.totalListingsCreated += 1;
    await user.save();

    // Update stats for active listings
    if (propertyData.status === 'active') {
      await incrementActiveListings(String(user._id));
    }

    // Update agent activeListings count if user is an agent
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ userId: user._id });
      if (agent) {
        agent.activeListings += 1;
        await agent.save();
      }
    }

    // Populate seller info
    await property.populate('sellerId', 'name email phone avatarUrl role agencyName');

    res.status(201).json({ property });
  } catch (error: any) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Check ownership
    if (property.sellerId.toString() !== String((req.user as IUser)._id).toString()) {
      res.status(403).json({ message: 'Not authorized to update this property' });
      return;
    }

    // Update property
    Object.assign(property, req.body);
    await property.save();

    // Populate seller info
    await property.populate('sellerId', 'name email phone avatarUrl role agencyName');

    res.json({ property });
  } catch (error: any) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Error updating property', error: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Check ownership
    const currentUser = req.user as IUser;
    if (property.sellerId.toString() !== String(currentUser._id).toString()) {
      res.status(403).json({ message: 'Not authorized to delete this property' });
      return;
    }

    // Delete images from Cloudinary before deleting property
    try {
      const userId = currentUser._id.toString();
      const propertyId = String(property._id);

      // Option 1: Delete entire property folder (most efficient)
      // This deletes all images in balkan-estate/properties/user-{userId}/listing-{propertyId}/
      await deleteFolder(`balkan-estate/properties/user-${userId}/listing-${propertyId}`);

      // Option 2 (fallback): Delete individual images if they exist
      const publicIdsToDelete: string[] = [];

      // Collect all public IDs
      if (property.imagePublicId) {
        publicIdsToDelete.push(property.imagePublicId);
      }

      if (property.floorplanPublicId) {
        publicIdsToDelete.push(property.floorplanPublicId);
      }

      if (property.images && property.images.length > 0) {
        const imagePublicIds = property.images
          .map((img: any) => img.publicId)
          .filter((id: string) => id);
        publicIdsToDelete.push(...imagePublicIds);
      }

      // Delete any remaining images that weren't in the folder
      if (publicIdsToDelete.length > 0) {
        await deleteImages(publicIdsToDelete);
      }

      console.log(`✅ Cleaned up all images for property ${propertyId}`);
    } catch (cloudinaryError: any) {
      console.error('⚠️  Error deleting images from Cloudinary:', cloudinaryError);
      // Continue with property deletion even if Cloudinary cleanup fails
    }

    // Decrement listing count if property is active or pending
    if (property.status === 'active' || property.status === 'pending' || property.status === 'draft') {
      const user = await User.findById(String(currentUser._id));
      if (user && user.listingsCount > 0) {
        user.listingsCount -= 1;
        await user.save();

        // Update agent activeListings count if user is an agent
        if (user.role === 'agent') {
          const agent = await Agent.findOne({ userId: user._id });
          if (agent && agent.activeListings > 0) {
            agent.activeListings -= 1;
            await agent.save();
          }
        }
      }
    }

    await property.deleteOne();

    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};

// @desc    Get user's properties
// @route   GET /api/properties/my-listings
// @access  Private
export const getMyListings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const properties = await Property.find({ sellerId: String((req.user as IUser)._id) })
      .populate('sellerId', 'name email phone avatarUrl role agencyName')
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error: any) {
    console.error('Get my listings error:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

// @desc    Upload property images
// @route   POST /api/properties/upload-images
// @route   POST /api/properties/:propertyId/upload-images (with property ID for organized folders)
// @access  Private
export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const userId = req.user.id;
    const propertyId = req.params.propertyId || req.body.propertyId;

    // If propertyId is provided, verify ownership
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        res.status(404).json({ message: 'Property not found' });
        return;
      }

      if (property.sellerId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Not authorized to upload images for this property' });
        return;
      }
    }

    // Upload images using the centralized service
    // Images will be organized in: balkan-estate/properties/user-{userId}/listing-{propertyId}/
    const uploadedImages = await uploadPropertyImages(files, userId, propertyId);

    res.json({
      images: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images`,
    });
  } catch (error: any) {
    console.error('❌ Upload images error:', error);
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// @desc    Mark property as sold
// @route   PATCH /api/properties/:id/mark-sold
// @access  Private
export const markAsSold = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Check ownership
    const currentUser = req.user as IUser;
    if (property.sellerId.toString() !== String(currentUser._id).toString()) {
      res.status(403).json({ message: 'Not authorized to update this property' });
      return;
    }

    // Decrement listing count if property was active
    if (property.status === 'active' || property.status === 'pending') {
      const user = await User.findById(String(currentUser._id));
      if (user && user.listingsCount > 0) {
        user.listingsCount -= 1;
        await user.save();

        // Update agent stats if user is an agent
        if (user.role === 'agent') {
          const agent = await Agent.findOne({ userId: user._id });
          if (agent) {
            // Decrement active listings
            if (agent.activeListings > 0) {
              agent.activeListings -= 1;
            }
            // Increment total sales and sales value
            agent.totalSales += 1;
            agent.totalSalesValue += property.price || 0;
            await agent.save();
          }
        }
      }
    }

    const soldDate = new Date();
    property.status = 'sold';
    property.soldAt = soldDate;
    await property.save();

    // Update seller's sold statistics in real-time
    await updateSoldStats(String(currentUser._id), property.price || 0);

    // Create sales history record
    const user = await User.findById(String(currentUser._id));
    if (user) {
      const daysOnMarket = Math.floor((soldDate.getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      await SalesHistory.create({
        sellerId: user._id,
        sellerName: user.name,
        sellerEmail: user.email,
        sellerRole: user.role,
        propertyId: property._id,
        propertyAddress: property.address,
        propertyCity: property.city,
        propertyCountry: property.country,
        propertyType: property.propertyType,
        salePrice: property.price || 0,
        currency: 'EUR', // Default currency
        soldAt: soldDate,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        totalViews: property.views || 0,
        totalSaves: property.saves || 0,
        daysOnMarket,
      });

      console.log(`📊 Sales history record created for property ${property._id}`);
    }

    res.json({ property });
  } catch (error: any) {
    console.error('Mark as sold error:', error);
    res.status(500).json({ message: 'Error marking property as sold', error: error.message });
  }
};

// @desc    Renew property listing
// @route   PATCH /api/properties/:id/renew
// @access  Private
export const renewProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Check ownership
    if (property.sellerId.toString() !== String((req.user as IUser)._id).toString()) {
      res.status(403).json({ message: 'Not authorized to renew this property' });
      return;
    }

    property.lastRenewed = new Date();
    await property.save();

    res.json({ property });
  } catch (error: any) {
    console.error('Renew property error:', error);
    res.status(500).json({ message: 'Error renewing property', error: error.message });
  }
};