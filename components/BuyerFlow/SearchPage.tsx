import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import Header from '../shared/Header';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import PropertyDetailsPage from './PropertyDetailsPage';
import SubscriptionModal from './SubscriptionModal';
import PricingPlans from '../SellerFlow/PricingPlans';
import { getAiChatResponse } from '../../services/geminiService';
import { AiSearchQuery, ChatMessage } from '../../types';

const SearchPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { properties, selectedProperty, isSubscriptionModalOpen, isPricingModalOpen } = state;

    const [filters, setFilters] = useState({
        query: '',
        minPrice: null,
        maxPrice: null,
        beds: null,
        baths: null,
        sortBy: 'price_asc',
        specialFeatures: [] as string[],
    });
    
    const [searchMode, setSearchMode] = useState<'manual' | 'ai'>('manual');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{
        sender: 'ai',
        text: "Hello! I'm your AI assistant. How can I help you find the perfect property today?"
    }]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [suggestedFilters, setSuggestedFilters] = useState<AiSearchQuery | null>(null);

    const handleFilterChange = useCallback((name: string, value: string | number | null) => {
        const numericValue = (name === 'minPrice' || name === 'maxPrice' || name === 'beds' || name === 'baths') 
            ? (value ? parseInt(value as string, 10) : null)
            : value;
        setFilters(prev => ({ ...prev, [name]: numericValue }));
    }, []);
    
    const handleSortChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
    }, []);

    const applyAiSearchQuery = useCallback((query: AiSearchQuery) => {
        setFilters(prev => ({
            ...prev,
            query: query.location || prev.query,
            minPrice: query.minPrice || null,
            maxPrice: query.maxPrice || null,
            beds: query.beds || null,
            baths: query.baths || null,
            specialFeatures: query.features || [],
        }));
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!message || isAiThinking) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: message };
        const newHistory = [...chatHistory, newUserMessage];
        setChatHistory(newHistory);
        setIsAiThinking(true);
        setSuggestedFilters(null);

        try {
            const aiResponse = await getAiChatResponse(newHistory, properties);
            
            const newAiMessage: ChatMessage = { sender: 'ai', text: aiResponse.responseMessage };
            setChatHistory(currentHistory => [...currentHistory, newAiMessage]);

            if (aiResponse.isFinalQuery && aiResponse.searchQuery) {
                setSuggestedFilters(aiResponse.searchQuery);
            }

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I encountered an error. Please try again or use the manual search." };
            setChatHistory(currentHistory => [...currentHistory, errorMessage]);
        } finally {
            setIsAiThinking(false);
        }
    }, [chatHistory, isAiThinking, properties]);

    const handleApplySuggestedFilters = useCallback(() => {
        if (suggestedFilters) {
            applyAiSearchQuery(suggestedFilters);
            setSuggestedFilters(null);
            setSearchMode('manual');
        }
    }, [suggestedFilters, applyAiSearchQuery]);

    const handleClearSuggestedFilters = useCallback(() => {
        setSuggestedFilters(null);
    }, []);
    
    const filteredProperties = useMemo(() => {
        let filtered = properties;

        filtered = filtered.filter(prop => {
            const queryLower = filters.query.toLowerCase();
            const matchesQuery = !filters.query || prop.address.toLowerCase().includes(queryLower) || prop.city.toLowerCase().includes(queryLower);
            const matchesMinPrice = filters.minPrice === null || prop.price >= filters.minPrice;
            const matchesMaxPrice = filters.maxPrice === null || prop.price <= filters.maxPrice;
            const matchesBeds = filters.beds === null || prop.beds >= filters.beds;
            const matchesBaths = filters.baths === null || prop.baths >= filters.baths;
            const matchesFeatures = filters.specialFeatures.length === 0 || 
                filters.specialFeatures.every(feature => 
                    prop.specialFeatures.some(propFeature => propFeature.toLowerCase().includes(feature.toLowerCase()))
                );

            return matchesQuery && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && matchesFeatures;
        });

        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price_desc':
                    return b.price - a.price;
                case 'beds_desc':
                    return b.beds - a.beds;
                case 'price_asc':
                default:
                    return a.price - b.price;
            }
        });
        
        return filtered;
    }, [properties, filters]);

    const handleSubscribeClick = () => {
        dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true });
    };

    const handleCloseSubscriptionModal = () => {
        dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: false });
    };

    const handleClosePricingModal = () => {
        dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: false });
    };

    if (selectedProperty) {
        return <PropertyDetailsPage property={selectedProperty} />;
    }

    return (
        <div className="h-screen flex flex-col">
            <Header userRole={state.userRole} dispatch={dispatch} onSubscribeClick={handleSubscribeClick} />
            <div className="flex-grow flex relative overflow-hidden">
                <MapComponent properties={filteredProperties} />
                <PropertyList 
                    properties={filteredProperties}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    searchMode={searchMode}
                    onSearchModeChange={setSearchMode}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isAiThinking={isAiThinking}
                    suggestedFilters={suggestedFilters}
                    onApplySuggestedFilters={handleApplySuggestedFilters}
                    onClearSuggestedFilters={handleClearSuggestedFilters}
                />
            </div>
            <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={handleCloseSubscriptionModal} />
            <PricingPlans isOpen={isPricingModalOpen} onClose={handleClosePricingModal} />
        </div>
    );
};

export default SearchPage;