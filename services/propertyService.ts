import { Property, Seller, User, UserRole } from '../types';
import { CITY_RAW_DATA } from '../utils/cityData';

export const sellers: { [key: string]: Seller } = {
  seller1: {
    type: 'agent',
    name: 'Ana Kovačević',
    avatarUrl: 'https://i.pravatar.cc/150?u=ana',
    phone: '+381 64 123 4567',
  },
  seller2: {
    type: 'private',
    name: 'Marko Petrović',
    avatarUrl: 'https://i.pravatar.cc/150?u=marko',
    phone: '+385 91 987 6543',
  },
  seller3: {
    type: 'agent',
    name: 'Ivan Horvat',
    avatarUrl: 'https://i.pravatar.cc/150?u=ivan',
    phone: '+385 91 123 4567',
    agencyName: 'Adriatic Properties'
  },
  seller4: {
    type: 'agent',
    name: 'Elena Georgieva',
    avatarUrl: 'https://i.pravatar.cc/150?u=elena',
    phone: '+359 88 123 4567',
    agencyName: 'Sofia Homes'
  },
  seller5: {
    type: 'private',
    name: 'Adnan Hodžić',
    avatarUrl: 'https://i.pravatar.cc/150?u=adnan',
    phone: '+387 61 987 6543',
  },
   seller6: {
    type: 'agent',
    name: 'Nikos Papadopoulos',
    avatarUrl: 'https://i.pravatar.cc/150?u=nikos',
    phone: '+30 697 123 4567',
    agencyName: 'Hellas Real Estate'
  },
   seller7: {
    type: 'agent',
    name: 'Alen Isić',
    avatarUrl: 'https://i.pravatar.cc/150?u=alen',
    phone: '+387 62 111 2222',
    agencyName: 'Sarajevo Realty'
  },
};

// Transform the raw city data from the new central file into the format the app expects
const transformCityData = (): { [country: string]: { name: string; localNames: string[]; lat: number; lng: number; }[] } => {
  const transformedData: { [country: string]: { name: string; localNames: string[]; lat: number; lng: number; }[] } = {};
  for (const country in CITY_RAW_DATA) {
      if (Object.prototype.hasOwnProperty.call(CITY_RAW_DATA, country)) {
          transformedData[country] = CITY_RAW_DATA[country].map(cityInfo => ({
              name: cityInfo.primary,
              localNames: cityInfo.localNames || [],
              lat: cityInfo.latitude,
              lng: cityInfo.longitude,
          }));
      }
  }
  return transformedData;
};

export const CITY_DATA: { [country: string]: { name: string; localNames: string[]; lat: number; lng: number }[] } = transformCityData();

