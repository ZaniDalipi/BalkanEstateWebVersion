import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Property from '../models/Property';

// Get user statistics (uses cached stats from database)
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    // Get user with stats
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get current active listings count
    const activeListings = await Property.countDocuments({
      sellerId: userId,
      status: 'active'
    });

    // Return stats from database (real-time updated)
    const stats = {
      activeListings,
      totalListings: user.totalListingsCreated || 0,
      totalViews: user.stats?.totalViews || 0,
      totalSaves: user.stats?.totalSaves || 0,
      totalInquiries: user.stats?.totalInquiries || 0,
      propertiesSold: user.stats?.propertiesSold || 0,
      totalSalesValue: user.stats?.totalSalesValue || 0,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
