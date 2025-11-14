import { Property, Seller, User, UserRole, SavedSearch, Message, Conversation, Filters } from '../types';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// --- TOKEN MANAGEMENT ---

const getToken = (): string | null => {
  return localStorage.getItem('balkan_estate_token');
};

const setToken = (token: string) => {
  localStorage.setItem('balkan_estate_token', token);
};

const removeToken = () => {
  localStorage.removeItem('balkan_estate_token');
};

// --- HTTP CLIENT ---

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

const apiRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Add body if present
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      const error = isJson ? await response.json() : { message: response.statusText };
      throw new Error(error.message || 'An error occurred');
    }

    return isJson ? await response.json() : ({} as T);
  } catch (error: any) {
    console.error('API request error:', error);
    throw error;
  }
};

// --- MOCK DATA (for backward compatibility) ---

export const sellers: { [key: string]: Seller } = {
  seller1: { type: 'agent', name: 'Ana Kovačević', avatarUrl: 'https://i.pravatar.cc/150?u=ana', phone: '+381 64 123 4567' },
  seller2: { type: 'private', name: 'Marko Petrović', avatarUrl: 'https://i.pravatar.cc/150?u=marko', phone: '+385 91 987 6543' },
  seller3: { type: 'agent', name: 'Ivan Horvat', avatarUrl: 'https://i.pravatar.cc/150?u=ivan', phone: '+385 91 123 4567', agencyName: 'Adriatic Properties' },
  seller4: { type: 'agent', name: 'Elena Georgieva', avatarUrl: 'https://i.pravatar.cc/150?u=elena', phone: '+359 88 123 4567', agencyName: 'Sofia Homes' },
  seller5: { type: 'private', name: 'Adnan Hodžić', avatarUrl: 'https://i.pravatar.cc/150?u=adnan', phone: '+387 61 987 6543' },
  seller6: { type: 'agent', name: 'Nikos Papadopoulos', avatarUrl: 'https://i.pravatar.cc/150?u=nikos', phone: '+30 697 123 4567', agencyName: 'Hellas Real Estate' },
  seller7: { type: 'agent', name: 'Alen Isić', avatarUrl: 'https://i.pravatar.cc/150?u=alen', phone: '+387 62 111 2222', agencyName: 'Sarajevo Realty' },
};

export const mockUsers: { [key: string]: User } = {
  'user_seller_1': { id: 'user_seller_1', name: 'Ana Kovačević', email: 'ana.k@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=ana', phone: '+381641234567', role: UserRole.AGENT, city: 'Belgrade', country: 'Serbia', agencyName: 'Balkan Premier Estates', agentId: 'AGENT-12345', licenseNumber: 'RS-LIC-9876', testimonials: [], isSubscribed: true },
  'user_seller_2': { id: 'user_seller_2', name: 'Marko Petrović', email: 'marko.p@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=marko', phone: '+385919876543', role: UserRole.PRIVATE_SELLER, city: 'Zagreb', country: 'Croatia', testimonials: [], isSubscribed: false },
};

// For backward compatibility
export const allProperties: Property[] = [];

// --- AUTHENTICATION API ---

export const checkAuth = async (): Promise<User | null> => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await apiRequest<{ user: User }>('/auth/me', { requiresAuth: true });
    return response.user;
  } catch (error) {
    // If token is invalid, remove it
    removeToken();
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  setToken(response.token);
  return response.user;
};

export const signup = async (email: string, password: string): Promise<User> => {
  const response = await apiRequest<{ user: User; token: string }>('/auth/signup', {
    method: 'POST',
    body: { email, password, name: email.split('@')[0], phone: '' },
  });

  setToken(response.token);
  return response.user;
};

export const logout = async (): Promise<void> => {
  await apiRequest('/auth/logout', { method: 'POST', requiresAuth: true });
  removeToken();
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  // TODO: Implement password reset endpoint on backend
  console.log(`Password reset request for ${email}`);
};

export const getAvailableOAuthProviders = async (): Promise<{ google: boolean; facebook: boolean; apple: boolean }> => {
  try {
    const response = await apiRequest<{ providers: { google: boolean; facebook: boolean; apple: boolean } }>('/auth/oauth/providers');
    return response.providers;
  } catch (error) {
    console.error('Error fetching OAuth providers:', error);
    // Return all false if endpoint fails
    return { google: false, facebook: false, apple: false };
  }
};

