import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters, initialFilters, SearchPageState, Property } from '../../types';
import { getAiChatResponse, generateSearchName, generateSearchNameFromCoords } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { MUNICIPALITY_DATA } from '../../services/propertyService';
import { Bars3Icon, SearchIcon, UserIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon, BellIcon, PencilIcon, PlusIcon, SparklesIcon, CrosshairsIcon, XCircleIcon } from '../../constants';
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

const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch, fetchProperties, updateSearchPageState, addSavedSearch } = useAppContext();
    const { properties, isAuthenticated, isAuthModalOpen, isPricingModalOpen, isSubscriptionModalOpen, currentUser, allMunicipalities, searchPageState } = state;

    const { filters, activeFilters, searchOnMove, mapBoundsJSON, drawnBoundsJSON, mobileView, searchMode, aiChatHistory, isAiChatModalOpen } = searchPageState;
    
    // Local, non-persistent state
    const [isQueryInputFocused, setIsQueryInputFocused] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapSyncActive, setIsMapSyncActive] = useState(false);
    const shownErrorToast = useRef(false);
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const [tileLayer, setTileLayer] = useState<'street' | 'satellite'>('street');
    const [recenterTo, setRecenterTo] = useState<[number, number] | null>(null);
    
    const isModalOpen = isAuthModalOpen || isPricingModalOpen || isSubscriptionModalOpen;
    
    const toggleDrawing = () => {
        const nextIsDrawing = !isDrawing;
        setIsDrawing(nextIsDrawing);
        if (nextIsDrawing) {
            setIsFabOpen(false); // Close menu when drawing starts
        }
    };

    const handleClearDrawnArea = () => {
        updateSearchPageState({ drawnBoundsJSON: null });
    };

    const handleDrawComplete = useCallback((bounds: L.LatLngBounds | null) => {
        updateSearchPageState({ drawnBoundsJSON: bounds ? JSON.stringify(bounds) : null });
        setIsDrawing(false);
    }, [updateSearchPageState]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
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
                           setRecenterMap(true);
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

    const searchLocation = useMemo<[number, number] | null>(() => {
        const query = activeFilters.query.trim().toLowerCase();
        if (!query) return null;
    
        let bestMatch: { lat: number; lng: number; score: number } | null = null;
    
        for (const country in allMunicipalities) {
            for (const mun of allMunicipalities[country]) {
                for (const set of mun.settlements) {
                    const settlementName = set.name.toLowerCase();
                    const fullName = `${set.name}, ${mun.name}`.toLowerCase();
                    let score = 0;
    
                    if (fullName === query) score = 100;
                    else if (settlementName === query) score = 90;
                    else if (set.localNames.some(ln => ln.toLowerCase() === query)) score = 95;
                    else if (fullName.startsWith(query)) score = 80;
                    else if (settlementName.startsWith(query)) score = 70;
                    else if (fullName.includes(query)) score = 40;
                    else if (settlementName.includes(query)) score = 30;
                    
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
    
    const handleSaveSearch = useCallback(async (isAreaOnly: boolean = false) => {
        if (!isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'signup' } });
            return;
        }
        setIsSaving(true);
        try {
            let newSearch: SavedSearch;
            const now = Date.now();

            if (drawnBounds) { // If there's a drawn area
                const center = drawnBounds.getCenter();
                const name = await generateSearchNameFromCoords(center.lat, center.lng);
                newSearch = {
                    id: `ss-${now}`,
                    name,
                    filters: isAreaOnly ? initialFilters : filters, // Use initialFilters if only saving area
                    drawnBoundsJSON: drawnBoundsJSON,
                    createdAt: now,
                    lastAccessed: now,
                };
            } else if (isFormSearchActive) { // No drawn area, but filters are active
                const name = await generateSearchName(filters);
                newSearch = {
                    id: `ss-${now}`,
                    name,
                    filters,
                    drawnBoundsJSON: null,
                    createdAt: now,
                    lastAccessed: now,
                };
            } else {
                showToast("Cannot save an empty search. Please add some criteria.", 'error');
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
    }, [isAuthenticated, dispatch, addSavedSearch, filters, isFormSearchActive, showToast, drawnBounds, drawnBoundsJSON]);
    
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
        setRecenterMap(true);
    }, [updateSearchPageState]);


    const handleApplyFiltersFromModal = () => {
        handleSearch();
        setFiltersOpen(false);
    };

    const fabActions = [
        { label: 'New Listing', icon: <PencilIcon className="w-5 h-5 text-neutral-500"/>, handler: handleNewListingClick, show: true },
        { label: 'Subscribe', icon: <BellIcon className="w-5 h-5 text-neutral-500"/>, handler: handleSubscribeClick, show: true },
        { label: 'Draw Area', icon: <Squares2x2Icon className="w-5 h-5 text-neutral-500"/>, handler: toggleDrawing, show: mobileView === 'map' && !isDrawing },
        { label: 'Cancel Draw', icon: <XMarkIcon className="w-5 h-5 text-red-500"/>, handler: toggleDrawing, show: mobileView === 'map' && isDrawing },
        { label: 'Clear Area', icon: <XCircleIcon className="w-5 h-5 text-neutral-500"/>, handler: handleClearDrawnArea, show: mobileView === 'map' && drawnBoundsJSON },
        { label: 'divider', show: true },
        { label: 'My Account', icon: <UserIcon className="w-5 h-5 text-neutral-500"/>, handler: handleAccountClick, show: true },
    ];
    
    const mapProps = {
        properties: baseFilteredProperties,
        recenter: recenterMap,
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
        tileLayer: tileLayer,
        recenterTo: recenterTo,
        onRecenterComplete: () => setRecenterTo(null),
    };
    
    const propertyListProps = {
        properties: listProperties,
        filters,
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
    };

    const MobileFilters = () => (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center"><h2 className="text-lg font-bold text-neutral-800">Filters</h2><button onClick={() => setFiltersOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-800"><XMarkIcon className="w-6 h-6" /></button></div>
            <div className="flex-grow overflow-y-auto min-h-0 pt-4"><PropertyList {...propertyListProps} isMobile={true} showFilters={true} showList={false} /></div>
            {searchMode === 'manual' && (
                <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
                     <button onClick={handleResetFilters} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Reset</button>
                     <button onClick={() => handleSaveSearch(false)} disabled={isSaving} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Save Search</button>
                     <button onClick={handleApplyFiltersFromModal} className="flex-grow px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">Show Results</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-grow overflow-hidden relative h-full w-full">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <AiChatModal
                isOpen={isAiChatModalOpen}
                onClose={() => updateSearchPageState({ isAiChatModalOpen: false })}
                properties={properties}
                onApplyFilters={handleApplyAiFilters}
                history={aiChatHistory}
                onHistoryChange={(newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory })}
            />

            {/* Base layer: Map */}
            <div className="absolute inset-0 z-0">
                <MapComponent {...mapProps} />
            </div>

            {/* Desktop floating panel */}
            <div className="hidden md:block absolute top-0 left-0 md:left-20 bottom-0 z-10 w-[calc(50%-5rem)] min-w-[500px] max-w-[700px] p-4 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col h-full pointer-events-auto">
                    <PropertyList {...propertyListProps} isMobile={false} showFilters={true} showList={true} />
                </div>
            </div>
            
            {/* Mobile View logic */}
            <div className="md:hidden w-full h-full relative">
                {isFiltersOpen && <MobileFilters />}
                
                {mobileView === 'list' && (
                    <div className="absolute inset-0 z-20 flex w-full h-full bg-white flex-col">
                        <div className="h-24 flex-shrink-0"></div>
                        <div className="flex-grow min-h-0"><PropertyList {...propertyListProps} isMobile={true} showFilters={false} showList={true}/></div>
                    </div>
                )}

                <div className="absolute inset-0 z-30 pointer-events-none p-4 flex flex-col justify-between">
                        <div className="pointer-events-auto w-full bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-2 flex items-center gap-2">
                            <button onClick={onToggleSidebar} className="p-2 flex-shrink-0"><Bars3Icon className="w-6 h-6 text-neutral-800"/></button>
                            <div className="relative flex-grow">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2"><SearchIcon className="h-5 w-5 text-neutral-500" /></div>
                            <input type="text" name="query" placeholder="Search city, address..." value={filters.query} onChange={(e) => handleFilterChange('query', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onFocus={() => setIsQueryInputFocused(true)} onBlur={() => setIsQueryInputFocused(false)} className="block w-full text-base bg-transparent border-none text-neutral-900 px-9 py-1 focus:outline-none focus:ring-0"/>
                            {filters.query && (<div className="absolute inset-y-0 right-0 flex items-center pr-2"><button onClick={() => handleFilterChange('query', '')} className="text-neutral-400 hover:text-neutral-800"><XMarkIcon className="h-5 w-5" /></button></div>)}
                        </div>
                        
                            <div className="relative" ref={fabRef}>
                            <button type="button" onClick={() => setIsFabOpen(prev => !prev)} className="p-2 rounded-full flex-shrink-0 hover:bg-neutral-100">
                                <PlusIcon className="w-6 h-6 text-neutral-800" />
                            </button>
                            {isFabOpen && mobileView === 'map' && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border z-10 p-2 animate-fade-in">
                                    {fabActions.filter(a => a.show).map((action, index) => {
                                        if (action.label === 'divider') {
                                            return <div key={index} className="my-1 border-t border-neutral-100" style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }} />;
                                        }
                                        return (
                                            <button
                                                key={action.label}
                                                onClick={action.handler as () => void}
                                                className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-base font-semibold rounded-lg transition-colors text-neutral-700 hover:bg-neutral-100"
                                            >
                                                {action.icon}
                                                <span>{action.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setFiltersOpen(true)} className="p-2 flex-shrink-0 hover:bg-neutral-100 rounded-full"><AdjustmentsHorizontalIcon className="w-6 h-6 text-neutral-800"/></button>
                    </div>
                    
                    <div className="pointer-events-auto">
                        {mobileView === 'map' && !isDrawing && drawnBoundsJSON && (
                            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 animate-fade-in">
                                <button onClick={() => handleSaveSearch(true)} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                                    <BellIcon className="w-5 h-5" />
                                    <span>{isSaving ? 'Saving...' : 'Save Area'}</span>
                                </button>
                                <button onClick={handleClearDrawnArea} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-bold rounded-full shadow-lg hover:bg-neutral-900">
                                    <XCircleIcon className="w-5 h-5" />
                                    <span>Clear Area</span>
                                </button>
                            </div>
                        )}
                        {mobileView === 'map' ? (
                            <div className="w-full flex justify-between items-center">
                                <div className="bg-white/80 text-neutral-800 p-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                    <div className="font-bold text-sm px-3 py-1.5 whitespace-nowrap">
                                        <span>{listProperties.length} results</span>
                                    </div>
                                    <button onClick={() => updateSearchPageState({ mobileView: 'list' })} className="flex items-center gap-2 px-4 py-1.5 bg-white text-neutral-900 font-bold rounded-full shadow hover:bg-neutral-200 transition-colors">
                                        <Squares2x2Icon className="w-5 h-5" />
                                        <span>List</span>
                                    </button>
                                </div>

                                <div className="bg-white/80 text-neutral-800 p-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                    <div className="bg-neutral-900/10 p-1 rounded-full flex space-x-1">
                                        <button onClick={() => setTileLayer('street')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'street' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600'}`}>Street</button>
                                        <button onClick={() => setTileLayer('satellite')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'satellite' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600'}`}>Satellite</button>
                                    </div>
                                    <div className="h-6 w-px bg-neutral-900/20 mx-1"></div>
                                    <button onClick={handleRecenterOnUser} className="p-2.5 rounded-full hover:bg-black/10 transition-colors" title="My Location"><CrosshairsIcon className="w-5 h-5" /></button>
                                    {isAuthenticated && !drawnBoundsJSON && (<button onClick={() => handleSaveSearch(false)} disabled={isSaving || (!isFormSearchActive && !drawnBounds)} className="p-2.5 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Save Search"><BellIcon className="w-5 h-5" /></button>)}
                                    <button onClick={() => updateSearchPageState({ isAiChatModalOpen: true })} className="p-2.5 rounded-full hover:bg-black/10 transition-colors" title="AI Search"><SparklesIcon className="w-5 h-5 text-primary" /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-between items-center">
                                <button onClick={() => updateSearchPageState({ mobileView: 'map' })} className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 font-bold rounded-full shadow-lg hover:bg-neutral-200 transition-colors">
                                    <MapPinIcon className="w-5 h-5" />
                                    <span>Map</span>
                                </button>

                                <div className="absolute left-1/2 -translate-x-1/2 bottom-4" ref={fabRef}>
                                    <button type="button" onClick={() => setIsFabOpen(prev => !prev)} className="p-4 rounded-full flex-shrink-0 bg-primary text-white shadow-lg hover:bg-primary-dark transition-transform hover:scale-105">
                                        {isFabOpen ? <XMarkIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                                    </button>
                                    {isFabOpen && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-2xl border z-10 p-2">
                                            {fabActions.filter(a => a.show).map((action, index) => {
                                                if (action.label === 'divider') return <div key={index} className="my-1 border-t border-neutral-100" />;
                                                return (
                                                    <button
                                                        key={action.label}
                                                        onClick={action.handler as () => void}
                                                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-base font-semibold rounded-lg transition-colors text-neutral-700 hover:bg-neutral-100"
                                                    >
                                                        {action.icon}
                                                        <span>{action.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2 invisible">
                                    <MapPinIcon className="w-5 h-5" />
                                    <span>Map</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;