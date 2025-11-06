import { Property, Seller, User, UserRole, AppState, SavedSearch, Message, Conversation, Filters, MunicipalityData } from '../types';
import { MUNICIPALITY_RAW_DATA } from '../utils/cityData';
import { filterProperties } from '../utils/propertyUtils';

// --- MOCK DATABASE ---
// This section simulates a server-side database.

// FIX: Export sellers to be used in other files.
export const sellers: { [key: string]: Seller } = {
  seller1: { type: 'agent', name: 'Ana Kovačević', avatarUrl: 'https://i.pravatar.cc/150?u=ana', phone: '+381 64 123 4567' },
  seller2: { type: 'private', name: 'Marko Petrović', avatarUrl: 'https://i.pravatar.cc/150?u=marko', phone: '+385 91 987 6543' },
  seller3: { type: 'agent', name: 'Ivan Horvat', avatarUrl: 'https://i.pravatar.cc/150?u=ivan', phone: '+385 91 123 4567', agencyName: 'Adriatic Properties' },
  seller4: { type: 'agent', name: 'Elena Georgieva', avatarUrl: 'https://i.pravatar.cc/150?u=elena', phone: '+359 88 123 4567', agencyName: 'Sofia Homes' },
  seller5: { type: 'private', name: 'Adnan Hodžić', avatarUrl: 'https://i.pravatar.cc/150?u=adnan', phone: '+387 61 987 6543' },
  seller6: { type: 'agent', name: 'Nikos Papadopoulos', avatarUrl: 'https://i.pravatar.cc/150?u=nikos', phone: '+30 697 123 4567', agencyName: 'Hellas Real Estate' },
  seller7: { type: 'agent', name: 'Alen Isić', avatarUrl: 'https://i.pravatar.cc/150?u=alen', phone: '+387 62 111 2222', agencyName: 'Sarajevo Realty' },
};

// FIX: Export mockUsers to be used in other files.
export const mockUsers: { [key: string]: User } = {
    'user_seller_1': { id: 'user_seller_1', name: 'Ana Kovačević', email: 'ana.k@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=ana', phone: '+381641234567', role: UserRole.AGENT, city: 'Belgrade', country: 'Serbia', agencyName: 'Balkan Premier Estates', agentId: 'AGENT-12345', licenseNumber: 'RS-LIC-9876', testimonials: [ { quote: "Ana was incredibly professional and helped us find our dream home in Belgrade. Highly recommended!", clientName: "Miloš & Jelena Popović" }, { quote: "The selling process was smooth and faster than we expected. Thanks, Ana!", clientName: "Ivana Stanković" }, ], isSubscribed: true },
    'user_seller_2': { id: 'user_seller_2', name: 'Marko Petrović', email: 'marko.p@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=marko', phone: '+385919876543', role: UserRole.PRIVATE_SELLER, city: 'Zagreb', country: 'Croatia', testimonials: [ { quote: "Marko's knowledge of the Zagreb market is second to none. He made the entire process feel effortless.", clientName: "Luka and Ema Horvat" }, ], isSubscribed: false },
    'user_agent_2': { id: 'user_agent_2', name: 'Ivan Horvat', email: 'ivan.h@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=ivan', phone: '+385911234567', role: UserRole.AGENT, city: 'Zagreb', country: 'Croatia', agencyName: 'Adriatic Properties', agentId: 'AGENT-54321', testimonials: [ { quote: "Ivan found us the perfect seaside villa in Split. A true professional.", clientName: "Petar and Marija Kovač" }, ], isSubscribed: false },
    'user_agent_3': { id: 'user_agent_3', name: 'Elena Georgieva', email: 'elena.g@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=elena', phone: '+359881234567', role: UserRole.AGENT, city: 'Sofia', country: 'Bulgaria', agencyName: 'Sofia Homes', agentId: 'AGENT-BG-001', licenseNumber: 'BG-LIC-1122', testimonials: [{ quote: "Elena is the best in Sofia!", clientName: "Dimitar Berbatov" }], isSubscribed: true },
    'user_seller_4': { id: 'user_seller_4', name: 'Adnan Hodžić', email: 'adnan.h@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=adnan', phone: '+387619876543', role: UserRole.PRIVATE_SELLER, city: 'Sarajevo', country: 'Bosnia and Herzegovina', testimonials: [], isSubscribed: false },
    'user_agent_5': { id: 'user_agent_5', name: 'Nikos Papadopoulos', email: 'nikos.p@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=nikos', phone: '+306971234567', role: UserRole.AGENT, city: 'Thessaloniki', country: 'Greece', agencyName: 'Hellas Real Estate', agentId: 'AGENT-GR-007', testimonials: [{ quote: "Fantastic service, found a great apartment in Athens.", clientName: "Maria S." }], isSubscribed: false },
    'user_agent_6': { id: 'user_agent_6', name: 'Alen Isić', email: 'alen.i@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=alen', phone: '+387621112222', role: UserRole.AGENT, city: 'Sarajevo', country: 'Bosnia and Herzegovina', agencyName: 'Sarajevo Realty', agentId: 'AGENT-BA-002', licenseNumber: 'BA-LIC-3344', testimonials: [{ quote: "Alen helped us sell our flat in record time.", clientName: "Jasmina & Emir" }], isSubscribed: false }
};

