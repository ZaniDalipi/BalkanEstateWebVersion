'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import Onboarding from '../components/Onboarding';
import { SearchPage } from '../components/BuyerFlow/Search';
import CreateListingPage from '../components/SellerFlow/SellerDashboard';
import AuthPage from '../components/auth/AuthModal';
import PricingPlans from '../components/SellerFlow/PricingPlans';
import { SavedSearchesPage } from '../components/BuyerFlow/Saved';
import SavedPropertiesPage from '../components/BuyerFlow/Saved/SavedHomesPage';
import InboxPage from '../components/BuyerFlow/Messaging/InboxPage';
import MyAccountPage from '../components/shared/MyAccountPage';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SubscriptionModal from '../components/BuyerFlow/Modals/SubscriptionModal';
import AgentsPage from '../components/AgentsPage/AgentsPage';
import AgenciesListPage from '../components/AgenciesListPage';
import AgencyDetailPage from '../components/AgencyDetailPage';
import EnterpriseCreationForm from '../components/EnterpriseCreationForm';
import PropertyDetailsPage from '../components/BuyerFlow/PropertyDisplay/PropertyDetailsPage';
import PaymentSuccess from '../components/PaymentSuccess';
import PaymentCancel from '../components/PaymentCancel';
import { LogoIcon } from '../constants';
import ListingLimitWarningModal from '../components/shared/ListingLimitWarningModal';
import DiscountGameModal from '../components/shared/DiscountGameModal';
import AdminDashboard from '../components/AdminPanel/AdminDashboard';
import { usePathname, useRouter } from 'next/navigation';

const ClientApp: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Check URL for routing on mount and when pathname changes
  useEffect(() => {
    const checkUrlForRouting = () => {
      // Normalize path: remove trailing slashes (except for root '/')
      let path = pathname;
      if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }

      console.log('🔙 Navigation detected:', path);

      // Payment callback routes (highest priority)
      if (path === '/payment/success' || path === '/payment/cancel') {
        // Don't change active view, let the component handle it
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
        return;
      }

      // Property detail route: /property/:id
      const propertyMatch = path.match(/^\/property\/(.+)$/);
      if (propertyMatch) {
        const propertyId = decodeURIComponent(propertyMatch[1]);
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        return;
      }

      // Agency detail route: /agencies/:slug
      const agencyMatch = path.match(/^\/agencies\/(.+)$/);
      if (agencyMatch) {
        let agencySlug = decodeURIComponent(agencyMatch[1]);

        // Normalize slug: remove country prefix with comma if present
        // Handles old format: "serbia,belgrade-premium-properties" -> "belgrade-premium-properties"
        if (agencySlug.includes(',')) {
          agencySlug = agencySlug.split(',')[1];
        }

        // Clear property selection when viewing agency
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencySlug });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });
        return;
      }

      // Main navigation routes
      const routeMap: { [key: string]: any } = {
        '/': 'search',
        '/search': 'search',
        '/saved-searches': 'saved-searches',
        '/saved-properties': 'saved-properties',
        '/inbox': 'inbox',
        '/account': 'account',
        '/agents': 'agents',
        '/agencies': 'agencies',
        '/create-listing': 'create-listing',
        '/admin': 'admin',
      };

      const view = routeMap[path];
      if (view) {
        // Clear selected items when navigating to main routes
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
      } else {
        // Unknown route - default to search and clear selections
        console.log('⚠️ Unknown route, defaulting to search');
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: null });
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        router.replace('/');
      }
    };

    checkUrlForRouting();
  }, [pathname, dispatch, router]);

  // Fetch selected agency when selectedAgencyId changes
  useEffect(() => {
    const fetchAgency = async () => {
      if (state.selectedAgencyId) {
        // Check if selectedAgencyId is already an agency object
        const agencyId = state.selectedAgencyId;
        if (typeof agencyId === 'object' && agencyId !== null && '_id' in agencyId && 'name' in agencyId) {
          console.log('✅ Agency object already loaded:', agencyId.name);
          setSelectedAgency(agencyId);
          setIsLoadingAgency(false);
          return;
        }

        setIsLoadingAgency(true);
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
          const agencyIdentifier = state.selectedAgencyId;

          console.log('🔍 Fetching agency with identifier:', agencyIdentifier);

          // Include auth token so backend can identify current user and auto-add owner as member
          const token = localStorage.getItem('balkan_estate_token');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${API_URL}/agencies/${agencyIdentifier}`, { headers });

          // Check content type before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Backend API not responding correctly. Is the server running?');
            setSelectedAgency(null);
            setIsLoadingAgency(false);
            return;
          }

          if (!response.ok) {
            console.error('Failed to fetch agency:', agencyIdentifier, '-', response.status, '-', response.statusText);
            setSelectedAgency(null);
          } else {
            const data = await response.json();
            console.log('✅ Agency fetched successfully:', data.agency?.name);
            setSelectedAgency(data.agency);
          }
        } catch (error) {
          console.error('Error fetching agency:', error);
          setSelectedAgency(null);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Payment callback routes (highest priority)
  if (pathname === '/payment/success') {
    return <PaymentSuccess />;
  }
  if (pathname === '/payment/cancel') {
    return <PaymentCancel />;
  }

  // Global handler for selected property view
  if (state.selectedProperty) {
    return <PropertyDetailsPage property={state.selectedProperty} />;
  }

  // Agency detail view
  if (state.selectedAgencyId && !isLoadingAgency) {
    return <AgencyDetailPage agency={selectedAgency} />;
  }

  // Show onboarding first if user is not onboarded
  if (!state.onboardingComplete) {
    return <Onboarding />;
  }

  // Show auth if not authenticated and trying to access protected routes
  const protectedRoutes = ['inbox', 'account', 'create-listing', 'saved-searches', 'saved-properties'];
  if (!state.currentUser && protectedRoutes.includes(state.activeView)) {
    return <AuthPage />;
  }

  // Render main app layout with sidebar and header
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {state.activeView === 'search' && <SearchPage onToggleSidebar={toggleSidebar} />}
          {state.activeView === 'saved-searches' && <SavedSearchesPage />}
          {state.activeView === 'saved-properties' && <SavedPropertiesPage />}
          {state.activeView === 'inbox' && <InboxPage />}
          {state.activeView === 'account' && <MyAccountPage />}
          {state.activeView === 'agents' && <AgentsPage />}
          {state.activeView === 'agencies' && <AgenciesListPage />}
          {state.activeView === 'create-listing' && <CreateListingPage />}
          {state.activeView === 'admin' && state.currentUser?.role === UserRole.ADMIN && <AdminDashboard />}
        </main>
        <Footer />
      </div>

      {/* Global modals */}
      <SubscriptionModal
        isOpen={state.isSubscriptionModalOpen}
        onClose={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: { isOpen: false } })}
        initialEmail={state.subscriptionEmail || undefined}
      />
      <ListingLimitWarningModal
        isOpen={state.isListingLimitWarningOpen}
        onClose={() => {
          dispatch({ type: 'SET_PENDING_PROPERTY', payload: null });
          dispatch({ type: 'TOGGLE_LISTING_LIMIT_WARNING', payload: false });
        }}
        onConfirm={() => {}}
      />
      <DiscountGameModal
        isOpen={state.isDiscountGameOpen}
        onGameComplete={(discounts) => {
          dispatch({ type: 'SET_ACTIVE_DISCOUNT', payload: discounts });
          dispatch({ type: 'TOGGLE_DISCOUNT_GAME', payload: false });
        }}
      />
    </div>
  );
};

export default ClientApp;
