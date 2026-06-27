export interface RoomNumberInfo {
  number: string;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance' | 'Blocked';
}

export interface Room {
  id: string;
  name: string;
  type: string; // 'deluxe' | 'suite' | 'standard' | 'family'
  price: number;
  capacity: { guests: number; beds: number };
  amenities: string[];
  images: string[];
  availableCount: number;
  sizeSqFt: number;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';
  roomNumbers: RoomNumberInfo[];
}

export interface Review {
  id: string;
  guestName: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  positivePoints?: string;
  negativePoints?: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  stars: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  amenities: string[];
  basePrice: number;
  tag?: string; // 'Best Seller' | 'Luxury Stay' | 'Free Cancellation' | 'Special Deal' | 'Member Choice' | 'Top Rated'
  rooms: Room[];
  reviews: Review[];
  featured?: boolean;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  guestDetails: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentMethod: string;
  status: 'Pending Approval' | 'Confirmed' | 'Room Assigned' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'Refunded';
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
  cgst?: number;
  sgst?: number;
  gstCompany?: string;
  gstin?: string;
  assignedRoomNumber?: string;
  qrCodeToken?: string;
}

export interface CityData {
  name: string;
  propertyCount: number;
  image: string;
  tier: 'Popular' | 'Tier 2';
  description: string;
}

// 1. Centralized Image Catalog Service
export const IMAGE_CATALOG = {
  exteriors: [
    'photo-1566073771259-6a8506099945', // Udaipur Palace
    'photo-1542314831-068cd1dbfeeb', // Luxury exterior
    'photo-1564507592333-c60657eea523', // Heritage Palace
    'photo-1540555700478-4be289fbecef', // Resort
    'photo-1571896349842-33c89424de2d', // Palace
    'photo-1520250497591-112f2f40a3f4', // Pool resort
    'photo-1584132967334-10e028bd69f7', // Tropical resort
    'photo-1524492412937-b28074a5d7da', // Agra Palace
    'photo-1445019980597-93fa8acb246c', // Sea front resort
    'photo-1551882547-ff40c63fe5fa'  // Luxury hotel
  ],
  lobbies: [
    'photo-1566665797739-1674de7a421a',
    'photo-1497366216548-37526070297c',
    'photo-1590490360182-c33d57733427',
    'photo-1582719478250-c89cae4dc85b',
    'photo-1578683010236-d716f9a3f461'
  ],
  pools: [
    'photo-1576013551627-0cc20b96c2a7',
    'photo-1560185007-c5ca9d2c014d',
    'photo-1512917774080-9991f1c4c750',
    'photo-1519167758481-83f550bb49b3',
    'photo-1473448912268-2022ce9509d8'
  ],
  restaurants: [
    'photo-1517248135467-4c7edcad34c4',
    'photo-1552566626-52f8b828add9',
    'photo-1414235077428-338989a2e8c0',
    'photo-1544025162-d76694265947',
    'photo-1550966871-3ed3cdb5ed0c'
  ],
  spas: [
    'photo-1515377905703-c4788e51af15',
    'photo-1540555700478-4be289fbecef',
    'photo-1600334089648-b0d9d3028eb2',
    'photo-1519699047748-de8e457a634e'
  ],
  gyms: [
    'photo-1534438327276-14e5300c3a48',
    'photo-1517838277536-f5f99be501cd',
    'photo-1541534741688-6078c6bfb5c5',
    'photo-1571731956622-7a72726b90f8'
  ],
  rooftops: [
    'photo-1533777857889-4be7c70b33f7',
    'photo-1572116469696-31de0f17cc34',
    'photo-1528605248644-14dd04022da1'
  ],
  bars: [
    'photo-1514362545857-3bc16c4c7d1b',
    'photo-1574096079513-d8259312b785',
    'photo-1470337458703-46ad1756a187'
  ],
  conferenceHalls: [
    'photo-1517245386807-bb43f82c33c4',
    'photo-1431540015161-0bf868a2d407',
    'photo-1540575467063-178a50c2df87'
  ],
  nightViews: [
    'photo-1542314831-068cd1dbfeeb',
    'photo-1571896349842-33c89424de2d',
    'photo-1506929562872-bb421503ef21'
  ],
  rooms: {
    deluxe: 'photo-1616594039964-ae9021a400a0',
    superior: 'photo-1618773928121-c32242e63f39',
    cityView: 'photo-1582719478250-c89cae4dc85b',
    lakeView: 'photo-1566073771259-6a8506099945',
    executiveSuite: 'photo-1590490360182-c33d57733427',
    royalSuite: 'photo-1578683010236-d716f9a3f461',
    presidentialSuite: 'photo-1584132915807-fd1f5fbc078f',
    luxuryVilla: 'photo-1613977257363-707ba9348227',
    poolVilla: 'photo-1512917774080-9991f1c4c750',
    heritageSuite: 'photo-1598928506311-c55ded91a20c'
  }
};

