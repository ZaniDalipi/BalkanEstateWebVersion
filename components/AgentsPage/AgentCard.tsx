import React, { useState, useEffect, useRef } from 'react';
import { Agent } from '../../types';
import StarRating from '../shared/StarRating';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  MapPinIcon,
  HomeIcon,
  ChevronRightIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon
} from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { slugify } from '../../utils/slug';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
  index?: number;
}

const AgentAvatar: React.FC<{ agent: Agent; size?: 'sm' | 'md' | 'lg' }> = ({ agent, size = 'md' }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  if (!agent.avatarUrl || error) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md`}>
        <UserCircleIcon className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-14 h-14' : 'w-16 h-16'} text-gray-400`} />
      </div>
    );
  }

  return (
    <img
      src={agent.avatarUrl}
      alt={agent.name}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-md transition-all duration-300 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
    />
  );
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, index = 0 }) => {
  const { dispatch } = useAppContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isAgencyAgent = agent.agencyName && agent.agencyName !== 'Independent Agent';
  const testimonialCount = agent.testimonials?.length || agent.totalReviews || 0;

  // Calculate median sold price
  const getMedianPrice = () => {
    if (agent.totalSalesValue && agent.propertiesSold > 0) {
      return formatPrice(agent.totalSalesValue / agent.propertiesSold, 'Serbia');
    }
    return '-';
  };

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
      ref={cardRef}
      className={`
        relative bg-white rounded-xl shadow-sm border border-gray-200
        hover:shadow-lg hover:border-gray-300
        transition-all duration-300 cursor-pointer overflow-hidden
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
      onClick={handleSelectAgent}
    >
      {/* Agency Header Bar - Like realestate.com.au */}
      {isAgencyAgent && (
        <div
          className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:from-red-700 hover:to-red-800 transition-colors"
          onClick={handleAgencyClick}
        >
          <div className="flex items-center gap-2">
            {agent.agencyLogo ? (
              <img
                src={agent.agencyLogo}
                alt={agent.agencyName}
                className="h-6 w-auto max-w-[100px] object-contain bg-white rounded px-1.5 py-0.5"
              />
            ) : (
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            )}
            <span className="text-white font-medium text-sm truncate max-w-[150px]">
              {agent.agencyName}
            </span>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-white/70" />
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Agent Info Row */}
        <div className="flex gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <AgentAvatar agent={agent} size="md" />
            {agent.licenseVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckBadgeIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name, Location, Rating */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
              {agent.name}
            </h3>

            {/* Role/Title */}
            <p className="text-sm text-gray-600 mb-1.5">
              {isAgencyAgent ? `Partner | Sales at ${agent.agencyName}` : 'Independent Agent'}
            </p>

            {/* Location */}
            {(agent.city || agent.country) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span>{[agent.city, agent.country].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-gray-900">
                  {agent.rating > 0 ? agent.rating.toFixed(1) : '-'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({testimonialCount} {testimonialCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>

        {/* Performance Stats - Like realestate.com.au */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {agent.propertiesSold || 0}
            </div>
            <div className="text-xs text-gray-500">Properties sold</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-xl font-bold text-gray-900">
              {getMedianPrice()}
            </div>
            <div className="text-xs text-gray-500">Median sold</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {agent.activeListings || 0}
            </div>
            <div className="text-xs text-gray-500">Active listings</div>
          </div>
        </div>

        {/* Quick Tags/Badges */}
        {agent.specializations && agent.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.specializations.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {spec}
              </span>
            ))}
            {agent.specializations.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{agent.specializations.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Recent Sold Properties Preview */}
        {agent.recentsales && agent.recentsales.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recent Sales</p>
            <div className="flex gap-1.5">
              {agent.recentsales.slice(0, 3).map((sale, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gray-100 rounded-md p-2 text-center"
                >
                  <HomeIcon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-700">
                    {formatPrice(sale.soldPrice, 'Serbia')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAgent();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            View Profile
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (agent.phone) {
                window.location.href = `tel:${agent.phone}`;
              }
            }}
            className="p-2.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
            title="Call"
          >
            <PhoneIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (agent.email) {
                window.location.href = `mailto:${agent.email}`;
              }
            }}
            className="p-2.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
            title="Email"
          >
            <EnvelopeIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