const MUNICIPALITY_DATA: Record<string, MunicipalityData[]> = (
  Object.fromEntries(Object.entries(MUNICIPALITY_RAW_DATA).map(([country, municipalities]) => [
    country,
    municipalities.map(mun => ({
        name: mun.name,
        localNames: mun.localNames || [],
        lat: mun.latitude,
        lng: mun.longitude,
        settlements: mun.settlements.map(s => ({
            name: s.name,
            localNames: s.localNames || [],
            lat: s.latitude,
            lng: s.longitude,
        }))
    }))
  ]))
);

// FIX: Export allProperties to be used in other files.
export const allProperties: Property[] = [
  { id: 'prop1', sellerId: 'user_seller_1', status: 'active', price: 350000, address: 'Knez Mihailova 10', city: 'Belgrade, Belgrade', country: 'Serbia', beds: 3, baths: 2, livingRooms: 1, sqft: 120, yearBuilt: 2010, parking: 1, description: 'A beautiful apartment in the heart of Belgrade, offering stunning city views and modern amenities. Perfect for families or professionals seeking a vibrant city life.', specialFeatures: ['City View', 'Modern Kitchen', 'Balcony', 'Elevator'], materials: ['Hardwood Floors', 'Marble Countertops'], tourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto-format&fit=crop', images: [ { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto-format&fit=crop', tag: 'exterior' }, { url: 'https://images.unsplash.com/photo-1600607687939-098d3c54e87a?q=80&w=2070&auto-format&fit=crop', tag: 'living_room' }, { url: 'https://images.unsplash.com/photo-1556912173-3e74dd82a485?q=80&w=2070&auto-format&fit=crop', tag: 'kitchen' }, ], lat: 44.7872, lng: 20.4573, seller: sellers.seller1, propertyType: 'apartment', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, lastRenewed: Date.now() - 1000 * 60 * 60 * 24 * 1, views: 125, saves: 12, inquiries: 3, floorNumber: 5, },
  { id: 'prop2', sellerId: 'user_agent_2', status: 'active', price: 650000, address: 'Ilica 55', city: 'Zagreb, Zagreb', country: 'Croatia', beds: 4, baths: 3, livingRooms: 2, sqft: 250, yearBuilt: 1998, parking: 2, description: 'Spacious family house with a beautiful garden, located in a quiet neighborhood of Zagreb. Close to parks and international schools.', specialFeatures: ['Garden', 'Fireplace', 'Garage', 'Quiet Neighborhood'], materials: ['Brick', 'Wood Beams'], imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format&fit=crop', images: [ { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format&fit=crop', tag: 'exterior' }, ], lat: 45.8131, lng: 15.9772, seller: sellers.seller3, propertyType: 'house', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, lastRenewed: Date.now() - 1000 * 60 * 60 * 24 * 3, views: 340, saves: 25, inquiries: 8, totalFloors: 2, },
  { id: 'prop3', sellerId: 'user_seller_1', status: 'pending', price: 280000, address: 'Baščaršija 1', city: 'Sarajevo, Sarajevo', country: 'Bosnia and Herzegovina', beds: 2, baths: 1, livingRooms: 1, sqft: 85, yearBuilt: 2015, parking: 0, description: 'Charming apartment in the old town of Sarajevo, offering a unique blend of history and modern comfort.', specialFeatures: ['Historic Area', 'Rooftop Terrace'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2070&auto-format&fit=crop', images: [], lat: 43.8596, lng: 18.4312, seller: sellers.seller1, propertyType: 'apartment', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, views: 210, saves: 15, inquiries: 5, floorNumber: 3, },
  { id: 'prop4', sellerId: 'user_agent_2', status: 'sold', price: 950000, address: 'Riva 20', city: 'Split, Split', country: 'Croatia', beds: 5, baths: 4, livingRooms: 2, sqft: 350, yearBuilt: 2018, parking: 3, description: 'Luxurious villa with a private pool and stunning sea views, located just a few steps from the beach in Split.', specialFeatures: ['Sea View', 'Swimming Pool', 'Private Beach Access'], materials: ['Stone', 'Glass'], imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto-format&fit=crop', images: [], lat: 43.5079, lng: 16.4391, seller: sellers.seller3, propertyType: 'villa', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, views: 1500, saves: 120, inquiries: 22, totalFloors: 3, },
  { id: 'prop5', sellerId: 'user_agent_3', status: 'active', price: 180000, address: 'Partizanska 5', city: 'Bitola, Bitola', country: 'North Macedonia', beds: 2, baths: 1, livingRooms: 1, sqft: 75, yearBuilt: 2005, parking: 1, description: 'Cozy apartment near the city center of Bitola.', specialFeatures: ['Balcony'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto-format&fit=crop', images: [], lat: 41.0319, lng: 21.33, seller: sellers.seller4, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 3, lastRenewed: Date.now() - 86400000 * 2, floorNumber: 4 },
  { id: 'prop11', sellerId: 'user_agent_5', status: 'active', price: 420000, address: 'Plaka District 12', city: 'Athens, Athens', country: 'Greece', beds: 2, baths: 2, livingRooms: 1, sqft: 95, yearBuilt: 2019, parking: 1, description: 'Modern apartment with Acropolis view in the historic Plaka district. Features a large balcony and high-end finishes.', specialFeatures: ['Acropolis View', 'Rooftop Terrace', 'Smart Home'], materials: ['Marble', 'Glass'], imageUrl: 'https://images.unsplash.com/photo-1595910340058-232117565c49?q=80&w=1974&auto-format&fit=crop', images: [], lat: 37.972, lng: 23.73, seller: sellers.seller6, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 4, views: 450, saves: 30, inquiries: 10, floorNumber: 6 },
  { id: 'prop12', sellerId: 'user_agent_3', status: 'active', price: 580000, address: 'Vitosha Boulevard 88', city: 'Sofia, Sofia', country: 'Bulgaria', beds: 4, baths: 3, livingRooms: 2, sqft: 220, yearBuilt: 2012, parking: 2, description: 'Elegant family house at the foot of Vitosha Mountain. Boasts a spacious garden, modern interior, and quick access to the city center.', specialFeatures: ['Mountain View', 'Garden', 'Sauna'], materials: ['Wood', 'Stone'], imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto-format&fit=crop', images: [], lat: 42.65, lng: 23.32, seller: sellers.seller4, propertyType: 'house', createdAt: Date.now() - 86400000 * 15, totalFloors: 2 },
  { id: 'prop13', sellerId: 'user_agent_2', status: 'active', price: 1250000, address: 'Slovenska Obala 33', city: 'Budva, Budva', country: 'Montenegro', beds: 5, baths: 4, livingRooms: 2, sqft: 400, yearBuilt: 2021, parking: 3, description: 'Breathtaking modern villa on the Budva Riviera with an infinity pool and panoramic sea views. Ultimate luxury and privacy.', specialFeatures: ['Sea View', 'Infinity Pool', 'Private Gym', 'Elevator'], materials: ['Glass', 'Concrete', 'Travertine'], imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2070&auto-format&fit=crop', images: [], lat: 42.285, lng: 18.84, seller: sellers.seller3, propertyType: 'villa', createdAt: Date.now() - 86400000 * 8, views: 980, saves: 88, inquiries: 15, totalFloors: 3 },
  { id: 'prop14', sellerId: 'user_seller_4', status: 'active', price: 95000, address: 'Macedonia Square 7', city: 'Skopje, Skopje', country: 'North Macedonia', beds: 1, baths: 1, livingRooms: 1, sqft: 50, yearBuilt: 2014, parking: 0, description: 'Compact and stylish apartment right on Skopje\'s main square. Ideal for a single person, a couple, or as a rental investment.', specialFeatures: ['City Center', 'Fully Furnished'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto-format&fit=crop', images: [], lat: 41.996, lng: 21.43, seller: sellers.seller5, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 20, floorNumber: 8 },
  { id: 'prop15', sellerId: 'user_agent_2', status: 'active', price: 480000, address: 'Korzo 2', city: 'Rijeka, Rijeka', country: 'Croatia', beds: 3, baths: 2, livingRooms: 1, sqft: 180, yearBuilt: 1910, parking: 0, description: 'Magnificent historic apartment on Rijeka\'s main promenade, Korzo. Features high ceilings, original details, and a modern renovation.', specialFeatures: ['Historic Building', 'Sea View'], materials: ['Parquet', 'Stucco'], imageUrl: 'https://images.unsplash.com/photo-1560185007-c5ca91578276?q=80&w=2070&auto-format&fit=crop', images: [], lat: 45.327, lng: 14.442, seller: sellers.seller3, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 12, floorNumber: 3 },
  { id: 'prop16', sellerId: 'user_seller_1', status: 'active', price: 155000, address: 'Bill Clinton Boulevard 5', city: 'Pristina, Pristina', country: 'Kosovo', beds: 2, baths: 2, livingRooms: 1, sqft: 90, yearBuilt: 2018, parking: 1, description: 'Bright and spacious new apartment in a prime location in Pristina. Close to shops, cafes, and government buildings.', specialFeatures: ['New Construction', 'Balcony'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto-format&fit=crop', images: [], lat: 42.648, lng: 21.16, seller: sellers.seller1, propertyType: 'apartment', createdAt: Date.now() - 86400000, floorNumber: 5 },
  { id: 'prop17', sellerId: 'user_seller_2', status: 'sold', price: 720000, address: 'Rruga Taulantia 1', city: 'Durrës, Durrës', country: 'Albania', beds: 4, baths: 3, livingRooms: 1, sqft: 280, yearBuilt: 2015, parking: 2, description: 'Stunning beachfront villa in Durrës with direct access to the sand. Features a large terrace perfect for watching sunsets over the Adriatic.', specialFeatures: ['Beachfront', 'Sea View', 'Large Terrace'], materials: ['Stone'], imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto-format&fit=crop', images: [], lat: 41.31, lng: 19.45, seller: sellers.seller2, propertyType: 'villa', createdAt: Date.now() - 86400000 * 40, totalFloors: 2 },
  { id: 'prop18', sellerId: 'user_seller_1', status: 'active', price: 295000, address: 'Dunavska 15', city: 'Novi Sad, Novi Sad', country: 'Serbia', beds: 3, baths: 2, livingRooms: 2, sqft: 150, yearBuilt: 2008, parking: 1, description: 'Charming family house in a peaceful part of Novi Sad. Close to the Danube park and city center. Includes a small private yard.', specialFeatures: ['Quiet Neighborhood', 'Yard'], materials: ['Brick'], imageUrl: 'https://images.unsplash.com/photo-1605276374104-5de67d60924f?q=80&w=1974&auto-format&fit=crop', images: [], lat: 45.255, lng: 19.85, seller: sellers.seller1, propertyType: 'house', createdAt: Date.now() - 86400000 * 9, totalFloors: 2 },
  { id: 'prop19', sellerId: 'user_agent_6', status: 'active', price: 110000, address: 'Aleja Svetog Save 22', city: 'Banja Luka, Banja Luka', country: 'Bosnia and Herzegovina', beds: 2, baths: 1, livingRooms: 1, sqft: 65, yearBuilt: 2020, parking: 1, description: 'Modern, fully equipped apartment in a new building in Banja Luka. Excellent location with all city amenities.', specialFeatures: ['New Construction', 'Elevator', 'Security'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1494203484021-3c454daf695d?q=80&w=2070&auto-format&fit=crop', images: [], lat: 44.775, lng: 17.19, seller: sellers.seller7, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 6, floorNumber: 7 },
  { id: 'prop20', sellerId: 'user_agent_5', status: 'active', price: 85000, address: 'Egnatia 100', city: 'Thessaloniki, Thessaloniki', country: 'Greece', beds: 1, baths: 1, livingRooms: 1, sqft: 45, yearBuilt: 1995, parking: 0, description: 'Renovated studio apartment near Aristotle University, perfect for students or as a short-term rental investment. Comes fully furnished.', specialFeatures: ['Renovated', 'City Center', 'Investment Property'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto-format&fit=crop', images: [], lat: 40.63, lng: 22.95, seller: sellers.seller6, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 25, floorNumber: 4 },
];

// --- API SIMULATION ---

const LATENCY = 500; // ms

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store session data in localStorage to persist login
const getSession = (): { user: User | null } => {
    try {
        const session = localStorage.getItem('balkan_estate_session');
        if (session) {
            return JSON.parse(session);
        }
    } catch (e) {
        console.error("Could not parse session", e);
    }
    return { user: null };
};

const setSession = (user: User | null) => {
    localStorage.setItem('balkan_estate_session', JSON.stringify({ user }));
};

// --- EXPORTED API FUNCTIONS ---

export const checkAuth = async (): Promise<User | null> => {
    await sleep(LATENCY / 2);
    const session = getSession();
    return session.user;
};

export const login = async (email: string, _pass: string): Promise<User> => {
    await sleep(LATENCY);
    const existingUser = Object.values(mockUsers).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        setSession(existingUser);
        return existingUser;
    }
    throw new Error("Invalid credentials. Please try again or sign up.");
};

export const signup = async (email: string, _pass: string): Promise<User> => {
    await sleep(LATENCY);
    const existingUser = Object.values(mockUsers).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUser: User = { id: `user_${Date.now()}`, name, email, phone: '', role: UserRole.PRIVATE_SELLER, isSubscribed: false };
    mockUsers[newUser.id] = newUser; // Add to our runtime mock DB
    setSession(newUser);
    return newUser;
};

export const logout = async (): Promise<void> => {
    await sleep(LATENCY / 2);
    setSession(null);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await sleep(LATENCY);
    console.log(`Password reset link sent to ${email} (simulation).`);
    const userExists = Object.values(mockUsers).some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) {
        // Silently succeed to prevent user enumeration
        return;
    }
};

export const loginWithSocial = async (provider: 'google' | 'facebook' | 'apple'): Promise<User> => {
    await sleep(LATENCY * 1.5);
    const email = `${provider}.user@example.com`;
    let user = Object.values(mockUsers).find(u => u.email === email);
    if (!user) {
        user = {
            id: `user_social_${provider}`,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            email: email,
            avatarUrl: `https://i.pravatar.cc/150?u=${provider}`,
            phone: '',
            role: UserRole.BUYER,
            isSubscribed: false
        };
        mockUsers[user.id] = user;
    }
    setSession(user);
    return user;
};

export const sendPhoneCode = async (phone: string): Promise<void> => {
    await sleep(LATENCY);
    console.log(`Sending verification code to ${phone} (simulation). The code is 123456.`);
    return;
};

export const verifyPhoneCode = async (phone: string, code: string): Promise<{ user: User | null, isNew: boolean }> => {
    await sleep(LATENCY);
    if (code !== '123456') {
        throw new Error("Invalid verification code.");
    }
    const normalizedPhone = phone.replace(/\D/g, '');
    const existingUser = Object.values(mockUsers).find(u => u.phone.replace(/\D/g, '') === normalizedPhone);
    if (existingUser) {
        setSession(existingUser);
        return { user: existingUser, isNew: false };
    }
    return { user: null, isNew: true };
};

export const completePhoneSignup = async (phone: string, name: string, email: string): Promise<User> => {
    await sleep(LATENCY);
    const existingUser = Object.values(mockUsers).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }
    const newUser: User = { id: `user_${Date.now()}`, name, email, phone, role: UserRole.BUYER, isSubscribed: false };
    mockUsers[newUser.id] = newUser;
    setSession(newUser);
    return newUser;
};

export const getProperties = async (filters?: Filters, allMunicipalities?: Record<string, MunicipalityData[]>): Promise<Property[]> => {
    await sleep(LATENCY);
    if (filters && allMunicipalities) {
        return filterProperties(allProperties, filters, allMunicipalities);
    }
    return [...allProperties]; // Return a copy to prevent mutation issues
};

export const getMyData = async (): Promise<{ savedHomes: Property[], savedSearches: SavedSearch[], conversations: Conversation[] }> => {
    await sleep(LATENCY);
    // In a real app, this would fetch data for the logged-in user.
    // Here we just return empty arrays as we don't persist this data.
    return {
        savedHomes: [],
        savedSearches: [],
        conversations: []
    };
};

export const createListing = async (propertyData: Property): Promise<Property> => {
    await sleep(LATENCY * 2);
    allProperties.unshift(propertyData); // Add to the start of the list
    return propertyData;
};

export const updateListing = async (propertyData: Property): Promise<Property> => {
    await sleep(LATENCY * 2);
    const index = allProperties.findIndex(p => p.id === propertyData.id);
    if (index > -1) {
        allProperties[index] = propertyData;
    } else {
        // If for some reason it's not found, add it.
        allProperties.unshift(propertyData);
    }
    return propertyData;
};

// Other functions like saving homes, searches, messaging would be added here.
// For now, they will just return successful promises.

export const toggleSavedHome = async (propertyId: string, isSaved: boolean): Promise<{ success: true }> => {
    await sleep(LATENCY / 2);
    console.log(`Simulating ${isSaved ? 'unsaving' : 'saving'} home: ${propertyId}`);
    return { success: true };
};

export const addSavedSearch = async (search: SavedSearch): Promise<SavedSearch> => {
    await sleep(LATENCY / 2);
    console.log(`Simulating saving search: ${search.name}`);
    return search;
};

export const sendMessage = async (conversationId: string, message: Message): Promise<Message> => {
    await sleep(LATENCY / 2);
    console.log(`Simulating sending message to ${conversationId}`);
    // Simulate an echo from the seller
    return message;
};

export const subscribe = async (plan: string): Promise<{ success: true }> => {
    await sleep(LATENCY);
    console.log(`Simulating subscription to ${plan} plan`);
    return { success: true };
};

export const updateUser = async(userData: Partial<User>): Promise<User> => {
    await sleep(LATENCY);
    const session = getSession();
    if (!session.user) throw new Error("Not authenticated");
    const updatedUser = { ...session.user, ...userData };
    setSession(updatedUser);
    // Also update in our mock runtime DB
    if (mockUsers[updatedUser.id]) {
        mockUsers[updatedUser.id] = updatedUser;
    }
    return updatedUser;
};
