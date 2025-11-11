import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters, initialFilters, SearchPageState, Property } from '../../types';
import { getAiChatResponse, generateSearchName, generateSearchNameFromCoords } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { MUNICIPALITY_DATA } from '../../services/propertyService';
import { Bars3Icon, SearchIcon, UserCircleIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon, BellIcon, PencilIcon, PlusIcon, SparklesIcon, CrosshairsIcon, XCircleIcon, MapIcon } from '../../constants';
import { findClosestSettlement } from '../../utils/location';
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

const MobileFilters: React.FC<{
    onClose: () => void;
    propertyListProps: any; // Simplified for this context
    localFilters: Filters;
    onLocalFilterChange: (name: keyof Filters, value: string | number | null) => void;
    onReset: () => void;
    onSave: () => void;
    isSaving: boolean;
    onApply: () => void;
    searchMode: 'manual' | 'ai';
}> = ({ onClose, propertyListProps, localFilters, onLocalFilterChange, onReset, onSave, isSaving, onApply, searchMode }) => (
    <div className="bg-white h-full w-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-800">Filters</h2>
            <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-800">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-grow overflow-y-auto min-h-0 pt-4">
            <PropertyList 
                {...propertyListProps}
                filters={localFilters}
                onFilterChange={onLocalFilterChange}
                isMobile={true} 
                showFilters={true} 
                showList={false} 
            />
        </div>
        {searchMode === 'manual' && (
            <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
                 <button onClick={onReset} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Reset</button>
                 <button onClick={onSave} disabled={isSaving} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Save Search</button>
                 <button onClick={onApply} className="flex-grow px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">Show Results</button>
            </div>
        )}
    </div>
);


