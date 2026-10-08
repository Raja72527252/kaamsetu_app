import { Job } from '../types';
import { STORAGE_KEYS } from '../constants';
import { storage } from '../utils/storage';

export const DEMO_JOBS: Job[] = [
  {
    id: 'job-construction',
    hirerId: 'h-shivam',
    hirerName: 'Shivam Construction',
    hirerBusinessName: 'Shivam Construction',
    title: '2 मजदूर चाहिए (सामान उठाना)',
    category: 'Labour',
    categoryIcon: '👷',
    area: 'Court Road',
    district: 'Katihar',
    distanceKm: 1.5,
    salaryMin: 700,
    salaryType: 'daily',
    wageText: '₹700 / दिन',
    jobType: 'तुरंत चाहिए',
    postedAt: 'आज',
    isNew: true,
    tags: ['तुरंत चाहिए', '2 व्यक्ति', '5-7 दिन काम'],
    photoAsset: require('../../assets/job-construction.png'),
    description: 'सामान अनलोडिंग और निर्माण कार्य के लिए 2 शारीरिक रूप से सक्षम मजदूर चाहिए। प्रतिदिन भुगतान।',
    isActive: true,
  },
  {
    id: 'job-wiring',
    hirerId: 'h-singh',
    hirerName: 'Singh Residence',
    hirerBusinessName: 'Singh Residence',
    title: 'घर की वायरिंग के लिए इलेक्ट्रिशियन',
    category: 'Electrician',
    categoryIcon: '⚡',
    area: 'Falka',
    district: 'Katihar',
    distanceKm: 3.2,
    salaryMin: 600,
    salaryMax: 1000,
    salaryType: 'daily',
    wageText: '₹600 – ₹1,000 / दिन',
    jobType: 'अनुभवी चाहिए',
    postedAt: '2 दिन पहले',
    isNew: false,
    tags: ['2-3 दिन काम', 'अनुभवी चाहिए', 'टूल होना चाहिए'],
    photoAsset: require('../../assets/job-wiring.png'),
    description: 'नए मकान में बोर्ड, वायरिंग और एमसीबी लगाने का कार्य। 2 से 3 दिनों का काम है।',
    isActive: true,
  },
  {
    id: 'job-salesman',
    hirerId: 'h-modern',
    hirerName: 'Modern Electronics',
    hirerBusinessName: 'Modern Electronics',
    title: 'दुकान के लिए सेल्समैन',
    category: 'Salesman',
    categoryIcon: '💼',
    area: 'Market',
    district: 'Katihar',
    distanceKm: 0.8,
    salaryMin: 10000,
    salaryMax: 15000,
    salaryType: 'monthly',
    wageText: '₹10,000 – ₹15,000 / महीना',
    jobType: 'फुल टाइम',
    postedAt: '5 दिन पहले',
    isNew: false,
    tags: ['फुल टाइम', 'अनुभव जरूरी', 'लड़का चाहिए'],
    photoAsset: require('../../assets/job-salesman.png'),
    description: 'इलेक्ट्रॉनिक शॉप में ग्राहकों को सामान दिखाने और बिलिंग में मदद करने के लिए सेल्समैन चाहिए।',
    isActive: true,
  },
  {
    id: 'job-delivery',
    hirerId: 'h-tasty',
    hirerName: 'Tasty Bites Food',
    hirerBusinessName: 'Tasty Bites Food',
    title: 'डिलिवरी बॉय चाहिए (फूड डिलिवरी)',
    category: 'Delivery',
    categoryIcon: '🛵',
    area: 'Town',
    district: 'Katihar',
    distanceKm: 2.1,
    salaryMin: 12000,
    salaryMax: 16000,
    salaryType: 'monthly',
    wageText: '₹12,000 – ₹16,000 / महीना',
    jobType: 'फुल टाइम',
    postedAt: '19 घंटे पहले',
    isNew: false,
    tags: ['फुल टाइम', 'बाइक होना चाहिए', 'तुरंत जॉइन'],
    photoAsset: require('../../assets/job-delivery.png'),
    description: 'रेस्टोरेंट से ऑनलाइन ऑर्डर्स पहुंचाने के लिए डिलीवरी बॉय। खुद की बाइक और स्मार्टफ़ोन होना चाहिए।',
    isActive: true,
  },
  {
    id: 'job-4',
    hirerId: 'h-104',
    hirerName: 'Ritu Sarees & Fashion Mall',
    hirerBusinessName: 'Ritu Retail Center',
    title: 'Sales Executive / Counter Staff Needed',
    category: 'Salesman',
    categoryIcon: '💼',
    area: 'Bhatta Bazar',
    district: 'Purnia',
    distanceKm: 1.5,
    salaryMin: 10000,
    salaryMax: 14000,
    salaryType: 'monthly',
    jobType: 'Full-time',
    postedAt: 'Kal',
    description: 'Smart candidate for retail garments counter. Basic billing & customer interaction.',
    isActive: true,
  },
  {
    id: 'job-5',
    hirerId: 'h-105',
    hirerName: 'Dr. S. K. Verma Clinic',
    hirerBusinessName: 'Verma Health Care',
    title: 'Security Guard / Night Caretaker',
    category: 'Security Guard',
    categoryIcon: '🛡️',
    area: 'Line Bazar Hospital Road',
    district: 'Purnia',
    distanceKm: 2.0,
    salaryMin: 9500,
    salaryMax: 11000,
    salaryType: 'monthly',
    jobType: 'Shift duty',
    postedAt: '2 din pehle',
    description: '12-hour night shift duty. Neat and disciplined candidate needed.',
    isActive: true,
  },
  {
    id: 'job-6',
    hirerId: 'h-106',
    hirerName: 'Champaran Meat House',
    hirerBusinessName: 'Champaran Handi Restaurant',
    title: 'Head Cook & Kitchen Helper',
    category: 'Cook',
    categoryIcon: '🍳',
    area: 'Boring Road',
    district: 'Patna',
    distanceKm: 4.8,
    salaryMin: 15000,
    salaryMax: 20000,
    salaryType: 'monthly',
    jobType: 'Full-time',
    postedAt: 'Aaj',
    description: 'Experience in traditional Bihari Handi style mutton & chicken cooking required. Accommodation provided.',
    isActive: true,
  },
];

