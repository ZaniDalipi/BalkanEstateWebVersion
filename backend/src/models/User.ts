import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: 'buyer' | 'private_seller' | 'agent';
  provider: 'local' | 'google' | 'facebook' | 'apple';
  providerId?: string;
  isEmailVerified: boolean;
  city?: string;
  country?: string;
  agencyName?: string;
  agentId?: string;
  licenseNumber?: string;

  // Enhanced Subscription Fields
  isSubscribed: boolean;
  subscriptionPlan?: string; // Product ID (e.g., 'buyer_pro_monthly')
  subscriptionProductName?: string; // Human-readable name (e.g., 'Buyer Pro Monthly')
  subscriptionSource?: 'google' | 'apple' | 'stripe' | 'web'; // Where subscription came from
  subscriptionExpiresAt?: Date;
  subscriptionStartedAt?: Date;
  activeSubscriptionId?: mongoose.Types.ObjectId; // Link to active Subscription document
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  totalPaid?: number; // Track lifetime payment value
  subscriptionStatus?: 'active' | 'expired' | 'trial' | 'grace' | 'canceled';

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;

  // Methods
  hasActiveSubscription(): boolean;
  canAccessPremiumFeatures(): boolean;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local',
    },
    providerId: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['buyer', 'private_seller', 'agent'],
      default: 'buyer',
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    agencyName: {
      type: String,
    },
    agentId: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
      index: true, // Index for fast subscription queries
    },
    subscriptionPlan: {
      type: String, // Product ID (e.g., 'buyer_pro_monthly', 'seller_premium_yearly')
    },
    subscriptionProductName: {
      type: String, // Human-readable name (e.g., 'Buyer Pro Monthly')
    },
    subscriptionSource: {
      type: String,
      enum: ['google', 'apple', 'stripe', 'web'],
      index: true, // Index for querying by subscription source
    },
    subscriptionExpiresAt: {
      type: Date,
      index: true, // Index for expiration queries
    },
    subscriptionStartedAt: {
      type: Date,
    },
    activeSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'trial', 'grace', 'canceled'],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for OAuth users only (when providerId is not null)
// This prevents duplicate key errors for local users who all have providerId = null
UserSchema.index(
  { provider: 1, providerId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerId: { $ne: null } }
  }
);

// Hash password before saving (only for local auth users)
UserSchema.pre('save', async function (next) {
  // Skip password hashing if no password (OAuth users) or password not modified
  if (!this.get('password') || !this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const password = this.get('password') as string;
    this.set('password', await bcrypt.hash(password, salt));
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const password = this.get('password') as string;
  return bcrypt.compare(candidatePassword, password);
};

// Check if user has an active subscription
UserSchema.methods.hasActiveSubscription = function (): boolean {
  if (!this.isSubscribed || !this.subscriptionExpiresAt) {
    return false;
  }
  return new Date(this.subscriptionExpiresAt) > new Date();
};

// Check if user can access premium features (includes grace period)
UserSchema.methods.canAccessPremiumFeatures = function (): boolean {
  if (!this.isSubscribed) {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(this.subscriptionExpiresAt || 0);

  // Allow access if within subscription period
  if (expiresAt > now) {
    return true;
  }

  // Allow access during grace period (7 days after expiration)
  const gracePeriodEnd = new Date(expiresAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

  if (now <= gracePeriodEnd && this.subscriptionStatus === 'grace') {
    return true;
  }

  return false;
};

// Index for finding expiring subscriptions
UserSchema.index({ subscriptionExpiresAt: 1, isSubscribed: 1 });

export default mongoose.model<IUser>('User', UserSchema);
