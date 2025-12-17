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

interface CityMarketData {
    avgPrice: number; // EUR per m²
    daysToSell: number;
    yoyGrowth: number; // percentage
    sellingSpeed: number; // percentage faster/slower than average
}

// Market data for major Balkan cities
const MARKET_DATA: Record<string, CityMarketData> = {
    // Serbia
    'Belgrade': { avgPrice: 1850, daysToSell: 45, yoyGrowth: 12, sellingSpeed: 23 },
    'Novi Sad': { avgPrice: 1450, daysToSell: 52, yoyGrowth: 10, sellingSpeed: 18 },
    'Nis': { avgPrice: 950, daysToSell: 60, yoyGrowth: 8, sellingSpeed: 12 },
    'Kragujevac': { avgPrice: 850, daysToSell: 65, yoyGrowth: 7, sellingSpeed: 10 },
    'Subotica': { avgPrice: 900, daysToSell: 58, yoyGrowth: 9, sellingSpeed: 14 },

    // Kosovo
    'Prishtina': { avgPrice: 1200, daysToSell: 50, yoyGrowth: 15, sellingSpeed: 20 },
    'Prizren': { avgPrice: 850, daysToSell: 62, yoyGrowth: 12, sellingSpeed: 15 },
    'Peja': { avgPrice: 750, daysToSell: 68, yoyGrowth: 10, sellingSpeed: 11 },
    'Gjakova': { avgPrice: 700, daysToSell: 70, yoyGrowth: 9, sellingSpeed: 10 },
    'Ferizaj': { avgPrice: 680, daysToSell: 72, yoyGrowth: 8, sellingSpeed: 9 },

    // Albania
    'Tirana': { avgPrice: 1600, daysToSell: 48, yoyGrowth: 14, sellingSpeed: 22 },
    'Durres': { avgPrice: 1300, daysToSell: 55, yoyGrowth: 16, sellingSpeed: 19 },
    'Vlore': { avgPrice: 1250, daysToSell: 58, yoyGrowth: 13, sellingSpeed: 17 },
    'Shkoder': { avgPrice: 900, daysToSell: 64, yoyGrowth: 11, sellingSpeed: 13 },
    'Sarande': { avgPrice: 1400, daysToSell: 52, yoyGrowth: 18, sellingSpeed: 21 },

    // North Macedonia
    'Skopje': { avgPrice: 1100, daysToSell: 54, yoyGrowth: 11, sellingSpeed: 16 },
    'Bitola': { avgPrice: 750, daysToSell: 66, yoyGrowth: 8, sellingSpeed: 11 },
    'Ohrid': { avgPrice: 1200, daysToSell: 50, yoyGrowth: 14, sellingSpeed: 19 },
    'Tetovo': { avgPrice: 700, daysToSell: 70, yoyGrowth: 7, sellingSpeed: 9 },
    'Kumanovo': { avgPrice: 650, daysToSell: 72, yoyGrowth: 6, sellingSpeed: 8 },

    // Bosnia and Herzegovina
    'Sarajevo': { avgPrice: 1400, daysToSell: 51, yoyGrowth: 10, sellingSpeed: 18 },
    'Banja Luka': { avgPrice: 1000, daysToSell: 59, yoyGrowth: 9, sellingSpeed: 14 },
    'Mostar': { avgPrice: 950, daysToSell: 62, yoyGrowth: 8, sellingSpeed: 12 },
    'Tuzla': { avgPrice: 850, daysToSell: 65, yoyGrowth: 7, sellingSpeed: 10 },
    'Zenica': { avgPrice: 800, daysToSell: 68, yoyGrowth: 6, sellingSpeed: 9 },

    // Montenegro
    'Podgorica': { avgPrice: 1500, daysToSell: 49, yoyGrowth: 13, sellingSpeed: 20 },
    'Budva': { avgPrice: 2200, daysToSell: 42, yoyGrowth: 18, sellingSpeed: 28 },
    'Kotor': { avgPrice: 2100, daysToSell: 44, yoyGrowth: 17, sellingSpeed: 26 },
    'Tivat': { avgPrice: 1950, daysToSell: 46, yoyGrowth: 16, sellingSpeed: 24 },
    'Bar': { avgPrice: 1350, daysToSell: 53, yoyGrowth: 12, sellingSpeed: 17 },

    // Croatia
    'Zagreb': { avgPrice: 2100, daysToSell: 44, yoyGrowth: 11, sellingSpeed: 21 },
    'Split': { avgPrice: 2400, daysToSell: 40, yoyGrowth: 15, sellingSpeed: 25 },
    'Rijeka': { avgPrice: 1800, daysToSell: 47, yoyGrowth: 10, sellingSpeed: 19 },
    'Dubrovnik': { avgPrice: 3200, daysToSell: 35, yoyGrowth: 20, sellingSpeed: 32 },
    'Zadar': { avgPrice: 2000, daysToSell: 45, yoyGrowth: 13, sellingSpeed: 22 },

    // Greece
    'Athens': { avgPrice: 2300, daysToSell: 43, yoyGrowth: 12, sellingSpeed: 20 },
    'Thessaloniki': { avgPrice: 1700, daysToSell: 48, yoyGrowth: 10, sellingSpeed: 17 },
    'Patras': { avgPrice: 1300, daysToSell: 55, yoyGrowth: 8, sellingSpeed: 13 },
    'Heraklion': { avgPrice: 1500, daysToSell: 52, yoyGrowth: 11, sellingSpeed: 16 },
    'Rhodes': { avgPrice: 2100, daysToSell: 44, yoyGrowth: 15, sellingSpeed: 23 },

    // Bulgaria
    'Sofia': { avgPrice: 1350, daysToSell: 53, yoyGrowth: 11, sellingSpeed: 17 },
    'Plovdiv': { avgPrice: 1000, daysToSell: 59, yoyGrowth: 9, sellingSpeed: 14 },
    'Varna': { avgPrice: 1400, daysToSell: 51, yoyGrowth: 13, sellingSpeed: 19 },
    'Burgas': { avgPrice: 1250, daysToSell: 55, yoyGrowth: 12, sellingSpeed: 16 },
    'Ruse': { avgPrice: 850, daysToSell: 64, yoyGrowth: 7, sellingSpeed: 11 },

    // Romania
    'Bucharest': { avgPrice: 1600, daysToSell: 49, yoyGrowth: 13, sellingSpeed: 19 },
    'Cluj-Napoca': { avgPrice: 1450, daysToSell: 52, yoyGrowth: 12, sellingSpeed: 18 },
    'Timisoara': { avgPrice: 1200, daysToSell: 56, yoyGrowth: 10, sellingSpeed: 15 },
    'Brasov': { avgPrice: 1350, daysToSell: 53, yoyGrowth: 11, sellingSpeed: 17 },
    'Constanta': { avgPrice: 1300, daysToSell: 54, yoyGrowth: 12, sellingSpeed: 16 },
};

