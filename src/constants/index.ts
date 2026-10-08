export const APP_NAME = 'KaamSetu';
export const APP_TAGLINE = 'Bihar ka apna hiring platform';
export const DEMO_OTP = '1234';
export const DEMO_AADHAAR_SUCCESS = true;

export const STORAGE_KEYS = {
  LANGUAGE: 'kaamsetu_language',
  AUTH_TOKEN: 'kaamsetu_auth_token',
  USER_TYPE: 'kaamsetu_user_type',
  PHONE_NUMBER: 'kaamsetu_phone',
  ONBOARDING_DONE: 'kaamsetu_onboarding_done',
  USER_PROFILE: 'kaamsetu_user_profile',
  JOB_POSTS: 'kaamsetu_job_posts',
  JOB_APPLICATIONS: 'kaamsetu_job_applications',
  UNLOCKED_CONTACTS: 'kaamsetu_unlocked_contacts',
};

export const JOB_CATEGORIES = [
  { id: 'labour', label: 'Labour', labelHi: 'मजदूर', icon: '👷' },
  { id: 'electrician', label: 'Electrician', labelHi: 'इलेक्ट्रिशियन', icon: '⚡' },
  { id: 'plumber', label: 'Plumber', labelHi: 'प्लम्बर', icon: '🔧' },
  { id: 'carpenter', label: 'Carpenter', labelHi: 'बढ़ई', icon: '🪚' },
  { id: 'painter', label: 'Painter', labelHi: 'पेंटर', icon: '🎨' },
  { id: 'driver', label: 'Driver', labelHi: 'ड्राइवर', icon: '🚗' },
  { id: 'cook', label: 'Cook', labelHi: 'रसोइया', icon: '🍳' },
  { id: 'maid', label: 'Maid', labelHi: 'घरेलू सहायक', icon: '🧹' },
  { id: 'security', label: 'Security Guard', labelHi: 'सुरक्षा गार्ड', icon: '🛡️' },
  { id: 'delivery', label: 'Delivery', labelHi: 'डिलीवरी', icon: '📦' },
  { id: 'mechanic', label: 'Mechanic', labelHi: 'मैकेनिक', icon: '🔩' },
  { id: 'ac_technician', label: 'AC Technician', labelHi: 'AC टेक्नीशियन', icon: '❄️' },
  { id: 'refrigerator', label: 'Refrigerator Technician', labelHi: 'फ्रिज टेक्नीशियन', icon: '🧊' },
  { id: 'construction', label: 'Construction Worker', labelHi: 'निर्माण मजदूर', icon: '🏗️' },
  { id: 'helper', label: 'Helper', labelHi: 'हेल्पर', icon: '🤝' },
  { id: 'salesman', label: 'Salesman', labelHi: 'सेल्समैन', icon: '💼' },
  { id: 'office_staff', label: 'Office Staff', labelHi: 'ऑफिस स्टाफ', icon: '🖥️' },
  { id: 'event_staff', label: 'Event Staff', labelHi: 'इवेंट स्टाफ', icon: '🎪' },
  { id: 'computer_operator', label: 'Computer Operator', labelHi: 'कंप्यूटर ऑपरेटर', icon: '💻' },
  { id: 'other', label: 'Other', labelHi: 'अन्य', icon: '➕' },
];

export const BIHAR_DISTRICTS = [
  'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur',
  'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj',
  'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj',
  'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda',
  'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
  'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul',
  'Vaishali', 'West Champaran'
];

export const WORK_RADIUS_OPTIONS = [
  { value: 2, label: '2 KM' },
  { value: 5, label: '5 KM' },
  { value: 10, label: '10 KM' },
  { value: 25, label: '25 KM' },
  { value: 0, label: 'Anywhere in District' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher', labelHi: 'फ्रेशर' },
  { value: '1-2', label: '1-2 Years', labelHi: '1-2 साल' },
  { value: '3-5', label: '3-5 Years', labelHi: '3-5 साल' },
  { value: '5-10', label: '5-10 Years', labelHi: '5-10 साल' },
  { value: '10+', label: '10+ Years', labelHi: '10+ साल' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'available_now', label: 'Available Now', labelHi: 'अभी उपलब्ध' },
  { value: 'available_tomorrow', label: 'Available from Tomorrow', labelHi: 'कल से उपलब्ध' },
  { value: 'not_available', label: 'Not Available', labelHi: 'उपलब्ध नहीं' },
];
