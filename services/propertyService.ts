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
};

// Transform the raw city data from the new central file into the format the app expects
const transformCityData = (): { [country: string]: { name: string; lat: number; lng: number; }[] } => {
  const transformedData: { [country: string]: { name: string; lat: number; lng: number; }[] } = {};
  for (const country in CITY_RAW_DATA) {
      if (Object.prototype.hasOwnProperty.call(CITY_RAW_DATA, country)) {
          transformedData[country] = CITY_RAW_DATA[country].map(cityInfo => ({
              name: cityInfo.city,
              lat: cityInfo.latitude,
              lng: cityInfo.longitude,
          }));
      }
  }
  return transformedData;
};

export const CITY_DATA: { [country: string]: { name: string; lat: number; lng: number }[] } = transformCityData();


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
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop', tag: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1600607687939-098d3c54e87a?q=80&w=2070&auto=format&fit=crop', tag: 'living_room' },
      { url: 'https://images.unsplash.com/photo-1556912173-3e74dd82a485?q=80&w=2070&auto=format&fit=crop', tag: 'kitchen' },
    ],
    lat: 44.7872,
    lng: 20.4573,
    seller: sellers.seller1,
    propertyType: 'apartment',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    views: 125,
    saves: 12,
    inquiries: 3,
  },
  {
    id: 'prop2',
    sellerId: 'user_seller_2',
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
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop', tag: 'exterior' },
    ],
    lat: 45.8131,
    lng: 15.9772,
    seller: sellers.seller2,
    propertyType: 'house',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    views: 340,
    saves: 25,
    inquiries: 8,
  },
  {
    id: 'prop3',
    sellerId: 'user_seller_1',
    status: 'active',
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
    imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=2070&auto=format&fit=crop',
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
    sellerId: 'user_seller_2',
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
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto=format&fit=crop',
    images: [],
    lat: 43.5079,
    lng: 16.4391,
    seller: sellers.seller2,
    propertyType: 'villa',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    views: 1500,
    saves: 120,
    inquiries: 22,
  },
];

export const mockUsers: { [key: string]: User } = {
    'user_seller_1': {
        id: 'user_seller_1',
        name: 'Ana Kovačević',
        email: 'ana.k@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=ana',
        phone: '+381 64 123 4567',
        role: UserRole.SELLER,
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
        role: UserRole.SELLER,
        testimonials: [
            { quote: "Marko's knowledge of the Zagreb market is second to none. He made the entire process feel effortless.", clientName: "Luka and Ema Horvat" },
        ]
    }
};