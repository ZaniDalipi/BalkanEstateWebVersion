import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapComponent from './MapComponent';
import PropertyList from './PropertyList';
import { SavedSearch, ChatMessage, AiSearchQuery, Filters } from '../../types';
import { getAiChatResponse, generateSearchName } from '../../services/geminiService';
import Toast from '../shared/Toast';
import L from 'leaflet';
import { CITY_DATA } from '../../services/propertyService';
import { Bars3Icon, SearchIcon, UserIcon, XMarkIcon, AdjustmentsHorizontalIcon, MapPinIcon, Squares2x2Icon } from '../../constants';

const initialFilters: Filters = {
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
};


interface SearchPageProps {
    onToggleSidebar: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onToggleSidebar }) => {
    const { state, dispatch } = useAppContext();
    const { properties, isAuthenticated, isAuthModalOpen, isPricingModalOpen, isSubscriptionModalOpen, currentUser } = state;

    const [filters, setFilters] = useState<Filters>(initialFilters);
    
    const [searchOnMove, setSearchOnMove] = useState(true);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isSaving, setIsSaving] = useState(false);
    const [recenterMap, setRecenterMap] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const isModalOpen = isAuthModalOpen || isPricingModalOpen || isSubscriptionModalOpen;

    // --- Mobile Layout State ---
    const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
    const [isFiltersOpen, setFiltersOpen] = useState(false);
    const [searchMode, setSearchMode] = useState<'manual' | 'ai'>('manual');


    const allCities = useMemo(() => Object.values(CITY_DATA).flat(), []);

    const searchLocation = useMemo<[number, number] | null>(() => {
        const query = filters.query.trim().toLowerCase();
        if (!query) return null;
        const city = allCities.find(c => 
            c.name.toLowerCase() === query || 
            c.localNames.some(ln => ln.toLowerCase() === query)
        );
        return city ? [city.lat, city.lng] : null;
    }, [filters.query, allCities]);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error: GeolocationPositionError) => {
                    let toastMessage: string;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            toastMessage = "Location access denied. You can enable it in your browser settings.";
                            console.warn("User denied geolocation access.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            toastMessage = "Location information is unavailable.";
                            console.warn("Geolocation position unavailable.");
                            break;
                        case error.TIMEOUT:
                            toastMessage = "Request for user location timed out.";
                            console.warn("Geolocation request timed out.");
                            break;
                        default:
                            toastMessage = "An unknown error occurred while getting your location.";
                            console.error("Error getting user location:", error.message);
                            break;
                    }
                    showToast(toastMessage, 'error');
                }
            );
        } else {
            showToast("Geolocation is not supported by your browser.", 'error');
        }
    }, [showToast]);
    
    // Properties filtered by form inputs (price, beds, etc.), used to populate the map
    const baseFilteredProperties = useMemo(() => {
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
                sortedProperties.sort((a, b) => {
                    const effectiveDateA = Math.max(a.createdAt || 0, a.lastRenewed || 0);
                    const effectiveDateB = Math.max(b.createdAt || 0, b.lastRenewed || 0);
                    return effectiveDateB - effectiveDateA;
                });
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
            
            return queryMatch && minPriceMatch && maxPriceMatch && bedsMatch && bathsMatch && sellerTypeMatch && propertyTypeMatch && minSqftMatch && maxSqftMatch;
        });

    }, [properties, filters]);

    // Properties for the list, further filtered by map bounds if "search on move" is active
    const listProperties = useMemo(() => {
        // If we are about to recenter the map, the current bounds are stale, so don't filter by them yet.
        if (recenterMap || !searchOnMove || !mapBounds) {
            return baseFilteredProperties;
        }
        return baseFilteredProperties.filter(p => mapBounds.contains([p.lat, p.lng]));
    }, [baseFilteredProperties, searchOnMove, mapBounds, recenterMap]);


    const isSearchActive = useMemo(() => {
        return filters.query.trim() !== '' || filters.minPrice !== null || filters.maxPrice !== null || filters.beds !== null || filters.baths !== null || filters.minSqft !== null || filters.maxSqft !== null || filters.sellerType !== 'any' || filters.propertyType !== 'any';
    }, [filters]);

    const handleFilterChange = useCallback((name: keyof Filters, value: string | number | null) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setRecenterMap(true);
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters(initialFilters);
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

        const hasExplicitFilters = 
            filters.query.trim() !== '' || 
            filters.minPrice !== null || 
            filters.maxPrice !== null || 
            filters.beds !== null || 
            filters.baths !== null || 
            filters.minSqft !== null || 
            filters.maxSqft !== null || 
            filters.sellerType !== 'any' ||
            filters.propertyType !== 'any';

        // A map-only search is also a valid search to save.
        const isMapSearchWithResults = searchOnMove && listProperties.length > 0;

        if (!hasExplicitFilters && !isMapSearchWithResults) {
            showToast("Cannot save an empty search. Please add some criteria.", 'error');
            return;
        }

        setIsSaving(true);
        try {
            const searchName = await generateSearchName(filters);
            const newSearch: SavedSearch = {
                id: `ss-${Date.now()}`,
                name: searchName,
                // Set the initial count to the number of properties found
                newPropertyCount: listProperties.length,
                properties: listProperties.slice(0, 5),
            };
            dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
            showToast("Search saved successfully!", 'success');
        } catch (e) {
            console.error("Failed to save search:", e);
            showToast("Could not save search. AI might be busy.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, dispatch, filters, listProperties, showToast, searchOnMove]);
    
    const handleMapMove = useCallback((newBounds: L.LatLngBounds) => {
        setMapBounds(newBounds);
        setRecenterMap(false);
    }, []);

    const handleNewListingClick = () => {
      if (isAuthenticated) {
          dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'create-listing' });
      } else {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
      }
    };
    const handleAccountClick = () => {
      if (isAuthenticated) {
          dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'account' });
      } else {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
      }
    };

    const handleApplyAiFilters = useCallback((aiQuery: AiSearchQuery) => {
        const newFilters: Partial<Filters> = {
            query: aiQuery.location || '',
            minPrice: aiQuery.minPrice || null,
            maxPrice: aiQuery.maxPrice || null,
            beds: aiQuery.beds || null,
            baths: aiQuery.baths || null,
            minSqft: aiQuery.minSqft || null,
            maxSqft: aiQuery.maxSqft || null,
        };
        setFilters(prev => ({ ...prev, ...newFilters }));
        setSearchMode('manual');
        setFiltersOpen(false); 
        setRecenterMap(true);
    }, []);


    const handleApplyFiltersFromModal = () => {
        setFiltersOpen(false);
        setRecenterMap(true); 
    };
    
    const mapProps = {
        properties: baseFilteredProperties,
        recenter: recenterMap,
        onMapMove: handleMapMove,
        userLocation: userLocation,
        isSearchActive: isSearchActive,
        searchLocation: searchLocation,
    };
    
    const propertyListProps = {
        properties: listProperties,
        filters,
        onFilterChange: handleFilterChange,
        onResetFilters: handleResetFilters,
        onSortChange: handleSortChange,
        onSaveSearch: handleSaveSearch,
        isSaving,
        searchOnMove,
        onSearchOnMoveChange: setSearchOnMove,
        searchMode,
        onSearchModeChange: setSearchMode,
        onApplyAiFilters: handleApplyAiFilters,
    };

    const MobileHeader = () => (
        <div className="flex justify-between items-center">
            <button onClick={onToggleSidebar} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md">
                <Bars3Icon className="w-6 h-6 text-neutral-800"/>
            </button>
            <div className="flex items-center gap-2">
                <button onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: true })} className="bg-primary text-white px-4 py-2 text-sm font-semibold rounded-full shadow-md">Subscribe</button>
                <button onClick={handleNewListingClick} className="bg-secondary text-white px-3 py-2 text-sm font-semibold rounded-full shadow-md">+ New Listing</button>
                <button onClick={handleAccountClick} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md">
                    {isAuthenticated && currentUser?.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full"/>
                    ) : (
                         <UserIcon className="w-6 h-6 text-neutral-800"/>
                    )}
                </button>
            </div>
        </div>
    );

    const MobileFilters = () => (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <div className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-neutral-800">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-800">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-0">
                <PropertyList {...propertyListProps} isMobile={true} showFilters={true} showList={false} />
            </div>
            {searchMode === 'manual' && (
                <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
                     <button onClick={handleResetFilters} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Reset</button>
                     <button onClick={handleSaveSearch} disabled={isSaving} className="px-4 py-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Save Search</button>
                     <button onClick={handleApplyFiltersFromModal} className="flex-grow px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">
                        Show {listProperties.length} Results
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col flex-grow overflow-hidden">
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
            <main className="flex-grow flex flex-row overflow-hidden relative">
                {/* --- DESKTOP LAYOUT --- */}
                <div className="hidden md:block w-3/5 h-full overflow-y-auto bg-white">
                    <PropertyList {...propertyListProps} isMobile={false} showFilters={true} showList={true} />
                </div>
                <div className={`hidden md:block relative w-2/5 h-full ${isModalOpen ? 'z-0' : 'z-10'}`}>
                    <MapComponent {...mapProps} />
                </div>

                {/* --- MOBILE LAYOUT --- */}
                <div className="md:hidden w-full h-full relative">
                    {isFiltersOpen && <MobileFilters />}
                    
                    {/* Map & List Container (Siblings for z-index control) */}
                    <div className="absolute inset-0 z-10">
                        <MapComponent {...mapProps} />
                    </div>
                    
                    {mobileView === 'list' && (
                        <div className="absolute inset-0 z-20 flex w-full h-full bg-white flex-col">
                            {/* Spacer to push content below floating header/search */}
                            <div className="h-[140px] flex-shrink-0"></div>
                            <div className="flex-grow min-h-0">
                                <PropertyList {...propertyListProps} isMobile={true} showFilters={false} showList={true}/>
                            </div>
                        </div>
                    )}

                    {/* Floating UI Container */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                         <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
                            <MobileHeader />
                         </div>

                        <div className="absolute top-[88px] left-4 right-4 flex items-center gap-2 pointer-events-auto">
                            <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <SearchIcon className="h-5 w-5 text-neutral-500" />
                                </div>
                                <input
                                    type="text"
                                    name="query"
                                    placeholder="Search city, address..."
                                    value={filters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    className="block w-full text-base bg-white border-neutral-200 rounded-full text-neutral-900 shadow-lg px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {filters.query && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                        <button onClick={() => handleFilterChange('query', '')} className="text-neutral-400 hover:text-neutral-800">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="p-3 bg-white rounded-full shadow-lg flex-shrink-0 hover:bg-neutral-100 transition-colors"
                            >
                                <AdjustmentsHorizontalIcon className="w-6 h-6 text-neutral-800"/>
                            </button>
                        </div>
                        
                        {mobileView === 'map' && (
                            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900/80 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto">
                                <span>{listProperties.length} results</span>
                            </div>
                        )}

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                            <button
                                onClick={() => setMobileView(v => v === 'map' ? 'list' : 'map')}
                                className="flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-lg hover:bg-black transition-transform hover:scale-105"
                            >
                                {mobileView === 'map' ? (
                                    <>
                                        <Squares2x2Icon className="w-5 h-5" />
                                        <span>List</span>
                                    </>
                                ) : (
                                    <>
                                        <MapPinIcon className="w-5 h-5" />
                                        <span>Map</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SearchPage;