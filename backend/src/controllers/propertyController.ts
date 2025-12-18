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

    // **AUTO-SYNC: Check if user has active subscription in database but proSubscription not synced**
    const Subscription = (await import('../models/Subscription')).default;
    const activeSubscription = await Subscription.findOne({
      userId: user._id,
      status: 'active',
      expirationDate: { $gt: new Date() }
    }).sort({ expirationDate: -1 });

    // If user has active subscription but proSubscription not set, sync it now
    if (activeSubscription && (!user.proSubscription || !user.proSubscription.isActive)) {
      console.log(`🔄 Auto-syncing Pro subscription for user ${user.email}`);

      const Product = (await import('../models/Product')).default;
      const product = await Product.findOne({ productId: activeSubscription.productId });

      user.proSubscription = {
        isActive: true,
        plan: activeSubscription.productId.includes('yearly') ? 'pro_yearly' : 'pro_monthly',
        expiresAt: activeSubscription.expirationDate,
        startedAt: activeSubscription.startDate,
        totalListingsLimit: product?.listingsLimit || 20, // 20 active listings
        activeListingsCount: user.proSubscription?.activeListingsCount || 0,
        privateSellerCount: user.proSubscription?.privateSellerCount || 0,
        agentCount: user.proSubscription?.agentCount || 0,
        promotionCoupons: {
          highlightCoupons: product?.highlightCoupons || 2,
          usedHighlightCoupons: user.proSubscription?.promotionCoupons?.usedHighlightCoupons || 0,
        },
      };

      user.isSubscribed = true;
      user.subscriptionPlan = activeSubscription.productId;
      user.subscriptionExpiresAt = activeSubscription.expirationDate;

      await user.save();
      console.log(`✅ Pro subscription auto-synced! User now has 20 active listings.`);
    }

    // Check if Pro subscription is expired
    if (user.proSubscription?.isActive && user.proSubscription.expiresAt && user.proSubscription.expiresAt < new Date()) {
      user.proSubscription.isActive = false;
      await user.save();
      console.log(`⏰ Pro subscription expired for user ${user.email}`);
    }

    // Determine which role is being used to create this listing
    const createdAsRole = req.body.createdAsRole || user.activeRole || user.role || 'private_seller';

    // **CRITICAL: Buyers cannot create listings**
    if (createdAsRole === 'buyer') {
      res.status(403).json({
        message: 'Buyers cannot create property listings. Please switch to or add a Private Seller or Agent role to create listings.',
        code: 'BUYER_CANNOT_CREATE_LISTING',
        availableRoles: user.availableRoles,
      });
      return;
    }

    // **CRITICAL: Agents MUST have Pro subscription to post**
    if (createdAsRole === 'agent') {
      if (!user.proSubscription || !user.proSubscription.isActive) {
        res.status(403).json({
          message: 'Agents must have an active Pro subscription to post listings. Please subscribe to continue.',
          code: 'AGENT_PRO_REQUIRED',
        });
        return;
      }
    }

    // Check listing limits based on subscription type
    let currentCount = 0;
    let limit = 0;
    let hasProSubscription = user.proSubscription && user.proSubscription.isActive;

    if (hasProSubscription) {
      // Pro user - 20 active listings (shared between private seller and agent)
      currentCount = user.proSubscription?.activeListingsCount || 0;
      limit = user.proSubscription?.totalListingsLimit || 20;

      console.log(`✅ Pro User ${user.email}: Creating listing (${currentCount + 1}/${limit} total, ${user.proSubscription?.privateSellerCount || 0} private, ${user.proSubscription?.agentCount || 0} agent)`);

      if (currentCount >= limit) {
        res.status(403).json({
          message: `You have reached your Pro limit of ${limit} active listings. The limit is shared between private seller and agent roles. Please delete some listings to create new ones.`,
          code: 'PRO_LISTING_LIMIT_REACHED',
          limit,
          current: currentCount,
          privateSellerCount: user.proSubscription?.privateSellerCount || 0,
          agentCount: user.proSubscription?.agentCount || 0,
        });
        return;
      }
    } else {
      // Free user - only private sellers can post
      if (createdAsRole === 'agent') {
        res.status(403).json({
          message: 'Free users cannot post as agents. Please subscribe to Pro to use agent features.',
          code: 'FREE_AGENT_NOT_ALLOWED',
        });
        return;
      }

      // Free private seller - use freeSubscription (3 listings max)
      if (!user.freeSubscription) {
        user.freeSubscription = {
          activeListingsCount: 0,
          listingsLimit: 3,
        };
      }

      currentCount = user.freeSubscription.activeListingsCount || 0;
      limit = user.freeSubscription.listingsLimit || 3;

      console.log(`📊 Free User ${user.email}: Creating listing (${currentCount + 1}/${limit})`);

      if (currentCount >= limit) {
        res.status(403).json({
          message: `You have reached your free limit of ${limit} active listings. Subscribe to Pro for 20 active listings!`,
          code: 'FREE_LISTING_LIMIT_REACHED',
          limit,
          current: currentCount,
        });
        return;
      }
    }

    // Geocode the property address automatically
    // Only geocode if we have at least city and country (for precision)
    const coordinates = await geocodeProperty({
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
    });

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

    // Update unified listing counters
    if (user.proSubscription && user.proSubscription.isActive) {
      // Pro user - update unified counter and role-specific counter
      user.proSubscription.activeListingsCount = (user.proSubscription.activeListingsCount || 0) + 1;

      if (createdAsRole === 'private_seller') {
        user.proSubscription.privateSellerCount = (user.proSubscription.privateSellerCount || 0) + 1;
        console.log(`📊 Pro User: Total ${user.proSubscription.activeListingsCount}/15 listings (${user.proSubscription.privateSellerCount} as private seller, ${user.proSubscription.agentCount || 0} as agent)`);
      } else if (createdAsRole === 'agent') {
        user.proSubscription.agentCount = (user.proSubscription.agentCount || 0) + 1;
        console.log(`📊 Pro User: Total ${user.proSubscription.activeListingsCount}/15 listings (${user.proSubscription.privateSellerCount || 0} as private seller, ${user.proSubscription.agentCount} as agent)`);
      }
    } else {
      // Free user (private seller only)
      if (!user.freeSubscription) {
        user.freeSubscription = {
          activeListingsCount: 0,
          listingsLimit: 3,
        };
      }
      user.freeSubscription.activeListingsCount = (user.freeSubscription.activeListingsCount || 0) + 1;
      console.log(`📊 Free User: ${user.freeSubscription.activeListingsCount}/3 listings`);
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

    const userId = String((req.user as IUser)._id);

    // Get the role filter from query parameters (optional)
    // If provided, only show listings created with that specific role
    const roleFilter = req.query.role as string | undefined;

    // Build query: always filter by sellerId, optionally filter by createdAsRole
    const query: any = { sellerId: userId };

    if (roleFilter && (roleFilter === 'agent' || roleFilter === 'private_seller')) {
      query.createdAsRole = roleFilter;
      console.log(`📋 Fetching listings for user ${userId} created as ${roleFilter}`);
    } else {
      console.log(`📋 Fetching all listings for user ${userId}`);
    }

    const properties = await Property.find(query)
      .populate('sellerId', 'name email phone avatarUrl role agencyName')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${properties.length} listings`);
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