const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch, fetchProperties, updateSearchPageState, addSavedSearch } = useAppContext();
    const { properties, isAuthenticated, currentUser, allMunicipalities, searchPageState } = state;
    const { filters, activeFilters, searchOnMove, mapBoundsJSON, drawnBoundsJSON, mobileView, searchMode, aiChatHistory, isAiChatModalOpen, isFiltersOpen } = searchPageState;
    
    // Local, non-persistent state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isQueryInputFocused, setIsQueryInputFocused] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapSyncActive, setIsMapSyncActive] = useState(false);
    const shownErrorToast = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [flyToTarget, setFlyToTarget] = useState<{ center: [number, number], zoom: number } | null>(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const { maxPriceValue, maxSqftValue } = useMemo(() => {
        if (properties.length === 0) {
            return { maxPriceValue: 2000000, maxSqftValue: 500 };
        }
        const maxPrice = Math.max(...properties.map(p => p.price));
        const maxSqft = Math.max(...properties.map(p => p.sqft));

        // Round up to a nice, even number for the slider's top end.
        const dynamicMaxPrice = Math.ceil(maxPrice / 100000) * 100000;
        const dynamicMaxSqft = Math.ceil(maxSqft / 50) * 50;

        return {
            maxPriceValue: Math.max(2000000, dynamicMaxPrice),
            maxSqftValue: Math.max(500, dynamicMaxSqft),
        };
    }, [properties]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync local filters when global filters change or when modal is opened
    useEffect(() => {
        if (isFiltersOpen) {
            setLocalFilters(filters);
        }
    }, [isFiltersOpen, filters]);

    const toggleDrawing = () => {
        setIsDrawing(prev => !prev);
    };

    const handleClearDrawnArea = () => {
        updateSearchPageState({ drawnBoundsJSON: null });
    };

    const handleDrawComplete = useCallback((bounds: L.LatLngBounds | null) => {
        updateSearchPageState({ drawnBoundsJSON: bounds ? JSON.stringify(bounds) : null });
        setIsDrawing(false);
    }, [updateSearchPageState]);
    
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
        if (properties.length === 0) {
            fetchProperties();
        }
    }, [fetchProperties, properties.length]);

    useEffect(() => {
        let timeoutId: number;

        const handleGeoError = (error: GeolocationPositionError) => {
            if (error.code === error.POSITION_UNAVAILABLE) {
                console.warn(`Geolocation warning: ${error.message} (code: ${error.code})`);
                return;
            }
            
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
                        if (!userLocation && !filters.query.trim()) {
                           setUserLocation([latitude, longitude]);
                        } else if (!userLocation) {
                           setUserLocation([latitude, longitude]);
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
    }, []); 
    
    useEffect(() => {
        const syncTimer = setTimeout(() => {
            setIsMapSyncActive(true);
        }, 7000);

        return () => clearTimeout(syncTimer);
    }, []);

    const searchLocationInfo = useMemo<{ center: [number, number], name: string } | null>(() => {
        const query = activeFilters.query.trim().toLowerCase();
        if (!query) return null;
    
        let bestMatch: { lat: number; lng: number; name: string; score: number } | null = null;
    
        for (const country in allMunicipalities) {
            for (const mun of allMunicipalities[country]) {
                for (const set of mun.settlements) {
                    const settlementName = set.name.toLowerCase();
                    const fullName = `${set.name}, ${mun.name}`;
                    const fullNameLower = fullName.toLowerCase();
                    let score = 0;
    
                    if (fullNameLower === query) score = 100;
                    else if (settlementName === query) score = 90;
                    else if (set.localNames.some(ln => ln.toLowerCase() === query)) score = 95;
                    else if (fullNameLower.startsWith(query)) score = 80;
                    else if (settlementName.startsWith(query)) score = 70;
                    else if (fullNameLower.includes(query)) score = 40;
                    else if (settlementName.includes(query)) score = 30;
                    
                    if (score > (bestMatch?.score || 0)) {
                        bestMatch = { lat: set.lat, lng: set.lng, name: fullName, score };
                    }
                }
            }
        }
    
        return bestMatch ? { center: [bestMatch.lat, bestMatch.lng], name: bestMatch.name } : null;
    }, [activeFilters.query, allMunicipalities]);

    const searchLocation = useMemo(() => searchLocationInfo?.center || null, [searchLocationInfo]);
    
    useEffect(() => {
        if (searchLocationInfo && activeFilters.query) {
            setFlyToTarget({ center: searchLocationInfo.center, zoom: 12 });
            if (filters.query !== searchLocationInfo.name) {
                 updateSearchPageState({ filters: { ...filters, query: searchLocationInfo.name } });
            }
        }
    }, [searchLocationInfo]);

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
        if (!searchOnMove) return baseFilteredProperties;
        if (!mapBounds) return baseFilteredProperties;
        return baseFilteredProperties.filter(p => mapBounds.contains([p.lat, p.lng]));
    }, [baseFilteredProperties, searchOnMove, mapBounds, drawnBounds]);


    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        const newFilters = { ...filters, [name]: value };
        
        if (name === 'query' && (value === '' || value === null)) {
            updateSearchPageState({ 
                filters: newFilters, 
                activeFilters: { ...activeFilters, query: '' } 
            });
        } else {
            updateSearchPageState({ filters: newFilters });
        }
    }, [filters, activeFilters, updateSearchPageState]);
    
    const handleSearch = useCallback(() => {
        updateSearchPageState({ activeFilters: filters, drawnBoundsJSON: null, searchOnMove: false });
    }, [filters, updateSearchPageState]);
    
    const handleLocalFilterChange = (name: keyof Filters, value: string | number | null) => {
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = useCallback(() => {
        const resetState: Partial<SearchPageState> = {
            filters: initialFilters,
            activeFilters: initialFilters,
            drawnBoundsJSON: null,
        };
        if (isMobile) {
            resetState.isFiltersOpen = false;
        }
        updateSearchPageState(resetState);
        setLocalFilters(initialFilters);
        setFlyToTarget({ center: [44.2, 19.9], zoom: 7 });
    }, [isMobile, updateSearchPageState]);

    const handleSortChange = useCallback((value: string) => {
        updateSearchPageState({ 
            filters: { ...filters, sortBy: value },
            activeFilters: { ...activeFilters, sortBy: value },
        });
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
    
    const handleSaveSearch = useCallback(async (isAreaOnly: boolean = false) => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
            return;
        }
        setIsSaving(true);
        try {
            let newSearch: SavedSearch;
            const now = Date.now();

            if (drawnBounds) { // Priority 1: A user-drawn area
                const center = drawnBounds.getCenter();
                const name = await generateSearchNameFromCoords(center.lat, center.lng);
                newSearch = {
                    id: `ss-${now}`,
                    name,
                    filters: isAreaOnly ? initialFilters : filters,
                    drawnBoundsJSON: drawnBoundsJSON,
                    createdAt: now,
                    lastAccessed: now,
                };
            } else if (isFormSearchActive) { // Priority 2: Active text/form filters
                const name = await generateSearchName(filters);
                newSearch = {
                    id: `ss-${now}`,
                    name,
                    filters,
                    drawnBoundsJSON: null,
                    createdAt: now,
                    lastAccessed: now,
                };
            } else if (mapBounds) { // Priority 3: The current map view
                const center = mapBounds.getCenter();
                const name = await generateSearchNameFromCoords(center.lat, center.lng);
                newSearch = {
                    id: `ss-${now}`,
                    name: `Area near ${name}`,
                    filters: initialFilters, // Save only the area, not other empty filters
                    drawnBoundsJSON: JSON.stringify(mapBounds), // Save the current map view as the search area
                    createdAt: now,
                    lastAccessed: now,
                };
            }
            else {
                showToast("Cannot save an empty search. Please add some criteria or move to an area on the map.", 'error');
                setIsSaving(false);
                return;
            }

            await addSavedSearch(newSearch);
            showToast("Search saved successfully!", 'success');
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search. AI might be busy.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, addSavedSearch, filters, isFormSearchActive, showToast, drawnBounds, drawnBoundsJSON, mapBounds]);
    
    const handleMapMove = useCallback((newBounds: L.LatLngBounds, newCenter: L.LatLng) => {
        if (isMobile && isFiltersOpen) return;

        const newState: Partial<SearchPageState> = { mapBoundsJSON: JSON.stringify(newBounds) };
        
        if (isQueryInputFocused || !isMapSyncActive) {
            updateSearchPageState(newState);
            return;
        };

        const closest = findClosestSettlement(newCenter.lat, newCenter.lng, allMunicipalities);
        if (closest) {
            const locationName = `${closest.settlement.name}, ${closest.municipality.name}`;
             if (locationName.toLowerCase() !== filters.query.toLowerCase()) {
                newState.filters = { ...filters, query: locationName };
            }
        }
        updateSearchPageState(newState);
    }, [isMobile, isFiltersOpen, allMunicipalities, filters, isQueryInputFocused, isMapSyncActive, updateSearchPageState]);


    const handleRecenterOnUser = () => {
        if (userLocation) {
            setFlyToTarget({ center: userLocation, zoom: 14 });
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
        updateSearchPageState({ isFiltersOpen: false }); 
    }, [updateSearchPageState]);


    const handleApplyFiltersFromModal = () => {
        updateSearchPageState({
            filters: localFilters,
            activeFilters: localFilters,
            isFiltersOpen: false,
            drawnBoundsJSON: null,
            searchOnMove: false
        });
    };
    
    const onFlyComplete = useCallback(() => setFlyToTarget(null), []);

    const mapProps = {
        properties: baseFilteredProperties,
        onMapMove: handleMapMove,
        isSearchActive: isSearchActive,
        searchLocation: searchLocation,
        userLocation: userLocation,
        onSaveSearch: () => handleSaveSearch(true),
        isSaving: isSaving,
        isAuthenticated: isAuthenticated,
        mapBounds: mapBounds,
        drawnBounds,
        onDrawComplete: handleDrawComplete,
        isDrawing: isDrawing,
        onDrawStart: toggleDrawing,
        flyToTarget: flyToTarget,
        onFlyComplete: onFlyComplete,
        isMobile: isMobile,
    };
    
    const propertyListProps = {
        properties: listProperties,
        filters: filters,
        onFilterChange: handleFilterChange,
        onSearchClick: handleSearch,
        onResetFilters: handleResetFilters,
        onSortChange: handleSortChange,
        onSaveSearch: () => handleSaveSearch(false),
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
        onDrawStart: toggleDrawing,
        isDrawing,
        maxPriceValue,
        maxSqftValue,
    };
    
    return (
        <div className="flex h-full w-full flex-col md:flex-row">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <AiChatModal
                isOpen={isAiChatModalOpen}
                onClose={() => updateSearchPageState({ isAiChatModalOpen: false })}
                properties={properties}
                onApplyFilters={handleApplyAiFilters}
                history={aiChatHistory}
                onHistoryChange={(newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory })}
            />
            
            {/* Main Content */}
            <div className="flex h-full w-full flex-col md:flex-row">
                {/* --- Left Panel: List & Filters (Desktop) --- */}
                {!isMobile && (
                    <div className="md:w-3/5 md:flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
                        <PropertyList {...propertyListProps} isMobile={false} showList={true} showFilters={true} />
                    </div>
                )}

                {/* --- Right Panel: Map (Desktop) --- */}
                {!isMobile && (
                    <div className="md:w-2/5 h-full relative z-10">
                        <MapComponent {...mapProps} />
                    </div>
                )}
                
                {/* --- Mobile View --- */}
                {isMobile && (
                    <div className="relative h-full w-full overflow-hidden">
                        {/* Map view is now the base layer, always rendered */}
                        <div className="h-full w-full">
                            <div className="h-full w-full pt-16 pb-20 relative z-0">
                                <MapComponent {...mapProps} />
                            </div>
                        </div>

                        {/* List view slides over the map */}
                        <div className={`absolute inset-0 z-10 h-full w-full transition-transform duration-300 ${mobileView === 'list' ? 'translate-x-0' : 'translate-x-full'}`}>
                            <PropertyList {...propertyListProps} isMobile={true} showList={true} showFilters={false} />
                        </div>
                        
                        {/* Static Overlays: Top and Bottom bars */}
                        <div className="absolute top-0 left-0 right-0 z-20 p-2 pointer-events-none">
                            <div className="pointer-events-auto w-full bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-1 flex items-center gap-1">
                                <button onClick={onToggleSidebar} className="p-2 flex-shrink-0"><Bars3Icon className="w-6 h-6 text-neutral-800"/></button>
                                <div className="relative flex-grow">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2"><SearchIcon className="h-5 w-5 text-neutral-500" /></div>
                                    <input type="text" name="query" placeholder="Search..." value={filters.query} onChange={(e) => handleFilterChange('query', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onFocus={() => setIsQueryInputFocused(true)} onBlur={() => setIsQueryInputFocused(false)} className="block w-full text-base bg-transparent border-none text-neutral-900 px-9 py-1 focus:outline-none focus:ring-0"/>
                                    {filters.query && (<div className="absolute inset-y-0 right-0 flex items-center pr-2"><button onClick={() => handleFilterChange('query', '')} className="text-neutral-400 hover:text-neutral-800"><XMarkIcon className="h-5 w-5" /></button></div>)}
                                </div>
                                <button onClick={() => updateSearchPageState({ isFiltersOpen: true })} className="p-2 flex-shrink-0 hover:bg-neutral-100 rounded-full"><AdjustmentsHorizontalIcon className="w-6 h-6 text-neutral-800"/></button>
                                {isAuthenticated && currentUser && (
                                    <button onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' })} className="flex-shrink-0 mr-1">
                                        {currentUser.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt="My Account" className="w-8 h-8 rounded-full object-cover"/>
                                        ) : (
                                            <UserCircleIcon className="w-8 h-8 text-neutral-400"/>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none">
                            <div className="pointer-events-auto mx-auto w-fit bg-white/80 text-neutral-800 p-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                <button onClick={() => updateSearchPageState({ mobileView: 'list' })} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${mobileView === 'list' ? 'bg-primary text-white shadow' : 'hover:bg-neutral-200'}`}>
                                    <Squares2x2Icon className="w-5 h-5" />
                                    <span>List</span>
                                </button>
                                <button onClick={() => updateSearchPageState({ mobileView: 'map' })} className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${mobileView === 'map' ? 'bg-primary text-white shadow' : 'hover:bg-neutral-200'}`}>
                                    <MapIcon className="w-5 h-5" />
                                    <span>Map</span>
                                </button>
                            </div>
                        </div>

                         {/* Map-specific controls, only visible in map view */}
                        {mobileView === 'map' && (
                            <div className="absolute inset-0 z-10 pointer-events-none p-2 flex flex-col justify-between pt-20 pb-20">
                                <div className="pointer-events-auto self-end">
                                    <button onClick={toggleDrawing} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-lg transition-colors ${ isDrawing ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-neutral-800 text-white hover:bg-neutral-900' }`}>
                                        {isDrawing ? <XCircleIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
                                        <span>{isDrawing ? 'Cancel' : 'Draw'}</span>
                                    </button>
                                </div>
                                {drawnBoundsJSON && !isDrawing && (
                                    <div className="absolute top-1/2 right-2 -translate-y-1/2 pointer-events-auto flex flex-col gap-2">
                                        {isAuthenticated && (<button onClick={() => handleSaveSearch(true)} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"><BellIcon className="w-5 h-5" /><span>{isSaving ? 'Saving...' : 'Save Area'}</span></button>)}
                                        <button onClick={handleClearDrawnArea} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-bold rounded-full shadow-lg hover:bg-neutral-900"><XCircleIcon className="w-5 h-5" /><span>Clear</span></button>
                                    </div>
                                )}
                                <div className="pointer-events-auto flex justify-between items-end">
                                    <div>
                                        <button onClick={() => setIsLegendOpen(p => !p)} className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg"><Bars3Icon className="w-6 h-6 text-neutral-800" /></button>
                                        {isLegendOpen && (
                                            <div className="absolute bottom-14 left-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200 animate-fade-in w-36">
                                                <h4 className="font-bold text-sm mb-2 text-neutral-800">Legend</h4>
                                                <div className="space-y-1.5">{Object.entries({ house: '#0252CD', apartment: '#28a745', villa: '#6f42c1', other: '#6c757d' }).map(([type, color]) => (<div key={type} className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></span><span className="text-xs font-semibold text-neutral-700 capitalize">{type}</span></div>))}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white/80 text-neutral-800 p-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                        <button onClick={handleRecenterOnUser} className="p-2.5 rounded-full hover:bg-black/10 transition-colors" title="My Location"><CrosshairsIcon className="w-5 h-5" /></button>
                                        {isAuthenticated && !drawnBoundsJSON && (<button onClick={() => handleSaveSearch(false)} disabled={isSaving} className="p-2.5 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50" title="Save Search"><BellIcon className="w-5 h-5" /></button>)}
                                        <button onClick={() => updateSearchPageState({ isAiChatModalOpen: true })} className="p-2.5 rounded-full hover:bg-black/10 transition-colors" title="AI Search"><SparklesIcon className="w-5 h-5 text-primary" /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Filter overlay and modal - rendered at the top level to overlay everything */}
            {isMobile && isFiltersOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-30 animate-fade-in" onClick={() => updateSearchPageState({ isFiltersOpen: false })}></div>
                    <div className="fixed inset-0 z-40 flex flex-col" onClick={(e) => { e.stopPropagation(); updateSearchPageState({ isFiltersOpen: false }); }}>
                        <div className="bg-white h-full w-full flex flex-col" onClick={e => e.stopPropagation()}>
                             <MobileFilters 
                                onClose={() => updateSearchPageState({ isFiltersOpen: false })}
                                propertyListProps={propertyListProps}
                                localFilters={localFilters}
                                onLocalFilterChange={handleLocalFilterChange}
                                onReset={handleResetFilters}
                                onSave={() => handleSaveSearch(false)}
                                isSaving={isSaving}
                                onApply={handleApplyFiltersFromModal}
                                searchMode={searchMode}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchPage;