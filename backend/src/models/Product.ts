import mongoose, { Document, Schema } from 'mongoose';

export type ProductType = 'subscription' | 'consumable' | 'non_consumable';
export type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'one_time';
export type TargetRole = 'buyer' | 'seller' | 'agent' | 'all';

export interface IProduct extends Document {
  productId: string;
  name: string;
  description?: string;
  type: ProductType;

  // Pricing
  price: number;
  currency: string;
  billingPeriod?: BillingPeriod;
  durationDays?: number; // Subscription validity in days (30 for monthly, 365 for yearly)

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

  // Target audience and display
  targetRole: TargetRole;
  displayOrder: number;
  badge?: string; // e.g., "MOST POPULAR", "BEST VALUE"
  badgeColor?: string; // e.g., "red", "green", "amber"
  highlighted: boolean; // Whether to show with special styling

  // UI customization
  cardStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };

  // Status
  isActive: boolean;
  isVisible: boolean;

  // Limits
  maxActiveSubscriptions?: number;

  // Subscription Benefits
  listingsLimit?: number; // Number of active listings (e.g., 15 for Pro)
  highlightCoupons?: number; // Number of highlight promotion coupons (e.g., 2 for all Pro users)

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
    durationDays: {
      type: Number,
      default: 30, // Default to 30 days (monthly)
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

    // Target audience and display
    targetRole: {
      type: String,
      enum: ['buyer', 'seller', 'agent', 'all'],
      required: true,
      default: 'all',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    badge: {
      type: String,
    },
    badgeColor: {
      type: String,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },

    // UI customization
    cardStyle: {
      type: {
        backgroundColor: String,
        borderColor: String,
        textColor: String,
      },
      default: undefined,
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

    // Subscription Benefits
    listingsLimit: {
      type: Number,
      default: 20, // 20 active listings for Pro subscriptions (shared between roles)
    },
    highlightCoupons: {
      type: Number,
      default: 2, // Default to 2 for all Pro plans (both agents and private sellers)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