export const getCatalogImageUrl = (photoId: string, _sig: string = 'default') => {
  if (photoId.startsWith('/images/')) return photoId;
  
  // Check if it matches a room
  if (IMAGE_CATALOG.rooms.hasOwnProperty(photoId)) {
    return `/images/rooms/${photoId}.jpg`;
  }
  for (const [key, value] of Object.entries(IMAGE_CATALOG.rooms)) {
    if (value === photoId) return `/images/rooms/${key}.jpg`;
  }

  // Check if it matches an exterior
  const extIdx = IMAGE_CATALOG.exteriors.indexOf(photoId);
  if (extIdx !== -1) {
    return `/images/hotels/hotel-${extIdx % 12}.jpg`;
  }

  // Check if it matches lobby, pool, etc.
  const lobIdx = IMAGE_CATALOG.lobbies.indexOf(photoId);
  if (lobIdx !== -1) return `/images/hotels/hotel-${(lobIdx + 2) % 12}.jpg`;

  const poolIdx = IMAGE_CATALOG.pools.indexOf(photoId);
  if (poolIdx !== -1) return `/images/hotels/hotel-${(poolIdx + 4) % 12}.jpg`;

  const restIdx = IMAGE_CATALOG.restaurants.indexOf(photoId);
  if (restIdx !== -1) return `/images/hotels/hotel-${(restIdx + 6) % 12}.jpg`;

  return `/images/hotels/hotel-0.jpg`;
};

// Local placeholder fallbacks when Unsplash limits or fails
export const LOCAL_FALLBACK_IMAGE = '/images/hotels/hotel-0.jpg';

