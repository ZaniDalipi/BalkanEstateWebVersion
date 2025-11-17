import mongoose, { Document, Schema } from 'mongoose';

export type FeatureType = 'ai_search' | 'ai_property_insights' | 'neighborhood_insights';

export interface IFeatureUsage extends Document {
  userId: mongoose.Types.ObjectId;
  featureType: FeatureType;
  date: Date; // Stored as start of day (midnight UTC) for easy querying
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureUsageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    featureType: {
      type: String,
      enum: ['ai_search', 'ai_property_insights', 'neighborhood_insights'],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries: find usage for a specific user, feature, and date
FeatureUsageSchema.index({ userId: 1, featureType: 1, date: 1 }, { unique: true });

// Index for cleanup queries (remove old records)
FeatureUsageSchema.index({ date: 1 });

export default mongoose.model<IFeatureUsage>('FeatureUsage', FeatureUsageSchema);
