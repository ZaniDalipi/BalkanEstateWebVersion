import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useFeaturedAgencies } from '../src/features/agencies/hooks/useAgencies';
import { Agency } from '../types';
import { BuildingStorefrontIcon ,SparklesIcon, ArrowRightIcon } from '../constants';

const FeaturedAgencies: React.FC = () => {
  const { state } = useAppContext();
  const { data: agenciesData, isLoading, isError } = useFeaturedAgencies(8); // Fetch up to 8 agencies
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

  // Helper function to get color gradient based on agency type or index
  const getAgencyColor = (agency: Agency, index: number): string => {
    const typeColors: Record<string, string> = {
      'luxury': 'from-purple-500 to-pink-500',
      'commercial': 'from-blue-600 to-indigo-600',
      'boutique': 'from-rose-500 to-pink-500',
      'team': 'from-emerald-500 to-green-500',
      'standard': 'from-blue-500 to-cyan-500'
    };

    if (agency.type && typeColors[agency.type]) {
      return typeColors[agency.type];
    }

    // Fallback to index-based colors
    const indexColors = [
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-green-500',
      'from-rose-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500',
      'from-orange-500 to-yellow-500'
    ];

    return indexColors[index % indexColors.length];
  };

  // Helper function to get logo emoji based on agency type
  const getAgencyLogo = (agency: Agency): string => {
    const typeLogos: Record<string, string> = {
      'luxury': '👑',
      'commercial': '🏢',
      'boutique': '💎',
      'team': '👥',
      'standard': '🏠'
    };

    return agency.type && typeLogos[agency.type] ? typeLogos[agency.type] : '🏠';
  };

  // Helper function to calculate rating based on agency data
  const getAgencyRating = (agency: Agency): number => {
    // If we have sales stats, calculate a rating based on performance
    if (agency.salesStats) {
      const salesScore = Math.min(agency.salesStats.salesLast12Months / 50, 1);
      const propertiesScore = Math.min(agency.totalProperties / 100, 1);
      return Math.round((4 + (salesScore + propertiesScore) / 2) * 10) / 10;
    }

    // Default to a good rating based on years in business and properties
    const yearsScore = agency.yearsInBusiness ? Math.min(agency.yearsInBusiness / 20, 1) : 0.5;
    const propertiesScore = Math.min(agency.totalProperties / 100, 1);
    return Math.round((4 + (yearsScore + propertiesScore) / 2) * 10) / 10;
  };

  const agencies: Agency[] = agenciesData?.agencies || [];

  const handleAgencyClick = (agencyId: string) => {
    // Navigate to agency page
    window.location.href = `/agencies/${agencyId}`;
  };

  // Don't show the component if there are no featured agencies or if loading/error
  if (isLoading || isError || agencies.length === 0) {
    return null;
  }

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
          {agencies.map((agency, index) => {
            const color = getAgencyColor(agency, index);
            const logo = getAgencyLogo(agency);
            const rating = getAgencyRating(agency);
            const specialty = agency.specialties?.[0] || agency.type || 'Real Estate';

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
              onClick={() => handleAgencyClick(agency.slug || agency._id)}
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
                <div className={`h-32 bg-gradient-to-r ${color} relative overflow-hidden`}>
                  {/* Show cover image if available */}
                  {agency.coverImage && (
                    <img
                      src={agency.coverImage}
                      alt={agency.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}

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
                        logo
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <SparklesIcon className="w-4 h-4 text-yellow-300" />
                      <span className="text-white font-semibold text-sm">{rating}</span>
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
                    <span className="truncate capitalize">{specialty}</span>
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-primary">{agency.totalProperties || 0}</div>
                      <div className="text-xs text-neutral-500">Properties</div>
                    </div>

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
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ${
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
          })}
        </div>

        {/* CTA with magical entrance */}
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '1.5s' }}>
          <button className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-primary text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
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

      <style jsx>{`
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