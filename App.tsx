import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import Onboarding from './components/Onboarding';
import SearchPage from './components/BuyerFlow/SearchPage';
import CreateListingPage from './components/SellerFlow/SellerDashboard';
import AuthPage from './components/auth/AuthModal';
import PricingPlans from './components/SellerFlow/PricingPlans';
import SavedSearchesPage from './components/BuyerFlow/SavedSearchesPage';
import SavedHomesPage from './components/BuyerFlow/SavedHomesPage';
import InboxPage from './components/BuyerFlow/InboxPage';
import MyAccountPage from './components/shared/MyAccountPage';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import SubscriptionModal from './components/BuyerFlow/SubscriptionModal';
import AgentsPage from './components/AgentsPage/AgentsPage';
import AgenciesListPage from './components/AgenciesListPage';
import AgencyDetailPage from './components/AgencyDetailPage';
import EnterpriseCreationForm from './components/EnterpriseCreationForm';
import PropertyDetailsPage from './components/BuyerFlow/PropertyDetailsPage';
import { LogoIcon } from './constants';
import ListingLimitWarningModal from './components/shared/ListingLimitWarningModal';
import DiscountGameModal from './components/shared/DiscountGameModal';

// Mock agencies data - same as in AgenciesListPage
const getMockAgencies = () => {
  return [
    {
      _id: 'mock1',
      slug: 'belgrade-premier-estates',
      name: 'Belgrade Premier Estates',
      description: 'Leading real estate agency in Serbia with over 15 years of experience. Specializing in luxury properties and commercial real estate.',
      logo: 'https://ui-avatars.com/api/?name=Belgrade+Premier&background=0D8ABC&color=fff&size=200',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
      email: 'info@belgradepremier.rs',
      phone: '+381 11 123 4567',
      city: 'Belgrade',
      country: 'Serbia',
      address: 'Knez Mihailova 12, Belgrade',
      website: 'https://belgradepremier.rs',
      lat: 44.8176,
      lng: 20.4568,
      totalProperties: 87,
      totalAgents: 12,
      yearsInBusiness: 15,
      isFeatured: true,
      specialties: ['Luxury Homes', 'Commercial Properties', 'Investment Properties'],
      certifications: ['ISO 9001', 'Real Estate Association of Serbia'],
      agents: [
        {
          id: 'agent1',
          name: 'Marko Petrović',
          email: 'marko@belgradepremier.rs',
          phone: '+381 11 111 1111',
          avatarUrl: 'https://ui-avatars.com/api/?name=Marko+Petrovic&background=random',
          rating: 4.9,
          totalSalesValue: 2500000,
          propertiesSold: 45,
          activeListings: 12,
        },
        {
          id: 'agent2',
          name: 'Ana Jovanović',
          email: 'ana@belgradepremier.rs',
          phone: '+381 11 222 2222',
          avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Jovanovic&background=random',
          rating: 4.8,
          totalSalesValue: 1800000,
          propertiesSold: 32,
          activeListings: 8,
        },
      ],
    },
    {
      _id: 'mock2',
      slug: 'adriatic-properties-group',
      name: 'Adriatic Properties Group',
      description: 'Premium coastal real estate specialists covering the entire Croatian coastline. Your gateway to Mediterranean living.',
      logo: 'https://ui-avatars.com/api/?name=Adriatic+Properties&background=1e40af&color=fff&size=200',
      coverImage: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200',
      email: 'contact@adriaticproperties.hr',
      phone: '+385 21 456 789',
      city: 'Split',
      country: 'Croatia',
      address: 'Riva 5, Split',
      website: 'https://adriaticproperties.hr',
      lat: 43.5081,
      lng: 16.4402,
      totalProperties: 124,
      totalAgents: 18,
      yearsInBusiness: 10,
      isFeatured: true,
      specialties: ['Coastal Properties', 'Vacation Homes', 'Luxury Villas'],
      certifications: ['Croatian Real Estate Association'],
      agents: [
        {
          id: 'agent3',
          name: 'Ivan Horvat',
          email: 'ivan@adriaticproperties.hr',
          rating: 4.7,
          totalSalesValue: 3200000,
          propertiesSold: 52,
          activeListings: 15,
        },
      ],
    },
    {
      _id: 'mock3',
      slug: 'sofia-city-realty',
      name: 'Sofia City Realty',
      description: 'Your trusted partner for urban properties in Bulgaria\'s capital city.',
      logo: 'https://ui-avatars.com/api/?name=Sofia+City&background=059669&color=fff&size=200',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      email: 'info@sofiacityrealty.bg',
      phone: '+359 2 987 6543',
      city: 'Sofia',
      country: 'Bulgaria',
      address: 'Vitosha Boulevard 100, Sofia',
      lat: 42.6977,
      lng: 23.3219,
      totalProperties: 96,
      totalAgents: 14,
      yearsInBusiness: 12,
      isFeatured: true,
      specialties: ['Urban Apartments', 'Office Spaces'],
      agents: [],
    },
  ];
};

