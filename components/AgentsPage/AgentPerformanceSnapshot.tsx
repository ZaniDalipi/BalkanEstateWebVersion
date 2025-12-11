import React from 'react';
import { formatPrice } from '../../utils/currency';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  ArrowTrendingUpIcon
} from '../../constants';

interface PerformanceStats {
  propertiesSold: number;
  activeListings: number;
  totalSalesValue: number;
  medianPrice: number;
  avgDaysOnMarket: number;
  statsByType?: {
    apartments: { sold: number; medianPrice: number };
    houses: { sold: number; medianPrice: number };
    villas: { sold: number; medianPrice: number };
  };
  rating: number;
  totalReviews: number;
}

interface AgentPerformanceSnapshotProps {
  stats: PerformanceStats;
  agentName: string;
  className?: string;
}

const AgentPerformanceSnapshot: React.FC<AgentPerformanceSnapshotProps> = ({
  stats,
  agentName,
  className = '',
}) => {
  const firstName = agentName.split(' ')[0];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-red-600" />
          {firstName}'s Performance Snapshot
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Performance in the last 12 months on balkanestate.com*
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {/* Median Sold Price */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.medianPrice > 0 ? formatPrice(stats.medianPrice, 'Serbia') : '-'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Median sold price</div>
          </div>

          {/* Median Days Advertised */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.avgDaysOnMarket || '-'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Median days advertised</div>
          </div>

          {/* Properties Sold */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.propertiesSold || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Properties sold</div>
          </div>

          {/* Active Listings */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.activeListings || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Active listings</div>
          </div>
        </div>

        {/* Stats by Property Type */}
        {stats.statsByType && (
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Properties Sold by Type</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Sold</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Median Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      Apartments
                    </td>
                    <td className="text-right py-3 font-semibold">
                      {stats.statsByType.apartments.sold}
                    </td>
                    <td className="text-right py-3">
                      {stats.statsByType.apartments.medianPrice > 0
                        ? formatPrice(stats.statsByType.apartments.medianPrice, 'Serbia')
                        : '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-2">
                      <HomeIcon className="w-4 h-4 text-gray-400" />
                      Houses
                    </td>
                    <td className="text-right py-3 font-semibold">
                      {stats.statsByType.houses.sold}
                    </td>
                    <td className="text-right py-3">
                      {stats.statsByType.houses.medianPrice > 0
                        ? formatPrice(stats.statsByType.houses.medianPrice, 'Serbia')
                        : '-'}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 flex items-center gap-2">
                      <HomeModernIcon className="w-4 h-4 text-gray-400" />
                      Villas
                    </td>
                    <td className="text-right py-3 font-semibold">
                      {stats.statsByType.villas.sold}
                    </td>
                    <td className="text-right py-3">
                      {stats.statsByType.villas.medianPrice > 0
                        ? formatPrice(stats.statsByType.villas.medianPrice, 'Serbia')
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Sales Value */}
        {stats.totalSalesValue > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Total Sales Volume</span>
              </div>
              <div className="text-xl font-bold text-green-700">
                {formatPrice(stats.totalSalesValue, 'Serbia')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          * Performance data based on listings and sales recorded on balkanestate.com.
          Statistics are calculated from the last 12 months.
        </p>
      </div>
    </div>
  );
};

export default AgentPerformanceSnapshot;
