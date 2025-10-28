import { Property, Seller } from '../types';

export const sellers: { [key: string]: Seller } = {
    'ana_kovacevic': {
        type: 'agent',
        name: 'Ana Kovačević',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
        phone: '+381 64 123 4567'
    },
    'marko_horvat': {
        type: 'agent',
        name: 'Marko Horvat',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop',
        phone: '+385 91 987 6543'
    },
     'private_seller_1': {
        type: 'private',
        name: 'Dragan Petrović',
        phone: '+381 65 555 1234'
    },
    'private_seller_2': {
        type: 'private',
        name: 'Ivana Jurić',
        phone: '+385 98 555 9876'
    }
};

export const CITY_DATA: { [country: string]: { name: string, lat: number, lng: number, pricePerSqft: number }[] } = {
    'Serbia': [
        { name: 'Belgrade', lat: 44.7866, lng: 20.4489, pricePerSqft: 2900 },
        { name: 'Novi Sad', lat: 45.2671, lng: 19.8335, pricePerSqft: 1500 },
        { name: 'Niš', lat: 43.3209, lng: 21.8958, pricePerSqft: 1200 },
        { name: 'Kragujevac', lat: 44.0167, lng: 20.9167, pricePerSqft: 1100 }
    ],
    'Croatia': [
        { name: 'Zagreb', lat: 45.8150, lng: 15.9819, pricePerSqft: 3300 },
        { name: 'Split', lat: 43.5081, lng: 16.4402, pricePerSqft: 3500 },
        { name: 'Rijeka', lat: 45.3271, lng: 14.4422, pricePerSqft: 2200 },
        { name: 'Zadar', lat: 44.1194, lng: 15.2314, pricePerSqft: 2800 }
    ],
    'Bosnia and Herzegovina': [
        { name: 'Sarajevo', lat: 43.8563, lng: 18.4131, pricePerSqft: 2000 },
        { name: 'Banja Luka', lat: 44.7722, lng: 17.1910, pricePerSqft: 1300 },
        { name: 'Tuzla', lat: 44.5384, lng: 18.6763, pricePerSqft: 1100 },
        { name: 'Mostar', lat: 43.3438, lng: 17.8078, pricePerSqft: 1400 }
    ],
    'Slovenia': [
        { name: 'Ljubljana', lat: 46.0569, lng: 14.5058, pricePerSqft: 2800 },
        { name: 'Maribor', lat: 46.5547, lng: 15.6467, pricePerSqft: 2000 },
        { name: 'Celje', lat: 46.2309, lng: 15.2604, pricePerSqft: 1800 }
    ],
    'North Macedonia': [
        { name: 'Skopje', lat: 41.9981, lng: 21.4254, pricePerSqft: 2000 },
        { name: 'Bitola', lat: 41.0319, lng: 21.3347, pricePerSqft: 900 },
        { name: 'Kumanovo', lat: 42.1322, lng: 21.7144, pricePerSqft: 850 }
    ],
    'Montenegro': [
        { name: 'Podgorica', lat: 42.4304, lng: 19.2594, pricePerSqft: 2000 },
        { name: 'Budva', lat: 42.2911, lng: 18.8403, pricePerSqft: 3000 },
        { name: 'Herceg Novi', lat: 42.4533, lng: 18.5322, pricePerSqft: 2500 }
    ],
    'Albania': [
        { name: 'Tirana', lat: 41.3275, lng: 19.8187, pricePerSqft: 1625 },
        { name: 'Durrës', lat: 41.3245, lng: 19.4545, pricePerSqft: 1200 },
        { name: 'Vlorë', lat: 40.4667, lng: 19.4833, pricePerSqft: 1300 }
    ],
    'Bulgaria': [
        { name: 'Sofia', lat: 42.6977, lng: 23.3219, pricePerSqft: 1700 },
        { name: 'Plovdiv', lat: 42.1354, lng: 24.7453, pricePerSqft: 1400 },
        { name: 'Varna', lat: 43.2141, lng: 27.9147, pricePerSqft: 1500 }
    ],
    'Greece': [
        { name: 'Athens', lat: 37.9838, lng: 23.7275, pricePerSqft: 2500 },
        { name: 'Thessaloniki', lat: 40.6401, lng: 22.9444, pricePerSqft: 1800 },
        { name: 'Patras', lat: 38.2466, lng: 21.7346, pricePerSqft: 1600 }
    ]
};