export const INITIAL_CITIES: CityData[] = [
  { name: 'Goa', propertyCount: 34, image: '/images/cities/goa.jpg', tier: 'Popular', description: 'Sun-kissed beaches, historic churches, and vibrant local shacks.' },
  { name: 'Udaipur', propertyCount: 18, image: '/images/cities/udaipur.jpg', tier: 'Popular', description: 'Majestic lake palaces, traditional Mewari art, and royal heritage.' },
  { name: 'Jaipur', propertyCount: 25, image: '/images/cities/jaipur.jpg', tier: 'Popular', description: 'The Pink City, showing royal astronomy observatories and grand hill forts.' },
  { name: 'Manali', propertyCount: 16, image: '/images/cities/manali.jpg', tier: 'Popular', description: 'Snow-capped peaks, skiing retreats, and cozy wooden mountain log cabins.' },
  { name: 'Pondicherry', propertyCount: 15, image: '/images/cities/pondicherry.jpg', tier: 'Popular', description: 'Quaint French architecture, spiritual communes, and quiet beaches.' },
  { name: 'Chennai', propertyCount: 22, image: '/images/cities/chennai.jpg', tier: 'Popular', description: 'Gateway to Southern culture, classical music heritage, and beaches.' },
  { name: 'Bangalore', propertyCount: 28, image: '/images/cities/bangalore.jpg', tier: 'Popular', description: 'The silicon valley hub featuring lush green gardens and microbreweries.' },
  { name: 'Hyderabad', propertyCount: 26, image: '/images/cities/hyderabad.jpg', tier: 'Popular', description: 'The city of pearls, tech parks, and traditional Nizami cuisine.' },
  { name: 'Kochi', propertyCount: 20, image: '/images/cities/kochi.jpg', tier: 'Popular', description: 'Historic spice port city, giant Chinese fishing nets, and backwater lagoons.' },
  { name: 'Ooty', propertyCount: 12, image: '/images/cities/ooty.jpg', tier: 'Popular', description: 'Lush tea plantations, toy trains, and serene mist-covered hills.' },
  { name: 'Kodaikanal', propertyCount: 11, image: '/images/cities/kodaikanal.jpg', tier: 'Tier 2', description: 'Scenic granite cliffs, clean forested valleys, and cool star-shaped lakes.' },
  { name: 'Mysore', propertyCount: 14, image: '/images/cities/mysore.jpg', tier: 'Tier 2', description: 'Heritage sandalwood, silk sarees, and majestic royal palaces.' },
  { name: 'Mumbai', propertyCount: 45, image: '/images/cities/mumbai.jpg', tier: 'Popular', description: 'Indias bustling financial center overlooking the Arabian Sea.' },
  { name: 'Delhi', propertyCount: 39, image: '/images/cities/delhi.jpg', tier: 'Popular', description: 'Historic capital representing ancient empires and political power.' },
  { name: 'Pune', propertyCount: 16, image: '/images/cities/pune.jpg', tier: 'Popular', description: 'Cultural capital of Maharashtra, blending IT industry with Peshwa heritage.' },
  { name: 'Coimbatore', propertyCount: 9, image: '/images/cities/coimbatore.jpg', tier: 'Tier 2', description: 'Cotton industry center set beside the Western Ghats range.' },
  { name: 'Vellore', propertyCount: 6, image: '/images/cities/vellore.jpg', tier: 'Tier 2', description: 'Historic fort city and a key medical and academic hub.' },
  { name: 'Madurai', propertyCount: 8, image: '/images/cities/madurai.jpg', tier: 'Tier 2', description: 'The temple city, built around the historic multi-tiered Meenakshi temple complex.' },
  { name: 'Salem', propertyCount: 5, image: '/images/cities/salem.jpg', tier: 'Tier 2', description: 'Steel and mango hub set in a circular valley of scenic green hills.' },
  { name: 'Tirupati', propertyCount: 14, image: '/images/cities/tirupati.jpg', tier: 'Tier 2', description: 'The sacred hill destination, home of Tirumala Venkateswara temple.' },
  { name: 'Vizag', propertyCount: 12, image: '/images/cities/vizag.jpg', tier: 'Tier 2', description: 'The port city of Andhra Pradesh, overlooking sandy beaches and green bays.' }
];

