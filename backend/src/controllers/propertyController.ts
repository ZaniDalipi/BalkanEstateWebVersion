import { Request, Response } from 'express';
import Property from '../models/Property';
import User, { IUser } from '../models/User';
import Agent from '../models/Agent';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

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

    // Default to active properties only
    filter.status = status || 'active';

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

    if (query) {
      filter.$or = [
        { address: new RegExp(query as string, 'i') },
        { city: new RegExp(query as string, 'i') },
        { description: new RegExp(query as string, 'i') },
      ];
    }

    // Build sort object
    let sort: any = { lastRenewed: -1 }; // Default: newest first

    if (sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price-high') {
      sort = { price: -1 };
    } else if (sortBy === 'sqft-low') {
      sort = { sqft: 1 };
    } else if (sortBy === 'sqft-high') {
      sort = { sqft: -1 };
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with seller population
    const properties = await Property.find(filter)
      .populate('sellerId', 'name email phone avatarUrl role agencyName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      properties,
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
      'name email phone avatarUrl role agencyName licenseNumber'
    );

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json({ property });
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

    // Check listing limit for non-subscribed users (5 free listings)
    const FREE_LISTING_LIMIT = 5;
    if (!user.isSubscribed && user.listingsCount >= FREE_LISTING_LIMIT) {
      res.status(403).json({
        message: `You have reached the limit of ${FREE_LISTING_LIMIT} free listings. Please subscribe to create more listings.`,
        code: 'LISTING_LIMIT_REACHED',
        limit: FREE_LISTING_LIMIT,
        current: user.listingsCount,
      });
      return;
    }

    const propertyData = {
      ...req.body,
      sellerId: String(currentUser._id),
    };

    const property = await Property.create(propertyData);

    // Update user listing counts
    user.listingsCount += 1;
    user.totalListingsCreated += 1;
    await user.save();

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

    // Get property ID from request body or query
    const propertyId = req.body.propertyId || req.query.propertyId;

    const files = req.files as Express.Multer.File[];
    const uploadedImages: { url: string; tag: string }[] = [];

    // Determine folder path - organize by property ID if provided
    const folderPath = propertyId
      ? `properties/${propertyId}`
      : `properties/temp/${Date.now()}`;

    // Upload each file to Cloudinary
    for (const file of files) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });

      uploadedImages.push({
        url: result.secure_url,
        tag: 'other',
      });
    }

    res.json({ images: uploadedImages });
  } catch (error: any) {
    console.error('Upload images error:', error);
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

    property.status = 'sold';
    await property.save();

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