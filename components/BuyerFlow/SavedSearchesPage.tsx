import React from 'react';
import { useAppContext } from '../../context/AppContext';
import SavedSearchAccordion from './SavedSearchAccordion';
import { MagnifyingGlassPlusIcon } from '../../constants';
import PropertyDetailsPage from './PropertyDetailsPage';
import { SavedSearch } from '../../types';

const SavedSearchesPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { savedSearches, isAuthenticated, selectedProperty } = state;

  if (selectedProperty) {
    return <PropertyDetailsPage property={selectedProperty} />;
  }

  const handleMarkAllViewed = () => {
    dispatch({ type: 'MARK_ALL_SEARCHES_VIEWED' });
  };

  const renderContent = () => {
    if (!isAuthenticated) {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md border">
                <MagnifyingGlassPlusIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800">Log in to view your saved searches</h3>
                <p className="text-neutral-500 mt-2">Save your favorite search criteria and get notified about new listings.</p>
                <button 
                    onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                    className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    Login / Register
                </button>
            </div>
        );
    }
    
    if (savedSearches.length === 0) {
        const handleSaveExample = () => {
            const exampleSearch: SavedSearch = {
                id: 'ss-example',
                name: 'Belgrade, under €400k',
                newPropertyCount: state.properties.filter(p => p.city === 'Belgrade' && p.price < 400000).length,
                properties: state.properties.filter(p => p.city === 'Belgrade' && p.price < 400000).slice(0,5),
            };
            dispatch({ type: 'ADD_SAVED_SEARCH', payload: exampleSearch });
        };
    
        return (
             <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md border">
                <MagnifyingGlassPlusIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800">You haven't saved any searches yet.</h3>
                <p className="text-neutral-500 mt-2">Perform a search and click "Save Search" to get started, or save this example:</p>
                
                <div className="mt-6 bg-neutral-50 p-4 rounded-lg border max-w-md mx-auto flex items-center justify-between">
                    <p className="font-semibold text-neutral-700">Example: Belgrade, under €400k</p>
                    <button 
                        onClick={handleSaveExample}
                        className="px-4 py-2 bg-secondary text-white font-bold rounded-lg shadow-sm hover:bg-opacity-90 transition-colors text-sm"
                    >
                        + Save
                    </button>
                </div>
    
                 <button 
                    onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' })}
                    className="mt-8 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    Or, Start a New Search
                </button>
            </div>
        );
    }
    
    return (
        <>
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
        </>
    );
  };

  return (
    <div className="bg-neutral-50 min-h-full">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Updates</h1>
                <h2 className="text-xl font-semibold text-neutral-700 mt-1">Saved Searches</h2>
            </div>
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SavedSearchesPage;