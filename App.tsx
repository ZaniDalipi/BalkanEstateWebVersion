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
import PropertyDetailsPage from './components/BuyerFlow/PropertyDetailsPage';

const AppContent: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { state } = useAppContext();

  // If no role is selected yet (first time user), show onboarding
  if (state.isInitialLaunch) {
    return <Onboarding />;
  }

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
    case 'search':
    default:
      return <SearchPage onToggleSidebar={onToggleSidebar} />;
  }
};

const MainLayout: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isFullHeightView = state.isInitialLaunch || state.activeView === 'search' || state.activeView === 'inbox' || !!state.selectedProperty;
  const showHeader = state.isInitialLaunch || !(isMobile && (state.activeView === 'search' || !!state.selectedProperty));

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`transition-all duration-300 ease-in-out h-screen flex flex-col ${showHeader ? 'md:pl-20' : ''}`}>
            {showHeader && <Header onToggleSidebar={() => setIsSidebarOpen(true)} />}
            <main className={`flex flex-col flex-grow ${isFullHeightView ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <AppContent onToggleSidebar={() => setIsSidebarOpen(true)} />
            </main>
        </div>
        
        {/* Global Modals that are NOT the auth page */}
        <PricingPlans 
            isOpen={state.isPricingModalOpen} 
            onClose={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: false } })}
            isOffer={state.isFirstLoginOffer}
        />
        <SubscriptionModal
            isOpen={state.isSubscriptionModalOpen}
            onClose={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: false })}
        />
    </div>
  );
};

const AppWrapper: React.FC = () => {
    const { state } = useAppContext();

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