export async function fetchNearbyJobs(filter?: {
  category?: string;
  searchQuery?: string;
  district?: string;
}): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 400));
  let list = [...(await getJobPosts()).filter((job) => job.isActive), ...DEMO_JOBS];

  if (filter?.category && filter.category !== 'all') {
    list = list.filter(
      (j) => j.category.toLowerCase() === filter.category?.toLowerCase()
    );
  }

  if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        j.area.toLowerCase().includes(q) ||
        j.district.toLowerCase().includes(q) ||
        j.hirerName.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function fetchJobById(id: string): Promise<Job | null> {
  await new Promise((r) => setTimeout(r, 200));
  const found = [...(await getJobPosts()).filter((job) => job.isActive), ...DEMO_JOBS].find((j) => j.id === id);
  return found || null;
}

export async function getJobPosts(): Promise<Job[]> {
  const saved = await storage.getItem(STORAGE_KEYS.JOB_POSTS);
  if (!saved) return [];
  const posts: unknown = JSON.parse(saved);
  if (!Array.isArray(posts) || !posts.every(isJob)) {
    throw new Error('Saved job posts have an invalid format.');
  }
  return posts;
}

function isJob(value: unknown): value is Job {
  if (!value || typeof value !== 'object') return false;
  const job = value as Partial<Job>;
  return typeof job.id === 'string' &&
    typeof job.hirerId === 'string' &&
    typeof job.title === 'string' &&
    typeof job.category === 'string' &&
    typeof job.area === 'string' &&
    typeof job.district === 'string' &&
    (job.salaryType === 'daily' || job.salaryType === 'monthly') &&
    typeof job.isActive === 'boolean';
}

export async function createJobPost(job: Job): Promise<void> {
  const posts = await getJobPosts();
  await storage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify([job, ...posts]));
}

export async function updateJobPost(jobId: string, updates: Partial<Job>): Promise<void> {
  const posts = await getJobPosts();
  const index = posts.findIndex((job) => job.id === jobId);
  if (index < 0) throw new Error(`Job post ${jobId} was not found.`);
  posts[index] = { ...posts[index], ...updates };
  await storage.setItem(STORAGE_KEYS.JOB_POSTS, JSON.stringify(posts));
}

export async function deleteJobPost(jobId: string): Promise<void> {
  const posts = await getJobPosts();
  await storage.setItem(
    STORAGE_KEYS.JOB_POSTS,
    JSON.stringify(posts.filter((job) => job.id !== jobId))
  );
}

export async function getAppliedJobIds(): Promise<string[]> {
  const saved = await storage.getItem(STORAGE_KEYS.JOB_APPLICATIONS);
  if (!saved) return [];
  const ids: unknown = JSON.parse(saved);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    throw new Error('Saved job applications have an invalid format.');
  }
  return ids;
}

export async function applyToJob(jobId: string): Promise<void> {
  const ids = await getAppliedJobIds();
  if (!ids.includes(jobId)) {
    await storage.setItem(
      STORAGE_KEYS.JOB_APPLICATIONS,
      JSON.stringify([jobId, ...ids])
    );
  }
}
