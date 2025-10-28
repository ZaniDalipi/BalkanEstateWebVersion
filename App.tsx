import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import Onboarding from './components/Onboarding';
import SearchPage from './components/BuyerFlow/SearchPage';
import SellerDashboard from './components/SellerFlow/SellerDashboard';

const AppContent: React.FC = () => {
  const { state } = useAppContext();

  switch (state.userRole) {
    case UserRole.BUYER:
      return <SearchPage />;
    case UserRole.SELLER:
      return <SellerDashboard />;
    default:
      return <Onboarding />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="font-sans">
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default App;