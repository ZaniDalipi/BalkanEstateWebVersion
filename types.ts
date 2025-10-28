
// FIX: Removed circular self-import of `UserRole`.
export enum UserRole {
  UNDEFINED = 'UNDEFINED',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
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
  selectedProperty: Property | null;
}

export type AppAction =
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'TOGGLE_SUBSCRIPTION_MODAL'; payload: boolean }
  | { type: 'TOGGLE_PRICING_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null }
  | { type: 'ADD_PROPERTY'; payload: Property };

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