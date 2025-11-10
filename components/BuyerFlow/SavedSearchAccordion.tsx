import React, { useState, useMemo } from 'react';
import { SavedSearch } from '../../types';
import PropertyCard from './PropertyCard';
import { ChevronUpIcon, ChevronDownIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { filterProperties } from '../../utils/propertyUtils';
import PropertyCardSkeleton from './PropertyCardSkeleton';

interface SavedSearchAccordionProps {
  search: SavedSearch;
  onOpen: () => void;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useAppContext();
  const { isLoadingProperties, properties } = state;

  const matchingProperties = useMemo(() => {
    return filterProperties(properties, search.filters);
  }, [properties, search]);

  const propertyCount = matchingProperties.length;

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    if (nextIsOpen) {
      onOpen();
    }
    setIsOpen(nextIsOpen);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
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