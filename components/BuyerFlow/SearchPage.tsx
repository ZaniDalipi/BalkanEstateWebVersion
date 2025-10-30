import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import Header from '../shared/Header';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import PropertyDetailsPage from './PropertyDetailsPage';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters } from '../../types';
import { getAiChatResponse, generateSearchName } from '../../services/geminiService';
import SubscriptionModal from './SubscriptionModal';
import Toast from '../shared/Toast';
import L from 'leaflet';

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

    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [searchOnMove, setSearchOnMove] = useState(true);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
    const [recenterMap, setRecenterMap] = useState(true);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };
    
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
            case 'newest':
                sortedProperties.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
            default:
                break;
        }

        const manualFiltered = sortedProperties.filter(p => {
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

        if (searchOnMove && mapBounds) {
            return manualFiltered.filter(p => mapBounds.contains([p.lat, p.lng]));
        }

        return manualFiltered;

    }, [properties, filters, searchOnMove, mapBounds]);

    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setRecenterMap(true);
    }, []);

    const handleSortChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
        // Sorting shouldn't recenter the map, just re-order the list
        setRecenterMap(false);
    }, []);

    const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
        setMapBounds(bounds);
        // User moved the map, so we disable automatic recentering
        setRecenterMap(false);
    }, []);
    
    const handleSaveSearch = useCallback(async () => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }

        const isSearchMeaningful = filters.query.trim() !== '' || filters.minPrice || filters.maxPrice || filters.beds || filters.baths || filters.sellerType !== 'any';

        if (!isSearchMeaningful) {
            showToast("Cannot save an empty search. Please add some criteria.", 'error');
            return;
        }

        setIsSaving(true);
        try {
            const searchName = await generateSearchName(filters);
            const newSearch: SavedSearch = {
                id: `ss-${Date.now()}`,
                name: searchName,
                newPropertyCount: 0,
                properties: filteredProperties.slice(0, 5),
            };
            dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
            showToast("Search saved successfully!", 'success');
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search. AI might be busy.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, filters, filteredProperties]);
    
    const handleGetAlerts = useCallback(() => {
        dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true });
    }, [dispatch]);

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
        setRecenterMap(true);
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
                onSubscribeClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })}
            />
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
             <SubscriptionModal
                isOpen={state.isSubscriptionModalOpen}
                onClose={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: false })}
            />
            <main className="flex-grow flex flex-row overflow-hidden">
                <div className="w-full md:w-2/3 h-full overflow-y-auto">
                    <PropertyList 
                        properties={filteredProperties}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        onSaveSearch={handleSaveSearch}
                        onGetAlerts={handleGetAlerts}
                        isSaving={isSaving}
                        searchMode={searchMode}
                        onSearchModeChange={setSearchMode}
                        chatHistory={chatHistory}
                        onSendMessage={handleSendMessage}
                        isAiThinking={isAiThinking}
                        suggestedFilters={suggestedFilters}
                        onApplySuggestedFilters={handleApplySuggestedFilters}
                        onClearSuggestedFilters={handleClearSuggestedFilters}
                        searchOnMove={searchOnMove}
                        onSearchOnMoveChange={setSearchOnMove}
                    />
                </div>
                 <div className="relative hidden md:block w-1/3 h-full">
                     <MapComponent 
                        properties={filteredProperties} 
                        onBoundsChange={handleBoundsChange}
                        searchOnMove={searchOnMove}
                        recenter={recenterMap}
                     />
                </div>
            </main>
        </div>
    );
};

export default SearchPage;