import React, { useState, useMemo, useEffect } from 'react';
import { SavedSearch, Property } from '../../types';
import PropertyCard from './PropertyCard';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, ShieldExclamationIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { filterProperties } from '../../utils/propertyUtils';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import L from 'leaflet';
import * as api from '../../services/apiService';

interface SavedSearchAccordionProps {
  search: SavedSearch;
  onOpen: () => void;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadedProperties, setLoadedProperties] = useState<Property[]>([]);
  const [isLoadingSearchProperties, setIsLoadingSearchProperties] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const { state, dispatch } = useAppContext();
  const { isLoadingProperties, allMunicipalities } = state;

  // Load properties for this specific search when accordion opens
  useEffect(() => {
    if (isOpen && loadedProperties.length === 0 && !loadError) {
      loadPropertiesForSearch();
    }
  }, [isOpen]);

  const loadPropertiesForSearch = async () => {
    setIsLoadingSearchProperties(true);
    setLoadError(null);
    try {
      // Load properties using the search filters
      const properties = await api.getProperties(search.filters);
      setLoadedProperties(properties);

      if (properties.length === 0) {
        setDisplayCount(0);
      }
    } catch (error) {
      console.error('Failed to load properties for saved search:', error);
      setLoadError('Failed to load properties. Please try again.');
      setLoadedProperties([]);
    } finally {
      setIsLoadingSearchProperties(false);
    }
  };

  const matchingProperties = useMemo(() => {
      // Use loaded properties if available
      const propertiesToFilter = loadedProperties.length > 0 ? loadedProperties : [];

      if (propertiesToFilter.length === 0) {
        setDisplayCount(0);
        return [];
      }

      // Start with base filters
      let filtered = filterProperties(propertiesToFilter, search.filters);

      // If there's a drawn area, filter by it
      if (search.drawnBoundsJSON) {
          try {
              const parsed = JSON.parse(search.drawnBoundsJSON);
              const drawnBounds = L.latLngBounds(parsed._southWest, parsed._northEast);
              filtered = filtered.filter(p => drawnBounds.contains([p.lat, p.lng]));
          } catch (e) {
              console.error("Failed to parse drawnBoundsJSON in SavedSearchAccordion", e);
              setLoadError('Invalid saved area. Please save the search again.');
          }
      }

      setDisplayCount(filtered.length);
      return filtered;
  }, [loadedProperties, search.filters, search.drawnBoundsJSON, allMunicipalities]);

  const propertyCount = matchingProperties.length;

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    if (nextIsOpen) {
      onOpen();
    }
    setIsOpen(nextIsOpen);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion from toggling

    if (!confirm(`Are you sure you want to delete "${search.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteSavedSearch(search.id);
      dispatch({ type: 'REMOVE_SAVED_SEARCH', payload: search.id });
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      alert('Failed to delete saved search. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isLoadingSearchProperties || isLoadingProperties;

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center">
        <button
          onClick={handleToggle}
          className="flex-1 flex justify-between items-center text-left"
        >
          <div className="flex flex-col flex-1">
            <h3 className="text-lg font-bold text-neutral-800">{search.name}</h3>
            {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
          </div>
          <div className="flex items-center bg-indigo-600 text-white rounded-full transition-colors hover:bg-indigo-700 ml-4">
            <span className="text-sm font-bold px-3 py-1.5 text-center">
              {isLoading ? '...' : propertyCount}
            </span>
            <div className="border-l border-indigo-400 p-1.5">
              {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </div>
          </div>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          title="Delete search"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 bg-neutral-50/70 border-t border-neutral-200 animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                   <PropertyCardSkeleton key={index} />
               ))}
           </div>
          ) : loadError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ShieldExclamationIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{loadError}</p>
                <button
                  onClick={() => {
                    setLoadError(null);
                    loadPropertiesForSearch();
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium mt-1"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : propertyCount > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {matchingProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          ) : loadedProperties.length > 0 ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <ShieldExclamationIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">No properties match this search in the specified area. Try expanding the area or adjusting filters.</p>
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-4">Loading properties...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedSearchAccordion;