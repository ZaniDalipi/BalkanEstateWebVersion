import React, { useState } from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import { UserCircleIcon, BuildingOfficeIcon, CheckBadgeIcon } from '../../constants';
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
      className="bg-white rounded-lg shadow-md border border-neutral-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={handleSelectAgent}
    >
      <div className="p-6">
        {/* Team Badge */}
        {isTeam && (
          <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
            TEAM
          </div>
        )}

        {/* Agent Avatar and Info */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="relative mb-3">
            <AgentAvatar agent={agent} />
            {/* Premier Agent Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
              <CheckBadgeIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <StarRating rating={agent.rating} className="w-4 h-4" />
            </div>
            {agent.rating > 0 ? (
              <span className="text-sm font-semibold text-neutral-700">
                {agent.rating.toFixed(1)} ({testimonialCount})
              </span>
            ) : (
              <span className="text-sm text-neutral-500 italic">No reviews</span>
            )}
          </div>

          {/* Agent Name */}
          <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
            {agent.name}
          </h3>

          {/* Agency/Brokerage */}
          {agent.agencyName && (
            <div
              className="flex items-center gap-1 text-neutral-600 hover:text-primary transition-colors mb-2"
              onClick={handleAgencyClick}
            >
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{agent.agencyName}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-4"></div>

        {/* Stats */}
        <div className="space-y-2 text-sm">
          {/* Price Range */}
          <div className="flex items-start gap-2">
            <span className="text-neutral-600 font-medium">
              {getPriceRange()}
            </span>
            {isTeam && (
              <span className="text-xs text-neutral-500">team price range</span>
            )}
          </div>

          {/* Recent Sales */}
          <div className="text-neutral-700">
            <span className="font-bold">{agent.propertiesSold}</span> recent sales last 12 months
          </div>

          {/* Location Sales (if part of team) */}
          {isTeam && agent.city && (
            <div className="text-neutral-700">
              <span className="font-bold">{agent.propertiesSold * 3}</span> team sales in {agent.city}
            </div>
          )}

          {/* Active Listings */}
          {agent.activeListings > 0 && (
            <div className="text-neutral-700">
              <span className="font-bold">{agent.activeListings}</span> active listings
            </div>
          )}
        </div>

        {/* Location */}
        {agent.city && agent.country && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">
              📍 {agent.city}, {agent.country}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
