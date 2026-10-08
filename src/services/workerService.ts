import { WorkerCard } from '../types';
import { STORAGE_KEYS } from '../constants';
import { storage } from '../utils/storage';

export const DEMO_WORKERS: WorkerCard[] = [
  {
    id: 'w-rajesh',
    name: 'राजेश कुमार',
    category: 'Labour',
    categoryIcon: '👷',
    distanceKm: 1.8,
    experience: '5-10',
    experienceText: '5 साल अनुभव',
    rating: 4.7,
    totalRatings: 62,
    reviewsCount: 62,
    availability: 'available_now',
    availabilityText: 'Available Now',
    isVerified: true,
    area: 'Katihar',
    district: 'Katihar',
    dailyRate: '₹600–₹800 / दिन',
    tags: ['मजदूर', 'निर्माण कार्य', 'लोडिंग/अनलोडिंग'],
    photoAsset: require('../../assets/worker-rajesh.png'),
    skills: 'भवन निर्माण, लोडिंग/अनलोडिंग, साइट मजदूरी',
  },
  {
    id: 'w-sanjay',
    name: 'संजय पासवान',
    category: 'Electrician',
    categoryIcon: '⚡',
    distanceKm: 2.4,
    experience: '5-10',
    experienceText: '6 साल अनुभव',
    rating: 4.5,
    totalRatings: 48,
    reviewsCount: 48,
    availability: 'available_now',
    availabilityText: 'Available Now',
    isVerified: true,
    area: 'Katihar',
    district: 'Katihar',
    dailyRate: '₹500–₹1,000 / दिन',
    tags: ['इलेक्ट्रिशियन', 'वायरिंग', 'फैन / AC'],
    photoAsset: require('../../assets/worker-sanjay.png'),
    skills: 'हाउस वायरिंग, एमसीबी फिटिंग, फैन और इनवर्टर मरम्मत',
  },
  {
    id: 'w-imran',
    name: 'मो. इमरान',
    category: 'Plumber',
    categoryIcon: '🔧',
    distanceKm: 3.1,
    experience: '3-5',
    experienceText: '4 साल अनुभव',
    rating: 4.6,
    totalRatings: 39,
    reviewsCount: 39,
    availability: 'available_now',
    availabilityText: 'Available Today',
    isVerified: true,
    area: 'Katihar',
    district: 'Katihar',
    dailyRate: '₹500–₹900 / दिन',
    tags: ['प्लंबर', 'पाइप फिटिंग', 'बाथरूम / टंकी'],
    photoAsset: require('../../assets/worker-imran.png'),
    skills: 'पाइप फिटिंग, पानी की टंकी, बाथरूम फिटिंग और मरम्मत',
  },
  {
    id: 'w-4',
    name: 'Dinesh Paswan',
    category: 'Painter',
    categoryIcon: '🎨',
    distanceKm: 0.9,
    experience: '3-5',
    rating: 4.3,
    totalRatings: 18,
    availability: 'available_now',
    isVerified: false,
    area: 'Kadwa Chowk',
    district: 'Katihar',
    skills: 'Wall Putty, Distemper, Weather Coat, Enamel & Polish',
  },
  {
    id: 'w-5',
    name: 'Arvind Mahto',
    category: 'Driver',
    categoryIcon: '🚗',
    distanceKm: 4.5,
    experience: '5-10',
    rating: 4.7,
    totalRatings: 94,
    availability: 'available_now',
    isVerified: true,
    area: 'Sahayak Thana Road',
    district: 'Katihar',
    skills: 'Commercial Vehicle, LMV, Highway Experience, Patna-Siliguri Routes',
  },
  {
    id: 'w-6',
    name: 'Shankar Sah',
    category: 'Labour',
    categoryIcon: '👷',
    distanceKm: 0.8,
    experience: '3-5',
    rating: 4.5,
    totalRatings: 14,
    availability: 'available_now',
    isVerified: true,
    area: 'Lalbagh',
    district: 'Purnia',
    skills: 'Loading/Unloading, Construction Work, Garden Digging, Shifting',
  },
  {
    id: 'w-7',
    name: 'Sunita Devi',
    category: 'Cook',
    categoryIcon: '🍳',
    distanceKm: 1.8,
    experience: '5-10',
    rating: 4.9,
    totalRatings: 56,
    availability: 'available_now',
    isVerified: true,
    area: 'Line Bazar',
    district: 'Purnia',
    skills: 'Bihari Vegetarian & Non-Veg, Roti, Rice, Dal, Breakfast Snacks',
  },
  {
    id: 'w-8',
    name: 'Mukesh Jha',
    category: 'AC Technician',
    categoryIcon: '❄️',
    distanceKm: 2.6,
    experience: '3-5',
    rating: 4.4,
    totalRatings: 27,
    availability: 'available_tomorrow',
    isVerified: true,
    area: 'Boring Road',
    district: 'Patna',
    skills: 'Split AC Gas Charging, Filter Cleaning, PCB Board Diagnostics',
  },
  {
    id: 'w-9',
    name: 'Pramod Thakur',
    category: 'Mechanic',
    categoryIcon: '🔩',
    distanceKm: 1.5,
    experience: '10+',
    rating: 4.6,
    totalRatings: 53,
    availability: 'available_now',
    isVerified: true,
    area: 'Bhagalpur Chowk',
    district: 'Bhagalpur',
    skills: '2-Wheeler Engine Overhaul, Brake Service, Wiring Repair',
  },
  {
    id: 'w-10',
    name: 'Rajnish Kumar',
    category: 'Security Guard',
    categoryIcon: '🛡️',
    distanceKm: 3.8,
    experience: '1-2',
    rating: 4.2,
    totalRatings: 9,
    availability: 'available_now',
    isVerified: true,
    area: 'Mithanpura',
    district: 'Muzaffarpur',
    skills: 'Gate Checking, Register Log, Night Vigilance, CCTV Monitoring',
  },
];

export async function fetchNearbyWorkers(filter?: {
  category?: string;
  searchQuery?: string;
  district?: string;
}): Promise<WorkerCard[]> {
  await new Promise((r) => setTimeout(r, 400));
  let list = [...DEMO_WORKERS];

  if (filter?.category && filter.category !== 'all') {
    list = list.filter(
      (w) => w.category.toLowerCase() === filter.category?.toLowerCase()
    );
  }

  if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.area.toLowerCase().includes(q) ||
        w.district.toLowerCase().includes(q) ||
        (w.skills && w.skills.toLowerCase().includes(q))
    );
  }

  if (filter?.district) {
    list = list.filter(
      (w) => w.district.toLowerCase() === filter.district?.toLowerCase()
    );
  }

  return list;
}

export async function getUnlockedWorkerIds(): Promise<string[]> {
  const saved = await storage.getItem(STORAGE_KEYS.UNLOCKED_CONTACTS);
  if (!saved) return [];
  const ids: unknown = JSON.parse(saved);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    throw new Error('Saved unlocked contacts have an invalid format.');
  }
  return ids;
}

export async function saveUnlockedWorker(workerId: string): Promise<void> {
  const ids = await getUnlockedWorkerIds();
  if (!ids.includes(workerId)) {
    await storage.setItem(
      STORAGE_KEYS.UNLOCKED_CONTACTS,
      JSON.stringify([workerId, ...ids])
    );
  }
}

export async function fetchWorkerById(id: string): Promise<WorkerCard | null> {
  await new Promise((r) => setTimeout(r, 200));
  const found = DEMO_WORKERS.find((w) => w.id === id);
  return found || null;
}
