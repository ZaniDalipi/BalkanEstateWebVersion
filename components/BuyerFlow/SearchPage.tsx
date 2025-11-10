
declare namespace google.maps {
  export interface LatLngBoundsLiteral {
    north: number;
    south: number;
    east: number;
    west: number;
  }
}




import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters, initialFilters, SearchPageState, Property } from '../../types';
import Toast from '../shared/Toast';
import { Bars3Icon, SearchIcon, UserIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon, BellIcon, PlusIcon, SparklesIcon, CrosshairsIcon, SpinnerIcon } from '../../constants';
import { filterProperties } from '../../utils/propertyUtils';
import AiSearch from './AiSearch';
import Modal from '../shared/Modal';

interface SearchPageProps {
    onToggleSidebar: () => void;
}

const AiChatModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    properties: Property[];
    onApplyFilters: (query: AiSearchQuery) => void;
    history: ChatMessage[];
    onHistoryChange: (history: ChatMessage[]) => void;
}> = ({ isOpen, onClose, ...aiSearchProps }) => (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="AI Property Search">
        <div className="h-[70vh] flex flex-col">
            <AiSearch {...aiSearchProps} isMobile={true} />
        </div>
    </Modal>
);

const generateLocalSearchName = (f: Filters): string => {
    const parts = [];
    if (f.query) parts.push(f.query);
    
    const formatK = (val: number) => `${Math.round(val / 1000)}k`;

    if (f.minPrice && f.maxPrice) parts.push(`€${formatK(f.minPrice)} - €${formatK(f.maxPrice)}`);
    else if (f.minPrice) parts.push(`over €${formatK(f.minPrice)}`);
    else if (f.maxPrice) parts.push(`under €${formatK(f.maxPrice)}`);
    
    if (f.beds) parts.push(`${f.beds}+ beds`);
    if (f.baths) parts.push(`${f.baths}+ baths`);
    
    if (f.propertyType !== 'any') parts.push(f.propertyType.charAt(0).toUpperCase() + f.propertyType.slice(1));
    if (f.sellerType !== 'any') parts.push(`${f.sellerType} seller`);
    
    const name = parts.join(', ');
    return name.length > 50 ? `${name.substring(0, 47)}...` : (name || "Custom Search");
}


