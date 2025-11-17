import { Request, Response } from 'express';
import { IUser } from '../models/User';
import Property from '../models/Property';
import Conversation from '../models/Conversation';

// Get user statistics
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    // Fetch user's properties and calculate stats
    const properties = await Property.find({ sellerId: userId });

    const stats = {
      activeListings: properties.filter(p => p.status === 'active').length,
      totalListings: properties.length,
      totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
      totalSaves: properties.reduce((sum, p) => sum + (p.saves || 0), 0),
      totalInquiries: 0, // Will calculate from conversations
      propertiesSold: properties.filter(p => p.status === 'sold').length,
      totalSalesValue: properties
        .filter(p => p.status === 'sold')
        .reduce((sum, p) => sum + p.price, 0),
    };

    // Calculate total inquiries from conversations
    const conversations = await Conversation.find({ sellerId: userId });
    stats.totalInquiries = conversations.length;

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
