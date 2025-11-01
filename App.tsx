import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import Onboarding from './components/Onboarding';
import SearchPage from './components/BuyerFlow/SearchPage';
import SellerDashboard from './components/SellerFlow/SellerDashboard';
import AuthPage from './components/auth/AuthModal';
import PricingPlans from './components/SellerFlow/PricingPlans';
import SavedSearchesPage from './components/BuyerFlow/SavedSearchesPage';
import SavedHomesPage from './components/BuyerFlow/SavedHomesPage';
import InboxPage from './components/BuyerFlow/InboxPage';
import MyAccountPage from './components/shared/MyAccountPage';
import AgentsPage from './components/AgentsPage/AgentsPage';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import SubscriptionModal from './components/BuyerFlow/SubscriptionModal';

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
        case 'agents':
          return <AgentsPage />;
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
        case 'agents':
            return <AgentsPage />;
        case 'search': // Sellers default to their main dashboard
        default:
          return <SellerDashboard />;
      }
  };

  const renderContent = () => {
    switch (state.userRole) {
      case UserRole.BUYER:
        return renderBuyerContent();
      case UserRole.SELLER:
        return renderSellerContent();
      default:
        return <Onboarding />;
    }
  };

  return renderContent();
};

const MainLayout: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLayoutVisible = state.userRole === UserRole.BUYER || state.userRole === UserRole.SELLER;
  
  const isFullHeightView = (state.activeView === 'search' && state.userRole === UserRole.BUYER) || state.activeView === 'inbox';


  if (!isLayoutVisible) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="transition-all duration-300 ease-in-out md:pl-20 h-screen flex flex-col">
            <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
            <main className={`flex-grow ${isFullHeightView ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <AppContent />
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