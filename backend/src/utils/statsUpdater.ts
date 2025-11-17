import User from '../models/User';
import Property from '../models/Property';
import Conversation from '../models/Conversation';

/**
 * Increment property view count for a seller
 */
export const incrementViewCount = async (sellerId: string, count: number = 1): Promise<void> => {
  try {
    await User.findByIdAndUpdate(
      sellerId,
      {
        $inc: { 'stats.totalViews': count },
        $set: { 'stats.lastUpdated': new Date() }
      }
    );
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

/**
 * Increment property save/favorite count for a seller
 */
export const incrementSaveCount = async (sellerId: string, count: number = 1): Promise<void> => {
  try {
    await User.findByIdAndUpdate(
      sellerId,
      {
        $inc: { 'stats.totalSaves': count },
        $set: { 'stats.lastUpdated': new Date() }
      }
    );
  } catch (error) {
    console.error('Error incrementing save count:', error);
  }
};

/**
 * Decrement property save count for a seller (when unfavorited)
 */
export const decrementSaveCount = async (sellerId: string, count: number = 1): Promise<void> => {
  try {
    await User.findByIdAndUpdate(
      sellerId,
      {
        $inc: { 'stats.totalSaves': -count },
        $set: { 'stats.lastUpdated': new Date() }
      }
    );
  } catch (error) {
    console.error('Error decrementing save count:', error);
  }
};

/**
 * Increment inquiry/conversation count for a seller
 */
export const incrementInquiryCount = async (sellerId: string, count: number = 1): Promise<void> => {
  try {
    await User.findByIdAndUpdate(
      sellerId,
      {
        $inc: { 'stats.totalInquiries': count },
        $set: { 'stats.lastUpdated': new Date() }
      }
    );
  } catch (error) {
    console.error('Error incrementing inquiry count:', error);
  }
};

/**
 * Update sold property statistics
 */
export const updateSoldStats = async (sellerId: string, propertyPrice: number): Promise<void> => {
  try {
    await User.findByIdAndUpdate(
      sellerId,
      {
        $inc: {
          'stats.propertiesSold': 1,
          'stats.totalSalesValue': propertyPrice
        },
        $set: { 'stats.lastUpdated': new Date() }
      }
    );
  } catch (error) {
    console.error('Error updating sold stats:', error);
  }
};

/**
 * Sync all statistics for a user (recalculates from properties and conversations)
 * Use this for initial setup or fixing discrepancies
 */
export const syncUserStats = async (userId: string): Promise<void> => {
  try {
    // Fetch all user properties
    const properties = await Property.find({ sellerId: userId });

    // Calculate statistics
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalSaves = properties.reduce((sum, p) => sum + (p.saves || 0), 0);
    const soldProperties = properties.filter(p => p.status === 'sold');
    const propertiesSold = soldProperties.length;
    const totalSalesValue = soldProperties.reduce((sum, p) => sum + p.price, 0);

    // Get total inquiries from conversations
    const totalInquiries = await Conversation.countDocuments({ sellerId: userId });

    // Update user stats
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          stats: {
            totalViews,
            totalSaves,
            totalInquiries,
            propertiesSold,
            totalSalesValue,
            lastUpdated: new Date()
          }
        }
      }
    );

    console.log(`Stats synced for user ${userId}`);
  } catch (error) {
    console.error('Error syncing user stats:', error);
    throw error;
  }
};

/**
 * Batch sync stats for all sellers (agents and private sellers)
 */
export const syncAllSellerStats = async (): Promise<void> => {
  try {
    const sellers = await User.find({
      role: { $in: ['agent', 'private_seller'] }
    });

    console.log(`Syncing stats for ${sellers.length} sellers...`);

    for (const seller of sellers) {
      await syncUserStats(String(seller._id));
    }

    console.log('All seller stats synced successfully');
  } catch (error) {
    console.error('Error syncing all seller stats:', error);
    throw error;
  }
};
