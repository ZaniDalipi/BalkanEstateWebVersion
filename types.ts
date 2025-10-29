// FIX: Removed circular self-import of `UserRole`.
export enum UserRole {
  UNDEFINED = 'UNDEFINED',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export type AppView = 'search' | 'saved-searches' | 'saved-homes' | 'loans' | 'inbox';

export interface SavedSearch {
    id: string;
    name: string;
    newPropertyCount: number;
    properties: Property[];
}


export interface Seller {
  type: 'agent' | 'private';
  name: string;
  avatarUrl?: string; // Optional for private sellers
  phone: string;
}

export type PropertyImageTag = 'exterior' | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'other';

export interface PropertyImage {
  url: string;
  tag: PropertyImageTag;
}

export interface Property {
  id: string;
  price: number;
  address: string;
  city: string;
  country: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string; 
  images: PropertyImage[];
  lat: number;
  lng: number;
  description: string;
  yearBuilt: number;
  parking: number;
  specialFeatures: string[];
  materials: string[];
  seller: Seller;
  tourUrl?: string;
}

export interface AppState {
  userRole: UserRole;
  properties: Property[];
  isSubscriptionModalOpen: boolean;
  isPricingModalOpen: boolean;
  isFirstLoginOffer: boolean;
  isAuthModalOpen: boolean;
  isAuthenticated: boolean;
  selectedProperty: Property | null;
  activeView: AppView;
  savedSearches: SavedSearch[];
  savedHomes: Property[];
}

export type AppAction =
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'TOGGLE_SUBSCRIPTION_MODAL'; payload: boolean }
  | { type: 'TOGGLE_PRICING_MODAL'; payload: { isOpen: boolean; isOffer?: boolean } }
  | { type: 'TOGGLE_AUTH_MODAL'; payload: boolean }
  | { type: 'SET_IS_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppView }
  | { type: 'ADD_SAVED_SEARCH'; payload: SavedSearch }
  | { type: 'MARK_ALL_SEARCHES_VIEWED' }
  | { type: 'TOGGLE_SAVED_HOME'; payload: Property };


export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface AiSearchQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  features?: string[];
}

export type SellerType = 'any' | 'agent' | 'private';

export interface Filters {
    query: string;
    minPrice: number | null;
    maxPrice: number | null;
    beds: number | null;
    baths: number | null;
    sortBy: string;
    sellerType: SellerType;
    propertyType: string;
}