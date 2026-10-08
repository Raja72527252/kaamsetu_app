export type Language = 'hi' | 'en' | 'hinglish';
export type UserType = 'hirer' | 'job_seeker';
export type Gender = 'male' | 'female' | 'other';
export type Availability = 'available_now' | 'available_tomorrow' | 'not_available';
export type ExperienceLevel = 'fresher' | '1-2' | '3-5' | '5-10' | '10+';
export type SalaryType = 'daily' | 'monthly';

export interface Location {
  state: string;
  district: string;
  city: string;
  area: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
}

export type AppLocation = Location;

export interface VerificationStatus {
  aadhaarVerified: boolean;
  phoneVerified: boolean;
  photoVerified: boolean;
}

export interface User {
  id: string;
  phoneNumber: string;
  userType: UserType;
  fullName: string;
  gender?: Gender;
  age?: number;
  profilePhotoUri?: string;
  location?: Location;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserProfile = User;

export interface HirerProfile extends User {
  userType: 'hirer';
  businessName?: string;
  aboutWork?: string;
  hiringCategories: string[];
}

export interface JobSeekerProfile extends User {
  userType: 'job_seeker';
  jobCategories: string[];
  experienceLevel?: ExperienceLevel;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  salaryType?: SalaryType;
  availability?: Availability;
  skills?: string;
  workExperienceDescription?: string;
  previousWork?: string;
  languagesKnown?: string[];
  workRadiusKm?: number;
  rating?: number;
  totalRatings?: number;
  workPhotos?: string[];
}

export interface JobCategory {
  id: string;
  label: string;
  labelHi: string;
  icon: string;
}

export interface WorkerProfile extends JobSeekerProfile {
  distanceKm?: number;
  isVerified?: boolean;
}

export interface WorkerCard {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  distanceKm: number;
  experience: ExperienceLevel;
  rating: number;
  totalRatings: number;
  availability: Availability;
  isVerified: boolean;
  profilePhotoUri?: string;
  photoAsset?: any;
  availabilityText?: string;
  dailyRate?: string;
  experienceText?: string;
  tags?: string[];
  reviewsCount?: number;
  area: string;
  district: string;
  skills?: string;
}

export interface Job {
  id: string;
  hirerId: string;
  hirerName: string;
  hirerBusinessName?: string;
  title: string;
  category: string;
  categoryIcon: string;
  area: string;
  district: string;
  distanceKm?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryType;
  jobType: string;
  postedAt: string;
  description?: string;
  isActive: boolean;
  photoAsset?: any;
  wageText?: string;
  isNew?: boolean;
  tags?: string[];
  durationText?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'unlock_single' | 'monthly_hirer' | 'premium_seeker';
  status: 'active' | 'expired';
  creditsRemaining?: number;
  expiresAt?: string;
}

export interface AppState {
  language: Language;
  phoneNumber: string | null;
  isAuthenticated: boolean;
  userType: UserType | null;
  onboardingCompleted: boolean;
  userProfile: HirerProfile | JobSeekerProfile | User | null;
}
