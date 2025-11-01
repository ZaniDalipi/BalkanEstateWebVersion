import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import PropertyDetailsPage from './PropertyDetailsPage';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters } from '../../types';
import { getAiChatResponse, generateSearchName } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { Bars3Icon, MapPinIcon } from '../../constants';

const SearchPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { properties, selectedProperty, isAuthenticated } = state;

    const [filters, setFilters] = useState<Filters>({
        query: '',
        minPrice: null,
        maxPrice: null,
        beds: null,
        baths: null,
        minSqft: null,
        maxSqft: null,
        sortBy: 'newest',
        sellerType: 'any',
        propertyType: 'any',
    });
    
    const [searchOnMove, setSearchOnMove] = useState(true);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

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

        return sortedProperties.filter(p => {
            const queryMatch = filters.query ? 
                p.address.toLowerCase().includes(filters.query.toLowerCase()) || 
                p.city.toLowerCase().includes(filters.query.toLowerCase()) : true;
            
            const minPriceMatch = filters.minPrice ? p.price >= filters.minPrice : true;
            const maxPriceMatch = filters.maxPrice ? p.price <= filters.maxPrice : true;
            const bedsMatch = filters.beds ? p.beds >= filters.beds : true;
            const bathsMatch = filters.baths ? p.baths >= filters.baths : true;
            const minSqftMatch = filters.minSqft ? p.sqft >= filters.minSqft : true;
            const maxSqftMatch = filters.maxSqft ? p.sqft <= filters.maxSqft : true;
            const sellerTypeMatch = filters.sellerType !== 'any' ? p.seller.type === filters.sellerType : true;
            const propertyTypeMatch = filters.propertyType !== 'any' ? p.propertyType === filters.propertyType : true;
            const boundsMatch = !searchOnMove || !mapBounds || mapBounds.contains([p.lat, p.lng]);

            return queryMatch && minPriceMatch && maxPriceMatch && bedsMatch && bathsMatch && sellerTypeMatch && propertyTypeMatch && boundsMatch && minSqftMatch && maxSqftMatch;
        });

    }, [properties, filters, searchOnMove, mapBounds]);

    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setRecenterMap(true);
    }, []);

    const handleSortChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, sortBy: value }));
        setRecenterMap(false);
    }, []);
    
    const handleSaveSearch = useCallback(async () => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }

        const isSearchMeaningful = filters.query.trim() !== '' || filters.minPrice || filters.maxPrice || filters.beds || filters.baths || filters.minSqft || filters.maxSqft || filters.sellerType !== 'any';

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
    
    const handleMapMove = useCallback((newBounds: L.LatLngBounds) => {
        setMapBounds(newBounds);
        setRecenterMap(false);
    }, []);

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
            minSqft: suggestedFilters.minSqft || null,
            maxSqft: suggestedFilters.maxSqft || null,
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
        <div className="flex flex-col h-full overflow-hidden">
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
            <main className="flex-grow flex flex-row overflow-hidden relative">
                <div className={`w-full md:w-2/3 lg:w-1/2 xl:w-1/3 h-full overflow-y-auto bg-white ${mobileView === 'map' ? 'hidden md:block' : ''}`}>
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
                 <div className={`relative w-full h-full md:w-1/3 lg:w-1/2 xl:w-2/3 ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
                     <MapComponent 
                        properties={filteredProperties} 
                        recenter={recenterMap}
                        onMapMove={handleMapMove}
                     />
                </div>

                <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={() => setMobileView(v => v === 'list' ? 'map' : 'list')}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-semibold rounded-full shadow-lg hover:bg-neutral-900 transition-colors"
                    >
                        {mobileView === 'list' ? (
                            <>
                                <MapPinIcon className="w-5 h-5" />
                                <span>Map</span>
                            </>
                        ) : (
                            <>
                                <Bars3Icon className="w-5 h-5" />
                                <span>List</span>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SearchPage;