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

// --- Data Generation ---

const basePricePerSqftByCountry: { [key: string]: number } = {
    'Slovenia': 2800,
    'Croatia': 2500,
    'Montenegro': 2200,
    'Greece': 2000,
    'Serbia': 1800,
    'Bosnia and Herzegovina': 1400,
    'Albania': 1500,
    'Bulgaria': 1300,
    'North Macedonia': 1200,
    'Kosovo': 1100,
};

const coastalCities = new Set([
    "split", "rijeka", "zadar", "pula", "šibenik", "dubrovnik", "rovinj", "makarska", "opatija", "poreč", "umag", "novalja", "hvar", "korčula", "bol", "pag", "rab", "krk", "cres", "mali lošinj", "biograd na moru", "primošten", "trogir", "šolta", "brač", "vis",
    "herceg novi", "budva", "bar", "kotor", "tivat", "ulcinj",
    "durrës", "vlorë", "sarandë", "shëngjin", "himarë",
    "athens", "thessaloniki", "patras", "heraklion", "volos", "rhodes", "chania", "kavala", "santorini", "mykonos", "corfu", "kalamata", "alexandroupoli"
]);

const generateMockProperties = (count: number): Property[] => {
    const newProperties: Property[] = [];
    const sellerIds = Object.keys(mockUsers);
    const streetNames = ['Main St', 'Oak Ave', 'Pine Ln', 'Maple Dr', 'Elm St', 'Cedar Blvd', 'Partizanska', 'Ilindenska', 'Rruga e Durrësit', 'Vasil Levski Blvd', 'Knez Mihailova', 'Ilica', 'Makedonia', 'Slovenska Obala'];
    const propertyTypes: Property['propertyType'][] = ['house', 'apartment', 'villa'];
    
    const commonFeatures = ['Balcony', 'Garage', 'New Construction', 'Renovated', 'Elevator', 'Air Conditioning', 'Security System', 'Fireplace'];
    const locationFeatures = ['City View', 'Mountain View', 'Quiet Neighborhood', 'City Center'];
    const coastalFeatures = ['Sea View', 'Beachfront', 'Near Beach'];
    
    const materials = ['Brick', 'Wood', 'Stone', 'Marble', 'Concrete', 'Hardwood Floors', 'Tiles', 'Laminate'];

    const locations: { country: string, municipality: string, settlement: string, lat: number, lng: number }[] = [];
    for (const country in MUNICIPALITY_DATA) {
        for (const mun of MUNICIPALITY_DATA[country]) {
            for (const set of mun.settlements) {
                locations.push({ country, municipality: mun.name, settlement: set.name, lat: set.lat, lng: set.lng });
            }
        }
    }
    
    if (locations.length === 0) {
        console.error("No locations found to generate properties.");
        return [];
    }

    for (let i = 0; i < count; i++) {
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const sellerId = sellerIds[Math.floor(Math.random() * sellerIds.length)];
        
        const isCityCenter = randomLocation.settlement === randomLocation.municipality;
        let propertyType: Property['propertyType'];
        if (isCityCenter && Math.random() < 0.7) {
            propertyType = 'apartment';
        } else {
            propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
        }

        let sqft;
        const randSqft = Math.random();
        if (propertyType === 'apartment') {
            if (randSqft < 0.6) sqft = Math.floor(Math.random() * 40) + 30;
            else if (randSqft < 0.9) sqft = Math.floor(Math.random() * 50) + 70;
            else sqft = Math.floor(Math.random() * 80) + 120;
        } else {
            if (randSqft < 0.5) sqft = Math.floor(Math.random() * 100) + 80;
            else if (randSqft < 0.9) sqft = Math.floor(Math.random() * 120) + 180;
            else sqft = Math.floor(Math.random() * 400) + 300;
            if (propertyType === 'villa') sqft += 50;
        }

        const basePrice = basePricePerSqftByCountry[randomLocation.country] || 1500;
        const pricePerSqftVariance = (Math.random() - 0.5) * 0.4;
        const locationPremium = isCityCenter ? 1.2 : 1.0;
        
        const pricePerSqft = basePrice * (1 + pricePerSqftVariance) * locationPremium;
        const price = Math.round((pricePerSqft * sqft) / 1000) * 1000;
        
        const beds = Math.max(1, Math.floor(sqft / 35) + (Math.random() < 0.3 ? -1 : (Math.random() < 0.7 ? 0 : 1)));
        const baths = Math.max(1, Math.floor(beds / 2) + (Math.random() < 0.5 ? 0 : 1));
        const livingRooms = Math.max(1, Math.floor(beds / 3));
        const yearBuilt = Math.floor(Math.random() * 70) + 1950;
        
        const isCoastal = coastalCities.has(randomLocation.municipality.toLowerCase());
        const availableFeatures = [...commonFeatures, ...locationFeatures, ...(isCoastal ? coastalFeatures : [])];
        
        const prop: Property = {
            id: `gen_prop_${Date.now()}_${i}`,
            sellerId,
            status: Math.random() < 0.92 ? 'active' : (Math.random() < 0.5 ? 'sold' : 'pending'),
            price,
            address: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${Math.floor(Math.random() * 200) + 1}`,
            city: `${randomLocation.settlement}, ${randomLocation.municipality}`,
            country: randomLocation.country,
            beds,
            baths,
            livingRooms,
            sqft,
            yearBuilt,
            parking: Math.floor(Math.random() * 3),
            description: `A lovely ${propertyType} in ${randomLocation.settlement} with ${beds} bedrooms and beautiful surroundings. Built in ${yearBuilt}, this property is a fantastic opportunity.`,
            specialFeatures: [...new Set(Array.from({ length: Math.floor(Math.random() * 5) }, () => availableFeatures[Math.floor(Math.random() * availableFeatures.length)]))],
            materials: [...new Set(Array.from({ length: Math.floor(Math.random() * 4) }, () => materials[Math.floor(Math.random() * materials.length)]))],
            imageUrl: `https://source.unsplash.com/random/800x600/?${propertyType},exterior,modern&sig=${i}`,
            images: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, j) => ({ url: `https://source.unsplash.com/random/800x600/?${propertyType},interior&sig=${i*10 + j}`, tag: 'other' })),
            lat: randomLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: randomLocation.lng + (Math.random() - 0.5) * 0.05,
            seller: { type: mockUsers[sellerId].role === UserRole.AGENT ? 'agent' : 'private', name: mockUsers[sellerId].name, phone: mockUsers[sellerId].phone, avatarUrl: mockUsers[sellerId].avatarUrl },
            propertyType,
            createdAt: Date.now() - Math.floor(Math.random() * 365) * 86400000,
            lastRenewed: Date.now() - Math.floor(Math.random() * 30) * 86400000,
            views: Math.floor(Math.random() * 3000),
            saves: Math.floor(Math.random() * 200),
            inquiries: Math.floor(Math.random() * 30),
        };
        if (propertyType === 'apartment') {
            prop.floorNumber = Math.floor(Math.random() * 12) + 1;
        } else {
            prop.totalFloors = Math.floor(Math.random() * 3) + 1;
        }
        newProperties.push(prop);
    }
    return newProperties;
};

export const allProperties: Property[] = generateMockProperties(10000);


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

export const updateSavedSearchAccessTime = async (searchId: string): Promise<{ success: true }> => {
    await sleep(LATENCY / 4);
    console.log(`Simulating update of lastAccessed for search: ${searchId}`);
    return { success: true };
};