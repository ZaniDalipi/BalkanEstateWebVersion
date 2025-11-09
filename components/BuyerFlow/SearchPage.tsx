import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters, initialFilters, SearchPageState, Property, MunicipalityData } from '../../types';
import { getAiChatResponse, getCoordinatesForLocation } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { MUNICIPALITY_DATA } from '../../services/propertyService';
import { Bars3Icon, SearchIcon, UserIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon, BellIcon, PlusIcon, SparklesIcon, CrosshairsIcon, SpinnerIcon } from '../../constants';
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

const formatNumber = (val: number) => val >= 1000000 ? `${(val / 1000000).toFixed(1).replace('.0', '')}M` : val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`;

const generateSearchNameFromFilters = (filters: Filters): string => {
    const parts: string[] = [];

    if (filters.query) parts.push(filters.query);
    
    if (filters.minPrice && filters.maxPrice) parts.push(`€${formatNumber(filters.minPrice)} - €${formatNumber(filters.maxPrice)}`);
    else if (filters.minPrice) parts.push(`over €${formatNumber(filters.minPrice)}`);
    else if (filters.maxPrice) parts.push(`under €${formatNumber(filters.maxPrice)}`);

    if (filters.beds) parts.push(`${filters.beds}+ beds`);
    if (filters.baths) parts.push(`${filters.baths}+ baths`);
    if (filters.livingRooms) parts.push(`${filters.livingRooms}+ living`);

    if (filters.minSqft && filters.maxSqft) parts.push(`${filters.minSqft}-${filters.maxSqft}m²`);
    else if (filters.minSqft) parts.push(`over ${filters.minSqft}m²`);
    else if (filters.maxSqft) parts.push(`under ${filters.maxSqft}m²`);

    if (filters.sellerType !== 'any') parts.push(filters.sellerType === 'agent' ? 'by agent' : 'private listings');
    
    if (filters.propertyType !== 'any') parts.push(filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1));

    if (parts.length === 0) return "All Properties";

    return parts.join(', ');
};

const findLocalLocation = (query: string, allMunicipalities: Record<string, MunicipalityData[]>): [number, number] | null => {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return null;

    let bestMatch: { lat: number; lng: number; score: number } | null = null;

    for (const country in allMunicipalities) {
        for (const mun of allMunicipalities[country]) {
            for (const set of mun.settlements) {
                const settlementName = set.name.toLowerCase();
                const fullName = `${set.name}, ${mun.name}`.toLowerCase();
                let score = 0;

                if (fullName === lowerQuery) score = 100;
                else if (settlementName === lowerQuery) score = 90;
                else if ((set.localNames || []).some(ln => ln.toLowerCase() === lowerQuery)) score = 95;
                else if (fullName.startsWith(lowerQuery)) score = 80;
                else if (settlementName.startsWith(lowerQuery)) score = 70;
                else if (fullName.includes(lowerQuery)) score = 40;
                else if (settlementName.includes(lowerQuery)) score = 30;
                
                if (score > (bestMatch?.score || 0)) {
                    bestMatch = { lat: set.lat, lng: set.lng, score };
                }
            }
        }
    }

    // Only accept good matches to avoid wrong geocoding for arbitrary addresses
    if (bestMatch && bestMatch.score >= 70) {
        return [bestMatch.lat, bestMatch.lng];
    }
    return null;
};


const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch, fetchProperties, updateSearchPageState, addSavedSearch } = useAppContext();
    const { properties, isAuthenticated, isAuthModalOpen, isPricingModalOpen, isSubscriptionModalOpen, currentUser, allMunicipalities, searchPageState } = state;

    const { filters, activeFilters, searchOnMove, mapBoundsJSON, mobileView, searchMode, aiChatHistory, isAiChatModalOpen } = searchPageState;
    
    // Local, non-persistent state
    const [isQueryInputFocused, setIsQueryInputFocused] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isMapSyncActive, setIsMapSyncActive] = useState(false);
    const shownErrorToast = useRef(false);
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const [tileLayer, setTileLayer] = useState<'street' | 'satellite'>('street');
    const [recenterTo, setRecenterTo] = useState<[number, number] | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const reverseGeocodeTimeoutRef = useRef<number | null>(null);
    
    const isModalOpen = isAuthModalOpen || isPricingModalOpen || isSubscriptionModalOpen;

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
        return findLocalLocation(activeFilters.query, allMunicipalities);
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
        if (!mapBounds) return baseFilteredProperties;
        if (searchOnMove) return baseFilteredProperties.filter(p => mapBounds.contains([p.lat, p.lng]));
        return baseFilteredProperties;
    }, [baseFilteredProperties, searchOnMove, mapBounds]);


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
    
    const handleSearch = useCallback(async () => {
        setIsGeocoding(true);
        updateSearchPageState({ activeFilters: filters });
    
        const query = filters.query.trim();
        if (query) {
            // Attempt local search first to save API calls
            const localCoords = findLocalLocation(query, allMunicipalities);
            
            if (localCoords) {
                setRecenterTo(localCoords);
                setIsGeocoding(false);
            } else {
                // Fallback to Gemini API for specific addresses
                try {
                    const coords = await getCoordinatesForLocation(filters.query);
                    if (coords) {
                        setRecenterTo([coords.lat, coords.lng]);
                    } else {
                        showToast(`Could not find location: ${filters.query}`, 'error');
                    }
                } catch (error) {
                    console.error("Geocoding failed:", error);
                    showToast("Failed to fetch location data.", 'error');
                } finally {
                    setIsGeocoding(false);
                }
            }
        } else {
            setRecenterMap(true); // Recenter if query is empty
            setIsGeocoding(false);
        }
    }, [filters, updateSearchPageState, showToast, allMunicipalities]);

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
            if (isFormSearchActive) {
                const name = generateSearchNameFromFilters(filters);
                const now = Date.now();
                const newSearch: SavedSearch = {
                    id: `ss-${now}`,
                    name,
                    filters,
                    createdAt: now,
                    lastAccessed: now,
                };
                await addSavedSearch(newSearch);
                showToast("Search saved successfully!", 'success');
            } else {
                showToast("Cannot save an empty search. Please add some search criteria.", 'error');
            }
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search. Please try again.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, addSavedSearch, filters, isFormSearchActive, showToast]);
    
    const handleMapMove = useCallback((newBounds: L.LatLngBounds, newCenter: L.LatLng) => {
        updateSearchPageState({ mapBoundsJSON: JSON.stringify(newBounds) });
        setRecenterMap(false);
    
        if (isQueryInputFocused || !isMapSyncActive) return;
    
        if (reverseGeocodeTimeoutRef.current) {
            clearTimeout(reverseGeocodeTimeoutRef.current);
        }
        setIsReverseGeocoding(true);
    
        reverseGeocodeTimeoutRef.current = window.setTimeout(() => {
            try {
                const closest = findClosestSettlement(newCenter.lat, newCenter.lng, allMunicipalities);
                if (closest) {
                    const locationName = `${closest.settlement.name}, ${closest.municipality.name}`;
                    if (locationName.toLowerCase() !== filters.query.toLowerCase()) {
                        updateSearchPageState({ filters: { ...filters, query: locationName } });
                    }
                }
            } catch (error) {
                console.error("Local reverse geocoding failed", error);
            } finally {
                setIsReverseGeocoding(false);
            }
        }, 250); // Shorter debounce for local function
    
    }, [allMunicipalities, filters, isQueryInputFocused, isMapSyncActive, updateSearchPageState]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (reverseGeocodeTimeoutRef.current) {
                clearTimeout(reverseGeocodeTimeoutRef.current);
            }
        };
    }, []);

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
        { label: 'New Listing', icon: <PlusIcon className="w-5 h-5 text-neutral-500"/>, handler: handleNewListingClick, show: true },
        { label: 'Subscribe', icon: <BellIcon className="w-5 h-5 text-neutral-500"/>, handler: handleSubscribeClick, show: true },
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
        onSaveSearch: handleSaveSearch,
        isSaving: isSaving,
        isAuthenticated: isAuthenticated,
        mapBounds: mapBounds,
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
        onSaveSearch: handleSaveSearch,
        isSaving,
        searchOnMove,
        onSearchOnMoveChange: handleSearchOnMoveChange,
        searchMode,
        onSearchModeChange: (mode: 'manual' | 'ai') => updateSearchPageState({ searchMode: mode }),
        onQueryFocus: () => setIsQueryInputFocused(true),
        onBlur: () => setIsQueryInputFocused(false),
        onApplyAiFilters: handleApplyAiFilters,
        aiChatHistory: aiChatHistory,
        onAiChatHistoryChange: (newHistory: ChatMessage[]) => updateSearchPageState({ aiChatHistory: newHistory }),
        isGeocoding: isGeocoding,
    };

    const MobileFilters = () => (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center"><h2 className="text-lg font-bold text-neutral-800">Filters</h2><button onClick={() => setFiltersOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-800"><XMarkIcon className="w-6 h-6" /></button></div>
            <div className="flex-grow overflow-y-auto min-h-0 pt-4"><PropertyList {...propertyListProps} isMobile={true} showFilters={true} showList={false} /></div>
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
                <div className="hidden md:block w-3/5 h-full bg-white border-r border-neutral-200"><PropertyList {...propertyListProps} isMobile={false} showFilters={true} showList={true} /></div>
                <div className={`hidden md:block relative w-2/5 h-full ${isModalOpen ? 'z-0' : 'z-10'}`}>
                    <MapComponent {...mapProps} />
                </div>

                <div className="md:hidden w-full h-full relative">
                    {isFiltersOpen && <MobileFilters />}
                    <div className="absolute inset-0 z-10">
                        <MapComponent {...mapProps} />
                    </div>
                    
                    {mobileView === 'list' && (
                        <div className="absolute inset-0 z-20 flex w-full h-full bg-white flex-col">
                            <div className="h-20 flex-shrink-0"></div>
                            <div className="flex-grow min-h-0"><PropertyList {...propertyListProps} isMobile={true} showFilters={false} showList={true}/></div>
                        </div>
                    )}

                    <div className="absolute inset-0 z-30 pointer-events-none p-3 flex flex-col justify-between">
                         <div className="pointer-events-auto w-full bg-white/80 backdrop-blur-sm rounded-full shadow-lg p-1.5 flex items-center gap-2">
                             <button onClick={onToggleSidebar} className="p-2 flex-shrink-0"><Bars3Icon className="w-5 h-5 text-neutral-800"/></button>
                             <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2"><SearchIcon className="h-4 w-4 text-neutral-500" /></div>
                                <input type="text" name="query" placeholder="Search city, address..." value={filters.query} onChange={(e) => handleFilterChange('query', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} onFocus={() => setIsQueryInputFocused(true)} onBlur={() => setIsQueryInputFocused(false)} className="block w-full text-sm bg-transparent border-none text-neutral-900 px-8 py-1 focus:outline-none focus:ring-0"/>
                                {(isGeocoding || isReverseGeocoding) && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <SpinnerIcon className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                {filters.query && !isGeocoding && !isReverseGeocoding && (<div className="absolute inset-y-0 right-0 flex items-center pr-2"><button onClick={() => handleFilterChange('query', '')} className="text-neutral-400 hover:text-neutral-800"><XMarkIcon className="h-5 w-5" /></button></div>)}
                            </div>
                            
                             <div className="relative" ref={fabRef}>
                                <button type="button" onClick={() => setIsFabOpen(prev => !prev)} className="p-2 rounded-full flex-shrink-0 hover:bg-neutral-100">
                                    <PlusIcon className="w-5 h-5 text-neutral-800" />
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

                            <button onClick={() => setFiltersOpen(true)} className="p-2 flex-shrink-0 hover:bg-neutral-100 rounded-full"><AdjustmentsHorizontalIcon className="w-5 h-5 text-neutral-800"/></button>
                        </div>
                        
                        <div className="pointer-events-auto">
                            {mobileView === 'map' ? (
                                <div className="w-full flex justify-between items-center">
                                    <div className="bg-white/80 text-neutral-800 p-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                        <div className="font-bold text-xs px-2 py-1 whitespace-nowrap">
                                            <span>{listProperties.length} results</span>
                                        </div>
                                        <button onClick={() => updateSearchPageState({ mobileView: 'list' })} className="flex items-center gap-1.5 px-3 py-1 bg-white text-neutral-900 font-bold rounded-full shadow hover:bg-neutral-200 transition-colors">
                                            <Squares2x2Icon className="w-4 h-4" />
                                            <span className="text-sm">List</span>
                                        </button>
                                    </div>

                                    <div className="bg-white/80 text-neutral-800 p-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                                        <div className="bg-neutral-900/10 p-0.5 rounded-full flex space-x-1">
                                            <button onClick={() => setTileLayer('street')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'street' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600'}`}>Street</button>
                                            <button onClick={() => setTileLayer('satellite')} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'satellite' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600'}`}>Satellite</button>
                                        </div>
                                        <div className="h-5 w-px bg-neutral-900/20 mx-1"></div>
                                        <button onClick={handleRecenterOnUser} className="p-2 rounded-full hover:bg-black/10 transition-colors" title="My Location"><CrosshairsIcon className="w-4 h-4" /></button>
                                        {isAuthenticated && (<button onClick={handleSaveSearch} disabled={isSaving || !isFormSearchActive} className="p-2 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Save Search"><BellIcon className="w-4 h-4" /></button>)}
                                        <button onClick={() => updateSearchPageState({ isAiChatModalOpen: true })} className="p-2 rounded-full hover:bg-black/10 transition-colors" title="AI Search"><SparklesIcon className="w-5 h-5 text-primary" /></button>
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
            </main>
        </div>
    );
};

export default SearchPage;