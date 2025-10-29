import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { AppState, AppAction, UserRole, SavedSearch, AppView } from '../types';
import { dummyProperties } from '../services/propertyService';

const dummySavedSearches: SavedSearch[] = [
    {
        id: '1',
        name: 'Houses near Belgrade',
        newPropertyCount: 15,
        properties: dummyProperties.slice(0, 8),
    },
    {
        id: '2',
        name: 'Houses near Novi Sad',
        newPropertyCount: 3,
        properties: dummyProperties.slice(6, 10),
    },
    {
        id: '3',
        name: 'Houses near Tirana',
        newPropertyCount: 15,
        properties: dummyProperties.slice(8, 16),
    }
];

const initialState: AppState = {
  userRole: UserRole.BUYER, // Default to buyer to show main app
  properties: dummyProperties,
  isSubscriptionModalOpen: false,
  isPricingModalOpen: false,
  isFirstLoginOffer: false,
  isAuthModalOpen: false,
  isAuthenticated: true, // Forcing login to see the new UI
  selectedProperty: null,
  activeView: 'search', // Default to search page
  savedSearches: dummySavedSearches,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    case 'SET_PROPERTIES':
        return {...state, properties: action.payload };
    case 'TOGGLE_SUBSCRIPTION_MODAL':
        return {...state, isSubscriptionModalOpen: action.payload};
    case 'TOGGLE_PRICING_MODAL':
        return {
            ...state,
            isPricingModalOpen: action.payload.isOpen,
            isFirstLoginOffer: action.payload.isOffer || false
        };
    case 'TOGGLE_AUTH_MODAL':
        return {...state, isAuthModalOpen: action.payload};
    case 'SET_IS_AUTHENTICATED':
        return { ...state, isAuthenticated: action.payload };
    case 'SET_SELECTED_PROPERTY':
        return { ...state, selectedProperty: action.payload };
    case 'ADD_PROPERTY':
        return { ...state, properties: [action.payload, ...state.properties] };
    case 'SET_ACTIVE_VIEW':
        return { ...state, activeView: action.payload };
    case 'ADD_SAVED_SEARCH':
        return { ...state, savedSearches: [action.payload, ...state.savedSearches] };
    case 'MARK_ALL_SEARCHES_VIEWED':
        return {
            ...state,
            savedSearches: state.savedSearches.map(s => ({...s, newPropertyCount: 0}))
        };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);