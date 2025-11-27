import User from '../models/User';
import { syncUserStats } from '../utils/statsUpdater';

/**
 * Statistics reconciliation worker
 * Periodically syncs and updates user statistics from property and conversation data
 */

interface StatsReconciliationResult {
  totalProcessed: number;
  updated: number;
  errors: number;
  details: Array<{
    userId: string;
    status: string;
    message: string;
  }>;
}

/**
 * Run statistics reconciliation for all sellers
 */
export async function runStatsReconciliation(): Promise<StatsReconciliationResult> {
  console.log('Starting statistics reconciliation...');

  const result: StatsReconciliationResult = {
    totalProcessed: 0,
    updated: 0,
    errors: 0,
    details: [],
  };

  try {
    // Get all sellers (agents and private sellers)
    const sellers = await User.find({
      role: { $in: ['agent', 'private_seller'] }
    }).select('_id name email stats');

    console.log(`Found ${sellers.length} sellers to reconcile`);

    for (const seller of sellers) {
      result.totalProcessed++;

      try {
        // Store old stats for comparison
        const oldStats = { ...seller.stats };

        // Sync stats for this seller
        await syncUserStats(String(seller._id));

        // Fetch updated user to check if stats changed
        const updatedSeller = await User.findById(seller._id);
        if (updatedSeller) {
          // Check if stats actually changed
          const statsChanged =
            JSON.stringify(oldStats) !== JSON.stringify(updatedSeller.stats);

          if (statsChanged) {
            result.updated++;
            result.details.push({
              userId: String(seller._id),
              status: 'updated',
              message: `Stats updated: Views=${updatedSeller.stats?.totalViews}, Saves=${updatedSeller.stats?.totalSaves}, Inquiries=${updatedSeller.stats?.totalInquiries}, Sold=${updatedSeller.stats?.propertiesSold}`,
            });
          } else {
            result.details.push({
              userId: String(seller._id),
              status: 'no_change',
              message: 'Stats already up to date',
            });
          }
        }
      } catch (error: any) {
        result.errors++;
        result.details.push({
          userId: String(seller._id),
          status: 'error',
          message: error.message,
        });
        console.error(`Error reconciling stats for seller ${seller._id}:`, error);
      }
    }

    console.log('Stats reconciliation completed:', {
      totalProcessed: result.totalProcessed,
      updated: result.updated,
      errors: result.errors,
    });

    return result;
  } catch (error: any) {
    console.error('Fatal error during stats reconciliation:', error);
    throw error;
  }
}

/**
 * Schedule statistics reconciliation to run periodically
 * Runs every 6 hours to keep stats fresh
 */
export function scheduleStatsReconciliation(): void {
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  // Run immediately on startup
  runStatsReconciliation().catch((error) => {
    console.error('Initial stats reconciliation failed:', error);
  });

  // Then run every 6 hours
  setInterval(() => {
    runStatsReconciliation().catch((error) => {
      console.error('Scheduled stats reconciliation failed:', error);
    });
  }, SIX_HOURS);

  console.log('Stats reconciliation worker scheduled to run every 6 hours');
}

export default {
  runStatsReconciliation,
  scheduleStatsReconciliation,
};
