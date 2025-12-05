import mongoose, { Document, Schema } from 'mongoose';

export interface IPropertyImage {
  url: string;
  publicId?: string; // Cloudinary public_id for image management and deletion (optional for backwards compatibility)
  tag: 'exterior' | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'other';
}

export interface IProperty extends Document {
  sellerId: mongoose.Types.ObjectId;
  createdByName: string; // Name of the user who created this listing
  createdByEmail: string; // Email of the user who created this listing
  title?: string; // Optional title/headline for the property listing
  status: 'active' | 'pending' | 'sold' | 'draft';
  soldAt?: Date;
  price: number;
  address: string;
  city: string;
  country: string;
  beds: number;
  baths: number;
  livingRooms: number;
  sqft: number;
  yearBuilt: number;
  parking: number;
  description: string;
  specialFeatures: string[];
  materials: string[];
  tourUrl?: string;
  imageUrl: string;
  imagePublicId?: string; // Cloudinary public_id for main image
  images: IPropertyImage[];
  lat: number;
  lng: number;
  propertyType: 'house' | 'apartment' | 'villa' | 'other';
  floorNumber?: number;
  totalFloors?: number;
  floorplanUrl?: string;
  floorplanPublicId?: string; // Cloudinary public_id for floorplan
  lastRenewed: Date;
  views: number;
  saves: number;
  inquiries: number;
  // Promotion fields
  isPromoted: boolean;
  promotionTier?: 'standard' | 'featured' | 'highlight' | 'premium';
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  hasUrgentBadge?: boolean;
  // Amenities fields
  amenities: string[];
  hasBalcony?: boolean;
  hasGarden?: boolean;
  hasElevator?: boolean;
  hasSecurity?: boolean;
  hasAirConditioning?: boolean;
  hasPool?: boolean;
  petsAllowed?: boolean;
  // Distance fields (in km)
  distanceToCenter?: number;
  distanceToSea?: number;
  distanceToSchool?: number;
  distanceToHospital?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      required: true,
      index: true,
    },
    createdByEmail: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'draft'],
      default: 'active',
      index: true,
    },
    soldAt: {
      type: Date,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    beds: {
      type: Number,
      required: true,
      min: 0,
    },
    baths: {
      type: Number,
      required: true,
      min: 0,
    },
    livingRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    sqft: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    yearBuilt: {
      type: Number,
      required: true,
    },
    parking: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    specialFeatures: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    tourUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Optional for backwards compatibility
        tag: {
          type: String,
          enum: ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'],
          default: 'other',
        },
      },
    ],
    lat: {
      type: Number,
      required: true,
      index: true,
    },
    lng: {
      type: Number,
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'villa', 'other'],
      required: true,
      index: true,
    },
    floorNumber: {
      type: Number,
    },
    totalFloors: {
      type: Number,
    },
    floorplanUrl: {
      type: String,
    },
    floorplanPublicId: {
      type: String,
    },
    lastRenewed: {
      type: Date,
      default: Date.now,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
    // Promotion fields
    isPromoted: {
      type: Boolean,
      default: false,
      index: true,
    },
    promotionTier: {
      type: String,
      enum: ['standard', 'featured', 'highlight', 'premium'],
      index: true,
    },
    promotionStartDate: {
      type: Date,
    },
    promotionEndDate: {
      type: Date,
    },
    hasUrgentBadge: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Amenities fields
    amenities: {
      type: [String],
      default: [],
      index: true,
    },
    hasBalcony: {
      type: Boolean,
    },
    hasGarden: {
      type: Boolean,
    },
    hasElevator: {
      type: Boolean,
    },
    hasSecurity: {
      type: Boolean,
    },
    hasAirConditioning: {
      type: Boolean,
    },
    hasPool: {
      type: Boolean,
    },
    petsAllowed: {
      type: Boolean,
    },
    // Distance fields (in km)
    distanceToCenter: {
      type: Number,
      min: 0,
    },
    distanceToSea: {
      type: Number,
      min: 0,
    },
    distanceToSchool: {
      type: Number,
      min: 0,
    },
    distanceToHospital: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for location-based queries
PropertySchema.index({ lat: 1, lng: 1 });
// Index for price range queries
PropertySchema.index({ price: 1, status: 1 });
// Index for property type and city queries
PropertySchema.index({ propertyType: 1, city: 1, status: 1 });
// Index for promoted properties
PropertySchema.index({ isPromoted: 1, status: 1 });
// Index for promoted properties by tier (for sorting)
PropertySchema.index({ promotionTier: 1, isPromoted: 1, promotionEndDate: 1 });
// Index for urgent properties
PropertySchema.index({ hasUrgentBadge: 1, isPromoted: 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);