export const getOAuthUrl = (provider: 'google' | 'facebook' | 'apple'): string => {
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/api/auth/${provider}`;
};

export const loginWithSocial = (provider: 'google' | 'facebook' | 'apple'): void => {
  // Redirect to backend OAuth endpoint
  window.location.href = getOAuthUrl(provider);
};

export const sendPhoneCode = async (phone: string): Promise<void> => {
  // TODO: Implement phone verification on backend
  console.log(`Sending code to ${phone}`);
};

export const verifyPhoneCode = async (phone: string, code: string): Promise<{ user: User | null; isNew: boolean }> => {
  // TODO: Implement phone verification on backend
  throw new Error('Phone verification not yet implemented');
};

export const completePhoneSignup = async (phone: string, name: string, email: string): Promise<User> => {
  // TODO: Implement phone signup on backend
  throw new Error('Phone signup not yet implemented');
};

export const updateUser = async (userData: Partial<User>, avatarFile?: File | null): Promise<User> => {
  const token = getToken();

  // If there's a file, use FormData
  if (avatarFile) {
    const formData = new FormData();

    // Only append specific editable fields (not id, email, etc.)
    const editableFields = ['name', 'phone', 'city', 'country', 'agencyName', 'licenseNumber'];
    editableFields.forEach(key => {
      const value = (userData as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    formData.append('avatar', avatarFile);

    const config: RequestInit = {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(`${API_URL}/auth/profile`, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Failed to upload avatar');
      }
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      console.error('API request error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  } else {
    // No file, use regular JSON request
    const response = await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: userData,
      requiresAuth: true,
    });

    return response.user;
  }
};

export const switchRole = async (
  role: UserRole,
  licenseData?: { licenseNumber: string; agencyName: string; agentId?: string; licenseDocument?: File }
): Promise<User> => {
  const token = getToken();

  // If there's a file, use FormData
  if (licenseData?.licenseDocument) {
    const formData = new FormData();
    formData.append('role', role);
    if (licenseData.licenseNumber) formData.append('licenseNumber', licenseData.licenseNumber);
    if (licenseData.agencyName) formData.append('agencyName', licenseData.agencyName);
    if (licenseData.agentId) formData.append('agentId', licenseData.agentId);
    formData.append('licenseDocument', licenseData.licenseDocument);

    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(`${API_URL}/auth/switch-role`, config);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      }
      const data = await response.json();
      return data.user;
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  } else {
    // No file, use regular JSON request
    const response = await apiRequest<{ user: User; message: string }>('/auth/switch-role', {
      method: 'POST',
      body: { role, ...licenseData },
      requiresAuth: true,
    });

    return response.user;
  }
};

// --- PROPERTIES API ---

export const getProperties = async (filters?: Filters): Promise<Property[]> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.query) params.append('query', filters.query);
    if (filters.minPrice !== null) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.beds !== null) params.append('beds', filters.beds.toString());
    if (filters.baths !== null) params.append('baths', filters.baths.toString());
    if (filters.livingRooms !== null) params.append('livingRooms', filters.livingRooms.toString());
    if (filters.minSqft !== null) params.append('minSqft', filters.minSqft.toString());
    if (filters.maxSqft !== null) params.append('maxSqft', filters.maxSqft.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sellerType && filters.sellerType !== 'any') params.append('sellerType', filters.sellerType);
    if (filters.propertyType && filters.propertyType !== 'any') params.append('propertyType', filters.propertyType);
  }

  const queryString = params.toString();
  const endpoint = `/properties${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<{ properties: any[]; pagination: any }>(endpoint);

  // Transform backend properties to match frontend Property type
  return response.properties.map(transformBackendProperty);
};

export const getProperty = async (id: string): Promise<Property> => {
  const response = await apiRequest<{ property: any }>(`/properties/${id}`);
  return transformBackendProperty(response.property);
};

export const createListing = async (propertyData: Property): Promise<Property> => {
  const backendPropertyData = transformToBackendProperty(propertyData);

  const response = await apiRequest<{ property: any }>('/properties', {
    method: 'POST',
    body: backendPropertyData,
    requiresAuth: true,
  });

  return transformBackendProperty(response.property);
};

export const updateListing = async (propertyData: Property): Promise<Property> => {
  const backendPropertyData = transformToBackendProperty(propertyData);

  const response = await apiRequest<{ property: any }>(`/properties/${propertyData.id}`, {
    method: 'PUT',
    body: backendPropertyData,
    requiresAuth: true,
  });

  return transformBackendProperty(response.property);
};

export const getMyListings = async (): Promise<Property[]> => {
  const response = await apiRequest<{ properties: any[] }>('/properties/my/listings', {
    requiresAuth: true,
  });

  return response.properties.map(transformBackendProperty);
};

export const uploadPropertyImages = async (images: File[], propertyId?: string): Promise<{ url: string; tag: string }[]> => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  // Add propertyId to organize images by listing ID in Cloudinary
  if (propertyId) {
    formData.append('propertyId', propertyId);
  }

  const token = getToken();
  const response = await fetch(`${API_URL}/properties/upload-images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  const data = await response.json();
  return data.images;
};

// --- FAVORITES API ---

export const toggleSavedHome = async (propertyId: string, isSaved: boolean): Promise<{ success: true }> => {
  await apiRequest('/favorites/toggle', {
    method: 'POST',
    body: { propertyId },
    requiresAuth: true,
  });

  return { success: true };
};

export const getFavorites = async (): Promise<Property[]> => {
  const response = await apiRequest<{ favorites: any[] }>('/favorites', {
    requiresAuth: true,
  });

  return response.favorites
    .filter((fav) => fav.propertyId)
    .map((fav) => transformBackendProperty(fav.propertyId));
};

// --- SAVED SEARCHES API ---

export const addSavedSearch = async (search: SavedSearch): Promise<SavedSearch> => {
  const response = await apiRequest<{ savedSearch: any }>('/saved-searches', {
    method: 'POST',
    body: {
      name: search.name,
      filters: search.filters,
      drawnBoundsJSON: search.drawnBoundsJSON,
    },
    requiresAuth: true,
  });

  return transformBackendSavedSearch(response.savedSearch);
};

export const getSavedSearches = async (): Promise<SavedSearch[]> => {
  const response = await apiRequest<{ savedSearches: any[] }>('/saved-searches', {
    requiresAuth: true,
  });

  return response.savedSearches.map(transformBackendSavedSearch);
};

export const updateSavedSearchAccessTime = async (searchId: string): Promise<{ success: true }> => {
  await apiRequest(`/saved-searches/${searchId}/access`, {
    method: 'PATCH',
    requiresAuth: true,
  });

  return { success: true };
};

export const deleteSavedSearch = async (searchId: string): Promise<void> => {
  await apiRequest(`/saved-searches/${searchId}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
};

// --- CONVERSATIONS/MESSAGING API ---

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await apiRequest<{ conversations: any[] }>('/conversations', {
    requiresAuth: true,
  });

  return response.conversations.map(transformBackendConversation);
};

