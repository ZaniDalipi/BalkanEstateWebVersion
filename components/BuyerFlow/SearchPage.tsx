import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters, initialFilters, SearchPageState } from '../../types';
import { getAiChatResponse, generateSearchName, generateSearchNameFromCoords } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { MUNICIPALITY_DATA } from '../../services/propertyService';
import { Bars3Icon, SearchIcon, UserIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon, BellIcon } from '../../constants';
import { findClosestSettlement } from '../../utils/location';
import { filterProperties } from '../../utils/propertyUtils';

interface SearchPageProps {
    onToggleSidebar: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch, fetchProperties, updateSearchPageState } = useAppContext();
    const { properties, isAuthenticated, isAuthModalOpen, isPricingModalOpen, isSubscriptionModalOpen, currentUser, allMunicipalities, searchPageState } = state;

    const { filters, activeFilters, searchOnMove, mapBoundsJSON, drawnBoundsJSON, mobileView, searchMode, aiChatHistory } = searchPageState;
    
    // Local, non-persistent state
    const [isQueryInputFocused, setIsQueryInputFocused] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapSyncActive, setIsMapSyncActive] = useState(false);
    const shownErrorToast = useRef(false);
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    
    const isModalOpen = isAuthModalOpen || isPricingModalOpen || isSubscriptionModalOpen;
    
    // Convert JSON strings from context back to L.LatLngBounds objects
    const mapBounds = useMemo(() => {
        if (!mapBoundsJSON) return null;
        try {
            const parsed = JSON.parse(mapBoundsJSON);
            return L.latLngBounds(parsed._southWest, parsed._northEast);
        } catch (e) {
            console.error("Failed to parse mapBoundsJSON", e);
            return null;
        }
    }, [mapBoundsJSON]);

    const drawnBounds = useMemo(() => {
        if (!drawnBoundsJSON) return null;
        try {
            const parsed = JSON.parse(drawnBoundsJSON);
            return L.latLngBounds(parsed._southWest, parsed._northEast);
        } catch (e) {
            console.error("Failed to parse drawnBoundsJSON", e);
            return null;
        }
    }, [drawnBoundsJSON]);


    useEffect(() => {
        // Only fetch properties if they haven't been loaded yet.
        if (properties.length === 0) {
            fetchProperties();
        }
    }, [fetchProperties, properties.length]);

    useEffect(() => {
        let timeoutId: number;

        const handleGeoError = (error: GeolocationPositionError) => {
             // Silently fail on POSITION_UNAVAILABLE as it's common and not user-fixable
            if (error.code === error.POSITION_UNAVAILABLE) {
                console.warn(`Geolocation warning: ${error.message} (code: ${error.code})`);
                return;
            }
            
            // For other errors (like PERMISSION_DENIED), show a toast only once.
            if (!shownErrorToast.current) {
                let message = 'Could not determine your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access was denied.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                }
                showToast(message, 'error');
                shownErrorToast.current = true;
            }
        };

        const getLocation = (highAccuracy = true) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        // Only set user location if not already set or query is empty
                        if (!userLocation && !filters.query.trim()) {
                           setUserLocation([latitude, longitude]);
                           setRecenterMap(true);
                        }
                    },
                    (error) => {
                        if (highAccuracy && error.code === error.POSITION_UNAVAILABLE) {
                            console.warn("High accuracy geolocation failed, trying low accuracy.");
                            getLocation(false);
                        } else {
                            handleGeoError(error);
                        }
                    },
                    { enableHighAccuracy: highAccuracy, timeout: 10000, maximumAge: 0 }
                );
            }
        };

        getLocation();
        timeoutId = window.setTimeout(() => getLocation(), 5000);
        return () => clearTimeout(timeoutId);
    }, []); // This effect should only run once.
    
    useEffect(() => {
        const syncTimer = setTimeout(() => {
            setIsMapSyncActive(true);
        }, 7000); // 7-second delay

        return () => clearTimeout(syncTimer);
    }, []);

    const searchLocation = useMemo<[number, number] | null>(() => {
        const query = activeFilters.query.trim().toLowerCase();
        if (!query) return null;
    
        let bestMatch: { lat: number; lng: number; score: number } | null = null;
    
        // This logic iterates through all municipalities and settlements to find the best match for the query.
        // It uses a scoring system to prioritize more exact matches.
        for (const country in allMunicipalities) {
            for (const mun of allMunicipalities[country]) {
                for (const set of mun.settlements) {
                    const settlementName = set.name.toLowerCase();
                    const fullName = `${set.name}, ${mun.name}`.toLowerCase();
                    let score = 0;
    
                    if (fullName === query) {
                        score = 100; // Exact full name match
                    } else if (settlementName === query) {
                        score = 90; // Exact settlement name match
                    } else if (set.localNames.some(ln => ln.toLowerCase() === query)) {
                        score = 95; // Exact local name match
                    } else if (fullName.startsWith(query)) {
                        score = 80;
                    } else if (settlementName.startsWith(query)) {
                        score = 70;
                    } else if (fullName.includes(query)) {
                        score = 40;
                    } else if (settlementName.includes(query)) {
                        score = 30;
                    }
                    
                    if (score > (bestMatch?.score || 0)) {
                        bestMatch = { lat: set.lat, lng: set.lng, score };
                    }
                }
            }
        }
    
        return bestMatch ? [bestMatch.lat, bestMatch.lng] : null;
    }, [activeFilters.query, allMunicipalities]);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    }, []);

    const isSearchActive = useMemo(() => {
        return activeFilters.query.trim() !== '' || activeFilters.minPrice !== null || activeFilters.maxPrice !== null || activeFilters.beds !== null || activeFilters.baths !== null || activeFilters.livingRooms !== null || activeFilters.minSqft !== null || activeFilters.maxSqft !== null || activeFilters.sellerType !== 'any' || activeFilters.propertyType !== 'any';
    }, [activeFilters]);

    
    const baseFilteredProperties = useMemo(() => {
        const filtered = filterProperties(properties, activeFilters, allMunicipalities);
        switch (activeFilters.sortBy) {
            case 'price_asc': return filtered.sort((a, b) => a.price - b.price);
            case 'price_desc': return filtered.sort((a, b) => b.price - a.price);
            case 'beds_desc': return filtered.sort((a, b) => b.beds - a.beds);
            case 'newest': return filtered.sort((a, b) => (Math.max(b.createdAt || 0, b.lastRenewed || 0)) - (Math.max(a.createdAt || 0, a.lastRenewed || 0)));
            default: return filtered;
        }
    }, [properties, activeFilters, allMunicipalities]);

    const listProperties = useMemo(() => {
        if (drawnBounds) return baseFilteredProperties.filter(p => drawnBounds.contains([p.lat, p.lng]));
        if (!mapBounds) return baseFilteredProperties;
        if (searchOnMove) return baseFilteredProperties.filter(p => mapBounds.contains([p.lat, p.lng]));
        return baseFilteredProperties;
    }, [baseFilteredProperties, searchOnMove, mapBounds, drawnBounds]);


    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        updateSearchPageState({ filters: { ...filters, [name]: value } });
    }, [filters, updateSearchPageState]);
    
    const handleSearch = useCallback(() => {
        updateSearchPageState({ activeFilters: filters, drawnBoundsJSON: null });
        setRecenterMap(true);
    }, [filters, updateSearchPageState]);

    const handleResetFilters = useCallback(() => {
        updateSearchPageState({ filters: initialFilters, activeFilters: initialFilters, drawnBoundsJSON: null });
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
        if (enabled) {
            updateSearchPageState({ searchOnMove: enabled, drawnBoundsJSON: null });
        } else {
            updateSearchPageState({ searchOnMove: enabled });
        }
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
            let newSearch: SavedSearch;

            if (drawnBounds) {
                const center = drawnBounds.getCenter();
                const name = await generateSearchNameFromCoords(center.lat, center.lng);
                newSearch = {
                    id: `ss-${Date.now()}`,
                    name,
                    filters,
                    drawnBoundsJSON: drawnBoundsJSON,
                };
            } else if (isFormSearchActive) {
                const name = await generateSearchName(filters);
                newSearch = { 
                    id: `ss-${Date.now()}`, 
                    name, 
                    filters, 
                    drawnBoundsJSON: null 
                };
            } else {
                showToast("Cannot save an empty search. Please add some criteria or draw an area.", 'error');
                setIsSaving(false);
                return;
            }

            dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
            showToast("Search saved successfully!", 'success');
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search. AI might be busy.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, filters, isFormSearchActive, showToast, drawnBounds, drawnBoundsJSON]);
    
    const handleMapMove = useCallback((newBounds: L.LatLngBounds, newCenter: L.LatLng) => {
        updateSearchPageState({ mapBoundsJSON: JSON.stringify(newBounds) });
        setRecenterMap(false);
        
        if (isQueryInputFocused || !isMapSyncActive) return;

        const closest = findClosestSettlement(newCenter.lat, newCenter.lng, allMunicipalities);
        if (closest) {
            const locationName = `${closest.settlement.name}, ${closest.municipality.name}`;
             if (locationName.toLowerCase() !== filters.query.toLowerCase()) {
                updateSearchPageState({ filters: { ...filters, query: locationName } });
            }
        }
    }, [allMunicipalities, filters, isQueryInputFocused, isMapSyncActive, updateSearchPageState]);

    const handleNewListingClick = () => {
      if (isAuthenticated) dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
      else dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
    };
    const handleAccountClick = () => {
      if (isAuthenticated) dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
      else dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'login' } });
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
        updateSearchPageState({ filters: updatedFilters, activeFilters: updatedFilters, searchMode: 'manual' });
        setFiltersOpen(false); 
        setRecenterMap(true);
    }, [updateSearchPageState]);


    const handleApplyFiltersFromModal = () => {
        handleSearch();
        setFiltersOpen(false);
    };
    
    const mapProps = {
        properties: baseFilteredProperties,
        recenter: recenterMap,
        onMapMove: handleMapMove,
        isSearchActive: isSearchActive,
        searchLocation: searchLocation,
        userLocation: userLocation,
        onSaveSearch: handleSaveSearch,
        isSaving: isSaving,
        isAuthenticated: isAuthenticated,
        mapBounds: mapBounds,
        drawnBounds,
        onDrawComplete: (bounds: L.LatLngBounds | null) => updateSearchPageState({ drawnBoundsJSON: bounds ? JSON.stringify(bounds) : null }),
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
        onQueryFocus: () => setIsQueryInputFocused(true),
        onBlur: () => setIsQueryInputFocused(false),
        onApplyAiFilters: handleApplyAiFilters,
        isAreaDrawn: !!drawnBounds,
        aiChatHistory: aiChatHistory,
        onAiChatHistoryChange: (newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory }),
    };

    const MobileHeader = () => (
        <div className="pointer-events-auto">
            <div className="flex justify-between items-center">
                <button onClick={onToggleSidebar} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"><Bars3Icon className="w-6 h-6 text-neutral-800"/></button>
                <div className="flex items-center gap-2">
                    <button onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })} className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded-full shadow-md">Subscribe</button>
                    <button onClick={handleNewListingClick} className="bg-secondary text-white px-3 py-2 text-sm font-semibold rounded-full shadow-md">+ New Listing</button>
                    <button onClick={handleAccountClick} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md">
                        {isAuthenticated && currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full"/> : <UserIcon className="w-6 h-6 text-neutral-800"/>}
                    </button>
                </div>
            </div>
        </div>
    );

    const MobileFilters = () => (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center"><h2 className="text-lg font-bold text-neutral-800">Filters</h2><button onClick={() => setFiltersOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-800"><XMarkIcon className="w-6 h-6" /></button></div>
            <div className="flex-grow overflow-y-auto min-h-0 pt-4"><PropertyList {...propertyListProps} isMobile={true} showFilters={true} showList={false} /></div>
            {searchMode === 'manual' && (
                <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
                     <button onClick={handleResetFilters} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Reset</button>
                     <button onClick={handleSaveSearch} disabled={isSaving} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Save Search</button>
                     <button onClick={handleApplyFiltersFromModal} className="flex-grow px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">Show Results</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col flex-grow overflow-hidden">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <main className="flex-grow flex flex-row overflow-hidden relative">
                <div className="hidden md:block w-3/5 h-full overflow-y-auto bg-white"><PropertyList {...propertyListProps} isMobile={false} showFilters={true} showList={true} /></div>
                <div className={`hidden md:block relative w-2/5 h-full ${isModalOpen ? 'z-0' : 'z-10'}`}><MapComponent {...mapProps} /></div>

                <div className="md:hidden w-full h-full relative">
                    {isFiltersOpen && <MobileFilters />}
                    <div className="absolute inset-0 z-10"><MapComponent {...mapProps} /></div>
                    
                    {mobileView === 'list' && (
                        <div className="absolute inset-0 z-20 flex w-full h-full bg-white flex-col">
                            <div className="h-[88px] flex-shrink-0"></div>
                            <div className="flex-grow min-h-0"><PropertyList {...propertyListProps} isMobile={true} showFilters={false} showList={true}/></div>
                        </div>
                    )}

                    <div className="absolute inset-0 z-30 pointer-events-none p-4 flex flex-col justify-between">
                         <div className="pointer-events-auto"><MobileHeader /></div>
                        <div className="absolute top-[88px] left-4 right-4 flex items-center gap-2 pointer-events-auto">
                            <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"><SearchIcon className="h-5 w-5 text-neutral-500" /></div>
                                <input type="text" name="query" placeholder="Search city, address..." value={filters.query} onChange={(e) => handleFilterChange('query', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onFocus={() => setIsQueryInputFocused(true)} onBlur={() => setIsQueryInputFocused(false)} className="block w-full text-base bg-white border-neutral-200 rounded-full text-neutral-900 shadow-lg px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
                                {filters.query && (<div className="absolute inset-y-0 right-0 flex items-center pr-4"><button onClick={() => handleFilterChange('query', '')} className="text-neutral-400 hover:text-neutral-800"><XMarkIcon className="h-5 w-5" /></button></div>)}
                            </div>
                            <button onClick={() => setFiltersOpen(true)} className="p-3 bg-white rounded-full shadow-lg flex-shrink-0 hover:bg-neutral-100 transition-colors"><AdjustmentsHorizontalIcon className="w-6 h-6 text-neutral-800"/></button>
                        </div>
                        <div className="flex flex-col items-center pointer-events-auto">
                            {mobileView === 'map' && (<div className="bg-neutral-900/80 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm mb-4"><span>{listProperties.length} results</span></div>)}
                            {mobileView === 'map' && isAuthenticated && ( <button onClick={handleSaveSearch} disabled={isSaving} className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-105 mb-4"><BellIcon className="w-5 h-5" /><span>{isSaving ? 'Saving...' : 'Save Search'}</span></button>)}
                            <button onClick={() => updateSearchPageState({ mobileView: mobileView === 'map' ? 'list' : 'map' })} className="flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-lg hover:bg-black transition-transform hover:scale-105">
                                {mobileView === 'map' ? ( <> <Squares2x2Icon className="w-5 h-5" /> <span>List</span> </> ) : ( <> <MapPinIcon className="w-5 h-5" /> <span>Map</span> </> )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SearchPage;