export const mockUsers: { [key: string]: User } = {
    'user_seller_1': {
        id: 'user_seller_1',
        name: 'Ana Kovačević',
        email: 'ana.k@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=ana',
        phone: '+381 64 123 4567',
        role: UserRole.AGENT,
        city: 'Belgrade',
        country: 'Serbia',
        agencyName: 'Balkan Premier Estates',
        agentId: 'AGENT-12345',
        licenseNumber: 'RS-LIC-9876',
        testimonials: [
            { quote: "Ana was incredibly professional and helped us find our dream home in Belgrade. Highly recommended!", clientName: "Miloš & Jelena Popović" },
            { quote: "The selling process was smooth and faster than we expected. Thanks, Ana!", clientName: "Ivana Stanković" },
        ]
    },
    'user_seller_2': {
        id: 'user_seller_2',
        name: 'Marko Petrović',
        email: 'marko.p@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=marko',
        phone: '+385 91 987 6543',
        role: UserRole.PRIVATE_SELLER,
        city: 'Zagreb',
        country: 'Croatia',
        testimonials: [
            { quote: "Marko's knowledge of the Zagreb market is second to none. He made the entire process feel effortless.", clientName: "Luka and Ema Horvat" },
        ]
    },
    'user_agent_2': {
        id: 'user_agent_2',
        name: 'Ivan Horvat',
        email: 'ivan.h@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=ivan',
        phone: '+385 91 123 4567',
        role: UserRole.AGENT,
        city: 'Zagreb',
        country: 'Croatia',
        agencyName: 'Adriatic Properties',
        agentId: 'AGENT-54321',
        // No licenseNumber here
        testimonials: [
            { quote: "Ivan found us the perfect seaside villa in Split. A true professional.", clientName: "Petar and Marija Kovač" },
        ]
    },
    'user_agent_3': {
        id: 'user_agent_3',
        name: 'Elena Georgieva',
        email: 'elena.g@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=elena',
        phone: '+359 88 123 4567',
        role: UserRole.AGENT,
        city: 'Sofia',
        country: 'Bulgaria',
        agencyName: 'Sofia Homes',
        agentId: 'AGENT-BG-001',
        licenseNumber: 'BG-LIC-1122',
        testimonials: [{ quote: "Elena is the best in Sofia!", clientName: "Dimitar Berbatov" }]
    },
    'user_seller_4': {
        id: 'user_seller_4',
        name: 'Adnan Hodžić',
        email: 'adnan.h@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=adnan',
        phone: '+387 61 987 6543',
        role: UserRole.PRIVATE_SELLER,
        city: 'Sarajevo',
        country: 'Bosnia and Herzegovina',
        testimonials: []
    },
    'user_agent_5': {
        id: 'user_agent_5',
        name: 'Nikos Papadopoulos',
        email: 'nikos.p@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=nikos',
        phone: '+30 697 123 4567',
        role: UserRole.AGENT,
        city: 'Thessaloniki',
        country: 'Greece',
        agencyName: 'Hellas Real Estate',
        agentId: 'AGENT-GR-007',
        // No licenseNumber for Nikos
        testimonials: [{ quote: "Fantastic service, found a great apartment in Athens.", clientName: "Maria S." }]
    },
    'user_agent_6': {
        id: 'user_agent_6',
        name: 'Alen Isić',
        email: 'alen.i@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=alen',
        phone: '+387 62 111 2222',
        role: UserRole.AGENT,
        city: 'Sarajevo',
        country: 'Bosnia and Herzegovina',
        agencyName: 'Sarajevo Realty',
        agentId: 'AGENT-BA-002',
        licenseNumber: 'BA-LIC-3344',
        testimonials: [{ quote: "Alen helped us sell our flat in record time.", clientName: "Jasmina & Emir" }]
    }
};