export const getConversation = async (conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> => {
  const response = await apiRequest<{ conversation: any; messages: any[] }>(`/conversations/${conversationId}`, {
    requiresAuth: true,
  });

  return {
    conversation: transformBackendConversation(response.conversation),
    messages: response.messages.map(transformBackendMessage),
  };
};

export const createConversation = async (propertyId: string): Promise<Conversation> => {
  const response = await apiRequest<{ conversation: any }>('/conversations', {
    method: 'POST',
    body: { propertyId },
    requiresAuth: true,
  });

  return transformBackendConversation(response.conversation);
};

export const sendMessage = async (conversationId: string, message: Message): Promise<Message> => {
  const response = await apiRequest<{ message: any }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { text: message.text },
    requiresAuth: true,
  });

  return transformBackendMessage(response.message);
};

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  await apiRequest(`/conversations/${conversationId}/read`, {
    method: 'PATCH',
    requiresAuth: true,
  });
};

// --- USER DATA API ---

export const getMyData = async (): Promise<{ savedHomes: Property[]; savedSearches: SavedSearch[]; conversations: Conversation[] }> => {
  const [favorites, savedSearches, conversations] = await Promise.all([
    getFavorites(),
    getSavedSearches(),
    getConversations(),
  ]);

  return {
    savedHomes: favorites,
    savedSearches,
    conversations,
  };
};

// --- SUBSCRIPTION API ---

export const subscribe = async (plan: string): Promise<{ success: true }> => {
  // TODO: Implement subscription endpoint on backend
  console.log(`Subscribing to ${plan}`);
  return { success: true };
};

// --- TRANSFORMATION HELPERS ---

