import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  role: 'buyer' | 'private_seller' | 'agent';
  city?: string;
  country?: string;
  agencyName?: string;
  agentId?: string;
  licenseNumber?: string;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
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
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_yearly', 'enterprise'],
      default: 'free',
    },
    subscriptionExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

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

export default mongoose.model<IUser>('User', UserSchema);
