
import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { AppState, AppAction, UserRole } from '../types';
import { dummyProperties } from '../services/propertyService';

const initialState: AppState = {
  userRole: UserRole.UNDEFINED,
  properties: dummyProperties,
  isSubscriptionModalOpen: false,
  isPricingModalOpen: false,
  selectedProperty: null,
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
        return {...state, isPricingModalOpen: action.payload};
    case 'SET_SELECTED_PROPERTY':
        return { ...state, selectedProperty: action.payload };
    case 'ADD_PROPERTY':
        return { ...state, properties: [action.payload, ...state.properties] };
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