// Transform backend property to frontend Property type
function transformBackendProperty(backendProp: any): Property {
  const seller = backendProp.sellerId;

  return {
    id: backendProp._id,
    sellerId: seller._id || seller,
    status: backendProp.status,
    price: backendProp.price,
    address: backendProp.address,
    city: backendProp.city,
    country: backendProp.country,
    beds: backendProp.beds,
    baths: backendProp.baths,
    livingRooms: backendProp.livingRooms,
    sqft: backendProp.sqft,
    yearBuilt: backendProp.yearBuilt,
    parking: backendProp.parking,
    description: backendProp.description,
    specialFeatures: backendProp.specialFeatures || [],
    materials: backendProp.materials || [],
    tourUrl: backendProp.tourUrl,
    imageUrl: backendProp.imageUrl,
    images: backendProp.images || [],
    lat: backendProp.lat,
    lng: backendProp.lng,
    seller: {
      type: seller.role === 'agent' ? 'agent' : 'private',
      name: seller.name,
      phone: seller.phone,
      avatarUrl: seller.avatarUrl,
      agencyName: seller.agencyName,
    },
    propertyType: backendProp.propertyType,
    floorNumber: backendProp.floorNumber,
    totalFloors: backendProp.totalFloors,
    floorplanUrl: backendProp.floorplanUrl,
    createdAt: new Date(backendProp.createdAt).getTime(),
    lastRenewed: new Date(backendProp.lastRenewed).getTime(),
    views: backendProp.views || 0,
    saves: backendProp.saves || 0,
    inquiries: backendProp.inquiries || 0,
  };
}

// Transform frontend Property to backend format
function transformToBackendProperty(frontendProp: Property): any {
  return {
    status: frontendProp.status,
    price: frontendProp.price,
    address: frontendProp.address,
    city: frontendProp.city,
    country: frontendProp.country,
    beds: frontendProp.beds,
    baths: frontendProp.baths,
    livingRooms: frontendProp.livingRooms,
    sqft: frontendProp.sqft,
    yearBuilt: frontendProp.yearBuilt,
    parking: frontendProp.parking,
    description: frontendProp.description,
    specialFeatures: frontendProp.specialFeatures,
    materials: frontendProp.materials,
    tourUrl: frontendProp.tourUrl,
    imageUrl: frontendProp.imageUrl,
    images: frontendProp.images,
    lat: frontendProp.lat,
    lng: frontendProp.lng,
    propertyType: frontendProp.propertyType,
    floorNumber: frontendProp.floorNumber,
    totalFloors: frontendProp.totalFloors,
    floorplanUrl: frontendProp.floorplanUrl,
  };
}

// Transform backend saved search to frontend SavedSearch type
function transformBackendSavedSearch(backendSearch: any): SavedSearch {
  return {
    id: backendSearch._id,
    name: backendSearch.name,
    filters: backendSearch.filters,
    drawnBoundsJSON: backendSearch.drawnBoundsJSON,
    createdAt: new Date(backendSearch.createdAt).getTime(),
    lastAccessed: new Date(backendSearch.lastAccessed).getTime(),
  };
}

// Transform backend conversation to frontend Conversation type
function transformBackendConversation(backendConv: any): Conversation {
  const property = backendConv.propertyId;
  const buyer = backendConv.buyerId;
  const seller = backendConv.sellerId;

  return {
    id: backendConv._id,
    propertyId: property._id || property,
    property: property._id ? transformBackendProperty(property) : undefined,
    buyerId: buyer._id || buyer,
    sellerId: seller._id || seller,
    buyer: buyer._id ? {
      id: buyer._id,
      name: buyer.name,
      avatarUrl: buyer.avatarUrl,
    } : undefined,
    seller: seller._id ? {
      id: seller._id,
      name: seller.name,
      avatarUrl: seller.avatarUrl,
      role: seller.role,
      agencyName: seller.agencyName,
    } : undefined,
    messages: [],
    lastMessage: backendConv.lastMessage ? transformBackendMessage(backendConv.lastMessage) : undefined,
    createdAt: new Date(backendConv.createdAt).getTime(),
    isRead: backendConv.buyerUnreadCount === 0 && backendConv.sellerUnreadCount === 0,
  };
}

// Transform backend message to frontend Message type
function transformBackendMessage(backendMsg: any): Message {
  return {
    id: backendMsg._id,
    senderId: backendMsg.senderId._id || backendMsg.senderId,
    text: backendMsg.text,
    timestamp: new Date(backendMsg.createdAt).getTime(),
    isRead: backendMsg.isRead,
  };
}
