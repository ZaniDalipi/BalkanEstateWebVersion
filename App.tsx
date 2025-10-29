import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import Onboarding from './components/Onboarding';
import SearchPage from './components/BuyerFlow/SearchPage';
import SellerDashboard from './components/SellerFlow/SellerDashboard';
import AuthModal from './components/auth/AuthModal';
import PricingPlans from './components/SellerFlow/PricingPlans';
import SavedSearchesPage from './components/BuyerFlow/SavedSearchesPage';
import SavedHomesPage from './components/BuyerFlow/SavedHomesPage';
import InboxPage from './components/BuyerFlow/InboxPage';

const AppContent: React.FC = () => {
  const { state } = useAppContext();

  switch (state.userRole) {
    case UserRole.BUYER:
      // Simple router for buyer views
      switch (state.activeView) {
        case 'saved-searches':
          return <SavedSearchesPage />;
        case 'saved-homes':
          return <SavedHomesPage />;
        case 'inbox':
          return <InboxPage />;
        case 'search':
        default:
          return <SearchPage />;
      }
    case UserRole.SELLER:
      return <SellerDashboard />;
    default:
      return <Onboarding />;
  }
};

const MainLayout: React.FC = () => {
  const { state, dispatch } = useAppContext();
  return (
    <div className="font-sans">
      <AppContent />
      <AuthModal />
      <PricingPlans 
        isOpen={state.isPricingModalOpen} 
        onClose={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: false } })}
        isOffer={state.isFirstLoginOffer}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;