const AppContent: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { state, dispatch } = useAppContext();
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(false);

  // Check URL for agency routing on mount and when URL changes
  useEffect(() => {
    const checkUrlForAgency = () => {
      const path = window.location.pathname;
      const agencyMatch = path.match(/^\/agency\/(.+)$/);

      if (agencyMatch) {
        const agencySlug = agencyMatch[1];
        // Set the selected agency in state
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencySlug });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });
      }
    };

    checkUrlForAgency();

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', checkUrlForAgency);
    return () => window.removeEventListener('popstate', checkUrlForAgency);
  }, [dispatch]);

  // Fetch selected agency when selectedAgencyId changes
  useEffect(() => {
    const fetchAgency = async () => {
      if (state.selectedAgencyId) {
        setIsLoadingAgency(true);
        try {
          const response = await fetch(`/api/agencies/${state.selectedAgencyId}`);
          if (!response.ok) throw new Error('API failed');
          const data = await response.json();
          setSelectedAgency(data.agency);
        } catch (error) {
          console.log('API not available, using mock data');
          // Fallback to mock data - match by ID or slug
          const mockAgencies = getMockAgencies();
          const agency = mockAgencies.find(
            a => a._id === state.selectedAgencyId || a.slug === state.selectedAgencyId
          );
          if (agency) {
            setSelectedAgency(agency);
          } else {
            console.error('Agency not found in mock data:', state.selectedAgencyId);
            setSelectedAgency(null);
          }
        } finally {
          setIsLoadingAgency(false);
        }
      } else {
        setSelectedAgency(null);
        setIsLoadingAgency(false);
      }
    };
    fetchAgency();
  }, [state.selectedAgencyId]);

  // Global handler for selected agency view
  // Show agency detail page if we have a selectedAgencyId (even while loading)
  if (state.selectedAgencyId) {
    if (isLoadingAgency || !selectedAgency) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agency details...</p>
          </div>
        </div>
      );
    }
    return <AgencyDetailPage agency={selectedAgency} />;
  }

  // Global handler for selected property view
  if (state.selectedProperty) {
    return <PropertyDetailsPage property={state.selectedProperty} />;
  }

  switch (state.activeView) {
    case 'saved-searches':
      return <SavedSearchesPage />;
    case 'saved-properties':
      return <SavedHomesPage />;
    case 'inbox':
      return <InboxPage />;
    case 'account':
      return <MyAccountPage />;
    case 'create-listing':
      return <CreateListingPage />;
    case 'agents':
      return <AgentsPage />;
    case 'agencies':
      return <AgenciesListPage />;
    case 'search':
    default:
      return <SearchPage onToggleSidebar={onToggleSidebar} />;
  }
};

