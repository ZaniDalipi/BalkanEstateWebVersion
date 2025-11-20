// --- Enums and Simple Types ---
export enum UserRole {
    BUYER = 'buyer',
    PRIVATE_SELLER = 'private_seller',
    AGENT = 'agent',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'draft';

export type PropertyImageTag = 'exterior' | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'other';

export type AppView = 'search' | 'saved-searches' | 'saved-properties' | 'inbox' | 'account' | 'create-listing' | 'agents' | 'agencies' | 'agentProfile' | 'agencyDetail' | 'admin';

export type AuthModalView = 'login' | 'signup' | 'forgotPassword' | 'forgotPasswordSuccess' | 'phoneCode' | 'phoneDetails';

export type SellerType = 'any' | 'agent' | 'private';

// --- Data Models ---

export interface Seller {
    type: 'agent' | 'private';
    name: string;
    avatarUrl?: string;
    phone: string;
    agencyName?: string;
}

export interface Testimonial {
    quote: string;
    clientName: string;
    rating: number;
    createdAt?: string;
    userId?: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
}

export interface User {
    id: string;
    _id?: string; // MongoDB ID (for compatibility)
    name: string;
    email: string;
    avatarUrl?: string;
    phone: string;
    role: UserRole;
    city?: string;
    country?: string;
    agencyName?: string;
    agentId?: string;
    agencyId?: string; // Agency ID for agents
    licenseNumber?: string;
    licenseVerified?: boolean;
    licenseVerificationDate?: Date;
    listingsCount?: number;
    totalListingsCreated?: number;
    testimonials?: Testimonial[];
    isSubscribed: boolean;
    publicKey?: string; // E2E encryption public key (JWK format)
}

export interface Agent extends User {
    userId?: string; // The user ID that properties are linked to (different from agent document id)
    totalSalesValue: number;
    propertiesSold: number;
    activeListings: number;
    rating: number;
    totalReviews?: number;
    bio?: string;
    specializations?: string[];
    yearsOfExperience?: number;
    languages?: string[];
    serviceAreas?: string[];
    websiteUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    officeAddress?: string;
    officePhone?: string;
}

export interface Agency {
    _id: string;
    slug?: string;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    email: string;
    phone: string;
    city?: string;
    country?: string;
    address?: string;
    website?: string;
    lat?: number;
    lng?: number;
    totalProperties: number;
    totalAgents: number;
    yearsInBusiness?: number;
    isFeatured: boolean;
    specialties?: string[];
    certifications?: string[];
    agents?: any[]; // Array of agent objects
    ownerId?: string; // Owner user ID (also the creator/admin)
    admins?: string[]; // Array of admin user IDs
    invitationCode?: string; // Code required to join agency
}

export interface PropertyImage {
    url: string;
    tag: PropertyImageTag;
}

export interface Property {
    id: string;
    sellerId: string;
    status: PropertyStatus;
    soldAt?: number;
    price: number;
    address: string;
    city: string;
    country: string;
    beds: number;
    baths: number;
    livingRooms: number;
    sqft: number;
    yearBuilt: number;
    parking: number;
    description: string;
    specialFeatures: string[];
    materials: string[];
    tourUrl?: string;
    imageUrl: string;
    images?: PropertyImage[];
    lat: number;
    lng: number;
    seller: Seller;
    propertyType: 'house' | 'apartment' | 'villa' | 'other';
    floorNumber?: number;
    totalFloors?: number;
    floorplanUrl?: string;
    createdAt?: number;
    lastRenewed?: number;
    views?: number;
    saves?: number;
    inquiries?: number;
}

export interface Message {
    id: string;
    senderId: string; // 'user' or seller's user ID
    text?: string;
    imageUrl?: string;
    // E2E Encryption fields
    encryptedMessage?: string;
    encryptedKeys?: Record<string, string>; // userId -> encrypted AES key
    iv?: string;
    timestamp: number;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    propertyId: string;
    property?: Property;
    buyerId: string;
    sellerId: string;
    buyer?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    seller?: {
        id: string;
        name: string;
        avatarUrl?: string;
        role?: string;
        agencyName?: string;
    };
    participants?: string[]; // user ID and seller ID (for backwards compatibility)
    messages: Message[];
    lastMessage?: Message;
    createdAt: number;
    isRead: boolean;
    buyerUnreadCount: number;
    sellerUnreadCount: number;
}

export interface Filters {
    query: string;
    minPrice: number | null;
    maxPrice: number | null;
    beds: number | null;
    baths: number | null;
    livingRooms: number | null;
    minSqft: number | null;
    maxSqft: number | null;
    sortBy: string;
    sellerType: SellerType;
    propertyType: 'any' | 'house' | 'apartment' | 'villa' | 'other';
}

export const initialFilters: Filters = {
    query: '',
    minPrice: null,
    maxPrice: null,
    beds: null,
    baths: null,
    livingRooms: null,
    minSqft: null,
    maxSqft: null,
    sortBy: 'newest',
    sellerType: 'any',
    propertyType: 'any',
};

export interface SavedSearch {
    id: string;
    name: string;
    filters: Filters;
    drawnBoundsJSON: string | null;
    createdAt: number;
    lastAccessed: number;
}

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
    livingRooms?: number;
    minSqft?: number;
    maxSqft?: number;
    features?: string[];
}

// --- Location/Map Data ---

export interface SettlementData {
  name: string;
  lat: number;
  lng: number;
}
export interface MunicipalityData {
    name: string;
    settlements: SettlementData[];
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country: string;
    country_code: string;
  };
}

// --- App State Management ---

