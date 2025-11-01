export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
}

export type AppView = 'search' | 'saved-searches' | 'saved-homes' | 'inbox' | 'account' | 'agents' | 'dashboard';

export type PropertyImageTag = 'exterior' | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'other';

export type PropertyStatus = 'active' | 'draft' | 'pending' | 'sold';

export type SellerType = 'any' | 'agent' | 'private';

export interface Seller {
  type: 'agent' | 'private';
  name: string;
  avatarUrl?: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone: string;
  role: UserRole;
  testimonials?: { quote: string; clientName: string; }[];
}

export interface Agent extends User {
    rating: number;
    reviewCount: number;
    specialties: string[];
    agency: string;
}

export interface PropertyImage {
  url: string;
  tag: PropertyImageTag;
}

export interface Property {
  id: string;
  sellerId: string;
  status: PropertyStatus;
  price: number;
  address: string;
  city: string;
  country: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  parking: number;
  description: string;
  specialFeatures: string[];
  materials: string[];
  tourUrl?: string;
  imageUrl: string;
  images: PropertyImage[];
  lat: number;
  lng: number;
  seller: Seller;
  propertyType: 'house' | 'apartment' | 'villa' | 'other';
  floorplanUrl?: string;
  createdAt?: number;
  views?: number;
  saves?: number;
  inquiries?: number;
}

export interface Filters {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  beds: number | null;
  baths: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  sortBy: string;
  sellerType: SellerType;
  propertyType: 'any' | 'house' | 'apartment' | 'villa' | 'other';
}

export interface SavedSearch {
  id: string;
  name: string;
  newPropertyCount: number;
  properties: Property[];
}

export interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export interface AiSearchQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minSqft?: number;
  maxSqft?: number;
  features?: string[];
}

export interface Message {
  id: string;
  senderId: string; // 'user' or sellerId
  text?: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  messages: Message[];
}

// --- App State & Actions ---

export interface AppState {
  userRole: UserRole | null;
  activeView: AppView;
  isPricingModalOpen: boolean;
  isFirstLoginOffer: boolean;
  isSubscriptionModalOpen: boolean;
  isAuthModalOpen: boolean;
  properties: Property[];
  selectedProperty: Property | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  savedSearches: SavedSearch[];
  savedHomes: Property[];
  comparisonList: string[]; // array of property IDs
  conversations: Conversation[];
  selectedAgentId: string | null;
}

export type AppAction =
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppView }
  | { type: 'TOGGLE_PRICING_MODAL'; payload: { isOpen: boolean; isOffer?: boolean } }
  | { type: 'TOGGLE_SUBSCRIPTION_MODAL'; payload: boolean }
  | { type: 'TOGGLE_AUTH_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_PROPERTY'; payload: string | null }
  | { type: 'SET_SELECTED_AGENT'; payload: string | null }
  | { type: 'ADD_SAVED_SEARCH'; payload: SavedSearch }
  | { type: 'TOGGLE_SAVED_HOME'; payload: Property }
  | { type: 'ADD_TO_COMPARISON'; payload: string }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'MARK_ALL_SEARCHES_VIEWED' }
  | { type: 'CREATE_OR_ADD_MESSAGE', payload: { propertyId: string; message: Message } }
  | { type: 'MARK_CONVERSATION_AS_READ'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'MARK_PROPERTY_SOLD'; payload: string }
  | { type: 'SET_AUTH_STATE'; payload: { isAuthenticated: boolean; user: User | null } };
