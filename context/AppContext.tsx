import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { AppState, AppAction, UserRole, SavedSearch, AppView, Property, Conversation, Message, User } from '../types';
import { dummyProperties, mockUsers } from '../services/propertyService';

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

const dummyConversations: Conversation[] = [
    {
        id: 'conv1',
        propertyId: '1',
        messages: [
            { id: 'msg1', senderId: 'user', text: 'Hi, is this property still available?', timestamp: '2024-07-29T10:00:00Z', isRead: true },
            { id: 'msg2', senderId: 'ana_kovacevic', text: "Hello! Yes, it is. Would you like to schedule a viewing?", timestamp: '2024-07-29T10:05:00Z', isRead: true },
            { id: 'msg3', senderId: 'user', text: "Great! How about this Friday at 2 PM?", timestamp: '2024-07-29T10:06:00Z', isRead: true },
            { id: 'msg4', senderId: 'ana_kovacevic', text: "Friday at 2 PM works perfectly. See you then!", timestamp: '2024-07-29T10:15:00Z', isRead: false },
        ]
    },
    {
        id: 'conv2',
        propertyId: '8',
        messages: [
             { id: 'msg5', senderId: 'user', text: 'I love this villa in Split! Can you tell me more about the neighborhood?', timestamp: '2024-07-28T15:20:00Z', isRead: true },
             { id: 'msg6', senderId: 'marko_horvat', text: "Of course! It's in a very quiet, prestigious area with great access to the beach and local restaurants. The view is spectacular.", timestamp: '2024-07-28T15:30:00Z', isRead: false },
        ]
    },
    {
        id: 'conv3',
        propertyId: '3',
        messages: [
            { id: 'msg7', senderId: 'user', text: "Is the price for the Sarajevo apartment negotiable?", timestamp: '2024-07-27T18:00:00Z', isRead: true },
        ]
    }
];


const initialState: AppState = {
  userRole: UserRole.UNDEFINED,
  properties: dummyProperties,
  isSubscriptionModalOpen: false,
  isPricingModalOpen: false,
  isFirstLoginOffer: false,
  isAuthModalOpen: false,
  isAuthenticated: false,
  currentUser: null, // Start with no user logged in
  selectedProperty: null,
  activeView: 'search',
  savedSearches: dummySavedSearches,
  savedHomes: [],
  conversations: dummyConversations,
  comparisonList: [],
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
    case 'SET_AUTH_STATE':
        return { 
            ...state, 
            isAuthenticated: action.payload.isAuthenticated,
            currentUser: action.payload.user,
            userRole: action.payload.user?.role || (state.userRole === UserRole.UNDEFINED ? UserRole.UNDEFINED : state.userRole),
        };
    case 'SET_SELECTED_PROPERTY':
        return { ...state, selectedProperty: action.payload };
    case 'ADD_PROPERTY':
        return { ...state, properties: [action.payload, ...state.properties] };
    case 'UPDATE_PROPERTY':
        return {
            ...state,
            properties: state.properties.map(p => p.id === action.payload.id ? action.payload : p),
        };
    case 'SET_ACTIVE_VIEW':
        return { ...state, activeView: action.payload };
    case 'ADD_SAVED_SEARCH':
        return { ...state, savedSearches: [action.payload, ...state.savedSearches] };
    case 'MARK_ALL_SEARCHES_VIEWED':
        return {
            ...state,
            savedSearches: state.savedSearches.map(s => ({...s, newPropertyCount: 0}))
        };
    case 'TOGGLE_SAVED_HOME':
      const isSaved = state.savedHomes.some(p => p.id === action.payload.id);
      if (isSaved) {
        return {
          ...state,
          savedHomes: state.savedHomes.filter(p => p.id !== action.payload.id),
        };
      } else {
        return {
          ...state,
          savedHomes: [...state.savedHomes, action.payload],
        };
      }
     case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(c => 
          c.id === action.payload.conversationId 
            ? { ...c, messages: [...c.messages, action.payload.message] }
            : c
        )
      };
    case 'CREATE_OR_ADD_MESSAGE': {
      const { propertyId, message } = action.payload;
      const existingConversation = state.conversations.find(c => c.propertyId === propertyId);
      
      if (existingConversation) {
        return {
          ...state,
          conversations: state.conversations.map(c => 
            c.id === existingConversation.id 
              ? { ...c, messages: [...c.messages, message], ...{ messages: c.messages.map(m => ({ ...m, isRead: true })) } }
              : c
          )
        };
      } else {
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          propertyId: propertyId,
          messages: [message]
        };
        return {
          ...state,
          conversations: [newConversation, ...state.conversations]
        };
      }
    }
    case 'MARK_CONVERSATION_AS_READ':
      return {
        ...state,
        conversations: state.conversations.map(c => 
          c.id === action.payload
            ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) }
            : c
        )
      };
    case 'ADD_TO_COMPARISON':
      if (state.comparisonList.includes(action.payload) || state.comparisonList.length >= 4) {
          return state;
      }
      return { ...state, comparisonList: [...state.comparisonList, action.payload] };
    case 'REMOVE_FROM_COMPARISON':
      return { ...state, comparisonList: state.comparisonList.filter(id => id !== action.payload) };
    case 'CLEAR_COMPARISON':
      return { ...state, comparisonList: [] };
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