export interface SearchPageState {
    filters: Filters;
    activeFilters: Filters;
    mapBoundsJSON: string | null;
    drawnBoundsJSON: string | null;
    mobileView: 'map' | 'list';
    searchMode: 'manual' | 'ai';
    aiChatHistory: ChatMessage[];
    isAiChatModalOpen: boolean;
    isFiltersOpen: boolean;
    focusMapOnProperty: { lat: number; lng: number; address: string } | null; // Property location to focus map on
}

export interface PendingSubscription {
    planName: string;
    planPrice: number;
    planInterval: 'month' | 'year';
    discountPercent?: number;
    modalType: 'buyer' | 'seller'; // which modal to open
}

export interface AppState {
    onboardingComplete: boolean;
    isAuthenticating: boolean;
    activeView: AppView;
    isPricingModalOpen: boolean;
    isFirstLoginOffer: boolean;
    isAgencyCreationMode: boolean; // Flag to indicate agency creation flow (only show Enterprise plan)
    isSubscriptionModalOpen: boolean;
    isAuthModalOpen: boolean;
    authModalView: AuthModalView;
    properties: Property[];
    isLoadingProperties: boolean;
    propertiesError: string | null;
    selectedProperty: Property | null;
    propertyToEdit: Property | null;
    isAuthenticated: boolean;
    isLoadingUserData: boolean;
    currentUser: User | null;
    savedSearches: SavedSearch[];
    savedHomes: Property[];
    comparisonList: string[]; // array of property IDs
    conversations: Conversation[];
    activeConversationId: string | null;
    selectedAgentId: string | null;
    selectedAgencyId: string | null;
    pendingProperty: Property | null;
    pendingSubscription: PendingSubscription | null;
    pendingAgencyData: any | null; // Agency form data to be created after payment
    searchPageState: SearchPageState;
    activeDiscount: { proYearly: number; proMonthly: number; enterprise: number; } | null;
    isListingLimitWarningOpen: boolean;
    isDiscountGameOpen: boolean;
    isEnterpriseModalOpen: boolean;
    allMunicipalities: Record<string, MunicipalityData[]>;
}

export type AppAction =
    | { type: 'AUTH_CHECK_START' }
    | { type: 'AUTH_CHECK_COMPLETE', payload: { isAuthenticated: boolean, user: User | null } }
    | { type: 'COMPLETE_ONBOARDING' }
    | { type: 'SET_ACTIVE_VIEW', payload: AppView }
    | { type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: boolean, isOffer?: boolean, isAgencyMode?: boolean } }
    | { type: 'TOGGLE_SUBSCRIPTION_MODAL', payload: boolean }
    | { type: 'TOGGLE_ENTERPRISE_MODAL', payload: boolean }
    | { type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: boolean, view?: AuthModalView } }
    | { type: 'SET_AUTH_MODAL_VIEW', payload: AuthModalView }
    | { type: 'SET_SELECTED_PROPERTY', payload: string | null }
    | { type: 'SET_PROPERTY_TO_EDIT', payload: Property | null }
    | { type: 'SET_SELECTED_AGENT', payload: string | null }
    | { type: 'SET_SELECTED_AGENCY', payload: string | null }
    | { type: 'PROPERTIES_LOADING' }
    | { type: 'PROPERTIES_SUCCESS', payload: Property[] }
    | { type: 'PROPERTIES_ERROR', payload: string }
    | { type: 'USER_DATA_LOADING' }
    | { type: 'USER_DATA_SUCCESS', payload: { savedHomes: Property[], savedSearches: SavedSearch[], conversations: Conversation[] } }
    | { type: 'ADD_SAVED_SEARCH', payload: SavedSearch }
    | { type: 'REMOVE_SAVED_SEARCH', payload: string }
    | { type: 'TOGGLE_SAVED_HOME', payload: Property }
    | { type: 'ADD_TO_COMPARISON', payload: string }
    | { type: 'REMOVE_FROM_COMPARISON', payload: string }
    | { type: 'CLEAR_COMPARISON' }
    | { type: 'SET_AUTH_STATE', payload: { isAuthenticated: boolean, user: User | null } }
    | { type: 'ADD_PROPERTY', payload: Property }
    | { type: 'UPDATE_PROPERTY', payload: Property }
    | { type: 'RENEW_PROPERTY', payload: string }
    | { type: 'MARK_PROPERTY_SOLD', payload: string }
    | { type: 'DELETE_PROPERTY', payload: string }
    | { type: 'UPDATE_USER', payload: Partial<User> }
    | { type: 'CREATE_CONVERSATION', payload: Conversation }
    | { type: 'DELETE_CONVERSATION', payload: string }
    | { type: 'SET_ACTIVE_CONVERSATION', payload: string | null }
    | { type: 'ADD_MESSAGE', payload: { conversationId: string, message: Message } }
    | { type: 'CREATE_OR_ADD_MESSAGE', payload: { propertyId: string, message: Message } }
    | { type: 'MARK_CONVERSATION_AS_READ', payload: string }
    | { type: 'SET_PENDING_PROPERTY', payload: Property | null }
    | { type: 'SET_PENDING_SUBSCRIPTION', payload: PendingSubscription | null }
    | { type: 'SET_PENDING_AGENCY_DATA', payload: any | null }
    | { type: 'UPDATE_SEARCH_PAGE_STATE', payload: Partial<SearchPageState> }
    | { type: 'SET_ACTIVE_DISCOUNT', payload: { proYearly: number; proMonthly: number; enterprise: number; } | null }
    | { type: 'TOGGLE_LISTING_LIMIT_WARNING', payload: boolean }
    | { type: 'TOGGLE_DISCOUNT_GAME', payload: boolean }
    | { type: 'UPDATE_SAVED_SEARCH_ACCESS_TIME', payload: string };