import React from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import { TrophyIcon } from '../../constants';

interface AgentCardProps {
    agent: Agent & { rank: number; propertiesSold: number; totalSales: number; };
    onSelectAgent: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelectAgent }) => {
    const rank = agent.rank;
    
    const rankIconColors: { [key: number]: string } = {
        1: 'text-yellow-400',
        2: 'text-neutral-400',
        3: 'text-yellow-600',
    };
    
    const rankBorderColors: { [key: number]: string } = {
        1: 'border-yellow-400',
        2: 'border-neutral-400',
        3: 'border-yellow-600',
    };
    
    const cardBorderColor = rank < 4 ? rankBorderColors[rank] : 'border-neutral-200';
    const cardBgColor = rank === 1 ? 'bg-yellow-50/50' : (rank === 2 ? 'bg-neutral-100/70' : (rank === 3 ? 'bg-yellow-100/30' : 'bg-white'));


    return (
        <div className={`rounded-xl border-2 ${cardBorderColor} ${cardBgColor} p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative`}>
            
            <div className={`absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full ${rank === 1 ? 'bg-yellow-400' : (rank === 2 ? 'bg-neutral-400' : 'bg-yellow-600')} text-white font-bold text-sm shadow-md`}>
                {rank}
            </div>
            
            <div className={`relative mb-4 mt-4`}>
                 <img src={agent.avatarUrl} alt={agent.name} className={`w-24 h-24 rounded-full object-cover shadow-xl border-4 ${cardBorderColor}`}/>
            </div>
            
            <h3 className="font-bold text-lg text-neutral-800">{agent.name}</h3>
            <p className="text-sm text-neutral-500 mb-2">{agent.agency}</p>
            
            <StarRating rating={agent.rating} reviewCount={agent.reviewCount} />
            
            <div className="w-full flex justify-around items-center my-4 py-3 border-y border-neutral-200/80">
                <div className="text-center">
                    <p className="font-bold text-2xl text-primary">{agent.propertiesSold}</p>
                    <p className="text-xs text-neutral-500 uppercase font-semibold">Properties Sold</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-2xl text-primary">{agent.totalSales.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    <p className="text-xs text-neutral-500 uppercase font-semibold">Total Sales</p>
                </div>
            </div>

            <button
                onClick={onSelectAgent}
                className="mt-auto w-full px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-md"
            >
                View Profile
            </button>
        </div>
    );
};

export default AgentCard;