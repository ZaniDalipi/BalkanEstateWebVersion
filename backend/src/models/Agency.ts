import mongoose, { Document, Schema } from 'mongoose';

export interface IAgency extends Document {
  ownerId: mongoose.Types.ObjectId; // User who owns the agency (enterprise tier)
  name: string;
  slug: string; // URL-friendly identifier: "{country},{name}"
  invitationCode: string; // Unique code for agents to join: format "AGY-{agencyId}-{randomString}"
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  lat?: number; // Latitude for map display
  lng?: number; // Longitude for map display
  website?: string;
  // Agency info
  specialties?: string[];
  certifications?: string[];
  // Social media links
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  // Agency stats
  totalProperties: number;
  totalAgents: number;
  yearsInBusiness?: number;
  // Agency agents (references to User model with role 'agent')
  agents: mongoose.Types.ObjectId[];
  // Featured/advertising settings
  isFeatured: boolean;
  featuredStartDate?: Date;
  featuredEndDate?: Date;
  adRotationOrder?: number; // For rotating ads monthly
  // Business hours
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AgencySchema: Schema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    invitationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },
    website: {
      type: String,
      trim: true,
    },
    specialties: [{
      type: String,
      trim: true,
    }],
    certifications: [{
      type: String,
      trim: true,
    }],
    facebookUrl: {
      type: String,
      trim: true,
    },
    instagramUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    twitterUrl: {
      type: String,
      trim: true,
    },
    totalProperties: {
      type: Number,
      default: 0,
    },
    totalAgents: {
      type: Number,
      default: 0,
    },
    yearsInBusiness: {
      type: Number,
    },
    agents: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredStartDate: {
      type: Date,
    },
    featuredEndDate: {
      type: Date,
    },
    adRotationOrder: {
      type: Number,
      default: 0,
    },
    businessHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
AgencySchema.index({ city: 1, isFeatured: 1 });
AgencySchema.index({ isFeatured: 1, adRotationOrder: 1 });

// Generate invitation code before saving
AgencySchema.pre<IAgency>('save', async function (next) {
  if (!this.invitationCode) {
    // Generate a unique invitation code: AGY-{agencyName}-{random6digits}
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const nameCode = this.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    this.invitationCode = `AGY-${nameCode}-${randomCode}`;
  }
  next();
});

export default mongoose.model<IAgency>('Agency', AgencySchema);
