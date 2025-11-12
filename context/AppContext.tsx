import React, { createContext, useReducer, useContext, Dispatch, useCallback } from 'react';
import { User, Property, SavedSearch, Conversation, AppState, AppAction, Filters, Message, AuthModalView, initialFilters, SearchPageState } from '../types';
import * as api from '../services/apiService';
import { MUNICIPALITY_DATA } from '../services/propertyService';

const initialSearchPageState: SearchPageState = {
    filters: initialFilters,
    activeFilters: initialFilters,
    searchOnMove: true,
    mapBoundsJSON: null,
    drawnBoundsJSON: null,
    mobileView: 'map',
    searchMode: 'manual',
    aiChatHistory: [{ sender: 'ai', text: "Hello! Welcome to Balkan Estate. How can I help you find a property today?" }],
    isAiChatModalOpen: false,
    isFiltersOpen: false,
};

const initialState: AppState = {
  onboardingComplete: false,
  isAuthenticating: true,
  activeView: 'search',
  isPricingModalOpen: false,
  isFirstLoginOffer: false,
  isSubscriptionModalOpen: false,
  isAuthModalOpen: false,
  authModalView: 'login',
  properties: [],
  isLoadingProperties: false,
  propertiesError: null,
  selectedProperty: null,
  propertyToEdit: null,
  isAuthenticated: false,
  isLoadingUserData: false,
  currentUser: null,
  savedSearches: [],
  savedHomes: [],
  comparisonList: [],
  conversations: [],
  selectedAgentId: null,
  pendingProperty: null,
  searchPageState: initialSearchPageState,
  activeDiscount: null,
  isListingLimitWarningOpen: false,
  isDiscountGameOpen: false,
  // FIX: Initialize allMunicipalities in the initial state.
  allMunicipalities: MUNICIPALITY_DATA,
};


