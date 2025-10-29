import React from 'react';
import { useAppContext } from '../../context/AppContext';
import SavedSearchAccordion from './SavedSearchAccordion';
import Header from '../shared/Header';

const SavedSearchesPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { savedSearches } = state;

  const handleMarkAllViewed = () => {
    dispatch({ type: 'MARK_ALL_SEARCHES_VIEWED' });
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header />
      {/* Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Updates</h1>
                <h2 className="text-xl font-semibold text-neutral-700 mt-1">Saved Searches</h2>
            </div>
            <div className="flex justify-end mb-6">
              <button 
                onClick={handleMarkAllViewed}
                className="bg-primary-light text-primary-dark font-semibold text-sm px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
              >
                Mark all viewed
              </button>
            </div>

            <div className="space-y-4">
              {savedSearches.map((search) => (
                <SavedSearchAccordion key={search.id} search={search} />
              ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default SavedSearchesPage;