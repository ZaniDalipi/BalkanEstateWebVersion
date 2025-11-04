import React, { useState, useMemo } from 'react';
import { SavedSearch } from '../../types';
import PropertyCard from './PropertyCard';
import { ChevronUpIcon, ChevronDownIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { filterProperties } from '../../utils/propertyUtils';

interface SavedSearchAccordionProps {
  search: SavedSearch;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useAppContext();

  const matchingProperties = useMemo(() => {
      return filterProperties(state.properties, search.filters);
  }, [state.properties, search.filters]);

  const propertyCount = matchingProperties.length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-bold text-neutral-800">{search.name}</h3>
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 text-white text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full">
            {propertyCount}
          </span>
          <div className="bg-indigo-600 text-white p-2 rounded-full">
            {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 bg-neutral-50/70 border-t border-neutral-200 animate-fade-in">
          {propertyCount > 0 ? (
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