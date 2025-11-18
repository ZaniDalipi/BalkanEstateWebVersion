import mongoose, { Document, Schema } from 'mongoose';

export interface IPropertyImage {
  url: string;
  publicId: string; // Cloudinary public_id for image management and deletion
  tag: 'exterior' | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'other';
}

export interface IProperty extends Document {
  sellerId: mongoose.Types.ObjectId;
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
  promotionStartDate?: Date;
  promotionEndDate?: Date;
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
        publicId: { type: String, required: true },
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
    promotionStartDate: {
      type: Date,
    },
    promotionEndDate: {
      type: Date,
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

export default mongoose.model<IProperty>('Property', PropertySchema);
