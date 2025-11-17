import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { ChartBarIcon, HomeIcon, EyeIcon, HeartIcon, ChatBubbleBottomCenterTextIcon } from '../../constants';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/my-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id]);

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
      <div className="flex items-center gap-3 mb-6">
        <ChartBarIcon className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-neutral-800">Your Statistics</h2>
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
