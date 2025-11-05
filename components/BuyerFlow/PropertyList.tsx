import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Property, ChatMessage, AiSearchQuery, Filters, SellerType } from '../../types';
import PropertyCard from './PropertyCard';
import { SearchIcon, SparklesIcon, XMarkIcon, BellIcon, BuildingLibraryIcon } from '../../constants';
import AiSearch from './AiSearch';

interface PropertyListProps {
  properties: Property[];
  filters: Filters;
  onFilterChange: (name: keyof Filters, value: string | number | null, shouldRecenter?: boolean) => void;
  onResetFilters: () => void;
  onSortChange: (value: string) => void;
  onSaveSearch: () => void;
  isSaving: boolean;
  searchOnMove: boolean;
  onSearchOnMoveChange: (enabled: boolean) => void;
  isMobile: boolean;
  showFilters: boolean;
  showList: boolean;
  searchMode: 'manual' | 'ai';
  onSearchModeChange: (mode: 'manual' | 'ai') => void;
  onApplyAiFilters: (query: AiSearchQuery) => void;
  onQueryFocus: () => void;
  onQueryBlur: () => void;
}

const FilterButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 flex-grow text-center ${
      isActive
        ? 'bg-white text-primary shadow'
        : 'text-neutral-600 hover:bg-neutral-200'
    }`}
  >
    {children}
  </button>
);

const FilterButtonGroup: React.FC<{
  label: string;
  options: { value: string | number | null; label: string }[];
  selectedValue: string | number | null;
  onChange: (value: string | number | null) => void;
}> = ({ label, options, selectedValue, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
    <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
      {options.map(({ value, label: optionLabel }) => (
        <FilterButton
          key={optionLabel}
          onClick={() => onChange(selectedValue === value ? null : value)}
          isActive={selectedValue === value}
        >
          {optionLabel}
        </FilterButton>
      ))}
    </div>
  </div>
);

const PRICE_RANGES = [50000, 75000, 100000, 125000, 150000, 175000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000];
const SQFT_RANGES = [30, 50, 70, 90, 120, 150, 200, 250, 300, 400];
const formatNumber = (num: number) => new Intl.NumberFormat('de-DE').format(num);

const ITEMS_PER_PAGE = 20;

const FilterControls: React.FC<Omit<PropertyListProps, 'properties' | 'showList'>> = ({
    filters, onFilterChange, onResetFilters, onSaveSearch, isSaving, searchOnMove, onSearchOnMoveChange, isMobile, onQueryFocus, onQueryBlur
}) => {

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let finalValue: string | number | null = value;
        
        const isNumericSelect = e.target.nodeName === 'SELECT' && (name === 'minPrice' || name === 'maxPrice' || name === 'minSqft' || name === 'maxSqft');
        const isNumericInput = e.target.getAttribute('type') === 'number';

        if (isNumericInput || isNumericSelect) {
            if (value === '') {
                finalValue = null;
            } else {
                const numValue = Number(value);
                finalValue = numValue < 0 ? 0 : numValue;
            }
        }
        
        // Only recenter the map when the main text query changes
        const shouldRecenter = name === 'query';
        onFilterChange(name as keyof Filters, finalValue, shouldRecenter);
    }, [onFilterChange]);
    
    const inputBaseClasses = "block w-full text-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-neutral-700";

    return (
         <div className="space-y-2">
            {!isMobile && (
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        name="query"
                        placeholder="Search city, address..."
                        value={filters.query}
                        onChange={handleInputChange}
                        onFocus={onQueryFocus}
                        onBlur={onQueryBlur}
                        className={`${inputBaseClasses} pl-9`}
                    />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="minPrice" className="block text-xs font-medium text-neutral-700 mb-1">Min Price</label>
                    <div className="relative">
                        <select
                            id="minPrice"
                            name="minPrice"
                            value={filters.minPrice || ''}
                            onChange={handleInputChange}
                            className={`${inputBaseClasses} appearance-none`}
                        >
                            <option value="">Any</option>
                            {PRICE_RANGES.map(price => (
                                <option key={`min-${price}`} value={price}>€{formatNumber(price)}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="maxPrice" className="block text-xs font-medium text-neutral-700 mb-1">Max Price</label>
                    <div className="relative">
                        <select
                            id="maxPrice"
                            name="maxPrice"
                            value={filters.maxPrice || ''}
                            onChange={handleInputChange}
                            className={`${inputBaseClasses} appearance-none`}
                        >
                            <option value="">Any</option>
                            {PRICE_RANGES.map(price => (
                                <option key={`max-${price}`} value={price}>€{formatNumber(price)}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <FilterButtonGroup 
                    label="Bedrooms"
                    options={[
                        {value: null, label: 'Any'},
                        {value: 1, label: '1+'},
                        {value: 2, label: '2+'},
                        {value: 3, label: '3+'},
                        {value: 4, label: '4+'},
                    ]}
                    selectedValue={filters.beds}
                    onChange={(value) => onFilterChange('beds', value, false)}
                />
                <FilterButtonGroup 
                    label="Bathrooms"
                    options={[
                        {value: null, label: 'Any'},
                        {value: 1, label: '1+'},
                        {value: 2, label: '2+'},
                        {value: 3, label: '3+'},
                    ]}
                    selectedValue={filters.baths}
                    onChange={(value) => onFilterChange('baths', value, false)}
                />
                <FilterButtonGroup 
                    label="Living Rooms"
                    options={[
                        {value: null, label: 'Any'},
                        {value: 1, label: '1+'},
                        {value: 2, label: '2+'},
                    ]}
                    selectedValue={filters.livingRooms}
                    onChange={(value) => onFilterChange('livingRooms', value, false)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="minSqft" className="block text-xs font-medium text-neutral-700 mb-1">Min Size (m²)</label>
                    <div className="relative">
                        <select
                            id="minSqft"
                            name="minSqft"
                            value={filters.minSqft || ''}
                            onChange={handleInputChange}
                            className={`${inputBaseClasses} appearance-none`}
                        >
                            <option value="">Any</option>
                            {SQFT_RANGES.map(size => (
                                <option key={`min-${size}`} value={size}>{size} m²</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="maxSqft" className="block text-xs font-medium text-neutral-700 mb-1">Max Size (m²)</label>
                    <div className="relative">
                        <select
                            id="maxSqft"
                            name="maxSqft"
                            value={filters.maxSqft || ''}
                            onChange={handleInputChange}
                            className={`${inputBaseClasses} appearance-none`}
                        >
                            <option value="">Any</option>
                            {SQFT_RANGES.map(size => (
                                <option key={`max-${size}`} value={size}>{size} m²</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FilterButtonGroup 
                    label="Listing Type"
                    options={[
                        {value: 'any', label: 'Any'},
                        {value: 'agent', label: 'Agent'},
                        {value: 'private', label: 'Private'},
                    ]}
                    selectedValue={filters.sellerType}
                    onChange={(value) => onFilterChange('sellerType', (value as SellerType) || 'any', false)}
                />
                <FilterButtonGroup
                    label="Property Type"
                    options={[
                        { value: 'any', label: 'Any' },
                        { value: 'house', label: 'House' },
                        { value: 'apartment', label: 'Apartment' },
                        { value: 'villa', label: 'Villa' },
                    ]}
                    selectedValue={filters.propertyType}
                    onChange={(value) => onFilterChange('propertyType', (value as Filters['propertyType']) || 'any', false)}
                />
            </div>
            
            <div className="flex items-center pt-1">
                 <input
                    type="checkbox"
                    id="search-on-move"
                    checked={searchOnMove}
                    onChange={(e) => onSearchOnMoveChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="search-on-move" className="ml-2 block text-xs text-neutral-600">
                    Search as I move the map
                </label>
            </div>

            {!isMobile && (
                 <div className="pt-1 flex items-center gap-2">
                     <button 
                        onClick={onResetFilters}
                        className="py-2.5 px-4 border border-neutral-300 text-neutral-600 rounded-lg text-sm font-bold bg-white hover:bg-neutral-100 transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={onSaveSearch} 
                        disabled={isSaving}
                        className="flex-grow py-2.5 px-4 border border-primary text-primary rounded-lg shadow-sm text-sm font-bold bg-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Search'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};


const PropertyList: React.FC<PropertyListProps> = (props) => {

    const { properties, filters, onSortChange, isMobile, showFilters, showList, searchMode, onSearchModeChange, onApplyAiFilters } = props;

    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const loadMoreRef = useRef(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    useEffect(() => {
      // Reset visible count when filters change
      setVisibleCount(ITEMS_PER_PAGE);
    }, [filters, properties]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && visibleCount < properties.length) {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
                        setIsLoadingMore(false);
                    }, 300); // Small delay to show loading and prevent rapid firing
                }
            },
            { threshold: 1.0 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [visibleCount, properties.length, isLoadingMore]);
    
    const inputBaseClasses = "block w-full text-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";
    
    return (
        <div className="flex flex-col bg-white h-full">
            {/* Header */}
            {!isMobile && showList && (
                <div className="p-4 border-b border-neutral-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-neutral-800">Properties for Sale</h2>
                    <p className="text-xs text-neutral-500">{properties.length} results found</p>
                </div>
            )}
            
            {showFilters && (
                 <div className="p-4 flex-shrink-0">
                    <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm max-w-sm mx-auto">
                        <button onClick={() => onSearchModeChange('manual')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'manual' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}>Manual Search</button>
                        <button onClick={() => onSearchModeChange('ai')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'ai' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}><SparklesIcon className="w-4 h-4" /> AI Search</button>
                    </div>
                </div>
            )}
            
            {searchMode === 'ai' && showFilters ? (
                <div className="flex-grow min-h-0">
                    <AiSearch properties={properties} onApplyFilters={onApplyAiFilters} isMobile={isMobile} />
                </div>
            ) : (
                <>
                    {showFilters && (
                        <div className="p-4 flex-shrink-0">
                            <FilterControls {...props} />
                        </div>
                    )}
                    
                    {showList && (
                        <div className="flex-grow overflow-y-auto">
                             {/* Sort and Results */}
                            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                                <p className="text-xs text-neutral-500 font-semibold">{properties.length} results found</p>
                                <div className="relative">
                                    <select
                                        id="sortBy"
                                        name="sortBy"
                                        value={filters.sortBy}
                                        onChange={(e) => onSortChange(e.target.value)}
                                        className={`${inputBaseClasses} appearance-none pr-8 text-xs !py-1.5`}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price_asc">Price (low-high)</option>
                                        <option value="price_desc">Price (high-low)</option>
                                        <option value="beds_desc">Beds (most)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Property Grid */}
                            <div className="p-4">
                                {properties.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {properties.slice(0, visibleCount).map(prop => (
                                                <PropertyCard key={prop.id} property={prop} />
                                            ))}
                                        </div>
                                        {visibleCount < properties.length && (
                                            <div ref={loadMoreRef} className="text-center p-8">
                                                {isLoadingMore ? (
                                                    <div className="flex justify-center items-center space-x-2 text-neutral-500">
                                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        <span>Loading more...</span>
                                                    </div>
                                                ) : <div className="h-1"></div>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 px-4 bg-neutral-50/70 rounded-lg border">
                                        <BuildingLibraryIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-neutral-800">No Properties Found</h3>
                                        <p className="text-neutral-500 mt-2">Try adjusting your search filters or moving the map to a different area.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PropertyList;