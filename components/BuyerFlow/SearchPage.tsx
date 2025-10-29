import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import Header from '../shared/Header';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import PropertyDetailsPage from './PropertyDetailsPage';
import { SavedSearch, ChatMessage, AiSearchQuery } from '../../types';
import { getAiChatResponse } from '../../services/geminiService';
import SubscriptionModal from './SubscriptionModal';

export type SellerType = 'any' | 'agent' | 'private';

export interface Filters {
    query: string;
    minPrice: number | null;
    maxPrice: number | null;
    beds: number | null;
    baths: number | null;
    sortBy: string;
    sellerType: SellerType;
    propertyType: string;
}

const SearchPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { properties, selectedProperty, isAuthenticated } = state;

    const [filters, setFilters] = useState<Filters>({
        query: '',
        minPrice: null,
        maxPrice: null,
        beds: null,
        baths: null,
        sortBy: 'price_asc',
        sellerType: 'any',
        propertyType: 'any',
    });
    
    const filteredProperties = useMemo(() => {
        let sortedProperties = [...properties];

        // Sorting
        switch (filters.sortBy) {
            case 'price_asc':
                sortedProperties.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sortedProperties.sort((a, b) => b.price - a.price);
                break;
            case 'beds_desc':
                sortedProperties.sort((a, b) => b.beds - a.beds);
                break;
            default:
                break;
        }

        return sortedProperties.filter(p => {
            const queryMatch = filters.query ? 
                p.address.toLowerCase().includes(filters.query.toLowerCase()) || 
                p.city.toLowerCase().includes(filters.query.toLowerCase()) : true;
            
            const minPriceMatch = filters.minPrice ? p.price >= filters.minPrice : true;
            const maxPriceMatch = filters.maxPrice ? p.price <= filters.maxPrice : true;
            const bedsMatch = filters.beds ? p.beds >= filters.beds : true;
            const bathsMatch = filters.baths ? p.baths >= filters.baths : true;
            const sellerTypeMatch = filters.sellerType !== 'any' ? p.seller.type === filters.sellerType : true;

            return queryMatch && minPriceMatch && maxPriceMatch && bedsMatch && bathsMatch && sellerTypeMatch;
        });
    }, [properties, filters]);

    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSortChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
    }, []);
    
    const handleSaveSearch = useCallback(() => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }

        const newSearch: SavedSearch = {
            id: `ss-${Date.now()}`,
            name: filters.query || `Properties in ${filteredProperties.length > 0 ? filteredProperties[0].city : 'selected area'}`,
            newPropertyCount: 0,
            properties: filteredProperties.slice(0, 5),
        };
        dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
    }, [isAuthenticated, dispatch, filters, filteredProperties]);
    
    // AI Search logic
    const [searchMode, setSearchMode] = useState<'manual' | 'ai'>('manual');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'Hello! How can I help you find your perfect home today?' }
    ]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [suggestedFilters, setSuggestedFilters] = useState<AiSearchQuery | null>(null);

    const handleSendMessage = useCallback(async (message: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: message }];
        setChatHistory(newHistory);
        setIsAiThinking(true);
        setSuggestedFilters(null);

        try {
            const aiResponse = await getAiChatResponse(newHistory, properties);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse.responseMessage }]);
            if (aiResponse.searchQuery && aiResponse.isFinalQuery) {
                setSuggestedFilters(aiResponse.searchQuery);
            }
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setIsAiThinking(false);
        }
    }, [chatHistory, properties]);

    const handleApplySuggestedFilters = useCallback(() => {
        if (!suggestedFilters) return;

        setFilters(prev => ({
            ...prev,
            query: suggestedFilters.location || prev.query,
            minPrice: suggestedFilters.minPrice || null,
            maxPrice: suggestedFilters.maxPrice || null,
            beds: suggestedFilters.beds || null,
            baths: suggestedFilters.baths || null,
        }));
        setSearchMode('manual');
        setSuggestedFilters(null);
    }, [suggestedFilters]);

    const handleClearSuggestedFilters = useCallback(() => {
        setSuggestedFilters(null);
    }, []);

    if (selectedProperty) {
        return <PropertyDetailsPage property={selectedProperty} />;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header
                userRole={state.userRole}
                dispatch={dispatch}
                onSubscribeClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })}
            />
             <SubscriptionModal
                isOpen={state.isSubscriptionModalOpen}
                onClose={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: false })}
            />
            <main className="flex-grow flex flex-row overflow-hidden">
                <div className="w-full md:w-2/3 h-full overflow-y-auto pb-20">
                    <PropertyList 
                        properties={filteredProperties}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        onSaveSearch={handleSaveSearch}
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
                 <div className="relative hidden md:block w-1/3 h-full">
                     <MapComponent properties={filteredProperties} />
                </div>
            </main>
        </div>
    );
};

export default SearchPage;