const CITY_HOTELS_MAP: Record<string, string[]> = {
  'Chennai': [
    'ITC Grand Chola', 'Taj Club House', 'The Leela Palace', 'Hyatt Regency',
    'Radisson Blu', 'Novotel Chennai', 'Holiday Inn', 'Park Hyatt', 'Ramada Plaza', 'Vivanta Chennai'
  ],
  'Bangalore': [
    'Taj West End', 'The Leela Palace', 'ITC Gardenia', 'JW Marriott',
    'Shangri-La', 'Radisson Blu', 'Hyatt Centric', 'Vivanta Bengaluru', 'Hilton Embassy', 'Royal Orchid'
  ],
  'Hyderabad': [
    'Taj Falaknuma Palace', 'ITC Kohenur', 'The Westin Mindspace', 'Park Hyatt',
    'Trident Hyderabad', 'Sheraton Hyderabad', 'Novotel Hitec City', 'Taj Krishna', 'Hyatt Regency', 'Radisson Blu Plaza'
  ],
  'Mumbai': [
    'Taj Lands End', 'The Taj Mahal Palace', 'The Oberoi Mumbai', 'JW Marriott Juhu',
    'Trident Nariman Point', 'St. Regis Mumbai', 'Sofitel BKC', 'Grand Hyatt Mumbai', 'The Leela Mumbai', 'Vivanta President'
  ],
  'Delhi': [
    'The Leela Palace', 'Taj Mahal Hotel', 'The Lodhi', 'The Imperial',
    'Shangri-La Eros', 'JW Marriott Aerocity', 'Hyatt Regency', 'Andaz Delhi', 'The Claridges', 'Radisson Blu Plaza'
  ],
  'Pune': [
    'JW Marriott Pune', 'Hyatt Regency', 'Conrad Pune', 'Sheraton Grand',
    'Ritz-Carlton Pune', 'DoubleTree by Hilton', 'Novotel Pune', 'Radisson Blu', 'Vivanta Pune', 'Orchid Hotel'
  ],
  'Goa': [
    'Taj Exotica Resort', 'W Goa', 'Alila Diwa Goa', 'Grand Hyatt Goa',
    'The Leela Goa', 'Caravela Beach Resort', 'Cidade de Goa', 'Kenilworth Resort', 'Novotel Goa', 'Radisson Blu Resort'
  ],
  'Kochi': [
    'Brunton Boatyard', 'Grand Hyatt Bolgatty', 'Kochi Marriott', 'Taj Malabar Resort',
    'Forte Kochi', 'Le Meridien Kochi', 'Fragrant Nature', 'Ramada Resort', 'Radisson Blu Kochi', 'Trident Kochi'
  ],
  'Jaipur': [
    'Rambagh Palace', 'Taj Jai Mahal Palace', 'The Oberoi Rajvilas', 'ITC Rajputana',
    'Fairmont Jaipur', 'Le Meridien Jaipur', 'Marriott Jaipur', 'Radisson Blu Jaipur', 'Hilton Jaipur', 'Alsisar Haveli'
  ],
  'Udaipur': [
    'The Leela Palace Udaipur', 'Taj Lake Palace', 'The Oberoi Udaivilas', 'Taj Aravali Resort',
    'Aurika Udaipur', 'Raffles Udaipur', 'Trident Udaipur', 'Jagmandir Island Palace', 'Mewargarh Palace', 'Radisson Blu Udaipur'
  ],
  'Pondicherry': [
    'Promenade Beach Resort', 'Palais de Mahé', 'La Villa', 'Windflower Resort',
    'Shenbaga Hotel', 'Ocean Spray', 'Accord Puducherry', 'Le Dupleix', 'Villa Shanti', 'Radisson Resort'
  ],
  'Coimbatore': [
    'Radisson Blu', 'Welcomhotel Coimbatore', 'Vivanta Coimbatore', 'The Residency Towers',
    'Le Meridien Coimbatore', 'Fairfield by Marriott', 'Hash Six Hotels', 'Aloft Coimbatore', 'Zone by The Park', 'Ibis Coimbatore'
  ],
  'Vellore': [
    'Fortune Park Vellore', 'Regency Sameera', 'Hotel Benz Park', 'Darling Residency',
    'Khanna Fiesta', 'Hotel SMS Grand', 'Poppys Anukula Residency', 'AR Residency', 'Quality Inn', 'Grand Estancia'
  ],
  'Madurai': [
    'Heritage Madurai', 'Courtyard by Marriott', 'The Gateway Hotel Pasumalai', 'Fortune Pandiyan',
    'JC Residency', 'Hotel Sangam', 'Madurai Residency', 'Poppys Hotel', 'Astoria Hotels', 'Hotel Supreme'
  ],
  'Salem': [
    'Radisson Salem', 'Grand Estancia', 'Hotel Sivaraj Inn', 'CJ Pallazio',
    'Zibe Salem', 'Hotel LRN Excellency', 'Hotel Selvam', 'Golden Palace', 'Park Plaza', 'Hotel Windsor Castle'
  ],
  'Tirupati': [
    'Marasa Sarovar Premiere', 'Taj Tirupati', 'Fortune Select Grand Ridge', 'Fortune Select Ridge',
    'Ramee Guestline', 'FabHotel Tirupati', 'Hotel Bliss', 'Minerva Grand', 'Aditya Homestay', 'Golden Tulip'
  ],
  'Vizag': [
    'The Gateway Hotel', 'Novotel Varun Beach', 'The Park Vizag', 'Welcomhotel Devee Grand Bay',
    'Radisson Blu Resort', 'Dolphin Hotel', 'Fairfield by Marriott', 'Four Points by Sheraton', 'Keys Select', 'Hotel Green Park'
  ],
  'Mysore': [
    'Grand Mercure', 'Radisson Blu Plaza', 'Royal Orchid Metropole', 'Fortune JP Palace',
    'Windflower Resort & Spa', 'The Southern Star', 'Hotel Mysore Palace', 'Silent Shores Resort', 'Lalitha Mahal Palace', 'Hotel Golden Landmark'
  ],
  'Manali': [
    'Span Resort & Spa', 'The Solang Valley Resort', 'Manu Allaya Resort', 'Whispering Inn',
    'Apple Country Resorts', 'Solang Ski Resort', 'The Himalayan', 'Manuallaya', 'Shivadya Resort', 'Larisa Resort'
  ],
  'Ooty': [
    'Savoy IHCL SeleQtions', 'Welcomheritage Savoy', 'Glyngarth Resorts', 'Sherlock Hotel',
    'Sinclairs Retreat', 'Destiny The Farmstay', 'Accord Highland', 'Kurumba Village Resort', 'Sterling Ooty Elk Hill', 'Fern Hill'
  ],
  'Kodaikanal': [
    'The Tamara Kodaikanal', 'Carlton Hotel', 'Sterling Kodaikanal Valley', 'Kodai Resort',
    'Le Poshe by Sparsa', 'Villa Retreat', 'Lillys Valley Resort', 'Hill Country Resort', 'Kodai By The Lake', 'Elephant Valley'
  ]
};

