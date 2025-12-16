import React, { useState, useEffect } from 'react';

interface MarketInsightsAnimationProps {
    city?: string;
    country?: string;
    propertyType?: string;
}

interface InsightCard {
    type: 'market' | 'tip' | 'stat' | 'trend';
    title: string;
    content: string;
    icon: string;
    highlight?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const MarketInsightsAnimation: React.FC<MarketInsightsAnimationProps> = ({
    city = 'Belgrade',
    country = 'Serbia',
    propertyType = 'apartment'
}) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Generate dynamic insights based on location and property type
    const insights: InsightCard[] = [
        {
            type: 'market',
            title: `${city} Market Overview`,
            content: `Average price in ${city}`,
            highlight: '€1,850/m²',
            icon: '📊',
            trend: 'up'
        },
        {
            type: 'trend',
            title: 'Market Trends',
            content: 'Properties in your area are selling',
            highlight: '23% faster',
            icon: '📈',
            trend: 'up'
        },
        {
            type: 'stat',
            title: 'Time on Market',
            content: 'Average days to sell',
            highlight: '45 days',
            icon: '⏱️',
            trend: 'neutral'
        },
        {
            type: 'tip',
            title: 'Pro Tip',
            content: 'Listings with professional photos sell 32% faster and for',
            highlight: '11% more',
            icon: '📸',
            trend: 'up'
        },
        {
            type: 'stat',
            title: 'Success Rate',
            content: 'Properties in your area sell within asking price',
            highlight: '89% of time',
            icon: '🎯',
            trend: 'up'
        },
        {
            type: 'tip',
            title: 'Best Practice',
            content: 'Adding a virtual tour increases buyer inquiries by',
            highlight: '67%',
            icon: '🏠',
            trend: 'up'
        },
        {
            type: 'market',
            title: 'Year Over Year',
            content: `${city} property values`,
            highlight: '+12% ↗',
            icon: '💰',
            trend: 'up'
        },
        {
            type: 'tip',
            title: 'Pricing Strategy',
            content: 'Competitively priced properties receive first inquiry within',
            highlight: '3 days',
            icon: '💡',
            trend: 'neutral'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentCardIndex((prev) => (prev + 1) % insights.length);
                setIsAnimating(false);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, [insights.length]);

    const currentInsight = insights[currentCardIndex];

    const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    const getCardGradient = (type: string) => {
        switch (type) {
            case 'market': return 'from-blue-50 to-blue-100';
            case 'tip': return 'from-purple-50 to-purple-100';
            case 'stat': return 'from-green-50 to-green-100';
            case 'trend': return 'from-orange-50 to-orange-100';
            default: return 'from-gray-50 to-gray-100';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            {/* Main Card */}
            <div
                className={`
                    w-full max-w-2xl bg-gradient-to-br ${getCardGradient(currentInsight.type)}
                    rounded-2xl shadow-xl p-8 border-2 border-white
                    transition-all duration-300 transform
                    ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
                `}
            >
                {/* Icon and Type Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{currentInsight.icon}</span>
                        <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {currentInsight.type}
                        </span>
                    </div>
                    {currentInsight.trend && (
                        <div className={`flex items-center gap-1 ${getTrendColor(currentInsight.trend)}`}>
                            {currentInsight.trend === 'up' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {currentInsight.title}
                </h3>

                {/* Content */}
                <p className="text-lg text-gray-700 mb-4">
                    {currentInsight.content}
                </p>

                {/* Highlight */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                    <p className={`text-4xl font-bold ${getTrendColor(currentInsight.trend)}`}>
                        {currentInsight.highlight}
                    </p>
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex items-center gap-2 mt-6">
                {insights.map((_, index) => (
                    <div
                        key={index}
                        className={`
                            h-2 rounded-full transition-all duration-300
                            ${index === currentCardIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}
                        `}
                    />
                ))}
            </div>

            {/* Status Text */}
            <div className="mt-8 text-center">
                <h3 className="text-xl font-bold text-neutral-800 flex items-center justify-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping absolute"></div>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    Analyzing Your Property...
                </h3>
                <p className="text-neutral-600 mt-2 max-w-md mx-auto">
                    While our AI works, learn about the {city} real estate market
                </p>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-primary">€1,850</div>
                    <div className="text-xs text-gray-600 mt-1">Avg. Price/m²</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-xs text-gray-600 mt-1">Days to Sell</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-orange-600">+12%</div>
                    <div className="text-xs text-gray-600 mt-1">YoY Growth</div>
                </div>
            </div>
        </div>
    );
};

export default MarketInsightsAnimation;
