import React, { useState } from 'react';
import { SavedSearch } from '../../types';
import PropertyCard from './PropertyCard';
import { ChevronUpIcon, ChevronDownIcon } from '../../constants';

interface SavedSearchAccordionProps {
  search: SavedSearch;
}

const SavedSearchAccordion: React.FC<SavedSearchAccordionProps> = ({ search }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-bold text-neutral-800">{search.name}</h3>
        <div className="flex items-center gap-3">
          {search.newPropertyCount > 0 && (
            <span className="bg-indigo-600 text-white text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full">
              {search.newPropertyCount}
            </span>
          )}
          <div className="bg-indigo-600 text-white p-2 rounded-full">
            {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 bg-neutral-50/70 border-t border-neutral-200 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {search.properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearchAccordion;