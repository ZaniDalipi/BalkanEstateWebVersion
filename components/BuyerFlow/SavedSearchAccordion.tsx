import React, { useState, useMemo } from 'react';
import { SavedSearch } from '../../types';
import PropertyCard from './PropertyCard';
import { ChevronUpIcon, ChevronDownIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { filterProperties } from '../../utils/propertyUtils';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import L from 'leaflet';

interface SavedSearchAccordionProps {
  search: SavedSearch;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useAppContext();
  const { isLoadingProperties, allMunicipalities, properties } = state;

  const matchingProperties = useMemo(() => {
      // Start with base filters
      let filtered = filterProperties(properties, search.filters, allMunicipalities);

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

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left"
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