export const dummyProperties: Property[] = [
  // Belgrade, Serbia
  {
    id: '1',
    price: 350000,
    address: 'Knez Mihailova 12',
    city: 'Belgrade',
    country: 'Serbia',
    beds: 3,
    baths: 2,
    sqft: 120,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41fa2242?q=80&w=1974&auto=format&fit=crop',
    images: [
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop', tag: 'living_room'},
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41fa2242?q=80&w=1974&auto=format&fit=crop', tag: 'bedroom'},
        { url: 'https://images.unsplash.com/photo-1556912173-3e74dd8c44b3?q=80&w=2070&auto=format&fit=crop', tag: 'kitchen'},
        { url: 'https://images.unsplash.com/photo-1576659531062-95a9752b8813?q=80&w=1974&auto=format&fit=crop', tag: 'bathroom'},
        { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop', tag: 'exterior'}
    ],
    lat: 44.816,
    lng: 20.459,
    description: "Discover urban living at its finest in this stunning 3-bedroom apartment located in the heart of Belgrade on Knez Mihailova.\n\n- Bathed in natural light with an open-concept living area.\n- Chef's kitchen with high-end appliances.\n- Private balcony with breathtaking city views.\n- Hardwood floors, custom cabinetry, and luxurious finishes throughout.",
    yearBuilt: 2018,
    parking: 1,
    specialFeatures: ["Heated Pool", "Rooftop Terrace", "Smart Home System", "City View"],
    materials: ["Reinforced Concrete", "Hardwood Flooring", "Marble Countertops"],
    seller: sellers['ana_kovacevic'],
    tourUrl: 'https://my.matterport.com/show/?m=u8t5v9o4p3K'
  },
  // Zagreb, Croatia
  {
    id: '2',
    price: 280000,
    address: 'Ilica 45',
    city: 'Zagreb',
    country: 'Croatia',
    beds: 2,
    baths: 1,
    sqft: 85,
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2070&auto=format&fit=crop', tag: 'living_room'}],
    lat: 45.813,
    lng: 15.975,
    description: "Charming 2-bedroom apartment in a historic building on Zagreb's famous Ilica street.",
    yearBuilt: 1930,
    parking: 0,
    specialFeatures: ["Historic Building", "City View"],
    materials: ["Brick", "Wood"],
    seller: sellers['marko_horvat']
  },
  // Sarajevo, Bosnia and Herzegovina
  {
    id: '3',
    price: 190000,
    address: 'Ferhadija 8',
    city: 'Sarajevo',
    country: 'Bosnia and Herzegovina',
    beds: 2,
    baths: 2,
    sqft: 95,
    imageUrl: 'https://images.unsplash.com/photo-1556912173-3e74dd8c44b3?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1556912173-3e74dd8c44b3?q=80&w=2070&auto=format&fit=crop', tag: 'kitchen'}],
    lat: 43.859,
    lng: 18.425,
    description: 'Spacious apartment in the vibrant heart of Sarajevo.',
    yearBuilt: 1980,
    parking: 1,
    specialFeatures: ["Balcony"],
    materials: ['Concrete'],
    seller: sellers['private_seller_1']
  },
  // Ljubljana, Slovenia
  {
    id: '4',
    price: 420000,
    address: 'Trg republike 3',
    city: 'Ljubljana',
    country: 'Slovenia',
    beds: 4,
    baths: 3,
    sqft: 150,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop', tag: 'exterior'}],
    lat: 46.051,
    lng: 14.503,
    description: 'Luxurious family home in a prime Ljubljana location.',
    yearBuilt: 2015,
    parking: 2,
    specialFeatures: ['Garden', 'Swimming Pool'],
    materials: ['Wood', 'Glass'],
    seller: sellers['marko_horvat']
  },
  // Skopje, North Macedonia
  {
    id: '5',
    price: 210000,
    address: 'Maksim Gorki 17',
    city: 'Skopje',
    country: 'North Macedonia',
    beds: 3,
    baths: 1,
    sqft: 105,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop', tag: 'exterior'}],
    lat: 41.996,
    lng: 21.432,
    description: 'Modern apartment in Skopje with ample living space.',
    yearBuilt: 2010,
    parking: 1,
    specialFeatures: ["Balcony"],
    materials: ['Concrete'],
    seller: sellers['ana_kovacevic']
  },
  // Podgorica, Montenegro
   {
    id: '6',
    price: 150000,
    address: 'Bulevar Svetog Petra Cetinjskog 55',
    city: 'Podgorica',
    country: 'Montenegro',
    beds: 2,
    baths: 1,
    sqft: 75,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop', tag: 'exterior'}],
    lat: 42.441,
    lng: 19.26,
    description: 'Cozy two-bedroom flat in the capital of Montenegro.',
    yearBuilt: 2005,
    parking: 1,
    specialFeatures: [],
    materials: ['Brick'],
    seller: sellers['private_seller_2']
  },
  // Novi Sad, Serbia
  {
    id: '7',
    price: 185000,
    address: 'Bulevar oslobođenja 78',
    city: 'Novi Sad',
    country: 'Serbia',
    beds: 2,
    baths: 1,
    sqft: 65,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1972&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1972&auto=format&fit=crop', tag: 'living_room'}],
    lat: 45.255,
    lng: 19.845,
    description: 'Bright and airy apartment in the heart of Novi Sad.',
    yearBuilt: 2012,
    parking: 1,
    specialFeatures: ['Balcony', 'City View'],
    materials: ['Reinforced Concrete'],
    seller: sellers['ana_kovacevic']
  },
  // Split, Croatia
  {
    id: '8',
    price: 450000,
    address: 'Riva 10',
    city: 'Split',
    country: 'Croatia',
    beds: 3,
    baths: 2,
    sqft: 110,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop', tag: 'exterior'}],
    lat: 43.508,
    lng: 16.440,
    description: 'Stunning villa with a sea view in beautiful Split.',
    yearBuilt: 2019,
    parking: 2,
    specialFeatures: ['Swimming Pool', 'Sea View', 'Garden'],
    materials: ['Stone', 'Glass'],
    seller: sellers['marko_horvat']
  },
  // Tirana, Albania
  {
    id: '9',
    price: 130000,
    address: 'Rruga Ibrahim Rugova 21',
    city: 'Tirana',
    country: 'Albania',
    beds: 2,
    baths: 1,
    sqft: 80,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop', tag: 'exterior'}],
    lat: 41.327,
    lng: 19.818,
    description: 'Comfortable apartment in a lively neighborhood of Tirana.',
    yearBuilt: 2008,
    parking: 1,
    specialFeatures: ['Balcony'],
    materials: ['Brick'],
    seller: sellers['private_seller_1']
  },
  // Sofia, Bulgaria
  {
    id: '10',
    price: 220000,
    address: 'Vitosha Boulevard 50',
    city: 'Sofia',
    country: 'Bulgaria',
    beds: 3,
    baths: 2,
    sqft: 130,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop', tag: 'living_room'}],
    lat: 42.697,
    lng: 23.321,
    description: 'Elegant apartment on the main pedestrian street in Sofia.',
    yearBuilt: 1995,
    parking: 0,
    specialFeatures: ['City View', 'Historic Building'],
    materials: ['Brick'],
    seller: sellers['marko_horvat']
  },
  // Thessaloniki, Greece
  {
    id: '11',
    price: 310000,
    address: 'Leoforos Nikis 15',
    city: 'Thessaloniki',
    country: 'Greece',
    beds: 2,
    baths: 2,
    sqft: 100,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto=format&fit=crop', tag: 'exterior'}],
    lat: 40.630,
    lng: 22.940,
    description: 'Modern apartment with a direct view of the Thermaic Gulf.',
    yearBuilt: 2017,
    parking: 1,
    specialFeatures: ['Sea View', 'Balcony'],
    materials: ['Concrete', 'Glass'],
    seller: sellers['marko_horvat']
  },
  // Banja Luka, Bosnia and Herzegovina
  {
    id: '12',
    price: 150000,
    address: 'Gospodska 5',
    city: 'Banja Luka',
    country: 'Bosnia and Herzegovina',
    beds: 3,
    baths: 1,
    sqft: 90,
    imageUrl: 'https://images.unsplash.com/photo-1631885440103-3006b2a3f6b7?q=80&w=2070&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1631885440103-3006b2a3f6b7?q=80&w=2070&auto=format&fit=crop', tag: 'kitchen'}],
    lat: 44.772,
    lng: 17.191,
    description: 'Well-maintained family apartment in Banja Luka center.',
    yearBuilt: 1988,
    parking: 1,
    specialFeatures: [],
    materials: ['Concrete'],
    seller: sellers['ana_kovacevic']
  },
  // Rijeka, Croatia
  {
    id: '13',
    price: 250000,
    address: 'Korzo 22',
    city: 'Rijeka',
    country: 'Croatia',
    beds: 2,
    baths: 1,
    sqft: 70,
    imageUrl: 'https://images.unsplash.com/photo-1595513824183-b69512f45c26?q=80&w=2062&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1595513824183-b69512f45c26?q=80&w=2062&auto=format&fit=crop', tag: 'exterior'}],
    lat: 45.327,
    lng: 14.442,
    description: 'Apartment on the main promenade of Rijeka with potential for renovation.',
    yearBuilt: 1950,
    parking: 0,
    specialFeatures: ['Sea View'],
    materials: ['Stone'],
    seller: sellers['marko_horvat']
  },
  // Niš, Serbia
  {
    id: '14',
    price: 95000,
    address: 'Obrenovićeva 30',
    city: 'Niš',
    country: 'Serbia',
    beds: 2,
    baths: 1,
    sqft: 55,
    imageUrl: 'https://images.unsplash.com/photo-1576659531062-95a9752b8813?q=80&w=1974&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1576659531062-95a9752b8813?q=80&w=1974&auto=format&fit=crop', tag: 'bathroom'}],
    lat: 43.320,
    lng: 21.895,
    description: 'Affordable and cozy apartment in the center of Niš.',
    yearBuilt: 1990,
    parking: 0,
    specialFeatures: [],
    materials: ['Brick'],
    seller: sellers['ana_kovacevic']
  },
  // Maribor, Slovenia
  {
    id: '15',
    price: 180000,
    address: 'Glavni trg 7',
    city: 'Maribor',
    country: 'Slovenia',
    beds: 3,
    baths: 1,
    sqft: 100,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1974&auto=format&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1974&auto=format&fit=crop', tag: 'exterior'}],
    lat: 46.557,
    lng: 15.646,
    description: 'Spacious flat overlooking the main square in Maribor.',
    yearBuilt: 1975,
    parking: 1,
    specialFeatures: ['City View'],
    materials: ['Concrete'],
    seller: sellers['marko_horvat']
  },
  // ... continue generating properties
];