const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'AUTH_CHECK_START':
      return { ...state, isAuthenticating: true };
    case 'AUTH_CHECK_COMPLETE':
      if (!action.payload.isAuthenticated) {
        return { ...state, isAuthenticating: false, isAuthenticated: false, currentUser: null, onboardingComplete: state.onboardingComplete };
      }
      return { ...state, isAuthenticating: false, isAuthenticated: action.payload.isAuthenticated, currentUser: action.payload.user, onboardingComplete: state.onboardingComplete || action.payload.isAuthenticated };
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };
    case 'SET_ACTIVE_VIEW': {
        const newState: AppState = { ...state, activeView: action.payload, selectedProperty: null };
        if (action.payload !== 'create-listing') newState.propertyToEdit = null;
        if (action.payload !== 'agents') newState.selectedAgentId = null;
        return newState;
    }
    case 'TOGGLE_PRICING_MODAL':
      return { ...state, isPricingModalOpen: action.payload.isOpen, isFirstLoginOffer: action.payload.isOffer ?? state.isFirstLoginOffer };
    case 'TOGGLE_SUBSCRIPTION_MODAL':
      return { ...state, isSubscriptionModalOpen: action.payload };
    case 'TOGGLE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: action.payload.isOpen, authModalView: action.payload.isOpen ? (action.payload.view || 'login') : state.authModalView };
    case 'SET_AUTH_MODAL_VIEW':
      return { ...state, authModalView: action.payload };
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: state.properties.find(p => p.id === action.payload) || null };
    case 'SET_PROPERTY_TO_EDIT':
      return { ...state, propertyToEdit: action.payload };
    case 'SET_SELECTED_AGENT':
      return { ...state, selectedAgentId: action.payload };
    case 'PROPERTIES_LOADING':
        return { ...state, isLoadingProperties: true, propertiesError: null };
    case 'PROPERTIES_SUCCESS':
        return { ...state, isLoadingProperties: false, properties: action.payload };
    case 'PROPERTIES_ERROR':
        return { ...state, isLoadingProperties: false, propertiesError: action.payload };
    case 'USER_DATA_LOADING':
        return { ...state, isLoadingUserData: true };
    case 'USER_DATA_SUCCESS':
        return { ...state, ...action.payload, isLoadingUserData: false };
    case 'ADD_SAVED_SEARCH':
      return { ...state, savedSearches: [action.payload, ...state.savedSearches] };
    case 'TOGGLE_SAVED_HOME':
        const isSaved = state.savedHomes.some(p => p.id === action.payload.id);
        return { ...state, savedHomes: isSaved ? state.savedHomes.filter(p => p.id !== action.payload.id) : [action.payload, ...state.savedHomes] };
    case 'ADD_TO_COMPARISON':
        if (state.comparisonList.length < 5 && !state.comparisonList.includes(action.payload)) return { ...state, comparisonList: [...state.comparisonList, action.payload] };
        return state;
    case 'REMOVE_FROM_COMPARISON':
        return { ...state, comparisonList: state.comparisonList.filter(id => id !== action.payload) };
    case 'CLEAR_COMPARISON':
        return { ...state, comparisonList: [] };
    case 'SET_AUTH_STATE':
        if (!action.payload.isAuthenticated) { // logging out
            return { ...state, isAuthenticated: false, currentUser: null, savedHomes: [], savedSearches: [], conversations: [] };
        }
        // logging in
        return { ...state, isAuthenticated: true, currentUser: action.payload.user, onboardingComplete: true, isLoadingUserData: true };
    case 'ADD_PROPERTY':
      // Add the new property to the beginning of the list to ensure it's visible.
      return { ...state, properties: [action.payload, ...state.properties] };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'RENEW_PROPERTY':
        // Find the property and update its lastRenewed timestamp.
        return {
            ...state,
            properties: state.properties.map(p =>
                p.id === action.payload ? { ...p, lastRenewed: Date.now() } : p
            ),
        };
    case 'MARK_PROPERTY_SOLD':
        // Find the property and update its status to 'sold'.
        return {
            ...state,
            properties: state.properties.map(p =>
                p.id === action.payload ? { ...p, status: 'sold' } : p
            ),
        };
    case 'UPDATE_USER':
      return { ...state, currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null };
    case 'ADD_MESSAGE':
        return { ...state, conversations: state.conversations.map(c => c.id === action.payload.conversationId ? { ...c, messages: [...c.messages, action.payload.message] } : c ) };
    // FIX: Add missing reducer case for creating a new conversation or adding a message to an existing one.
    case 'CREATE_OR_ADD_MESSAGE': {
        const { propertyId, message } = action.payload;
        const existingConversation = state.conversations.find(c => c.propertyId === propertyId);
        if (existingConversation) {
            return {
                ...state,
                conversations: state.conversations.map(c =>
                    c.id === existingConversation.id ? { ...c, messages: [...c.messages, message] } : c
                )
            };
        } else {
            const property = state.properties.find(p => p.id === propertyId);
            if (!property || !state.currentUser) return state;
            const newConversation: Conversation = {
                id: `conv-${Date.now()}`,
                propertyId,
                participants: [state.currentUser.id, property.sellerId],
                messages: [message],
            };
            return { ...state, conversations: [newConversation, ...state.conversations] };
        }
    }
    // FIX: Add missing reducer case for marking a conversation as read.
    case 'MARK_CONVERSATION_AS_READ': {
        const conversationId = action.payload;
        return {
            ...state,
            conversations: state.conversations.map(c =>
                c.id === conversationId
                    ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) }
                    : c
            )
        };
    }
    case 'SET_PENDING_PROPERTY':
        return { ...state, pendingProperty: action.payload };
    case 'UPDATE_SEARCH_PAGE_STATE':
        return {
            ...state,
            searchPageState: {
                ...state.searchPageState,
                ...action.payload,
            },
        };
    case 'SET_ACTIVE_DISCOUNT':
        return { ...state, activeDiscount: action.payload };
    case 'TOGGLE_LISTING_LIMIT_WARNING':
        return { ...state, isListingLimitWarningOpen: action.payload };
    case 'TOGGLE_DISCOUNT_GAME':
        return { ...state, isDiscountGameOpen: action.payload };
    case 'UPDATE_SAVED_SEARCH_ACCESS_TIME':
        return {
            ...state,
            savedSearches: state.savedSearches.map(s =>
                s.id === action.payload ? { ...s, lastAccessed: Date.now() } : s
            ),
        };
    default:
      return state;
  }
};

