import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { ChartBarIcon, HomeIcon, EyeIcon, HeartIcon, ChatBubbleBottomCenterTextIcon, CalendarIcon, MapPinIcon } from '../../constants';

interface ProfileStatisticsProps {
  user: User;
}

interface UserStats {
  activeListings: number;
  totalListings: number;
  totalViews: number;
  totalSaves: number;
  totalInquiries: number;
  propertiesSold?: number;
  totalSalesValue?: number;
}

interface SaleRecord {
  _id: string;
  propertyAddress: string;
  propertyCity: string;
  propertyCountry: string;
  propertyType: string;
  salePrice: number;
  currency: string;
  soldAt: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  totalViews: number;
  totalSaves: number;
  daysOnMarket: number;
  commission?: number;
}

interface SalesHistoryData {
  sales: SaleRecord[];
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    averageSalePrice: number;
    averageDaysOnMarket: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}> = ({ icon, label, value, subtext, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow`}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-white/80">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm font-medium text-white/90">{label}</div>
    {subtext && <div className="text-xs text-white/70 mt-1">{subtext}</div>}
  </div>
);

const ProfileStatistics: React.FC<ProfileStatisticsProps> = ({ user }) => {
  const [stats, setStats] = useState<UserStats>({
    activeListings: 0,
    totalListings: 0,
    totalViews: 0,
    totalSaves: 0,
    totalInquiries: 0,
    propertiesSold: 0,
    totalSalesValue: 0,
  });
  const [salesHistory, setSalesHistory] = useState<SalesHistoryData | null>(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // First, sync the stats to ensure they're up-to-date
        const syncResponse = await fetch('/api/auth/sync-stats', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
          },
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          setStats(syncData.stats);
        } else {
          // If sync fails, fallback to just fetching stats
          const response = await fetch('/api/auth/my-stats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id]);

  const handleRefreshStats = async () => {
    try {
      setSyncing(true);
      const syncResponse = await fetch('/api/auth/sync-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
        },
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        setStats(syncData.stats);
      }
    } catch (error) {
      console.error('Failed to sync stats:', error);
    } finally {
      setSyncing(false);
    }
  };

  const fetchSalesHistory = async () => {
    if (salesHistory) {
      setShowSalesHistory(!showSalesHistory);
      return;
    }

    try {
      setLoadingHistory(true);
      const response = await fetch('/api/sales-history/my-sales?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSalesHistory(data);
        setShowSalesHistory(true);
      }
    } catch (error) {
      console.error('Failed to fetch sales history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const isSellerRole = user.role === UserRole.AGENT || user.role === UserRole.PRIVATE_SELLER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-neutral-800">Your Statistics</h2>
        </div>
        <button
          onClick={handleRefreshStats}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh statistics"
        >
          <svg
            className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {syncing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {isSellerRole ? (
        <>
          {/* Primary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={<HomeIcon className="w-6 h-6" />}
              label="Active Listings"
              value={stats.activeListings}
              subtext={`${stats.totalListings} total created`}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<EyeIcon className="w-6 h-6" />}
              label="Total Views"
              value={stats.totalViews.toLocaleString()}
              subtext="Across all listings"
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<HeartIcon className="w-6 h-6" />}
              label="Total Saves"
              value={stats.totalSaves.toLocaleString()}
              subtext="Properties favorited"
              color="from-pink-500 to-pink-600"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={<ChatBubbleBottomCenterTextIcon className="w-6 h-6" />}
              label="Total Inquiries"
              value={stats.totalInquiries.toLocaleString()}
              subtext="Buyer messages received"
              color="from-green-500 to-green-600"
            />

            {user.role === UserRole.AGENT && (
              <>
                <StatCard
                  icon={<HomeIcon className="w-6 h-6" />}
                  label="Properties Sold"
                  value={stats.propertiesSold || 0}
                  subtext="Successful sales"
                  color="from-orange-500 to-orange-600"
                />
                <StatCard
                  icon={<ChartBarIcon className="w-6 h-6" />}
                  label="Total Sales Value"
                  value={`€${((stats.totalSalesValue || 0) / 1000).toFixed(0)}K`}
                  subtext="Lifetime revenue"
                  color="from-teal-500 to-teal-600"
                />
              </>
            )}
          </div>

          {user.role === UserRole.AGENT && user.agencyName && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800">Agency Performance</h3>
              </div>
              <p className="text-neutral-600">
                You are part of <span className="font-semibold text-primary">{user.agencyName}</span>
              </p>
              {user.licenseVerified && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                    ✓ Verified License
                  </span>
                  <span className="text-sm text-neutral-500">License #{user.licenseNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Sales History Section */}
          {(stats.propertiesSold || 0) > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-neutral-800">Sales History</h3>
                <button
                  onClick={fetchSalesHistory}
                  disabled={loadingHistory}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loadingHistory ? 'Loading...' : showSalesHistory ? 'Hide History' : 'View History'}
                </button>
              </div>

              {showSalesHistory && salesHistory && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">Total Revenue</div>
                      <div className="text-2xl font-bold">€{(salesHistory.summary.totalRevenue / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">Avg. Sale Price</div>
                      <div className="text-2xl font-bold">€{(salesHistory.summary.averageSalePrice / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">Avg. Days on Market</div>
                      <div className="text-2xl font-bold">{Math.round(salesHistory.summary.averageDaysOnMarket)}</div>
                    </div>
                    {salesHistory.summary.totalCommission > 0 && (
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
                        <div className="text-sm opacity-90">Total Commission</div>
                        <div className="text-2xl font-bold">€{(salesHistory.summary.totalCommission / 1000).toFixed(1)}K</div>
                      </div>
                    )}
                  </div>

                  {/* Sales List */}
                  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Property</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Type</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">Sale Price</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-700">Days on Market</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Sold Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {salesHistory.sales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-neutral-800">{sale.propertyAddress}</div>
                                <div className="text-xs text-neutral-500">
                                  {sale.beds && `${sale.beds} beds`}
                                  {sale.baths && ` • ${sale.baths} baths`}
                                  {sale.sqft && ` • ${sale.sqft} sqft`}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm text-neutral-600">
                                  <MapPinIcon className="w-4 h-4" />
                                  {sale.propertyCity}, {sale.propertyCountry}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                                  {sale.propertyType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="text-sm font-semibold text-neutral-800">
                                  €{sale.salePrice.toLocaleString()}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm text-neutral-600">{sale.daysOnMarket} days</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm text-neutral-600">
                                  <CalendarIcon className="w-4 h-4" />
                                  {new Date(sale.soldAt).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {salesHistory.pagination.total > salesHistory.pagination.limit && (
                    <div className="text-center text-sm text-neutral-600">
                      Showing {salesHistory.sales.length} of {salesHistory.pagination.total} sales
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
          <ChartBarIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">Statistics Available for Sellers</h3>
          <p className="text-neutral-500">
            Switch to Agent or Private Seller role to see your property statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileStatistics;
