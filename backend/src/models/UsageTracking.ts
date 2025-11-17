import mongoose, { Document, Schema } from 'mongoose';

export interface IUsageTracking extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // Date in YYYY-MM-DD format for daily tracking

  // AI Feature Usage
  aiSearchCount: number; // AI-powered property search
  aiDescriptionCount: number; // AI property description generator
  neighborhoodInsightsCount: number; // AI neighborhood insights

  // Insights Feature Usage
  propertyInsightsViewCount: number; // Viewing property stats (views, saves, inquiries)
  agentInsightsViewCount: number; // Viewing agent stats

  createdAt: Date;
  updatedAt: Date;
}

const UsageTrackingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // AI Feature Usage Counters
    aiSearchCount: {
      type: Number,
      default: 0,
    },
    aiDescriptionCount: {
      type: Number,
      default: 0,
    },
    neighborhoodInsightsCount: {
      type: Number,
      default: 0,
    },
    // Insights Feature Usage Counters
    propertyInsightsViewCount: {
      type: Number,
      default: 0,
    },
    agentInsightsViewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient daily lookups
UsageTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });

// Helper method to get or create today's usage record
UsageTrackingSchema.statics.getTodayUsage = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let usage = await this.findOne({ userId, date: today });

  if (!usage) {
    usage = await this.create({
      userId,
      date: today,
      aiSearchCount: 0,
      aiDescriptionCount: 0,
      neighborhoodInsightsCount: 0,
      propertyInsightsViewCount: 0,
      agentInsightsViewCount: 0,
    });
  }

  return usage;
};

// Helper method to increment usage counter
UsageTrackingSchema.statics.incrementUsage = async function (
  userId: string | mongoose.Types.ObjectId,
  featureType: 'aiSearch' | 'aiDescription' | 'neighborhoodInsights' | 'propertyInsights' | 'agentInsights'
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fieldMap: Record<string, string> = {
    aiSearch: 'aiSearchCount',
    aiDescription: 'aiDescriptionCount',
    neighborhoodInsights: 'neighborhoodInsightsCount',
    propertyInsights: 'propertyInsightsViewCount',
    agentInsights: 'agentInsightsViewCount',
  };

  const fieldName = fieldMap[featureType];

  const usage = await this.findOneAndUpdate(
    { userId, date: today },
    { $inc: { [fieldName]: 1 } },
    { upsert: true, new: true }
  );

  return usage;
};

export default mongoose.model<IUsageTracking>('UsageTracking', UsageTrackingSchema);
