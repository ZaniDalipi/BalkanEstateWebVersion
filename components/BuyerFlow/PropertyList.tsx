import React, { useCallback, useState } from 'react';
import { Property, ChatMessage, AiSearchQuery, Filters, SellerType } from '../../types';
import PropertyCard from './PropertyCard';
import { SearchIcon, SparklesIcon, XMarkIcon, BellIcon } from '../../constants';

interface PropertyListProps {
  properties: Property[];
  filters: Filters;
  onFilterChange: (name: keyof Filters, value: string | number | null) => void;
  onSortChange: (value: string) => void;
  onSaveSearch: () => void;
  onGetAlerts: () => void;
  isSaving: boolean;
  searchMode: 'manual' | 'ai';
  onSearchModeChange: (mode: 'manual' | 'ai') => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isAiThinking: boolean;
  suggestedFilters: AiSearchQuery | null;
  onApplySuggestedFilters: () => void;
  onClearSuggestedFilters: () => void;
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
  options: { value: string | number; label: string }[];
  selectedValue: string | number | null;
  onChange: (value: string | number | null) => void;
}> = ({ label, options, selectedValue, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-700 mb-1.5">{label}</label>
    <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full border border-neutral-200">
      {options.map(({ value, label: optionLabel }) => (
        <FilterButton
          key={value}
          onClick={() => onChange(selectedValue === value ? null : value)}
          isActive={selectedValue === value}
        >
          {optionLabel}
        </FilterButton>
      ))}
    </div>
  </div>
);

const SuggestedFilters: React.FC<{
    filters: AiSearchQuery;
    onApply: () => void;
    onClear: () => void;
}> = ({ filters, onApply, onClear }) => {
    const filterItems = Object.entries(filters).filter(([, value]) => value !== undefined && value !== null);

    if (filterItems.length === 0) return null;

    const formatValue = (key: string, value: any) => {
        if (key === 'minPrice' || key === 'maxPrice') return `€${(value as number).toLocaleString()}`;
        if (Array.isArray(value)) return value.join(', ');
        return value;
    };
    
    const formatLabel = (key: string) => {
        const labels: {[key: string]: string} = {
            location: 'Location',
            minPrice: 'Min Price',
            maxPrice: 'Max Price',
            beds: 'Min Beds',
            baths: 'Min Baths',
            features: 'Features',
        };
        return labels[key] || key;
    };

    return (
        <div className="mt-2 animate-fade-in">
            <div className="p-4 bg-primary-light border border-primary/20 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-primary-dark">AI Suggested Filters</h4>
                    <button onClick={onClear} className="text-primary-dark hover:bg-primary/20 rounded-full p-1">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {filterItems.map(([key, value]) => (
                        <div key={key}>
                            <span className="font-semibold text-primary-dark/80">{formatLabel(key)}:</span>
                            <span className="ml-1 text-primary-dark">{formatValue(key, value)}</span>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={onApply} 
                    className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

const PRICE_RANGES = [50000, 75000, 100000, 125000, 150000, 175000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000];
const formatNumber = (num: number) => new Intl.NumberFormat('de-DE').format(num);

const PropertyList: React.FC<PropertyListProps> = ({ 
    properties, filters, onFilterChange, onSortChange, onSaveSearch, onGetAlerts, isSaving,
    searchMode, onSearchModeChange, 
    chatHistory, onSendMessage, isAiThinking,
    suggestedFilters, onApplySuggestedFilters, onClearSuggestedFilters
}) => {
    
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let finalValue: string | number | null = value;
        
        const isNumericSelect = e.target.nodeName === 'SELECT' && (name === 'minPrice' || name === 'maxPrice');
        const isNumericInput = e.target.getAttribute('type') === 'number';

        if (isNumericInput || isNumericSelect) {
            finalValue = value === '' ? null : Number(value);
        }
        
        onFilterChange(name as keyof Filters, finalValue);
    }, [onFilterChange]);
    
    const inputBaseClasses = "block w-full text-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";
    
    return (
        <div className="flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex-shrink-0">
                <h2 className="text-lg font-bold text-neutral-800">Properties for Sale</h2>
                <p className="text-xs text-neutral-500">{properties.length} results found</p>
            </div>

            {/* Filters Section */}
            <div className="p-4">
                 <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 border border-neutral-200 shadow-sm max-w-sm mx-auto mb-4">
                    <button
                        onClick={() => onSearchModeChange('manual')}
                        className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'manual' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    >Manual Search</button>
                    <button
                        onClick={() => onSearchModeChange('ai')}
                        className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${searchMode === 'ai' ? 'bg-white text-primary shadow' : 'text-neutral-600 hover:bg-neutral-200'}`}
                    ><SparklesIcon className="w-4 h-4" /> AI Search</button>
                </div>
                 {searchMode === 'manual' ? (
                    <div className="space-y-3">
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
                                className={`${inputBaseClasses} pl-9`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="minPrice" className="block text-xs font-medium text-neutral-700 mb-1.5">Min Price</label>
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
                                <label htmlFor="maxPrice" className="block text-xs font-medium text-neutral-700 mb-1.5">Max Price</label>
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
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Bedrooms</label>
                                <input 
                                    type="number" 
                                    name="beds" 
                                    placeholder="Any" 
                                    value={filters.beds || ''} 
                                    onChange={handleInputChange}
                                    min="0"
                                    className={inputBaseClasses}
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Bathrooms</label>
                                <input 
                                    type="number" 
                                    name="baths" 
                                    placeholder="Any" 
                                    value={filters.baths || ''} 
                                    onChange={handleInputChange}
                                    min="0"
                                    className={inputBaseClasses}
                                />
                            </div>
                        </div>

                        <FilterButtonGroup 
                            label="Listing Type"
                            options={[
                                {value: 'any', label: 'Any'},
                                {value: 'agent', label: 'Agent'},
                                {value: 'private', label: 'Private'},
                            ]}
                            selectedValue={filters.sellerType}
                            onChange={(value) => onFilterChange('sellerType', value as SellerType)}
                        />

                        <div className="relative">
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleInputChange}
                                className={`${inputBaseClasses} appearance-none`}
                            >
                                <option value="price_asc">Sort by: Price (low-high)</option>
                                <option value="price_desc">Sort by: Price (high-low)</option>
                                <option value="beds_desc">Sort by: Beds (most)</option>
                                <option value="newest">Sort by: Newest first</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>

                        <div className="relative">
                            <select
                                name="propertyType"
                                value={filters.propertyType}
                                onChange={handleInputChange}
                                className={`${inputBaseClasses} appearance-none`}
                            >
                                <option value="any">Property Type (Any)</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={onSaveSearch} 
                                disabled={isSaving}
                                className="w-full py-2.5 px-4 border border-primary text-primary rounded-lg shadow-sm text-sm font-bold bg-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
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
                             <button
                                onClick={() => {}} // Search is live, so this is a visual affordance
                                className="w-full py-2.5 px-4 border border-transparent text-white rounded-lg shadow-sm text-sm font-bold bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center gap-2"
                            >
                                <SearchIcon className="w-4 h-4" />
                                Search Now
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50/50 rounded-lg border h-[300px]">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
                                        msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-br-lg' 
                                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-lg'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-white text-neutral-800 border border-neutral-200 rounded-bl-lg">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2 w-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-neutral-400 rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <ChatInput onSendMessage={onSendMessage} disabled={isAiThinking} />
                        </div>
                        {suggestedFilters && (
                            <SuggestedFilters
                                filters={suggestedFilters}
                                onApply={onApplySuggestedFilters}
                                onClear={onClearSuggestedFilters}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Property Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map(prop => (
                    <PropertyCard key={prop.id} property={prop} />
                ))}
            </div>
        </div>
    );
};

const ChatInput: React.FC<{ onSendMessage: (message: string) => void; disabled: boolean }> = ({ onSendMessage, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your ideal home..."
                disabled={disabled}
                className="block w-full text-base bg-white border border-neutral-300 rounded-full text-neutral-900 shadow-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
            <button type="submit" disabled={disabled} className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark disabled:bg-primary/50 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
        </form>
    );
};

export default PropertyList;