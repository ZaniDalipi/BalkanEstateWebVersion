import React from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import { TrophyIcon, UserCircleIcon, CheckCircleIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';

interface AgentCardProps {
  agent: Agent;
  rank: number;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, rank }) => {
  const { dispatch } = useAppContext();

  const rankColors: { [key: number]: { bg: string; text: string; border: string } } = {
    1: { bg: 'bg-yellow-400', text: 'text-yellow-800', border: 'border-yellow-400' },
    2: { bg: 'bg-neutral-300', text: 'text-neutral-700', border: 'border-neutral-400' },
    3: { bg: 'bg-yellow-600', text: 'text-yellow-900', border: 'border-yellow-600' },
  };

  const rankColor = rankColors[rank] || { bg: 'bg-neutral-200', text: 'text-neutral-600', border: 'border-neutral-300' };

  const handleSelectAgent = () => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agent.id });
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${rank <= 3 ? rankColor.border : 'border-neutral-200'}`}
      onClick={handleSelectAgent}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {agent.avatarUrl ? (
              <img src={agent.avatarUrl} alt={agent.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="w-16 h-16 text-neutral-300" />
            )}
            <div>
              <h3 className="text-lg font-bold text-neutral-900">{agent.name}</h3>
              {agent.city && agent.country && (
                  <p className="text-sm text-neutral-500 font-medium">{agent.city}, {agent.country}</p>
              )}
              {agent.licenseNumber && (
                  <div className="flex items-center gap-1 mt-1 text-green-700">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">Trusted Agent</span>
                  </div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <StarRating rating={agent.rating} className="w-4 h-4" />
                <span className="text-sm font-semibold text-neutral-600">{agent.rating.toFixed(1)}</span>
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
  );
};

export default AgentCard;