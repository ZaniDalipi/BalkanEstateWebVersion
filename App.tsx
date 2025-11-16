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
import EnterpriseCreationForm from './components/EnterpriseCreationForm';
import PropertyDetailsPage from './components/BuyerFlow/PropertyDetailsPage';
import { LogoIcon } from './constants';
import ListingLimitWarningModal from './components/shared/ListingLimitWarningModal';
import DiscountGameModal from './components/shared/DiscountGameModal';

const AppContent: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { state } = useAppContext();

  // Global handler for selected property view
  if (state.selectedProperty) {
    return <PropertyDetailsPage property={state.selectedProperty} />;
  }
  
  switch (state.activeView) {
    case 'saved-searches':
      return <SavedSearchesPage />;
    case 'saved-homes':
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