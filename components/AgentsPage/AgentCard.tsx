import React, { useState } from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import { UserCircleIcon, BuildingOfficeIcon, CheckBadgeIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { slugify } from '../../utils/slug';

interface AgentCardProps {
  agent: Agent;
}

const AgentAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [error, setError] = useState(false);

  if (!agent.avatarUrl || error) {
    return (
      <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center">
        <UserCircleIcon className="w-16 h-16 text-neutral-400" />
      </div>
    );
  }

  return (
    <img
      src={agent.avatarUrl}
      alt={agent.name}
      className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
      onError={() => setError(true)}
    />
  );
};

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { dispatch } = useAppContext();

  // Calculate price range from agent's sold properties
  const getPriceRange = () => {
    if (agent.totalSalesValue && agent.propertiesSold > 0) {
      const avgPrice = agent.totalSalesValue / agent.propertiesSold;
      const minPrice = avgPrice * 0.5;
      const maxPrice = avgPrice * 1.8;
      return `${formatPrice(minPrice, 'Serbia')} - ${formatPrice(maxPrice, 'Serbia')}`;
    }
    return 'Contact for pricing';
  };

  // Calculate testimonial count
  const testimonialCount = agent.testimonials?.length || 0;

  // Check if agent is part of a team/agency
  const isTeam = agent.agencyName && agent.agencyName !== 'Independent Agent';

  const handleSelectAgent = () => {
    const agentIdentifier = agent.agentId || agent.id;
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agentIdentifier });
    window.history.pushState({}, '', `/agents/${agentIdentifier}`);
  };

  const handleAgencyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!agent.agencyName || agent.agencyName === 'Independent Agent') {
      return;
    }

    const agencyIdentifier = agent.agencyId || slugify(agent.agencyName);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/agencies/${agencyIdentifier}`);

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: data.agency });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
        let urlSlug = data.agency.slug || data.agency._id;
        urlSlug = urlSlug.replace(',', '/');
        window.history.pushState({}, '', `/agencies/${urlSlug}`);
      }
    } catch (error) {
      console.error('Error fetching agency:', error);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={handleSelectAgent}
    >
      <div className="p-6">
        {/* Team Badge */}
        {isTeam && (
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow-sm">
            <UserCircleIcon className="w-3.5 h-3.5 mr-1" />
            TEAM
          </div>
        )}

        {/* Agent Avatar and Info */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <AgentAvatar agent={agent} />
            {/* Premier Agent Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-md">
              <CheckBadgeIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mb-3 bg-neutral-50 px-3 py-2 rounded-lg">
            <div className="flex items-center">
              <StarRating rating={agent.rating} className="w-4 h-4" />
            </div>
            {agent.rating > 0 ? (
              <span className="text-sm font-bold text-neutral-800">
                {agent.rating.toFixed(1)} <span className="text-neutral-500 font-normal">({testimonialCount})</span>
              </span>
            ) : (
              <span className="text-sm text-neutral-500 italic">No reviews</span>
            )}
          </div>

          {/* Agent Name */}
          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
            {agent.name}
          </h3>

          {/* Agency/Brokerage */}
          {agent.agencyName && (
            <div
              className="flex items-center gap-1.5 text-neutral-600 hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-neutral-50"
              onClick={handleAgencyClick}
            >
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{agent.agencyName}</span>
            </div>
          )}

          {/* Location */}
          {agent.city && agent.country && (
            <div className="flex items-center gap-1.5 mt-2 text-neutral-600">
              <MapPinIcon className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">
                {agent.city}, {agent.country}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-4"></div>

        {/* Stats */}
        <div className="space-y-3">
          {/* Price Range */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <CurrencyDollarIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-neutral-600 uppercase">Price Range</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary">
                {getPriceRange()}
              </span>
              {isTeam && (
                <span className="text-xs text-neutral-500 italic">team</span>
              )}
            </div>
          </div>

          {/* Sales Stats */}
          <div className="grid grid-cols-2 gap-2">
            {/* Recent Sales */}
            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1 mb-1">
                <HomeIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-600 font-medium">Sales</span>
              </div>
              <p className="text-lg font-bold text-neutral-900">{agent.propertiesSold}</p>
              <p className="text-xs text-neutral-500">last 12 months</p>
            </div>

            {/* Active Listings */}
            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1 mb-1">
                <HomeIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs text-neutral-600 font-medium">Active</span>
              </div>
              <p className="text-lg font-bold text-neutral-900">{agent.activeListings || 0}</p>
              <p className="text-xs text-neutral-500">listings</p>
            </div>
          </div>

          {/* Team Sales Badge (if part of team) */}
          {isTeam && agent.city && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-center">
              <p className="text-sm text-yellow-900">
                <span className="font-bold text-lg">{agent.propertiesSold * 3}</span>
                <span className="text-xs font-medium ml-1">team sales in {agent.city}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