// Generates structural reviews
const generateReviews = (hotelId: string): Review[] => [
  {
    id: `${hotelId}-rev1`,
    guestName: 'Anjali Sharma',
    rating: 5,
    date: '2026-05-10',
    comment: 'An absolutely breathtaking stay! The service was impeccably polished, matching the highest standards of luxury travel. The signature restaurant served authentic flavors that left a lasting impression.',
    positivePoints: 'Exceptional hospitality, panoramic rooms, superb dining options.',
    negativePoints: 'Advance bookings are essential since rooms occupy quickly.'
  },
  {
    id: `${hotelId}-rev2`,
    guestName: 'Vikram Malhotra',
    rating: 4.6,
    date: '2026-06-02',
    comment: 'Wonderful property. Checked in for our family summer anniversary. The landscape design, swimming pool hygiene, and dedicated staff concierge are worth writing home about.',
    positivePoints: 'Swimming pools, landscaping, concierge support.',
    negativePoints: 'Slight traffic delays during checkout hours.'
  }
];

// Generates 10 concrete room categories per hotel
const generateRoomCategories = (hotelId: string, cityMultiplier: number): Room[] => {
  const categories = [
    { name: 'Deluxe Room', type: 'deluxe', priceRange: [4500, 6000], guests: 2, beds: 1, size: 380, image: IMAGE_CATALOG.rooms.deluxe, roomNos: ['101', '102', '103', '104', '105'] },
    { name: 'Superior Room', type: 'standard', priceRange: [6000, 8000], guests: 3, beds: 2, size: 450, image: IMAGE_CATALOG.rooms.superior, roomNos: ['151', '152', '153', '154', '155'] },
    { name: 'Premium City View', type: 'standard', priceRange: [8000, 11000], guests: 2, beds: 1, size: 480, image: IMAGE_CATALOG.rooms.cityView, roomNos: ['201', '202', '203', '204'] },
    { name: 'Premium Lake View', type: 'deluxe', priceRange: [10000, 14000], guests: 2, beds: 1, size: 520, image: IMAGE_CATALOG.rooms.lakeView, roomNos: ['301', '302', '303', '304'] },
    { name: 'Executive Suite', type: 'suite', priceRange: [15000, 20000], guests: 3, beds: 2, size: 780, image: IMAGE_CATALOG.rooms.executiveSuite, roomNos: ['401', '402', '403'] },
    { name: 'Royal Suite', type: 'suite', priceRange: [25000, 35000], guests: 4, beds: 2, size: 1100, image: IMAGE_CATALOG.rooms.royalSuite, roomNos: ['501', '502'] },
    { name: 'Presidential Suite', type: 'suite', priceRange: [45000, 75000], guests: 4, beds: 2, size: 1800, image: IMAGE_CATALOG.rooms.presidentialSuite, roomNos: ['601'] },
    { name: 'Luxury Villa', type: 'family', priceRange: [60000, 110000], guests: 4, beds: 2, size: 2200, image: IMAGE_CATALOG.rooms.luxuryVilla, roomNos: ['V01', 'V02'] },
    { name: 'Private Pool Villa', type: 'family', priceRange: [80000, 180000], guests: 6, beds: 3, size: 2800, image: IMAGE_CATALOG.rooms.poolVilla, roomNos: ['P01', 'P02'] },
    { name: 'Heritage Palace Suite', type: 'suite', priceRange: [120000, 350000], guests: 4, beds: 2, size: 3200, image: IMAGE_CATALOG.rooms.heritageSuite, roomNos: ['H01', 'H02'] }
  ];

  return categories.map((cat, idx) => {
    // Generate pricing matching ranges and multipliers
    const rawPrice = cat.priceRange[0] + (idx * 250);
    const price = Math.round(rawPrice * cityMultiplier);

    // Initial operational room statuses
    const roomNumbers = cat.roomNos.map((no, rIdx) => {
      // Simulate live rooms: make a few occupied, cleaning, or available
      let status: RoomNumberInfo['status'] = 'Available';
      if (rIdx === 0 && idx % 3 === 0) status = 'Occupied';
      else if (rIdx === 1 && idx % 4 === 0) status = 'Cleaning';
      else if (rIdx === 2 && idx % 5 === 0) status = 'Maintenance';

      return { number: no, status };
    });

    const availableCount = roomNumbers.filter(rn => rn.status === 'Available').length;

    return {
      id: `${hotelId}-r${idx + 1}`,
      name: cat.name,
      type: cat.type,
      price,
      capacity: { guests: cat.guests, beds: cat.beds },
      amenities: ['Individually Controlled AC', 'Smart TV with Streaming', 'Plush Robes & Linens', 'Fully Stocked Minibar', 'Espresso Machine', 'High-speed Wi-Fi'],
      images: [getCatalogImageUrl(cat.image, `${hotelId}_r${idx}`)],
      availableCount,
      sizeSqFt: cat.size,
      status: availableCount > 0 ? 'Available' as const : 'Occupied' as const,
      roomNumbers
    };
  });
};

