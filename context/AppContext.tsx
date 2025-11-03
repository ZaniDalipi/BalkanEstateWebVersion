import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { User, UserRole, AppView, Property, SavedSearch, Conversation, Message, AppState, AppAction } from '../types';
import { dummyProperties, mockUsers } from '../services/propertyService';

const initialState: AppState = {
  isInitialLaunch: true,
  activeView: 'search',
  isPricingModalOpen: false,
  isFirstLoginOffer: false,
  isSubscriptionModalOpen: false,
  isAuthModalOpen: false,
  properties: dummyProperties,
  selectedProperty: null,
  propertyToEdit: null,
  isAuthenticated: false,
  currentUser: null,
  savedSearches: [],
  savedHomes: [],
  comparisonList: [],
  conversations: [
    {
        id: 'convo1',
        propertyId: 'prop1',
        messages: [
            { id: 'msg1', senderId: 'user_seller_1', text: 'Hello! I saw you were interested in the Knez Mihailova property. Do you have any questions?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), isRead: false },
            { id: 'msg2', senderId: 'user', text: 'Yes, I was wondering about the monthly utility costs.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: true },
        ],
    },
  ],
  selectedAgentId: null,
};


const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return { ...state, isInitialLaunch: false };
    case 'SET_ACTIVE_VIEW': {
        const newState: AppState = { 
            ...state, 
            activeView: action.payload, 
            selectedProperty: null, 
        };
        // Preserve propertyToEdit only when navigating to the create-listing view
        if (action.payload !== 'create-listing') {
            newState.propertyToEdit = null;
        }
        if (action.payload !== 'agents') {
            newState.selectedAgentId = null;
        }
        return newState;
    }
    case 'TOGGLE_PRICING_MODAL':
      return { ...state, isPricingModalOpen: action.payload.isOpen, isFirstLoginOffer: action.payload.isOffer ?? state.isFirstLoginOffer };
    case 'TOGGLE_SUBSCRIPTION_MODAL':
      return { ...state, isSubscriptionModalOpen: action.payload };
    case 'TOGGLE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: action.payload };
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: state.properties.find(p => p.id === action.payload) || null };
    case 'SET_PROPERTY_TO_EDIT':
      return { ...state, propertyToEdit: action.payload };
    case 'SET_SELECTED_AGENT':
      return { ...state, selectedAgentId: action.payload };
    case 'ADD_SAVED_SEARCH':
        if (!state.isAuthenticated) {
            return { ...state, isAuthModalOpen: true };
        }
      return { ...state, savedSearches: [action.payload, ...state.savedSearches] };
    case 'TOGGLE_SAVED_HOME':
        const isSaved = state.savedHomes.some(p => p.id === action.payload.id);
        return {
            ...state,
            savedHomes: isSaved
                ? state.savedHomes.filter(p => p.id !== action.payload.id)
                : [action.payload, ...state.savedHomes],
        };
    case 'ADD_TO_COMPARISON':
        if (state.comparisonList.length < 5 && !state.comparisonList.includes(action.payload)) {
            return { ...state, comparisonList: [...state.comparisonList, action.payload] };
        }
        return state;
    case 'REMOVE_FROM_COMPARISON':
        return { ...state, comparisonList: state.comparisonList.filter(id => id !== action.payload) };
    case 'CLEAR_COMPARISON':
        return { ...state, comparisonList: [] };
    case 'MARK_ALL_SEARCHES_VIEWED':
        return { ...state, savedSearches: state.savedSearches.map(s => ({ ...s, newPropertyCount: 0 })) };
    case 'ADD_PROPERTY':
      return { ...state, properties: [action.payload, ...state.properties] };
    case 'UPDATE_PROPERTY':
      return { 
        ...state, 
        properties: state.properties.map(p => p.id === action.payload.id ? action.payload : p),
        propertyToEdit: null,
      };
    case 'RENEW_PROPERTY':
        return { ...state, properties: state.properties.map(p => p.id === action.payload ? { ...p, lastRenewed: Date.now() } : p) };
    case 'MARK_PROPERTY_SOLD':
      return { ...state, properties: state.properties.map(p => p.id === action.payload ? { ...p, status: 'sold' } : p) };
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    case 'SET_AUTH_STATE':
        return { 
            ...state, 
            isAuthenticated: action.payload.isAuthenticated, 
            currentUser: action.payload.user,
            // Clear saved items on logout. For a demo app, we also start fresh on login.
            savedHomes: action.payload.isAuthenticated ? [] : [],
            savedSearches: action.payload.isAuthenticated ? [] : [],
        };
    case 'ADD_MESSAGE':
        return {
            ...state,
            conversations: state.conversations.map(c =>
                c.id === action.payload.conversationId
                    ? { ...c, messages: [...c.messages, action.payload.message] }
                    : c
            ),
        };
    case 'CREATE_OR_ADD_MESSAGE': {
        const { propertyId, message } = action.payload;
        const existingConvo = state.conversations.find(c => c.propertyId === propertyId);
        if (existingConvo) {
            return {
                ...state,
                conversations: state.conversations.map(c =>
                    c.id === existingConvo.id
                        ? { ...c, messages: [...c.messages, message] }
                        : c
                ),
            };
        } else {
            const newConvo: Conversation = {
                id: `convo-${Date.now()}`,
                propertyId,
                messages: [message],
            };
            return { ...state, conversations: [newConvo, ...state.conversations] };
        }
    }
    case 'MARK_CONVERSATION_AS_READ':
        return {
            ...state,
            conversations: state.conversations.map(c =>
                c.id === action.payload
                    ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) }
                    : c
            ),
        };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);