// Function to generate a random property
const generateRandomProperty = (id: number): Property => {
    const allFeatures = ["Swimming Pool", "Garden", "Balcony", "Sea View", "City View", "Mountain View", "Fireplace", "Smart Home System", "Garage", "Rooftop Terrace"];
    const allMaterials = ["Brick", "Concrete", "Wood", "Glass", "Stone", "Steel"];
    const imagePool = [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618221195710-dd6b41fa2242?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1631885440103-3006b2a3f6b7?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1576659531062-95a9752b8813?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595513824183-b69512f45c26?q=80&w=2062&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1972&auto=format&fit=crop'
    ];
    
    const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    const allCities = Object.values(CITY_DATA).flat();
    const cityData = randomFromArray(allCities);
    const country = Object.keys(CITY_DATA).find(key => CITY_DATA[key].includes(cityData)) || 'Serbia';
    
    const sqft = Math.floor(Math.random() * 200) + 50; // 50 - 250 sqft
    const price = Math.round((cityData.pricePerSqft * sqft * (Math.random() * 0.4 + 0.8)) / 1000) * 1000; // variance and round to nearest 1000
    const beds = Math.floor(Math.random() * 5) + 1; // 1-5 beds
    const baths = Math.max(1, Math.floor(beds / 2) + (Math.random() > 0.5 ? 1 : 0));
    
    const numFeatures = Math.floor(Math.random() * 4); // 0-3 features
    const specialFeatures = Array.from({ length: numFeatures }, () => randomFromArray(allFeatures)).filter((v, i, a) => a.indexOf(v) === i);

    const numMaterials = Math.floor(Math.random() * 3) + 1; // 1-3 materials
    const materials = Array.from({ length: numMaterials }, () => randomFromArray(allMaterials)).filter((v, i, a) => a.indexOf(v) === i);
    
    const sellerKeys = Object.keys(sellers);
    const randomSellerKey = randomFromArray(sellerKeys);

    return {
        id: (id + 16).toString(),
        price,
        address: `${['Main Street', 'Park Avenue', 'Central Boulevard', 'River Road'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 100) + 1}`,
        city: cityData.name,
        country: country,
        beds,
        baths,
        sqft,
        imageUrl: randomFromArray(imagePool),
        images: [{ url: randomFromArray(imagePool), tag: 'exterior'}],
        lat: cityData.lat + (Math.random() - 0.5) * 0.1,
        lng: cityData.lng + (Math.random() - 0.5) * 0.1,
        description: `A lovely ${beds}-bedroom property located in the vibrant city of ${cityData.name}. Features a spacious living area of ${sqft} m².`,
        yearBuilt: Math.floor(Math.random() * 60) + 1960, // 1960 - 2020
        parking: Math.floor(Math.random() * 3), // 0-2 parking spots
        specialFeatures,
        materials,
        seller: sellers[randomSellerKey],
    };
};

// Generate 135 new random properties
const newProperties: Property[] = Array.from({ length: 135 }, (_, i) => generateRandomProperty(i));

dummyProperties.push(...newProperties);