const MainLayout: React.FC = () => {
  const { state, dispatch, updateUser, createListing } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isSearchPage = state.activeView === 'search';
  const isFullHeightView = isSearchPage || state.activeView === 'inbox' || !!state.selectedProperty;
  const showHeader = !(isMobile && (isSearchPage || !!state.selectedProperty));
  
  const anyNonAuthModalOpen = state.isPricingModalOpen || state.isSubscriptionModalOpen || state.isListingLimitWarningOpen || state.isDiscountGameOpen;
  
  const isOverlayVisible = 
    state.isAuthModalOpen || 
    anyNonAuthModalOpen || 
    (isMobile && isSidebarOpen);


  const handleSubscribe = async () => {
    try {
        await updateUser({ isSubscribed: true });
        
        // If a property was pending, create it now
        if (state.pendingProperty) {
            await createListing(state.pendingProperty);
            dispatch({ type: 'SET_PENDING_PROPERTY', payload: null });
            // Optionally, show a success toast here
        }
    } catch (error) {
        console.error("Subscription update failed:", error);
        // Optionally show an error toast
    } finally {
        dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: false } });
        dispatch({ type: 'SET_ACTIVE_DISCOUNT', payload: null });
    }
  };

  const handlePricingClose = () => {
    // If a property was pending and the user closes the modal, we clear it.
    // The component that initiated this will show an error message.
    if (state.pendingProperty) {
        dispatch({ type: 'SET_PENDING_PROPERTY', payload: null });
    }
    dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: false } });
    dispatch({ type: 'SET_ACTIVE_DISCOUNT', payload: null });
  };
  
  const handleWarningConfirm = () => {
    dispatch({ type: 'TOGGLE_LISTING_LIMIT_WARNING', payload: false });
    dispatch({ type: 'TOGGLE_DISCOUNT_GAME', payload: true });
  };

  const handleGameComplete = (discounts: { proYearly: number; proMonthly: number; enterprise: number; }) => {
    dispatch({ type: 'SET_ACTIVE_DISCOUNT', payload: discounts });
    dispatch({ type: 'TOGGLE_DISCOUNT_GAME', payload: false });
    dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: true } });
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`relative transition-all duration-300 ease-in-out h-screen flex flex-col md:pl-20 ${isOverlayVisible ? 'blur-sm pointer-events-none' : ''}`}>
            {showHeader && <Header onToggleSidebar={() => setIsSidebarOpen(true)} isFloating={isSearchPage} />}
            <main className={`flex flex-col flex-grow ${isFullHeightView ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <AppContent onToggleSidebar={() => setIsSidebarOpen(true)} />
            </main>
        </div>
        
        <ListingLimitWarningModal
            isOpen={state.isListingLimitWarningOpen}
            onClose={() => {
                dispatch({ type: 'SET_PENDING_PROPERTY', payload: null });
                dispatch({ type: 'TOGGLE_LISTING_LIMIT_WARNING', payload: false });
            }}
            onConfirm={handleWarningConfirm}
        />
        <DiscountGameModal
            isOpen={state.isDiscountGameOpen}
            onGameComplete={handleGameComplete}
        />
        <PricingPlans 
            isOpen={state.isPricingModalOpen} 
            onClose={handlePricingClose}
            onSubscribe={handleSubscribe}
            isOffer={state.isFirstLoginOffer}
        />
        <SubscriptionModal
            isOpen={state.isSubscriptionModalOpen}
            onClose={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: false })}
        />
        <EnterpriseCreationForm
            isOpen={state.isEnterpriseModalOpen}
            onClose={() => dispatch({ type: 'TOGGLE_ENTERPRISE_MODAL', payload: false })}
        />
    </div>
  );
};

const FullScreenLoader: React.FC = () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-50">
        <LogoIcon className="w-16 h-16 text-primary animate-pulse" />
        <p className="mt-4 text-neutral-600 font-semibold">Loading Balkan Estate...</p>
    </div>
);


const AppWrapper: React.FC = () => {
    const { state, checkAuthStatus, handleOAuthCallback } = useAppContext();

    useEffect(() => {
        // Check for OAuth callback parameters in URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            alert(`Authentication failed: ${error}`);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                handleOAuthCallback(token, user);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (err) {
                console.error('Error parsing OAuth callback data:', err);
                alert('Authentication failed. Please try again.');
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            // Normal auth check
            checkAuthStatus();
        }
    }, [checkAuthStatus, handleOAuthCallback]);


    if (state.isAuthenticating) {
        return <FullScreenLoader />;
    }

    if (!state.onboardingComplete) {
        return (
            <>
                <Onboarding />
                {state.isAuthModalOpen && <AuthPage />}
            </>
        )
    }

    return (
        <>
            <MainLayout />
            {state.isAuthModalOpen && <AuthPage />}
        </>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppWrapper />
    </AppProvider>
  );
};

export default App;