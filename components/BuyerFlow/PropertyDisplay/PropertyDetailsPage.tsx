// PropertyDetailsPage - Main Component
// Orchestrates all property detail subcomponents

import React, { useState, useEffect, useCallback } from 'react';
import { Property, PropertyImageTag } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { ArrowLeftIcon } from '../../../constants';
import ImageViewerModal from '../Modals/ImageViewerModal';
import FloorPlanViewerModal from '../Modals/FloorPlanViewerModal';
import {
  ImageEditorModal,
  NeighborhoodInsights,
  PropertyGallery,
  PropertyInfo,
  PropertyContact,
  PropertyPhotos,
  PropertyMapLink,
} from '../../../src/components/property';

/**
 * PropertyDetailsPage Component
 *
 * Main property details page that orchestrates all subcomponents:
 * - Back button and favorite toggle
 * - Image gallery with street view
 * - Property information
 * - Photo thumbnail gallery
 * - Neighborhood insights
 * - Contact seller sidebar
 * - Map link
 *
 * All major sections have been extracted into focused components <200 lines.
 */
const PropertyDetailsPage: React.FC<{ property: Property }> = ({ property }) => {
  const { state, dispatch, createConversation, toggleSavedHome } = useAppContext();

  // State for image gallery
  const [activeCategory, setActiveCategory] = useState<PropertyImageTag | 'all'>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);

  // State for contact
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Computed values
  const isFavorited = state.savedHomes.some((p) => p.id === property.id);

  // Get current image URL for editor
  const allImages = React.useMemo(() => {
    const images = property.images || [];
    const mainImage = { url: property.imageUrl, tag: 'exterior' as PropertyImageTag };
    const combined = [mainImage, ...images];
    return combined.filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i);
  }, [property.imageUrl, property.images]);

  const categorizedImages = React.useMemo(() => {
    return allImages.reduce((acc, img) => {
      const tag = img.tag || 'other';
      if (!acc[tag]) {
        acc[tag] = [];
      }
      acc[tag].push(img);
      return acc;
    }, {} as Record<PropertyImageTag, { url: string; tag: PropertyImageTag }[]>);
  }, [allImages]);

  const imagesForCurrentCategory = React.useMemo(() => {
    if (activeCategory === 'all') {
      return allImages;
    }
    return categorizedImages[activeCategory] || [];
  }, [activeCategory, allImages, categorizedImages]);

  const currentImageUrl = imagesForCurrentCategory[currentImageIndex]?.url || property.imageUrl;

  // Handlers
  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    window.history.pushState({}, '', '/search');
  };

  const handleFavoriteClick = async () => {
    if (!state.isAuthenticated && !state.user) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
    } else {
      try {
        await toggleSavedHome(property);
      } catch (error) {
        console.error('Failed to toggle saved home:', error);
        alert('Failed to save property. Please try again.');
      }
    }
  };

  const handleContactSeller = async () => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
      return;
    }

    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'inbox' });

    setIsCreatingConversation(true);
    try {
      const conversation = await createConversation(property.id);
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
    } catch (error) {
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleNavigateToMap = () => {
    dispatch({
      type: 'UPDATE_SEARCH_PAGE_STATE',
      payload: {
        focusMapOnProperty: {
          lat: property.lat,
          lng: property.lng,
          address: property.address,
        },
      },
    });
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
  };

  const handleCategorySelect = useCallback((tag: PropertyImageTag | 'all') => {
    setActiveCategory(tag);
    setCurrentImageIndex(0);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  return (
    <div className="bg-neutral-50 h-full overflow-y-auto animate-fade-in">
      {/* Modals */}
      {isEditorOpen && (
        <ImageEditorModal
          imageUrl={currentImageUrl}
          property={property}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
      {isViewerOpen && (
        <ImageViewerModal
          images={imagesForCurrentCategory}
          startIndex={currentImageIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
      {isFloorPlanOpen && property.floorplanUrl && (
        <FloorPlanViewerModal
          imageUrl={property.floorplanUrl}
          onClose={() => setIsFloorPlanOpen(false)}
        />
      )}

      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary font-semibold hover:underline"
          aria-label="Go back to search results"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <div
          onClick={property.status === 'sold' ? undefined : handleFavoriteClick}
          className={`bg-white p-2 rounded-full border border-neutral-200 ${
            property.status === 'sold'
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:shadow-md'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-colors duration-300 ${
              property.status === 'sold'
                ? 'text-neutral-300'
                : isFavorited
                ? 'text-red-500 fill-current'
                : 'text-neutral-500 hover:text-red-500'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyGallery
              property={property}
              onOpenEditor={(url) => setIsEditorOpen(true)}
              onOpenViewer={() => setIsViewerOpen(true)}
            />

            {/* Property Info */}
            <PropertyInfo property={property} onOpenFloorPlan={() => setIsFloorPlanOpen(true)} />

            {/* Photo Thumbnails */}
            <PropertyPhotos
              property={property}
              activeCategory={activeCategory}
              currentImageIndex={currentImageIndex}
              onCategorySelect={handleCategorySelect}
              onImageSelect={setCurrentImageIndex}
            />

            {/* Map Link */}
            <PropertyMapLink property={property} onNavigateToMap={handleNavigateToMap} />

            {/* Neighborhood Insights */}
            <NeighborhoodInsights
              lat={property.lat}
              lng={property.lng}
              address={property.address}
              city={property.city}
              country={property.country}
            />
          </div>

          {/* Right Column - Contact Sidebar */}
          <div className="lg:col-span-1">
            <PropertyContact
              property={property}
              isCreatingConversation={isCreatingConversation}
              onContactSeller={handleContactSeller}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetailsPage;