interface AppContextType {
    state: AppState;
    dispatch: Dispatch<AppAction>;
    checkAuthStatus: () => Promise<void>;
    login: (email: string, pass: string) => Promise<User>;
    signup: (email: string, pass: string) => Promise<User>;
    logout: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    loginWithSocial: (provider: 'google' | 'facebook' | 'apple') => Promise<User>;
    sendPhoneCode: (phone: string) => Promise<void>;
    verifyPhoneCode: (phone: string, code: string) => Promise<{ user: User | null, isNew: boolean }>;
    completePhoneSignup: (phone: string, name: string, email: string) => Promise<User>;
    fetchProperties: (filters?: Filters) => Promise<void>;
    toggleSavedHome: (property: Property) => Promise<void>;
    addSavedSearch: (search: SavedSearch) => Promise<void>;
    sendMessage: (conversationId: string, message: Message) => Promise<void>;
    createListing: (property: Property) => Promise<Property>;
    updateListing: (property: Property) => Promise<Property>;
    updateUser: (userData: Partial<User>) => Promise<User>;
    updateSearchPageState: (newState: Partial<SearchPageState>) => void;
    updateSavedSearchAccessTime: (searchId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'AUTH_CHECK_START' });
    const user = await api.checkAuth();
    dispatch({ type: 'AUTH_CHECK_COMPLETE', payload: { isAuthenticated: !!user, user } });
    if (user) {
        dispatch({ type: 'USER_DATA_LOADING' });
        const userData = await api.getMyData();
        dispatch({ type: 'USER_DATA_SUCCESS', payload: userData });
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const user = await api.login(email, pass);
    dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: true, user } });
    dispatch({ type: 'USER_DATA_LOADING' });
    const userData = await api.getMyData();
    dispatch({ type: 'USER_DATA_SUCCESS', payload: userData });
    return user;
  }, []);

  const signup = useCallback(async (email: string, pass: string) => {
    const user = await api.signup(email, pass);
    dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: true, user } });
    dispatch({ type: 'USER_DATA_SUCCESS', payload: { savedHomes: [], savedSearches: [], conversations: [] } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: false, user: null } });
  }, []);
  
  const requestPasswordReset = useCallback(async (email: string) => {
      await api.requestPasswordReset(email);
  }, []);

  const loginWithSocial = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    const user = await api.loginWithSocial(provider);
    dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: true, user } });
    dispatch({ type: 'USER_DATA_LOADING' });
    const userData = await api.getMyData();
    dispatch({ type: 'USER_DATA_SUCCESS', payload: userData });
    return user;
  }, []);
  
  const sendPhoneCode = useCallback(async (phone: string) => {
      await api.sendPhoneCode(phone);
  }, []);
  
  const verifyPhoneCode = useCallback(async (phone: string, code: string) => {
      const result = await api.verifyPhoneCode(phone, code);
      if (result.user && !result.isNew) {
          dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: true, user: result.user } });
          dispatch({ type: 'USER_DATA_LOADING' });
          const userData = await api.getMyData();
          dispatch({ type: 'USER_DATA_SUCCESS', payload: userData });
      }
      return result;
  }, []);
  
  const completePhoneSignup = useCallback(async (phone: string, name: string, email: string) => {
      const user = await api.completePhoneSignup(phone, name, email);
      dispatch({ type: 'SET_AUTH_STATE', payload: { isAuthenticated: true, user } });
      dispatch({ type: 'USER_DATA_SUCCESS', payload: { savedHomes: [], savedSearches: [], conversations: [] } });
      return user;
  }, []);

  const fetchProperties = useCallback(async (filters?: Filters) => {
      dispatch({ type: 'PROPERTIES_LOADING' });
      try {
          const properties = await api.getProperties(filters);
          dispatch({ type: 'PROPERTIES_SUCCESS', payload: properties });
      } catch (e: any) {
          dispatch({ type: 'PROPERTIES_ERROR', payload: e.message || 'Failed to fetch properties.'});
      }
  }, []);

  const toggleSavedHome = useCallback(async (property: Property) => {
    const isSaved = state.savedHomes.some(p => p.id === property.id);
    await api.toggleSavedHome(property.id, isSaved);
    dispatch({ type: 'TOGGLE_SAVED_HOME', payload: property });
  }, [state.savedHomes]);

  const addSavedSearch = useCallback(async (search: SavedSearch) => {
    const newSearch = await api.addSavedSearch(search);
    dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
  }, []);

  const sendMessage = useCallback(async (conversationId: string, message: Message) => {
      const sentMessage = await api.sendMessage(conversationId, message);
      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message: sentMessage }});
  }, []);

  const createListing = useCallback(async (property: Property) => {
      const newProperty = await api.createListing(property);
      // For simplicity, we can refetch all properties or just add the new one
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
      return newProperty;
  }, []);

  const updateListing = useCallback(async (property: Property) => {
      const updatedProperty = await api.updateListing(property);
      dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
      return updatedProperty;
  }, []);
  
  const updateUser = useCallback(async (userData: Partial<User>) => {
      const updatedUser = await api.updateUser(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
  }, []);

  const updateSearchPageState = useCallback((newState: Partial<SearchPageState>) => {
    dispatch({ type: 'UPDATE_SEARCH_PAGE_STATE', payload: newState });
  }, []);

  const updateSavedSearchAccessTime = useCallback(async (searchId: string) => {
    await api.updateSavedSearchAccessTime(searchId);
    dispatch({ type: 'UPDATE_SAVED_SEARCH_ACCESS_TIME', payload: searchId });
  }, []);

  const value = { state, dispatch, checkAuthStatus, login, signup, logout, requestPasswordReset, loginWithSocial, sendPhoneCode, verifyPhoneCode, completePhoneSignup, fetchProperties, toggleSavedHome, addSavedSearch, sendMessage, createListing, updateListing, updateUser, updateSearchPageState, updateSavedSearchAccessTime };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};