// Generates 12 unique gallery images per hotel
const generateHotelGallery = (hotelId: string): string[] => {
  const baseCategories = [
    IMAGE_CATALOG.exteriors[0],
    IMAGE_CATALOG.lobbies[0],
    IMAGE_CATALOG.pools[0],
    IMAGE_CATALOG.restaurants[0],
    IMAGE_CATALOG.spas[0],
    IMAGE_CATALOG.gyms[0],
    IMAGE_CATALOG.rooftops[0],
    IMAGE_CATALOG.bars[0],
    IMAGE_CATALOG.conferenceHalls[0],
    IMAGE_CATALOG.nightViews[0],
    IMAGE_CATALOG.exteriors[1],
    IMAGE_CATALOG.lobbies[1]
  ];

  return baseCategories.map((photoId, idx) => 
    getCatalogImageUrl(photoId, `${hotelId}_gal${idx}`)
  );
};

// Main dynamic generator building exactly 10 hotels for each of the 20 cities
const generateHotels = (): Hotel[] => {
  const list: Hotel[] = [];
  const cities = Object.keys(CITY_HOTELS_MAP);
  
  // Rate multipliers based on city tier and demand profiles
  const cityMultipliers: Record<string, number> = {
    'Goa': 1.6, 'Udaipur': 1.8, 'Jaipur': 1.5, 'Ooty': 1.4, 'Kodaikanal': 1.4,
    'Mumbai': 1.3, 'Delhi': 1.2, 'Bangalore': 1.2, 'Kochi': 1.3, 'Mysore': 1.1,
    'Pondicherry': 1.2
  };

  cities.forEach((cityName) => {
    const hotelNames = CITY_HOTELS_MAP[cityName];
    const multiplier = cityMultipliers[cityName] || 1.0;

    hotelNames.forEach((hotelName, idx) => {
      const hotelId = `h_${cityName.toLowerCase()}_${idx}`;
      const rooms = generateRoomCategories(hotelId, multiplier);
      const basePrice = rooms[0].price;

      // Premium visual tags
      const tags: Hotel['tag'][] = ['Best Seller', 'Luxury Stay', 'Free Cancellation', 'Special Deal', 'Member Choice', 'Top Rated'];
      const tag = tags[idx % tags.length];

      list.push({
        id: hotelId,
        name: hotelName,
        city: cityName,
        country: 'India',
        address: `${100 + idx * 8} Heritage Circle, Near City Center, ${cityName}, India`,
        stars: idx % 3 === 0 ? 5 : 4,
        rating: Number((4.3 + (idx % 7) * 0.1).toFixed(1)),
        reviewCount: 80 + idx * 42,
        description: `Welcome to ${hotelName}, an oasis of luxury and comfort in the heart of ${cityName}. Boasting premium rooms, infinity pools, royal spas, and curated fine dining options, our property provides a gateway to exploring the scenic sights and local heritage trails of the city.`,
        images: generateHotelGallery(hotelId),
        amenities: ['Valet Parking', 'Infinity Pool', 'Spa Wellness Center', 'Fitness Gym', 'Multi-cuisine Restaurant', 'Airport Shuttle Service', '24h Room Service', 'Free Wi-Fi'],
        basePrice,
        tag,
        rooms,
        reviews: generateReviews(hotelId),
        featured: idx === 0 || idx === 1 // First two hotels of each city are featured
      });
    });
  });

  return list;
};

