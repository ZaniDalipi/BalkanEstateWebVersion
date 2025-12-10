import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BuildingStorefrontIcon ,SparklesIcon, ArrowRightIcon } from '../constants';
import { useFeaturedAgencies } from '../src/features/agencies/hooks/useAgencies';
import { Agency } from '../types';

const FeaturedAgencies: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { agencies, isLoading } = useFeaturedAgencies(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          
          // Trigger confetti effect
          triggerConfetti();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasAnimated]);

  const triggerConfetti = () => {
    // Create confetti effect
    const confettiCount = 30;
    const container = containerRef.current;
    
    if (!container) return;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full';
      confetti.style.background = `linear-gradient(45deg, 
        ${['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B'][Math.floor(Math.random() * 4)]}, 
        ${['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B'][Math.floor(Math.random() * 4)]}
      )`;
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `-20px`;
      confetti.style.opacity = '0';
      confetti.style.zIndex = '50';
      
      container.appendChild(confetti);
      
      // Animate confetti
      setTimeout(() => {
        confetti.style.transition = 'all 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)';
        confetti.style.opacity = '1';
        confetti.style.transform = `translateY(${window.innerHeight * 0.5}px) rotate(${Math.random() * 720}deg)`;
        confetti.style.left = `${parseFloat(confetti.style.left) + (Math.random() * 40 - 20)}%`;
      }, i * 30);
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.style.opacity = '0';
        setTimeout(() => {
          if (container.contains(confetti)) {
            container.removeChild(confetti);
          }
        }, 300);
      }, 1200);
    }
  };

  // Color gradients for agency cards
  const colorGradients = [
    "from-purple-500 to-pink-500",
    "from-amber-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-green-500",
  ];

  // Get agency type badge color and emoji
  const getAgencyTypeInfo = (type?: string) => {
    switch (type) {
      case 'luxury':
        return { emoji: '👑', label: 'Luxury Properties' };
      case 'commercial':
        return { emoji: '🏢', label: 'Commercial Properties' };
      case 'boutique':
        return { emoji: '🗝️', label: 'Boutique Agency' };
      case 'team':
        return { emoji: '👥', label: 'Team Agency' };
      default:
        return { emoji: '🏠', label: 'Real Estate' };
    }
  };

  const handleAgencyClick = (agency: Agency) => {
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: agency._id });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
    let urlSlug = agency.slug || agency._id;
    urlSlug = urlSlug.replace(',', '/');
    window.history.pushState({}, '', `/agencies/${urlSlug}`);
  };

  const handleExploreAll = () => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });
    window.history.pushState({}, '', '/agencies');
  };

  return (
    <div 
      ref={containerRef}
      className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Magic curtain effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-transparent transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}
        style={{
          clipPath: isVisible ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          transition: 'clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1)'
        }}
      />
      
      {/* Floating magic orbs */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 backdrop-blur-sm transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: `${40 + i * 10}px`,
            height: `${40 + i * 10}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + i * 5}%`,
            animation: isVisible ? `float 8s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.5}s`,
            filter: 'blur(10px)',
            transitionDelay: `${i * 0.1}s`
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with magical entrance */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`relative transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'
            }`} style={{ transitionDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-primary blur-lg rounded-full opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-white to-purple-50 rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                <BuildingStorefrontIcon className="w-8 h-8 text-primary" />
                <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin" />
              </div>
            </div>
            
            <div className={`h-12 w-1 bg-gradient-to-b from-purple-400 to-primary rounded-full transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            }`} style={{ transitionDelay: '0.5s' }} />
            
            <div className={`relative transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
            }`} style={{ transitionDelay: '0.6s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 blur-lg rounded-full opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                <SparklesIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '0.7s' }}>
            Magically Featured Agencies
          </h2>
          
          <p className={`text-lg text-neutral-600 max-w-2xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '0.8s' }}>
            Discover properties through our enchanted network of trusted real estate partners
          </p>
        </div>

        {/* Agencies grid with staggered entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden">
                  <div className="h-32 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-200 rounded w-1/3" />
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : agencies.length > 0 ? (
            agencies.map((agency, index) => {
              const typeInfo = getAgencyTypeInfo(agency.type);
              const colorGradient = colorGradients[index % colorGradients.length];

              return (
            <div
              key={agency._id}
              className={`group relative transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${0.9 + index * 0.1}s`,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
              }}
              onClick={() => handleAgencyClick(agency)}
            >
              {/* Magic glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-primary to-blue-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              
              {/* Magic trail effect on hover */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s infinite linear'
                   }} />
              
              {/* Agency card */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-500">
                {/* Header with gradient or cover image */}
                <div className={`h-32 bg-gradient-to-r ${colorGradient} relative overflow-hidden`}
                     style={agency.coverImage ? {
                       backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${agency.coverImage})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center'
                     } : {}}>
                  {/* Animated particles in header */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}

                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl overflow-hidden">
                      {agency.logo ? (
                        <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{typeInfo.emoji}</span>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <SparklesIcon className="w-4 h-4 text-yellow-300" />
                      <span className="text-white font-semibold text-sm">Featured</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary transition-colors duration-300 truncate">
                    {agency.name}
                  </h3>

                  <p className="text-sm text-neutral-600 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-primary rounded-full animate-pulse" />
                    <span className="truncate">{typeInfo.label}</span>
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-primary">{agency.totalProperties || 0}</div>
                      <div className="text-xs text-neutral-500">Properties</div>
                    </div>

                    {agency.totalAgents > 0 && (
                      <div className="text-left">
                        <div className="text-2xl font-bold text-purple-600">{agency.totalAgents}</div>
                        <div className="text-xs text-neutral-500">Agents</div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <ArrowRightIcon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-primary rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorGradient} rounded-full transition-all duration-1000 ${
                        isVisible ? 'w-full' : 'w-0'
                      }`}
                      style={{ transitionDelay: `${1.2 + index * 0.1}s` }}
                    />
                  </div>
                </div>

                {/* Magic corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400/50 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400/50 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400/50 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400/50 rounded-br-xl" />
              </div>
            </div>
              );
            })
          ) : (
            // Empty state
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 text-lg">No featured agencies available at the moment.</p>
            </div>
          )}
        </div>

        {/* CTA with magical entrance */}
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '1.5s' }}>
          <button
            onClick={handleExploreAll}
            className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-primary text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <span className="relative z-10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5" />
              Explore All Magical Agencies
              <SparklesIcon className="w-5 h-5" />
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-primary rounded-xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
          </button>
          
          <p className="text-neutral-500 text-sm mt-6 flex items-center justify-center gap-2">
            <span className="animate-pulse">✨</span>
            Each agency is carefully selected by our magical algorithms
            <span className="animate-pulse">✨</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default FeaturedAgencies;