const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch, fetchProperties, updateSearchPageState, addSavedSearch } = useAppContext();
    const { properties, isAuthenticated, isAuthModalOpen, isPricingModalOpen, isSubscriptionModalOpen, currentUser, allMunicipalities, searchPageState } = state;

    const { filters, activeFilters, searchOnMove, mapBoundsJSON, mobileView, searchMode, aiChatHistory, isAiChatModalOpen } = searchPageState;
    
    // Local, non-persistent state
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const shownErrorToast = useRef(false);
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const [tileLayer, setTileLayer] = useState<'street' | 'satellite'>('street');
    const [recenterTo, setRecenterTo] = useState<[number, number] | null>(null);
    
    const isModalOpen = isAuthModalOpen || isPricingModalOpen || isSubscriptionModalOpen;

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (properties.length === 0) {
            fetchProperties();
        }
    }, [fetchProperties, properties.length]);

    useEffect(() => {
        const handleGeoError = (error: GeolocationPositionError) => {
            if (error.code === error.POSITION_UNAVAILABLE || shownErrorToast.current) return;
            
            let message = 'Could not determine your location.';
            if (error.code === error.PERMISSION_DENIED) message = 'Location access was denied.';
            else if (error.code === error.TIMEOUT) message = 'Location request timed out.';

            showToast(message, 'error');
            shownErrorToast.current = true;
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (!userLocation) setUserLocation([latitude, longitude]);
                },
                handleGeoError,
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
    }, [userLocation, showToast]); 
    
    const handleSearch = useCallback(async () => {
        const query = filters.query.trim().toLowerCase();
        if (!query) {
             updateSearchPageState({ activeFilters: filters });
             setRecenterMap(true);
             return;
        }

        let bestMatch: { lat: number; lng: number } | null = null;
        for (const country in allMunicipalities) {
            for (const mun of allMunicipalities[country]) {
                const munName = mun.name.toLowerCase();
                if (munName === query || (mun.localNames || []).some(ln => ln.toLowerCase() === query)) {
                    bestMatch = { lat: mun.lat, lng: mun.lng };
                    break;
                }
                for (const set of mun.settlements) {
                     const setName = set.name.toLowerCase();
                     const fullName = `${set.name}, ${mun.name}`.toLowerCase();
                     if (setName === query || fullName === query || (set.localNames || []).some(ln => ln.toLowerCase() === query)) {
                         bestMatch = { lat: set.lat, lng: set.lng };
                         break;
                     }
                }
                if(bestMatch) break;
            }
            if(bestMatch) break;
        }

        if (bestMatch) {
            setRecenterTo([bestMatch.lat, bestMatch.lng]);
            updateSearchPageState({ activeFilters: filters });
        } else {
            showToast(`Could not find a primary location for "${filters.query}". Showing all results that match text.`, 'error');
            updateSearchPageState({ activeFilters: filters });
            setRecenterMap(true); // Recenter based on filtered results
        }
    }, [filters, allMunicipalities, updateSearchPageState, showToast]);

    const isSearchActive = useMemo(() => {
        return activeFilters.query.trim() !== '' || activeFilters.minPrice !== null || activeFilters.maxPrice !== null || activeFilters.beds !== null || activeFilters.baths !== null || activeFilters.livingRooms !== null || activeFilters.minSqft !== null || activeFilters.maxSqft !== null || activeFilters.sellerType !== 'any' || activeFilters.propertyType !== 'any';
    }, [activeFilters]);

    
    const baseFilteredProperties = useMemo(() => {
        const filtered = filterProperties(properties, activeFilters);
        switch (activeFilters.sortBy) {
            case 'price_asc': return filtered.sort((a, b) => a.price - b.price);
            case 'price_desc': return filtered.sort((a, b) => b.price - a.price);
            case 'beds_desc': return filtered.sort((a, b) => b.beds - a.beds);
            case 'newest': return filtered.sort((a, b) => (Math.max(b.createdAt || 0, b.lastRenewed || 0)) - (Math.max(a.createdAt || 0, a.lastRenewed || 0)));
            default: return filtered;
        }
    }, [properties, activeFilters]);

    const listProperties = useMemo(() => {
        if (!searchOnMove || !mapBoundsJSON) return baseFilteredProperties;
        
        try {
            const bounds = JSON.parse(mapBoundsJSON);
            return baseFilteredProperties.filter(p => 
                p.lat >= bounds.south && p.lat <= bounds.north &&
                p.lng >= bounds.west && p.lng <= bounds.east
            );
        } catch(e) {
            console.error("Error parsing map bounds", e);
            return baseFilteredProperties;
        }
    }, [baseFilteredProperties, searchOnMove, mapBoundsJSON]);


    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        const newFilters = { ...filters, [name]: value };
        updateSearchPageState({ filters: newFilters });
    }, [filters, updateSearchPageState]);
    
    const handleResetFilters = useCallback(() => {
        updateSearchPageState({ filters: initialFilters, activeFilters: initialFilters });
        setRecenterMap(true);
    }, [updateSearchPageState]);

    const handleSortChange = useCallback((value: string) => {
        updateSearchPageState({ 
            filters: { ...filters, sortBy: value },
            activeFilters: { ...activeFilters, sortBy: value },
        });
        setRecenterMap(false);
    }, [filters, activeFilters, updateSearchPageState]);
    
    const handleSearchOnMoveChange = (enabled: boolean) => {
        updateSearchPageState({ searchOnMove: enabled });
    };

    const isFormSearchActive = useMemo(() => {
        return filters.query.trim() !== '' || filters.minPrice !== null || filters.maxPrice !== null || filters.beds !== null || filters.baths !== null || filters.livingRooms !== null || filters.minSqft !== null || filters.maxSqft !== null || filters.sellerType !== 'any' || filters.propertyType !== 'any';
    }, [filters]);
    
    const handleSaveSearch = useCallback(async () => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
            return;
        }
        setIsSaving(true);
        try {
            if (!isFormSearchActive) {
                showToast("Cannot save an empty search. Please add some search criteria.", 'error');
                setIsSaving(false);
                return;
            }

            const now = Date.now();
            const name = generateLocalSearchName(filters);
            const newSearch: SavedSearch = {
                id: `ss-${now}`,
                name,
                filters,
                createdAt: now,
                lastAccessed: now,
            };

            await addSavedSearch(newSearch);
            showToast("Search saved successfully!", 'success');
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, addSavedSearch, filters, isFormSearchActive, showToast]);
    
    const handleMapMove = useCallback((newBoundsJSON: google.maps.LatLngBoundsLiteral) => {
        updateSearchPageState({ mapBoundsJSON: JSON.stringify(newBoundsJSON) });
        setRecenterMap(false);
    }, [updateSearchPageState]);

    const handleNewListingClick = () => {
      if (isAuthenticated) dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
      else dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
      setIsFabOpen(false);
    };
    const handleAccountClick = () => {
      if (isAuthenticated) dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
      else dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'login' } });
      setIsFabOpen(false);
    };

    const handleSubscribeClick = () => {
        dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true });
        setIsFabOpen(false);
    };

    const handleRecenterOnUser = () => {
        if (userLocation) {
            setRecenterTo(userLocation);
        } else {
            showToast("Your location is not available.", "error");
        }
    };

    const handleApplyAiFilters = useCallback((aiQuery: AiSearchQuery) => {
        const newFilters: Partial<Filters> = {
            query: aiQuery.location || '',
            minPrice: aiQuery.minPrice || null,
            maxPrice: aiQuery.maxPrice || null,
            beds: aiQuery.beds || null,
            baths: aiQuery.baths || null,
            livingRooms: aiQuery.livingRooms || null,
            minSqft: aiQuery.minSqft || null,
            maxSqft: aiQuery.maxSqft || null,
        };
        const updatedFilters = { ...initialFilters, ...newFilters };
        updateSearchPageState({ filters: updatedFilters, activeFilters: updatedFilters, searchMode: 'manual', isAiChatModalOpen: false });
        setFiltersOpen(false); 
        handleSearch(); // Trigger search with new filters
    }, [updateSearchPageState, handleSearch]);


    const handleApplyFiltersFromModal = () => {
        handleSearch();
        setFiltersOpen(false);
    };

    const fabActions = [
        { label: 'New Listing', icon: <PlusIcon className="w-5 h-5 text-neutral-500"/>, handler: handleNewListingClick, show: true },
        { label: 'Subscribe', icon: <BellIcon className="w-5 h-5 text-neutral-500"/>, handler: handleSubscribeClick, show: true },
        { label: 'divider', show: true },
        { label: 'My Account', icon: <UserIcon className="w-5 h-5 text-neutral-500"/>, handler: handleAccountClick, show: true },
    ];
    
    const mapProps = {
        properties: baseFilteredProperties,
        onMapMove: handleMapMove,
        userLocation: userLocation,
        mapBoundsJSON,
        tileLayer,
        recenterTo,
        onRecenterComplete: () => setRecenterTo(null),
    };
    
    const propertyListProps = {
        properties: listProperties,
        filters,
        onFilterChange: handleFilterChange,
        onSearchClick: handleSearch,
        onResetFilters: handleResetFilters,
        onSortChange: handleSortChange,
        onSaveSearch: handleSaveSearch,
        isSaving,
        searchOnMove,
        onSearchOnMoveChange: handleSearchOnMoveChange,
        searchMode,
        onSearchModeChange: (mode: 'manual' | 'ai') => updateSearchPageState({ searchMode: mode }),
        onApplyAiFilters: handleApplyAiFilters,
        aiChatHistory: aiChatHistory,
        onAiChatHistoryChange: (newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory }),
        isGeocoding: false, 
    };

    const MobileFilters = () => (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center"><h2 className="text-lg font-bold text-neutral-800">Filters</h2><button onClick={() => setFiltersOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-800"><XMarkIcon className="w-6 h-6" /></button></div>
            <div className="flex-grow overflow-y-auto min-h-0 pt-4"><PropertyList {...propertyListProps} isMobile={true} showFilters={true} showList={false} onQueryFocus={() => {}} onBlur={() => {}} /></div>
            {searchMode === 'manual' && (
                <div className="flex-shrink-0 p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
                     <button onClick={handleResetFilters} className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Reset</button>
                     <button onClick={handleSaveSearch} disabled={isSaving} className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Save</button>
                     <button onClick={handleApplyFiltersFromModal} className="flex-grow px-4 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">Show Results</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col flex-grow overflow-hidden">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <AiChatModal
                isOpen={isAiChatModalOpen}
                onClose={() => updateSearchPageState({ isAiChatModalOpen: false })}
                properties={properties}
                onApplyFilters={handleApplyAiFilters}
                history={aiChatHistory}
                onHistoryChange={(newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory })}
            />
            <main className="flex-grow flex flex-row overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-white border-r border-neutral-200 z-10 w-full md:w-[450px] lg:w-[500px] xl:w-[600px]"><PropertyList {...propertyListProps} isMobile={false} showFilters={true} showList={true} onQueryFocus={() => {}} onBlur={() => {}} /></div>
                <div className="relative flex-grow h-full w-full">
                    <MapComponent {...mapProps} />
                </div>
            </main>
        </div>
    );
};

export default SearchPage;