export const dummyProperties: Property[] = [
  {
    id: 'prop1',
    sellerId: 'user_seller_1',
    status: 'active',
    price: 350000,
    address: 'Knez Mihailova 10',
    city: 'Belgrade',
    country: 'Serbia',
    beds: 3,
    baths: 2,
    sqft: 120,
    yearBuilt: 2010,
    parking: 1,
    description: 'A beautiful apartment in the heart of Belgrade, offering stunning city views and modern amenities. Perfect for families or professionals seeking a vibrant city life.',
    specialFeatures: ['City View', 'Modern Kitchen', 'Balcony', 'Elevator'],
    materials: ['Hardwood Floors', 'Marble Countertops'],
    tourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto-format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto-format&fit=crop', tag: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1600607687939-098d3c54e87a?q=80&w=2070&auto-format&fit=crop', tag: 'living_room' },
      { url: 'https://images.unsplash.com/photo-1556912173-3e74dd82a485?q=80&w=2070&auto-format&fit=crop', tag: 'kitchen' },
    ],
    lat: 44.7872,
    lng: 20.4573,
    seller: sellers.seller1,
    propertyType: 'apartment',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    lastRenewed: Date.now() - 1000 * 60 * 60 * 24 * 1,
    views: 125,
    saves: 12,
    inquiries: 3,
  },
  {
    id: 'prop2',
    sellerId: 'user_agent_2',
    status: 'active',
    price: 650000,
    address: 'Ilica 55',
    city: 'Zagreb',
    country: 'Croatia',
    beds: 4,
    baths: 3,
    sqft: 250,
    yearBuilt: 1998,
    parking: 2,
    description: 'Spacious family house with a beautiful garden, located in a quiet neighborhood of Zagreb. Close to parks and international schools.',
    specialFeatures: ['Garden', 'Fireplace', 'Garage', 'Quiet Neighborhood'],
    materials: ['Brick', 'Wood Beams'],
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto-format&fit=crop', tag: 'exterior' },
    ],
    lat: 45.8131,
    lng: 15.9772,
    seller: sellers.seller3,
    propertyType: 'house',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastRenewed: Date.now() - 1000 * 60 * 60 * 24 * 3,
    views: 340,
    saves: 25,
    inquiries: 8,
  },
  {
    id: 'prop3',
    sellerId: 'user_seller_1',
    status: 'pending',
    price: 280000,
    address: 'Baščaršija 1',
    city: 'Sarajevo',
    country: 'Bosnia and Herzegovina',
    beds: 2,
    baths: 1,
    sqft: 85,
    yearBuilt: 2015,
    parking: 0,
    description: 'Charming apartment in the old town of Sarajevo, offering a unique blend of history and modern comfort.',
    specialFeatures: ['Historic Area', 'Rooftop Terrace'],
    materials: [],
    imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2070&auto-format&fit=crop',
    images: [],
    lat: 43.8596,
    lng: 18.4312,
    seller: sellers.seller1,
    propertyType: 'apartment',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    views: 210,
    saves: 15,
    inquiries: 5,
  },
  {
    id: 'prop4',
    sellerId: 'user_agent_2',
    status: 'sold',
    price: 950000,
    address: 'Riva 20',
    city: 'Split',
    country: 'Croatia',
    beds: 5,
    baths: 4,
    sqft: 350,
    yearBuilt: 2018,
    parking: 3,
    description: 'Luxurious villa with a private pool and stunning sea views, located just a few steps from the beach in Split.',
    specialFeatures: ['Sea View', 'Swimming Pool', 'Private Beach Access'],
    materials: ['Stone', 'Glass'],
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto-format&fit=crop',
    images: [],
    lat: 43.5079,
    lng: 16.4391,
    seller: sellers.seller3,
    propertyType: 'villa',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    views: 1500,
    saves: 120,
    inquiries: 22,
  },
  { id: 'prop5', sellerId: 'user_agent_3', status: 'active', price: 180000, address: 'Partizanska 5', city: 'Bitola', country: 'North Macedonia', beds: 2, baths: 1, sqft: 75, yearBuilt: 2005, parking: 1, description: 'Cozy apartment near the city center of Bitola.', specialFeatures: ['Balcony'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto-format&fit=crop', images: [], lat: 41.0319, lng: 21.33, seller: sellers.seller4, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 3, lastRenewed: Date.now() - 86400000 * 2 },
  { id: 'prop6', sellerId: 'user_agent_3', status: 'active', price: 420000, address: 'Vitosha Boulevard 15', city: 'Sofia', country: 'Bulgaria', beds: 3, baths: 2, sqft: 110, yearBuilt: 2012, parking: 1, description: 'Modern flat in the heart of Sofia with great views.', specialFeatures: ['City View'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto-format&fit=crop', images: [], lat: 42.6977, lng: 23.3219, seller: sellers.seller4, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 8 },
  { id: 'prop7', sellerId: 'user_agent_5', status: 'active', price: 850000, address: 'Rruga Butrinti', city: 'Sarandë', country: 'Albania', beds: 4, baths: 3, sqft: 200, yearBuilt: 2019, parking: 2, description: 'Stunning villa with sea views in Sarandë.', specialFeatures: ['Sea View', 'Swimming Pool'], materials: ['Stone'], imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto-format&fit=crop', images: [], lat: 39.8756, lng: 20.0056, seller: sellers.seller6, propertyType: 'villa', createdAt: Date.now() - 86400000 * 1 },
  { id: 'prop8', sellerId: 'user_seller_1', status: 'active', price: 210000, address: 'Strazilovska 12', city: 'Novi Sad', country: 'Serbia', beds: 2, baths: 1, sqft: 65, yearBuilt: 1985, parking: 0, description: 'Renovated apartment in a classic building in Novi Sad.', specialFeatures: ['Renovated'], materials: ['Hardwood Floors'], imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto-format&fit=crop', images: [], lat: 45.2517, lng: 19.845, seller: sellers.seller1, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 12, lastRenewed: Date.now() - 86400000 * 5 },
  { id: 'prop9', sellerId: 'user_agent_6', status: 'sold', price: 75000, address: 'Marsala Tita 80', city: 'Tuzla', country: 'Bosnia and Herzegovina', beds: 1, baths: 1, sqft: 40, yearBuilt: 2000, parking: 0, description: 'Compact and modern studio in Tuzla.', specialFeatures: [], materials: [], imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto-format&fit=crop', images: [], lat: 44.5384, lng: 18.6671, seller: sellers.seller7, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 40 },
  { id: 'prop10', sellerId: 'user_agent_2', status: 'active', price: 1200000, address: 'Stradun 5', city: 'Dubrovnik', country: 'Croatia', beds: 3, baths: 3, sqft: 150, yearBuilt: 1700, parking: 0, description: 'Historic stone house in the Old Town of Dubrovnik.', specialFeatures: ['Historic Area'], materials: ['Stone'], imageUrl: 'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?q=80&w=1964&auto-format&fit=crop', images: [], lat: 42.6414, lng: 18.1083, seller: sellers.seller3, propertyType: 'house', createdAt: Date.now() - 86400000 * 6 },
  { id: 'prop11', sellerId: 'user_agent_5', status: 'active', price: 320000, address: 'Nikis Avenue 22', city: 'Thessaloniki', country: 'Greece', beds: 2, baths: 2, sqft: 90, yearBuilt: 2018, parking: 1, description: 'Modern apartment overlooking the Thermaic Gulf.', specialFeatures: ['Sea View'], materials: [], imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2070&auto-format&fit=crop', images: [], lat: 40.626, lng: 22.95, seller: sellers.seller6, propertyType: 'apartment', createdAt: Date.now() - 86400000 * 9 },
  ...Array.from({ length: 2989 }, (_, i) => {
    const propId = i + 12;
    const countryList = Object.keys(CITY_DATA);
    const country = countryList[propId % countryList.length];
    const cities = CITY_DATA[country];
    const city = cities[propId % cities.length];
    const userKeys = Object.keys(mockUsers);
    const sellerId = userKeys[propId % userKeys.length];
    const sellerUser = mockUsers[sellerId];
    const sellerInfo: Seller = { type: sellerUser.role === UserRole.AGENT ? 'agent' : 'private', name: sellerUser.name, avatarUrl: sellerUser.avatarUrl, phone: sellerUser.phone, agencyName: sellerUser.agencyName };
    const propertyType = ['house', 'apartment', 'villa'][propId % 3] as 'house' | 'apartment' | 'villa';
    
    // Choose a relevant Unsplash collection based on property type for better aesthetics
    let collectionId;
    switch(propertyType) {
        case 'house':
            collectionId = '1471343'; // House exteriors
            break;
        case 'apartment':
            collectionId = '1163637'; // House interiors
            break;

        case 'villa':
            collectionId = '1353039'; // Luxury homes & villas
            break;
    }
    const price = 80000 + Math.floor(Math.random() * 15) * 50000;

    return {
      id: `prop${propId}`,
      sellerId: sellerId,
      status: (propId % 10 === 0) ? 'sold' : 'active',
      price,
      address: `Random Street ${propId}`,
      city: city.name,
      country,
      beds: 2 + (propId % 3),
      baths: 1 + (propId % 2),
      sqft: 60 + (propId % 5) * 20,
      yearBuilt: 1990 + (propId % 30),
      parking: propId % 3,
      description: `A lovely ${propertyType} in the beautiful city of ${city.name}. Great opportunity.`,
      specialFeatures: ['Balcony', 'Garden'].slice(0, propId % 3),
      materials: [],
      // Use a unique query param to get a different random image from the collection
      imageUrl: `https://source.unsplash.com/collection/${collectionId}/800x600?${propId}`,
      images: [],
      lat: city.lat + (Math.random() - 0.5) * 0.05,
      lng: city.lng + (Math.random() - 0.5) * 0.05,
      seller: sellerInfo,
      propertyType,
      createdAt: Date.now() - 86400000 * (propId % 50),
      lastRenewed: (propId % 4 === 0) ? Date.now() - 86400000 * (propId % 10) : undefined,
      views: 50 + propId * 10,
      saves: 5 + propId,
      inquiries: propId % 5,
    } as Property;
  }),
];