import mongoose, { Document, Schema } from 'mongoose';

export type ProductType = 'subscription' | 'consumable' | 'non_consumable';
export type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'one_time';

export interface IProduct extends Document {
  productId: string;
  name: string;
  description?: string;
  type: ProductType;

  // Pricing
  price: number;
  currency: string;
  billingPeriod?: BillingPeriod;

  // Store IDs
  googlePlayProductId?: string;
  appStoreProductId?: string;
  stripeProductId?: string;
  stripePriceId?: string;

  // Trial
  trialPeriodDays?: number;
  hasFreeTrial: boolean;

  // Grace period
  gracePeriodDays?: number;

  // Features
  features: string[];

  // Status
  isActive: boolean;
  isVisible: boolean;

  // Limits
  maxActiveSubscriptions?: number;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['subscription', 'consumable', 'non_consumable'],
      required: true,
      default: 'subscription',
    },

    // Pricing
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'EUR',
    },
    billingPeriod: {
      type: String,
      enum: ['monthly', 'yearly', 'weekly', 'quarterly', 'one_time'],
    },

    // Store IDs
    googlePlayProductId: {
      type: String,
    },
    appStoreProductId: {
      type: String,
    },
    stripeProductId: {
      type: String,
    },
    stripePriceId: {
      type: String,
    },

    // Trial
    trialPeriodDays: {
      type: Number,
      default: 0,
    },
    hasFreeTrial: {
      type: Boolean,
      default: false,
    },

    // Grace period
    gracePeriodDays: {
      type: Number,
      default: 3,
    },

    // Features
    features: {
      type: [String],
      default: [],
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },

    // Limits
    maxActiveSubscriptions: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
