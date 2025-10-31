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
import BottomNav from './components/shared/BottomNav';
import MyAccountPage from './components/shared/MyAccountPage';

const AppContent: React.FC = () => {
  const { state } = useAppContext();
  
  const renderBuyerContent = () => {
      switch (state.activeView) {
        case 'saved-searches':
          return <SavedSearchesPage />;
        case 'saved-homes':
          return <SavedHomesPage />;
        case 'inbox':
          return <InboxPage />;
        case 'account':
          return <MyAccountPage />;
        case 'search':
        default:
          return <SearchPage />;
      }
  };

  const renderSellerContent = () => {
       switch (state.activeView) {
        case 'inbox':
          return <InboxPage />;
        case 'account':
          return <MyAccountPage />;
        case 'search': // Sellers default to their main dashboard
        default:
          return <SellerDashboard />;
      }
  };

  switch (state.userRole) {
    case UserRole.BUYER:
      return renderBuyerContent();
    case UserRole.SELLER:
      return renderSellerContent();
    default:
      return <Onboarding />;
  }
};

const MainLayout: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const isNavVisible = state.userRole === UserRole.BUYER || state.userRole === UserRole.SELLER;
  
  return (
    <div className={`font-sans ${isNavVisible ? 'pb-16 md:pb-0' : ''}`}>
      <AppContent />
      <AuthModal />
      <PricingPlans 
        isOpen={state.isPricingModalOpen} 
        onClose={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: false } })}
        isOffer={state.isFirstLoginOffer}
      />
      {isNavVisible && <BottomNav />}
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