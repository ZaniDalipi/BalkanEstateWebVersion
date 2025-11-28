import React, { useState, useMemo } from 'react';
import { SavedSearch } from '../../types';
import PropertyCard from '../PropertyDisplay/PropertyCard';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { filterProperties } from '../../utils/propertyUtils';
import PropertyCardSkeleton from '../PropertyDisplay/PropertyCardSkeleton';
import L from 'leaflet';
import * as api from '../../services/apiService';

interface SavedSearchAccordionProps {
  search: SavedSearch;
  onOpen: () => void;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { state, dispatch } = useAppContext();
  const { isLoadingProperties, allMunicipalities, properties } = state;

  const matchingProperties = useMemo(() => {
      // Start with base filters
      // FIX: The filterProperties function expects 2 arguments, not 3.
      let filtered = filterProperties(properties, search.filters);

      // If there's a drawn area, filter by it
      if (search.drawnBoundsJSON) {
          try {
              const parsed = JSON.parse(search.drawnBoundsJSON);
              const drawnBounds = L.latLngBounds(parsed._southWest, parsed._northEast);
              filtered = filtered.filter(p => drawnBounds.contains([p.lat, p.lng]));
          } catch (e) {
              console.error("Failed to parse drawnBoundsJSON in SavedSearchAccordion", e);
          }
      }
      
      return filtered;
  }, [properties, search.filters, search.drawnBoundsJSON, allMunicipalities]);

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

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center">
        <button
          onClick={handleToggle}
          className="flex-1 flex justify-between items-center text-left"
        >
          <h3 className="text-lg font-bold text-neutral-800">{search.name}</h3>
          <div className="flex items-center bg-indigo-600 text-white rounded-full transition-colors hover:bg-indigo-700">
            <span className="text-sm font-bold px-3 py-1.5 text-center">
              {propertyCount}
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
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                   <PropertyCardSkeleton key={index} />
               ))}
           </div>
          ) : propertyCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matchingProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-4">No properties currently match this search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedSearchAccordion;