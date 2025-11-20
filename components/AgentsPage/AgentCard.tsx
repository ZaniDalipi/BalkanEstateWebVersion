import React, { useState, useEffect } from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import { TrophyIcon, UserCircleIcon, BuildingOfficeIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { slugify } from '../../utils/slug';

interface AgentCardProps {
  agent: Agent;
  rank: number;
}

const AgentAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [error, setError] = useState(false);

    if (!agent.avatarUrl || error) {
        return <UserCircleIcon className="w-16 h-16 text-neutral-300" />;
    }

    return (
        <img 
            src={agent.avatarUrl} 
            alt={agent.name} 
            className="w-16 h-16 rounded-full object-cover"
            onError={() => setError(true)}
        />
    );
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, rank }) => {
  const { dispatch } = useAppContext();
  const [showAnimation, setShowAnimation] = useState(true);

  // Disable animations after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const rankColors: { [key: number]: { bg: string; text: string; border: string } } = {
    1: { bg: 'bg-yellow-400', text: 'text-yellow-800', border: 'border-yellow-400' },
    2: { bg: 'bg-neutral-300', text: 'text-neutral-700', border: 'border-neutral-400' },
    3: { bg: 'bg-yellow-600', text: 'text-yellow-900', border: 'border-yellow-600' },
  };

  const rankColor = rankColors[rank] || { bg: 'bg-neutral-200', text: 'text-neutral-600', border: 'border-neutral-300' };

  // Animation for top 3 (staggered bounce effect)
  const getAnimationStyle = (): React.CSSProperties => {
    if (!showAnimation || rank > 3) return {};
    const delays = [0, 300, 600]; // ms delays for each rank
    return {
      animation: `gentle-bounce 2s ease-in-out infinite`,
      animationDelay: `${delays[rank - 1]}ms`,
    };
  };

  const handleSelectAgent = () => {
    // Use agentId for URL-friendly sharing, fallback to id
    const agentIdentifier = agent.agentId || agent.id;
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agentIdentifier });
    // Update URL to use agentId
    window.history.pushState({}, '', `/agents/${agentIdentifier}`);
  };

  const handleAgencyClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering agent selection

    // Don't navigate if no agency name
    if (!agent.agencyName || agent.agencyName === 'Independent Agent') {
      return;
    }

    // Use agencyId if available for direct lookup, otherwise fallback to slug
    const agencyIdentifier = agent.agencyId || slugify(agent.agencyName);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      console.log('🔗 Fetching agency:', agencyIdentifier, 'for agent:', agent.name);

      const response = await fetch(`${API_URL}/agencies/${agencyIdentifier}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Agency found:', data.agency.name);

        // Pass the full agency object and navigate
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: data.agency });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });

        // Update URL - convert old comma format to new forward slash format
        let urlSlug = data.agency.slug || data.agency._id;
        // Replace comma with forward slash for backward compatibility with old slugs
        urlSlug = urlSlug.replace(',', '/');
        window.history.pushState({}, '', `/agencies/${urlSlug}`);
      } else {
        console.error('❌ Agency not found:', agent.agencyName, 'with identifier:', agencyIdentifier);
        alert(
          `⚠️ Agency Not Found\n\n` +
          `The agency "${agent.agencyName}" is referenced in this agent's profile ` +
          `but doesn't exist in the database.\n\n` +
          `This agent's data may be outdated or the agency was deleted.\n\n` +
          `Identifier used: ${agencyIdentifier}`
        );
      }
    } catch (error) {
      console.error('Error fetching agency:', error);
      alert('Failed to load agency details. Please check your connection and try again.');
    }
  };

  return (
    <>
      <style>{`
        @keyframes gentle-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      <div
        className={`bg-white rounded-xl shadow-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${rank <= 3 ? rankColor.border : 'border-neutral-200'}`}
        style={getAnimationStyle()}
        onClick={handleSelectAgent}
      >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AgentAvatar agent={agent} />
            <div>
              <h3 className="text-lg font-bold text-neutral-900">{agent.name}</h3>
              {agent.agencyName && (
                <div
                  className="flex items-center gap-1 mt-1 mb-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={handleAgencyClick}
                  title="View agency profile"
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold underline decoration-dotted">{agent.agencyName}</span>
                </div>
              )}
              {agent.city && agent.country && (
                  <p className="text-sm text-neutral-500 font-medium">{agent.city}, {agent.country}</p>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                {agent.rating > 0 ? (
                  <>
                    <StarRating rating={agent.rating} className="w-4 h-4" />
                    <span className="text-sm font-semibold text-neutral-600">{agent.rating.toFixed(1)}</span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500 italic">No reviews yet</span>
                )}
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-full text-sm ${rankColor.bg} ${rankColor.text}`}>
            <TrophyIcon className="w-4 h-4" />
            <span>#{rank}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center border-t border-neutral-100 pt-4">
          <div>
            <p className="text-xs text-neutral-500 font-semibold">Total Sales</p>
            <p className="text-lg font-bold text-primary">{formatPrice(agent.totalSalesValue, 'Serbia')}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-semibold">Properties Sold</p>
            <p className="text-lg font-bold text-primary">{agent.propertiesSold}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AgentCard;