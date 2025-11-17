import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  promotionType: 'featured' | 'highlighted' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    promotionType: {
      type: String,
      enum: ['featured', 'highlighted', 'premium'],
      default: 'featured',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PromotionSchema.index({ userId: 1, isActive: 1 });
PromotionSchema.index({ propertyId: 1, isActive: 1 });
PromotionSchema.index({ endDate: 1, isActive: 1 });

// Method to check if promotion is still valid
PromotionSchema.methods.isValid = function(): boolean {
  return this.isActive && this.endDate > new Date();
};

// Static method to get active promotions for a user
PromotionSchema.statics.getActivePromotionsCount = async function(
  userId: mongoose.Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    userId,
    isActive: true,
    endDate: { $gt: new Date() },
  });
};

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