// Pre-generate hotel array
export const INITIAL_HOTELS: Hotel[] = generateHotels();

// Pre-define 3 initial simulated bookings that sync to the new hotels
export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'STS-2026-00125',
    hotelId: 'h_mumbai_0', // Taj Lands End Mumbai
    hotelName: 'Taj Lands End',
    hotelImage: getCatalogImageUrl(IMAGE_CATALOG.exteriors[1], 'h_mumbai_0'),
    roomId: 'h_mumbai_0-r4', // Premium Lake View (Index 4)
    roomName: 'Premium Lake View',
    checkIn: '2026-06-15',
    checkOut: '2026-06-20',
    guests: 2,
    rooms: 1,
    totalPrice: 96000,
    guestDetails: {
      fullName: 'Rohan Mehta',
      email: 'rohan@example.com',
      phone: '+91 99999-00125',
      specialRequests: 'High floor, sea view preferred.'
    },
    paymentMethod: 'Credit Card (Visa ending in 4242)',
    status: 'Confirmed',
    createdAt: '2026-06-05T10:14:00Z',
    assignedRoomNumber: '302',
    qrCodeToken: 'STS-QR-MUMBAI-00125'
  },
  {
    id: 'STS-2026-00438',
    hotelId: 'h_udaipur_0', // The Leela Palace Udaipur
    hotelName: 'The Leela Palace Udaipur',
    hotelImage: getCatalogImageUrl(IMAGE_CATALOG.exteriors[0], 'h_udaipur_0'),
    roomId: 'h_udaipur_0-r6', // Royal Suite (Index 6)
    roomName: 'Royal Suite',
    checkIn: '2026-06-09',
    checkOut: '2026-06-12',
    guests: 2,
    rooms: 1,
    totalPrice: 198000,
    guestDetails: {
      fullName: 'Sarah Jenkins',
      email: 'sarah@example.com',
      phone: '+91 98765-43210'
    },
    paymentMethod: 'UPI (PhonePe)',
    status: 'Checked-In',
    createdAt: '2026-06-01T08:12:00Z',
    assignedRoomNumber: '501',
    qrCodeToken: 'STS-QR-UDAIPUR-00438'
  },
  {
    id: 'STS-2026-00982',
    hotelId: 'h_ooty_0', // Savoy IHCL SeleQtions Ooty
    hotelName: 'Savoy IHCL SeleQtions',
    hotelImage: getCatalogImageUrl(IMAGE_CATALOG.exteriors[3], 'h_ooty_0'),
    roomId: 'h_ooty_0-r1', // Deluxe Room (Index 1)
    roomName: 'Deluxe Room',
    checkIn: '2026-05-10',
    checkOut: '2026-05-13',
    guests: 3,
    rooms: 1,
    totalPrice: 38000,
    guestDetails: {
      fullName: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+91 99999-01999'
    },
    paymentMethod: 'UPI (Paytm)',
    status: 'Checked-Out',
    createdAt: '2026-05-01T15:20:00Z',
    assignedRoomNumber: '104',
    qrCodeToken: 'STS-QR-OOTY-00982'
  }
];