// Default market data for cities not in the list
const DEFAULT_MARKET_DATA: CityMarketData = {
    avgPrice: 1000,
    daysToSell: 60,
    yoyGrowth: 9,
    sellingSpeed: 15
};

const MarketInsightsAnimation: React.FC<MarketInsightsAnimationProps> = ({
    city = 'Belgrade',
    country = 'Serbia',
    propertyType = 'apartment'
}) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Get market data for the city, or use default
    const marketData = MARKET_DATA[city] || DEFAULT_MARKET_DATA;

    // Generate dynamic insights based on location and property type
    const insights: InsightCard[] = [
        {
            type: 'market',
            title: `${city} Market Overview`,
            content: `Average price in ${city}`,
            highlight: `€${marketData.avgPrice.toLocaleString()}/m²`,
            icon: '📊',
            trend: 'up'
        },
        {
            type: 'trend',
            title: 'Market Trends',
            content: 'Properties in your area are selling',
            highlight: `${marketData.sellingSpeed}% faster`,
            icon: '📈',
            trend: 'up'
        },
        {
            type: 'stat',
            title: 'Time on Market',
            content: 'Average days to sell',
            highlight: `${marketData.daysToSell} days`,
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
            highlight: `+${marketData.yoyGrowth}% ↗`,
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
                    <div className="text-2xl font-bold text-primary">€{marketData.avgPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">Avg. Price/m²</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-green-600">{marketData.daysToSell}</div>
                    <div className="text-xs text-gray-600 mt-1">Days to Sell</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-orange-600">+{marketData.yoyGrowth}%</div>
                    <div className="text-xs text-gray-600 mt-1">YoY Growth</div>
                </div>
            </div>
        </div>
    );
};

export default MarketInsightsAnimation;
