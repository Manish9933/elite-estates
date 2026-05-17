export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  rating: number;
  images: string[];
  type: string;
  description?: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  amenities?: string[];
  agent?: {
    name: string;
    image: string;
    phone: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  role: string;
  image: string;
  stats: {
    saved: number;
    viewings: number;
    offers: number;
  };
}

export const CATEGORIES: Category[] = [
  { id: 'trending', name: 'Trending', icon: '🔥' },
  { id: '1', name: 'Apartments', icon: '🏢' },
  { id: '2', name: 'Villas', icon: '🏡' },
  { id: '3', name: 'Penthouses', icon: '🏙️' },
  { id: '4', name: 'Estates', icon: '🏰' },
  { id: '5', name: 'Lofts', icon: '🏭' },
];

export const PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Skyline Penthouse',
    price: '$2,500,000',
    location: 'Manhattan, NY',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Penthouse',
    description: 'A luxurious penthouse with breathtaking views of the Manhattan skyline. Features floor-to-ceiling windows, a private elevator, and a 2,000 sqft terrace.',
    beds: 4,
    baths: 4.5,
    sqft: '4,200',
    amenities: ['Private Elevator', 'Wine Cellar', '24/7 Concierge', 'Roof Terrace'],
    agent: {
      name: 'Sarah Jenkins',
      image: 'https://i.pravatar.cc/150?u=sarah',
      phone: '+1 212 555 0198'
    }
  },
  {
    id: '2',
    title: 'Emerald Valley Villa',
    price: '$1,800,000',
    location: 'Beverly Hills, CA',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'A modern masterpiece nestled in the lush Emerald Valley. This villa offers complete privacy and seamless indoor-outdoor living.',
    beds: 5,
    baths: 6,
    sqft: '5,800',
    amenities: ['Infinity Pool', 'Home Theater', 'Smart Home System', 'Guest House'],
    agent: {
      name: 'Michael Chen',
      image: 'https://i.pravatar.cc/150?u=michael',
      phone: '+1 310 555 0124'
    }
  },
  {
    id: '3',
    title: 'Modern Loft',
    price: '$950,000',
    location: 'Brooklyn, NY',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Apartment',
    description: 'Industrial-chic loft in the heart of DUMBO. High ceilings, exposed brick, and original timber beams.',
    beds: 2,
    baths: 2,
    sqft: '1,500',
    amenities: ['Exposed Brick', 'Gym', 'Pet Friendly', 'Storage'],
    agent: {
      name: 'Jessica Lee',
      image: 'https://i.pravatar.cc/150?u=jessica',
      phone: '+1 718 555 0147'
    }
  },
  {
    id: '4',
    title: 'Azure Coast Mansion',
    price: '$5,200,000',
    location: 'Malibu, CA',
    rating: 5.0,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    ],
    type: 'Estate',
    description: 'Stunning oceanfront estate with private beach access. Architecturally significant design with multiple entertainment decks.',
    beds: 6,
    baths: 8,
    sqft: '8,500',
    amenities: ['Private Beach', 'Chef\'s Kitchen', 'Gym', 'Spa'],
    agent: {
      name: 'David Vane',
      image: 'https://i.pravatar.cc/150?u=david',
      phone: '+1 424 555 0163'
    }
  },
  {
    id: '5',
    title: 'The Glass House',
    price: '$3,750,000',
    location: 'Aspen, CO',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1449156001935-d25a43063688?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Modern alpine retreat with stunning mountain views.',
    beds: 4,
    baths: 4,
    sqft: '3,800',
    amenities: ['Ski-in/Ski-out', 'Heated Floors', 'Hot Tub'],
    agent: { name: 'Emma Wilson', image: 'https://i.pravatar.cc/150?u=emma', phone: '+1 970 555 0112' }
  },
  {
    id: '6',
    title: 'Regency Square Flat',
    price: '£1,250,000',
    location: 'London, UK',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Apartment',
    description: 'Elegant Victorian flat in the heart of Kensington.',
    beds: 3,
    baths: 2,
    sqft: '1,800',
    amenities: ['High Ceilings', 'Period Features', 'Garden Access'],
    agent: { name: 'Robert Black', image: 'https://i.pravatar.cc/150?u=robert', phone: '+44 20 7946 0123' }
  },
  {
    id: '7',
    title: 'Zen Sanctuary',
    price: '¥280,000,000',
    location: 'Kyoto, JP',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503174971373-b1f69850bbd5?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Estate',
    description: 'Traditional Ryokan-style estate with private Zen gardens.',
    beds: 4,
    baths: 3,
    sqft: '3,500',
    amenities: ['Tea Room', 'Onsen Bath', 'Zen Garden'],
    agent: { name: 'Kenji Sato', image: 'https://i.pravatar.cc/150?u=kenji', phone: '+81 75 555 0199' }
  },
  {
    id: '8',
    title: 'Haussmann Elegance',
    price: '€2,100,000',
    location: 'Paris, FR',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493397212122-2b85def82824?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Penthouse',
    description: 'Classic Haussmann-style apartment overlooking the Eiffel Tower.',
    beds: 3,
    baths: 3,
    sqft: '2,200',
    amenities: ['Balcony', 'Fireplace', 'Wine Cellar'],
    agent: { name: 'Marie Dubois', image: 'https://i.pravatar.cc/150?u=marie', phone: '+33 1 42 68 55 55' }
  },
  {
    id: '9',
    title: 'Ocean Breeze Villa',
    price: '$4,100,000',
    location: 'Santorini, GR',
    rating: 5.0,
    images: [
      'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Stunning white-washed villa with panoramic caldera views.',
    beds: 3,
    baths: 3,
    sqft: '2,500',
    amenities: ['Infinity Pool', 'Sunset Terrace', 'Cave Bedroom'],
    agent: { name: 'Nikos Pappas', image: 'https://i.pravatar.cc/150?u=nikos', phone: '+30 22860 12345' }
  },
  {
    id: '10',
    title: 'Desert Mirage',
    price: '$2,900,000',
    location: 'Dubai, UAE',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518602164578-cd0074744b55?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Estate',
    description: 'Ultra-modern villa on Palm Jumeirah with private beach.',
    beds: 5,
    baths: 6,
    sqft: '6,200',
    amenities: ['Private Beach', 'Cinema Room', 'Elevator'],
    agent: { name: 'Ahmed Khan', image: 'https://i.pravatar.cc/150?u=ahmed', phone: '+971 4 555 0100' }
  },
  {
    id: '11',
    title: 'Bondi Beach Loft',
    price: '$1,650,000',
    location: 'Sydney, AU',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Loft',
    description: 'Sun-drenched loft just steps from Bondi Beach.',
    beds: 2,
    baths: 2,
    sqft: '1,400',
    amenities: ['Surfboard Storage', 'Rooftop BBQ', 'Ocean View'],
    agent: { name: 'Liam Foster', image: 'https://i.pravatar.cc/150?u=liam', phone: '+61 2 5555 0122' }
  },
  {
    id: '12',
    title: 'The Industrialist',
    price: '$850,000',
    location: 'Berlin, DE',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1554230505-919a13968970?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554230505-d19f03816507?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Loft',
    description: 'Former warehouse converted into a massive art-filled loft.',
    beds: 1,
    baths: 1.5,
    sqft: '1,200',
    amenities: ['High Ceilings', 'Studio Space', 'Original Brick'],
    agent: { name: 'Hans Mueller', image: 'https://i.pravatar.cc/150?u=hans', phone: '+49 30 555 0111' }
  },
  {
    id: '13',
    title: 'Vila Madalena Studio',
    price: 'R$ 750.000',
    location: 'São Paulo, BR',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1536376074432-8d64059671ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536376111597-0c975f448417?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Apartment',
    description: 'Chic studio in the artistic heart of São Paulo.',
    beds: 1,
    baths: 1,
    sqft: '650',
    amenities: ['Pool', 'Gym', 'Gourmet Balcony'],
    agent: { name: 'Julia Silva', image: 'https://i.pravatar.cc/150?u=julia', phone: '+55 11 5555 0188' }
  },
  {
    id: '14',
    title: 'The Redwood Retreat',
    price: '$1,950,000',
    location: 'Portland, OR',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1449156001935-d25a43063688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Eco-friendly modern home hidden in the forest.',
    beds: 3,
    baths: 2.5,
    sqft: '2,800',
    amenities: ['Solar Panels', 'Rainwater Collection', 'Forest Trails'],
    agent: { name: 'Chloe Reed', image: 'https://i.pravatar.cc/150?u=chloe', phone: '+1 503 555 0144' }
  },
  {
    id: '15',
    title: 'City Lights Flat',
    price: '$1,100,000',
    location: 'Chicago, IL',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1464146072230-91cabc968276?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Apartment',
    description: 'Modern flat in the Loop with stunning skyscraper views.',
    beds: 2,
    baths: 2,
    sqft: '1,600',
    amenities: ['24/7 Security', 'Indoor Pool', 'Sky Lounge'],
    agent: { name: 'Mark Thompson', image: 'https://i.pravatar.cc/150?u=mark', phone: '+1 312 555 0155' }
  },
  {
    id: '16',
    title: 'The Vineyard Estate',
    price: '$6,500,000',
    location: 'Napa Valley, CA',
    rating: 5.0,
    images: [
      'https://images.unsplash.com/photo-1505916349660-8d91ad99c3e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Estate',
    description: 'Grand estate surrounded by private rolling vineyards.',
    beds: 7,
    baths: 9,
    sqft: '10,500',
    amenities: ['Wine Cellar', 'Tasting Room', 'Tennis Court'],
    agent: { name: 'Sophia Loren', image: 'https://i.pravatar.cc/150?u=sophia', phone: '+1 707 555 0177' }
  },
  {
    id: '17',
    title: 'Sky Garden Condo',
    price: '$1,350,000',
    location: 'Singapore',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1512914890251-2f96a9b0925b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Penthouse',
    description: 'Futuristic condo with a private lush sky garden.',
    beds: 3,
    baths: 3,
    sqft: '2,100',
    amenities: ['Sky Garden', 'Smart Home', 'Infinity Pool'],
    agent: { name: 'Tan Wei', image: 'https://i.pravatar.cc/150?u=tan', phone: '+65 6555 0199' }
  },
  {
    id: '18',
    title: 'The Alpine Chalet',
    price: 'CHF 4,500,000',
    location: 'Zermatt, CH',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Ultra-luxurious chalet with Matterhorn views.',
    beds: 4,
    baths: 5,
    sqft: '3,200',
    amenities: ['Sauna', 'Ski Storage', 'Heated Balcony'],
    agent: { name: 'Lukas Meyer', image: 'https://i.pravatar.cc/150?u=lukas', phone: '+41 27 555 0188' }
  },
  {
    id: '19',
    title: 'Cape Town Modern',
    price: 'R 22,000,000',
    location: 'Cape Town, SA',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11f9ad6b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Sleek architectural home at the foot of Table Mountain.',
    beds: 4,
    baths: 4,
    sqft: '4,000',
    amenities: ['Pool', 'Ocean View', 'Mountain View'],
    agent: { name: 'Zoe Malan', image: 'https://i.pravatar.cc/150?u=zoe', phone: '+27 21 555 0122' }
  },
  {
    id: '20',
    title: 'Tulum Jungle Eco-Villa',
    price: '$790,000',
    location: 'Tulum, MX',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512914890251-2f96a9b0925b?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Villa',
    description: 'Eco-conscious design immersed in the Mayan jungle.',
    beds: 2,
    baths: 2,
    sqft: '1,200',
    amenities: ['Eco-pool', 'Solar Power', 'Rooftop Deck'],
    agent: { name: 'Elena Gomez', image: 'https://i.pravatar.cc/150?u=elena', phone: '+52 984 555 0133' }
  },
  {
    id: '21',
    title: 'Hong Kong Sky High',
    price: 'HK$ 45,000,000',
    location: 'The Peak, HK',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80',
    ],
    type: 'Apartment',
    description: 'Ultra-exclusive residence at The Peak with harbor views.',
    beds: 3,
    baths: 3,
    sqft: '2,400',
    amenities: ['Victoria Harbor View', 'Private Gym', 'Pool'],
    agent: { name: 'Jack Wong', image: 'https://i.pravatar.cc/150?u=jack', phone: '+852 2555 0177' }
  }
];

export const SAVED_PROPERTIES = [PROPERTIES[0], PROPERTIES[2], PROPERTIES[4], PROPERTIES[8]];

export const FEATURED_PROPERTIES = [PROPERTIES[0], PROPERTIES[1], PROPERTIES[3], PROPERTIES[4], PROPERTIES[5], PROPERTIES[10], PROPERTIES[15]];

export const USER_PROFILE: UserProfile = {
  name: 'Alexander Vance',
  role: 'PLATINUM MEMBER',
  image: 'https://i.pravatar.cc/150?u=elite',
  stats: {
    saved: 12,
    viewings: 4,
    offers: 2,
  }
};
